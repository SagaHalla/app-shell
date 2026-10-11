/** Provisional native-module contract. Registration grants no backend authority. */
export const MODULE_API = 'saga.workbench.module/v0.1';
export type Manifest = {
  id: string; name: string; version: string; apiVersion: typeof MODULE_API;
  entrypoint: string; integrity: string; routes: string[];
  capabilities: string[]; providers: Record<string, string>;
  dependencies: string[]; optionalDependencies: string[];
};
export type LoadedModule = { health(): Promise<boolean>; dispose(): Promise<void> };
export type Registration = { manifest: Manifest; load(): Promise<LoadedModule> };
export type HostPolicy = {
  capabilities: ReadonlySet<string>; providers: Readonly<Record<string, string>>;
  verifyArtifact(manifest: Readonly<Manifest>): Promise<boolean>;
};

export class ModuleRegistry {
  private staged = new Map<string, Registration>();
  private active = new Map<string, { registration: Registration; instance: LoadedModule }>();
  private busy = false;
  constructor(private policy: HostPolicy) {}

  stage(registration: Registration) {
    if (this.busy) throw new Error('Module lifecycle busy');
    const manifest = structuredClone(registration.manifest);
    if (!/^[a-z][a-z0-9.-]+$/.test(manifest.id) || !manifest.name.trim()
        || !/^\d+\.\d+\.\d+$/.test(manifest.version) || manifest.apiVersion !== MODULE_API
        || !manifest.entrypoint || !/^sha256-[a-f0-9]{64}$/.test(manifest.integrity)
        || !manifest.routes.length || manifest.routes.some(route => !route.startsWith(`/modules/${manifest.id}/`) || /[?#]|\.\./.test(route))
        || new Set(manifest.routes).size !== manifest.routes.length
        || manifest.dependencies.includes(manifest.id)) throw new Error('Invalid module manifest');
    const previous = this.staged.get(manifest.id);
    this.staged.set(manifest.id, { manifest, load: registration.load });
    try { this.checkCycles(); } catch (error) {
      if (previous) this.staged.set(manifest.id, previous);
      else this.staged.delete(manifest.id);
      throw error;
    }
  }

  private checkCycles() {
    const visit = (id: string, path: Set<string>) => {
      if (path.has(id)) throw new Error('Module dependency cycle');
      const registration = this.staged.get(id) ?? this.active.get(id)?.registration;
      if (!registration) return;
      for (const dependency of registration.manifest.dependencies) visit(dependency, new Set([...path, id]));
    };
    for (const id of this.staged.keys()) visit(id, new Set());
  }

  async activate(id: string) {
    if (this.busy) throw new Error('Module lifecycle busy');
    const candidate = this.staged.get(id);
    if (!candidate) throw new Error('Module not staged');
    this.busy = true;
    let instance: LoadedModule | undefined;
    try {
      const m = candidate.manifest;
      if (m.capabilities.some(capability => !this.policy.capabilities.has(capability))
          || Object.entries(m.providers).some(([name, version]) => this.policy.providers[name] !== version)
          || m.dependencies.some(dependency => !this.active.has(dependency))) throw new Error('Module requirements unavailable');
      for (const [otherId, other] of this.active) {
        if (otherId !== id && other.registration.manifest.routes.some(route => m.routes.includes(route))) throw new Error('Module route collision');
      }
      // The trusted host verifies the actual artifact before any module code executes.
      if (!await this.policy.verifyArtifact(structuredClone(m))) throw new Error('Module artifact unverified');
      instance = await candidate.load();
      if (!await instance.health()) throw new Error('Module health failed');
      const previous = this.active.get(id);
      this.active.set(id, { registration: candidate, instance });
      this.staged.delete(id);
      // Failure to dispose an old UI cannot undo a healthy replacement or cancel domain work.
      if (previous) await previous.instance.dispose().catch(() => undefined);
    } catch (error) {
      if (instance) await instance.dispose().catch(() => undefined);
      throw error;
    } finally { this.busy = false; }
  }

  async disable(id: string) {
    if (this.busy) throw new Error('Module lifecycle busy');
    if ([...this.active.values()].some(value => value.registration.manifest.dependencies.includes(id))) throw new Error('Active dependent module');
    const current = this.active.get(id);
    if (!current) return;
    this.busy = true;
    try { await current.instance.dispose(); this.active.delete(id); }
    finally { this.busy = false; }
  }

  list() {
    return [...this.active.values()].map(({ registration }) => ({
      manifest: structuredClone(registration.manifest),
      unavailableOptionalModules: registration.manifest.optionalDependencies.filter(id => !this.active.has(id))
    }));
  }
}

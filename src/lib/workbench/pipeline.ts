import { MODULE_API, type LoadedModule, type Registration } from './registry';

/** The shell supplies an authenticated, resource-authorized provider; never DB credentials. */
export type ReviewProvider = {
  readReviews(workspace: string): Promise<unknown>;
};
export function pipelineReviewModule(options: {
  integrity: string;
  provider: ReviewProvider;
  mount(readReviews: (workspace: string) => Promise<unknown>): Promise<LoadedModule>;
}): Registration {
  return {
    manifest: {
      id: 'game-pipeline', name: 'Pipeline', version: '0.1.0', apiVersion: MODULE_API,
      entrypoint: '@saga/app-shell/workbench/pipeline', integrity: options.integrity,
      routes: ['/modules/game-pipeline/reviews'], capabilities: ['pipeline.reviews.read'],
      providers: { 'pipeline.reviews': 'v1' }, dependencies: [], optionalDependencies: []
    },
    async load() {
      return options.mount(workspace => options.provider.readReviews(workspace));
    }
  };
}

/** The host fetch callback owns bearer attachment, audience, origin and no-store policy. */
export function reviewProvider(fetchReviews: (path: string) => Promise<{ ok: boolean; json(): Promise<unknown> }>): ReviewProvider {
  return {
    async readReviews(workspace) {
      if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(workspace)) throw new Error('Invalid workspace');
      const response = await fetchReviews(`/pipeline/operator/v1/workspaces/${workspace.toLowerCase()}/reviews`);
      if (!response.ok) throw new Error('Pipeline reviews unavailable');
      const result = await response.json();
      if (!result || typeof result !== 'object' || !('contract_version' in result) || result.contract_version !== 1
          || !('live_intake_enabled' in result) || result.live_intake_enabled !== false
          || !('reviews' in result) || !result.reviews || typeof result.reviews !== 'object') throw new Error('Unsupported Pipeline review contract');
      return result;
    }
  };
}

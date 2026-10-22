import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ModuleRegistry, MODULE_API, type Registration } from '../src/lib/workbench/registry';
import { pipelineReviewModule } from '../src/lib/workbench/pipeline';
const digest = 'sha256-'+'a'.repeat(64);
function module(id: string, changes = {}): Registration {
  return { manifest: { id, name: id, version: '1.0.0', apiVersion: MODULE_API,
    entrypoint: id, integrity: digest, routes: [`/modules/${id}/home`],
    capabilities: [], providers: {}, dependencies: [], optionalDependencies: [], ...changes },
    load: async () => ({health:async()=>true, dispose:async()=>{}}) };
}
function registry(verifyArtifact = async () => true) {
  return new ModuleRegistry({ capabilities:new Set(['pipeline.reviews.read']), providers:{'pipeline.reviews':'v1'}, verifyArtifact });
}
test('independent module registrations and optional absence', async()=>{
  const r=registry(); r.stage(module('plans', {optionalDependencies:['agent']})); r.stage(module('oracle'));
  await r.activate('plans'); await r.activate('oracle');
  assert.deepEqual(r.list()[0].unavailableOptionalModules,['agent']);
  await r.disable('oracle'); assert.equal(r.list()[0].manifest.id,'plans');
});
test('required dependencies, provider versions and capability expansion block loading', async()=>{
  for(const changes of [{dependencies:['agent']},{providers:{'pipeline.reviews':'v2'}},{capabilities:['pipeline.execute']}]) {
    const r=registry();let called=false; const candidate=module('pipeline',changes);candidate.load=async()=>{called=true;throw Error('unexpected')};
    r.stage(candidate); await assert.rejects(r.activate('pipeline'),/requirements/);assert.equal(called,false);
  }
});
test('artifact verification happens before execution', async()=>{
  const r=registry(async()=>false);const c=module('plans');let called=false;c.load=async()=>{called=true;throw Error('unexpected')};
  r.stage(c);await assert.rejects(r.activate('plans'),/unverified/);assert.equal(called,false);
});
test('cycles and foreign routes rejected', ()=>{
  const r=registry();r.stage(module('plans',{dependencies:['agent']}));
  assert.throws(()=>r.stage(module('agent',{dependencies:['plans']})),/cycle/);
  assert.throws(()=>r.stage(module('oracle',{routes:['/modules/plans/home']})),/manifest/);
});
test('failed upgrade retains healthy old module and unrelated modules', async()=>{
  const r=registry();r.stage(module('plans'));r.stage(module('oracle'));await r.activate('plans');await r.activate('oracle');
  let disposed=false;const c=module('plans',{version:'2.0.0'});c.load=async()=>({health:async()=>false,dispose:async()=>{disposed=true}});
  r.stage(c);await assert.rejects(r.activate('plans'),/health/);assert.equal(disposed,true);
  assert.equal(r.list()[0].manifest.version,'1.0.0');assert.equal(r.list().length,2);
});
test('required active dependency cannot be disabled', async()=>{
  const r=registry();r.stage(module('plans'));await r.activate('plans');r.stage(module('agent',{dependencies:['plans']}));await r.activate('agent');
  await assert.rejects(r.disable('plans'),/dependent/);
});
test('manifest snapshots cannot mutate active registrations', async()=>{
  const r=registry();const c=module('plans');r.stage(c);c.manifest.routes.push('/foreign');await r.activate('plans');
  r.list()[0].manifest.routes.push('/foreign');assert.equal(r.list()[0].manifest.routes.length,1);
});
test('Pipeline reads only through shell provider; unload only disposes UI', async()=>{
  const r=registry();const workspaces:string[]=[];let disposed=false;let read:((workspace:string)=>Promise<unknown>)|undefined;
  r.stage(pipelineReviewModule({integrity:digest,provider:{readReviews:async workspace=>{workspaces.push(workspace);return {contract_version:1}}},mount:async callback=>{read=callback;return {health:async()=>true,dispose:async()=>{disposed=true}}}}));
  await r.activate('game-pipeline');assert.deepEqual(await read!('synthetic-workspace'),{contract_version:1});
  await r.disable('game-pipeline');assert.equal(disposed,true);assert.deepEqual(workspaces,['synthetic-workspace']);
});
import { reviewProvider } from '../src/lib/workbench/pipeline';
test('read provider accepts only workspace UUID and expected read-only contract', async()=>{
  const paths:string[]=[];const provider=reviewProvider(async path=>{paths.push(path);return {ok:true,json:async()=>({contract_version:1,live_intake_enabled:false,reviews:{}})}});
  await assert.rejects(provider.readReviews('../other'),/workspace/);assert.equal(paths.length,0);
  await provider.readReviews('00000000-0000-0000-0000-000000000001');
  assert.deepEqual(paths,['/pipeline/operator/v1/workspaces/00000000-0000-0000-0000-000000000001/reviews']);
  for (const response of [{ok:false,json:async()=>({})},{ok:true,json:async()=>({contract_version:2})}]) {
    await assert.rejects(reviewProvider(async()=>response).readReviews('00000000-0000-0000-0000-000000000001'));
  }
});
test('lifecycle concurrency rejects reentry while artifact verification waits', async()=>{
  let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve});
  const r=registry(async()=>{await gate;return true});r.stage(module('plans'));const pending=r.activate('plans');
  assert.throws(()=>r.stage(module('oracle')),/busy/);await assert.rejects(r.disable('plans'),/busy/);
  release();await pending;assert.equal(r.list().length,1);
});
import { reviewPage } from '../src/lib/workbench/reviewPage';
test('panel read model rejects another workspace and duplicate rows',()=>{
  const body={contract_version:1,live_intake_enabled:false,reviews:{workspace_id:'synthetic',workspace:{name:'Synthetic'},truncated:false,entries:[{review_id:'one',title:'<script>literal</script>',policy_current:false,decision:null,promoted:false}]}};
  assert.equal(reviewPage(body,'synthetic').entries[0].title,'<script>literal</script>');
  assert.throws(()=>reviewPage(body,'other'));
  assert.throws(()=>reviewPage({...body,reviews:{...body.reviews,entries:[...body.reviews.entries,...body.reviews.entries]}},'synthetic'));
});

test('activation checks the active dependency graph rather than staged future replacements', async()=>{
  const r=registry();
  r.stage(module('base'));await r.activate('base');
  r.stage(module('panel',{dependencies:['base']}));await r.activate('panel');
  // This future panel version would remove the dependency, but it is not active yet.
  r.stage(module('panel'));
  let loaded=false;
  const candidate=module('base',{dependencies:['panel']});
  candidate.load=async()=>{loaded=true;return {health:async()=>true,dispose:async()=>{}}};
  r.stage(candidate);
  await assert.rejects(r.activate('base'),/cycle/);
  assert.equal(loaded,false);
  assert.deepEqual(r.list().find(row=>row.manifest.id==='base')!.manifest.dependencies,[]);
});


test('staged upgrades can activate once the old dependency edge is removed', async()=>{
  const r=registry();
  r.stage(module('base'));await r.activate('base');
  r.stage(module('panel',{dependencies:['base']}));await r.activate('panel');
  r.stage(module('panel'));r.stage(module('base',{dependencies:['panel']}));
  await r.activate('panel');await r.activate('base');
  assert.deepEqual(r.list().find(row=>row.manifest.id==='base')!.manifest.dependencies,['panel']);
  await assert.rejects(r.disable('panel'),/dependent/);
});

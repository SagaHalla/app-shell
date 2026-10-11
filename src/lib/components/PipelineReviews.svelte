<script lang="ts">
  import { reviewPage, type ReviewPage } from '../workbench/reviewPage';
  import type { ReviewProvider } from '../workbench/pipeline';
  let { workspace, provider }: { workspace: string; provider: ReviewProvider } = $props();
  let page: ReviewPage | null = $state(null);
  let loading = $state(false);
  let failed = $state(false);
  let refresh = $state(0);
  $effect(() => {
    const currentWorkspace = workspace;
    const currentProvider = provider;
    refresh;
    let disposed = false;
    page = null; failed = false; loading = true;
    currentProvider.readReviews(currentWorkspace)
      .then(value => { if (!disposed) page = reviewPage(value, currentWorkspace); })
      .catch(() => { if (!disposed) { page = null; failed = true; } })
      .finally(() => { if (!disposed) loading = false; });
    return () => { disposed = true; };
  });
</script>

<section aria-labelledby="pipeline-reviews-heading" aria-busy={loading}>
  <header>
    <div><p class="eyebrow">Pipeline</p><h1 id="pipeline-reviews-heading">Intake reviews</h1></div>
    <button onclick={() => refresh += 1} disabled={loading}>Refresh</button>
  </header>
  <p class="summary">Read-only review queue. Live intake is not enabled.</p>
  {#if loading}
    <p role="status">Loading reviews…</p>
  {:else if failed}
    <p role="alert">Reviews are unavailable. Check your workspace access and try again.</p>
  {:else if page}
    <h2>{page.name}</h2>
    {#if page.entries.length === 0}
      <p>No reviews in this workspace.</p>
    {:else}
      <div class="table-scroll"><table>
        <caption>Retained reviews for {page.name}</caption>
        <thead><tr><th scope="col">Observation</th><th scope="col">Policy</th><th scope="col">Recorded decision</th><th scope="col">Opportunity</th></tr></thead>
        <tbody>{#each page.entries as entry (entry.id)}
          <tr><th scope="row">{entry.title}</th><td>{entry.policyCurrent ? 'Current' : 'Changed'}</td>
            <td>{entry.decision === 'approve' ? 'Approved' : entry.decision === 'reject' ? 'Rejected' : 'Pending review'}</td>
            <td>{entry.promoted ? 'Created' : 'Not created'}</td></tr>
        {/each}</tbody>
      </table></div>
    {/if}
    {#if page.truncated}<p role="status">Showing the latest 100 reviews.</p>{/if}
    <p class="summary">Recorded decisions do not grant GAME acceptance or rewards.</p>
  {/if}
</section>

<style>
  section { background: #fff; color: #17212f; padding: 1.5rem; border: 1px solid #d7dde5; border-radius: .75rem; font-family: system-ui, sans-serif; }
  header { display: flex; gap: 1rem; justify-content: space-between; align-items: center; }
  h1 { margin: .25rem 0; font-size: 1.65rem; } h2 { font-size: 1.1rem; }
  .eyebrow { margin: 0; color: #75501b; font-weight: 600; } .summary { color: #48566a; }
  button { padding: .6rem 1rem; border-radius: .4rem; border: 1px solid #8290a3; background: #fff; color: #17212f; cursor: pointer; }
  button:disabled { opacity: .6; cursor: default; } button:focus-visible { outline: 3px solid #315ea9; outline-offset: 2px; }
  .table-scroll { overflow-x: auto; } table { width: 100%; border-collapse: collapse; text-align: left; }
  caption { text-align: left; padding: .5rem 0; color: #48566a; }
  th, td { padding: .85rem; border-bottom: 1px solid #d7dde5; } thead { background: #f3f5f8; }
  [role='alert'] { color: #9f2626; }
  @media (max-width: 540px) { section { padding: 1rem; } th, td { padding: .6rem; } }
</style>

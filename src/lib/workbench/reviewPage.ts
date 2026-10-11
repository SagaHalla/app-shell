export type ReviewPage = {
  workspace: string; name: string; truncated: boolean;
  entries: { id: string; title: string; policyCurrent: boolean; decision: 'approve' | 'reject' | null; promoted: boolean }[];
};
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Invalid review page');
  return value as Record<string, unknown>;
}
export function reviewPage(value: unknown, workspace: string): ReviewPage {
  const body = record(value), reviews = record(body.reviews), scope = record(reviews.workspace);
  if (body.contract_version !== 1 || body.live_intake_enabled !== false || reviews.workspace_id !== workspace
      || typeof scope.name !== 'string' || typeof reviews.truncated !== 'boolean'
      || !Array.isArray(reviews.entries) || reviews.entries.length > 100) throw Error('Unsupported review page');
  const ids = new Set<string>();
  const entries = reviews.entries.map(value => {
    const row = record(value);
    if (typeof row.review_id !== 'string' || !row.review_id || ids.has(row.review_id)
        || typeof row.title !== 'string' || typeof row.policy_current !== 'boolean' || typeof row.promoted !== 'boolean'
        || ![null, 'approve', 'reject'].includes(row.decision as null)) throw Error('Invalid review entry');
    ids.add(row.review_id);
    return { id: row.review_id, title: row.title, policyCurrent: row.policy_current,
      decision: row.decision as 'approve' | 'reject' | null, promoted: row.promoted };
  });
  return { workspace, name: scope.name, truncated: reviews.truncated, entries };
}

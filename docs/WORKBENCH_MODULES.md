# Workbench native-module registry foundation

This is a provisional `saga.workbench.module/v0.1` SDK seam, distinct from
`saga.plugin/v1`. It implements independently registered native modules with
namespaced routes, exact host API and provider contract versions, capability
allowlisting, required and optional module dependencies, cycle rejection,
artifact-verification callbacks, health checks and UI disposal. A failed load or
upgrade retains the previously active version and unrelated modules. Disabling a
required active dependency is refused. Disposal removes UI resources only; it
must never cancel durable backend work or delete records.

The trusted host supplies the artifact verifier and loader. It must bind the
loader to the exact verified artifact bytes and approve capabilities before
registration. An integrity string alone proves nothing. This is not a third-party
sandbox, signing service, artifact downloader or complete deployment lifecycle.
Dependency versions beyond exact provider/API contracts, rollback after successful
activation, workflow draining and owner-service migrations remain future work.

Import `ModuleRegistry` from `@saga/app-shell/workbench` and
`pipelineReviewModule` / `reviewProvider` from `@saga/app-shell/workbench/pipeline`.
Pipeline declares only `pipeline.reviews.read` and `pipeline.reviews` v1, with no
required Agent, Oracle or planning module. The host supplies UI mounting/health/
disposal and an authenticated fetch callback. The provider builds only the known
review route from a UUID and rejects failed/unsupported responses. The callback
owns credentials, approved API origin, workspace context and no-store behavior.
Server mapping, session_user and current membership remain authoritative.

No rendered panel, product navigation, authenticated BFF route, live identity
binding or deployed module is included. The current apps are unchanged. The
broader saga-orcastrator D0/DAO3 refactor remains a separate required gate.
Next: render the read-only review panel and wire it through a trusted app BFF,
then rehearse with synthetic host mappings before reviewing live activation.

Validation: `tsx --test tests/workbench.test.ts`; strict TypeScript checking of
both workbench source files. Tests use synthetic providers and artifact verifier
callbacks. They do not prove browser rendering or actual artifact-signature trust.

## Read-only panel and BFF integration slice

`@saga/app-shell/components/PipelineReviews.svelte` renders the bounded BFF review
projection. It clears prior rows while reloading, ignores requests completed after
unmount/workspace change, escapes titles, and separates recorded approval from
opportunity creation. Refresh rechecks host membership through the BFF. It offers
no review mutation, promotion or GAME acceptance controls.

This supersedes the previous “no rendered panel” status. The user-app source adds
a disabled-by-default BFF route and gated preview page. Product navigation and
module-registry activation remain pending; the preview is not an activated
Workbench module. Synthetic loopback Chromium checks passed for the actual Svelte
panel and BFF projection, denial clearing, literal HTML, empty/mobile states and
unmount. Eleven module/panel tests and strict TypeScript source checks passed.
Screenshots and browser log are retained under verification/pipeline-panel.

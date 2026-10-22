# Product spec and document organization

Shared convention for product repositories. This repository index is a local document snapshot; cross-product rollout does not change host GAME or deployment state.

| Home | Content | Status authority |
| --- | --- | --- |
| .game/specs/<stable-id>/ | Formal machine-readable GAME Spec and its generated views | Spec status/revision/baseline fields |
| specs/<stable-id>/ (legacy) | Existing formal specs referenced by runtime/plans | Keep stable until a separately reviewed migration |
| docs/architecture/ | Design decisions and bounded architecture notes | Explicit proposed/accepted document state; never deployment inference |
| docs/evaluations/ | Deferred research and selection gates | Unscheduled unless an actual GAME task says otherwise |
| docs/reviews/ | Dated findings, tests, source manifests and verification evidence | Exact evidence scope and verification status |
| docs/ root | Existing normative contracts, operational guides and established references | Owning contract/release record; preserve stable links |

## Lifecycle rules

1. Do not move a formal spec when it changes from draft to approved/baselined or retired. Keep stable IDs/paths and record lifecycle changes in metadata/history. Do not duplicate it into live/draft/deferred directories.
2. A draft is proposed intent. An approved or baselined spec is an accepted document state, not proof of implementation. Deferred is normally a GAME Plan work state or evaluation disposition, not a deployment label.
3. Live/deployed/activated status requires verified release and host evidence. Host GAME owns current task priority, dependencies, status and acceptance. The local index explicitly leaves deployment unassessed.
4. Never rewrite frozen evidence manifests or old baseline hashes to make a folder move look accepted. Review link/hash/source/plan references before moving any referenced artifact. Preserve history; avoid duplicate backup copies and stale redirect stubs.
5. Add new formal specs only for selected, demonstrated gaps. Architecture notes and evaluations do not need executable seeds or fabricated acceptance policy just to remain useful.
6. Existing root contracts and legacy formal paths are registered exceptions, not an invitation to move thousands of dated artifacts. Other products should adopt the same inventory and review their own exceptions before migration.

## Inventory maintenance

Run `python3 scripts/index_specs.py` to refresh docs/SPEC_INVENTORY.json and docs/SPECS.md; use `--check` to detect drift. The script requires PyYAML, also available in the sibling GAME Spec virtualenv. It reads only direct formal-spec roots, excluding review snapshots and runtime fixtures. It records exact source hashes and document lifecycle, and does not infer live GAME or deployment state.

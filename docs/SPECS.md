# app-shell — specs and document index

Formal paths stay stable across lifecycle changes. Status below comes from the YAML document; live work and acceptance remain in authoritative GAME. Deployment is not assessed here.

## Formal GAME Specs in this repository

No current formal YAML spec was found in the configured roots. This does not establish an absence of requirements: product contracts may live in another owning repository or established design documents.

## Related contract homes

- [sagahalla-workbench-core](https://gitlab.com/sagahalla-game/game-spec/-/blob/main/specs/sagahalla-workbench-core/spec.yaml) — Related versioned contract in GAME Spec; no runtime/deployment claim

## Document organization

- [Organization convention](SPEC_ORGANIZATION.md)
- [Dated review evidence](reviews/) — historical source/test evidence, not current spec discovery

Existing canonical and legacy paths are preserved. Do not sort specs into live/draft/deferred directories; keep status in metadata and work/release records.

Refresh: `python3 scripts/index_specs.py`. Drift check: `python3 scripts/index_specs.py --check`. Requires PyYAML; the sibling GAME Spec environment supplies it. [Machine-readable inventory](SPEC_INVENTORY.json).

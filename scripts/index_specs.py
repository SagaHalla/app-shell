#!/usr/bin/env python3
"""Index current formal document roots without inferring implementation or deployment."""
from pathlib import Path
import argparse
import hashlib
import json
import os
import sys
try:
    import yaml
except ImportError:
    raise SystemExit('PyYAML is required; use the sibling GAME Spec Python environment.')
ROOT = Path(__file__).resolve().parents[1]
PRODUCT = 'app-shell'
RELATED_SPEC_HOMES = [{'label': 'sagahalla-workbench-core', 'url': 'https://gitlab.com/sagahalla-game/game-spec/-/blob/main/specs/sagahalla-workbench-core/spec.yaml', 'scope': 'Related versioned contract in GAME Spec; no runtime/deployment claim'}]
PATTERNS = ('.game/specs/*/spec.yaml', 'specs/*/spec.yaml',
            'docs/.game/specs/*/spec.yaml', 'trusted-services-network/spec.yaml',
            'game-vae/.game/specs/*/spec.yaml', 'oracle-ve/.game/specs/*/spec.yaml')

def outputs():
    paths = sorted({p for pattern in PATTERNS for p in ROOT.glob(pattern) if p.is_file()})
    rows, seen = [], set()
    for path in paths:
        document = yaml.safe_load(path.read_text())
        spec = document['spec']
        if spec['id'] in seen:
            raise ValueError('Duplicate current spec ID: ' + spec['id'])
        seen.add(spec['id'])
        rel = path.relative_to(ROOT).as_posix()
        rows.append({'id': spec['id'], 'title': spec['title'], 'path': rel,
                     'document_status': spec['status'], 'revision': spec['revision'],
                     'baseline_hash': spec.get('baseline_hash'),
                     'source_sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                     'location': 'preferred_stable_path' if rel.startswith('.game/specs/') else 'existing_stable_path_exception',
                     'deployment_status': 'not_assessed', 'live_plan_status': 'read_authoritative_GAME'})
    data = {'schema_version': 'product-spec-inventory.v0.1', 'product': PRODUCT,
            'scope': 'Configured current formal-spec roots; excludes examples, tests, historical reviews and fixtures',
            'status_semantics': 'Document lifecycle only; no implementation, acceptance, priority or deployment inference',
            'related_contract_homes': RELATED_SPEC_HOMES, 'specs': rows}
    lines = [f'# {PRODUCT} — specs and document index', '',
             'Formal paths stay stable across lifecycle changes. Status below comes from the YAML document; live work and acceptance remain in authoritative GAME. Deployment is not assessed here.', '',
             '## Formal GAME Specs in this repository', '']
    if rows:
        lines += ['| Spec | Document status | Revision | Baseline recorded | Path convention |',
                  '| --- | --- | ---: | --- | --- |']
        for row in rows:
            lines.append(f"| [{row['title']}](../{row['path']}) | {row['document_status']} | {row['revision']} | {'yes' if row['baseline_hash'] else 'no'} | {row['location']} |")
    else:
        lines += ['No current formal YAML spec was found in the configured roots. This does not establish an absence of requirements: product contracts may live in another owning repository or established design documents.']
    if RELATED_SPEC_HOMES:
        lines += ['', '## Related contract homes', '']
        lines += [f"- [{x['label']}]({x['url']}) — {x['scope']}" for x in RELATED_SPEC_HOMES]
    lines += ['', '## Document organization', '', '- [Organization convention](SPEC_ORGANIZATION.md)']
    candidates = []
    for pattern in ('docs/architecture/*.md', 'docs/evaluations/**/README.md', '*/docs/evaluations/**/README.md'):
        candidates.extend(ROOT.glob(pattern))
    for path in sorted(set(candidates)):
        if path.is_file():
            rel = os.path.relpath(path, ROOT / 'docs')
            title = path.read_text().splitlines()[0].lstrip('# ').strip()
            lines.append(f'- [{title}]({rel})')
    for name in ('DOMAIN_PROFILE_RUNTIME.md', 'NORMATIVE_DESIGN_SPEC.md', 'README.md'):
        if (ROOT / 'docs' / name).exists():
            lines.append(f'- [Existing {name}]({name})')
    if (ROOT / 'docs/reviews').exists():
        lines.append('- [Dated review evidence](reviews/) — historical source/test evidence, not current spec discovery')
    if (ROOT / 'plans/agent-knowledge-and-analytics-evaluation/README.md').exists():
        lines.append('- [Deferred knowledge evaluation inventory](../plans/agent-knowledge-and-analytics-evaluation/README.md) — not an executable spec or seed')
    lines += ['', 'Existing canonical and legacy paths are preserved. Do not sort specs into live/draft/deferred directories; keep status in metadata and work/release records.', '',
              'Refresh: `python3 scripts/index_specs.py`. Drift check: `python3 scripts/index_specs.py --check`. Requires PyYAML; the sibling GAME Spec environment supplies it. [Machine-readable inventory](SPEC_INVENTORY.json).', '']
    return {'docs/SPEC_INVENTORY.json': json.dumps(data, indent=2) + '\n', 'docs/SPECS.md': '\n'.join(lines)}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    stale = []
    for name, text in outputs().items():
        path = ROOT / name
        if args.check:
            if not path.exists() or path.read_text() != text:
                stale.append(name)
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text)
    if stale:
        print('Stale inventory: ' + ', '.join(stale), file=sys.stderr)
        return 1
    print('PASS: inventory current' if args.check else 'Updated spec inventory and index')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())

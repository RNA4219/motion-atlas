"""ZIPを標準ライブラリで開き、CRC・ライセンス・全項目の収録を検証する。"""
import argparse
import importlib.util
import json
import re
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--skill-validator', type=Path)
args = parser.parse_args()
validator = None
if args.skill_validator:
    spec = importlib.util.spec_from_file_location('quick_validate', args.skill_validator)
    validator = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(validator)

manifest = json.loads((ROOT / 'dist/manifest.json').read_text(encoding='utf-8'))
license_text = (ROOT / 'LICENSE').read_bytes()
checks = []
for entry in manifest['entries']:
    item_id = entry['id']
    prefix = 'motion-atlas-' + item_id + '/'
    with zipfile.ZipFile(ROOT / 'dist' / entry['zip']) as archive:
        assert archive.testzip() is None, item_id
        names = archive.namelist()
        assert len(names) == entry['zip_files'] == len(set(names)), item_id
        assert all(n.startswith(prefix) and '..' not in n and '\\' not in n for n in names), item_id
        assert archive.read(prefix + 'LICENSE') == license_text, item_id
        assert archive.read(prefix + 'assets/demo.html') == (ROOT / 'dist' / entry['html']).read_bytes(), item_id
        skill = archive.read(prefix + 'SKILL.md').decode('utf-8')
        assert re.search(r'^name: motion-atlas-' + re.escape(item_id) + r'$', skill, re.M), item_id
        for link in re.findall(r'\]\(([^)]+)\)', skill):
            assert prefix + link in names, (item_id, link)
        for source in [n for n in names if n.endswith('.js')]:
            assert archive.read(source) == (ROOT / 'src' / Path(source).name).read_bytes(), source
        if validator:
            with tempfile.TemporaryDirectory(prefix='atlas-skill-', dir=ROOT / 'reports') as temp:
                (Path(temp) / 'SKILL.md').write_text(skill, encoding='utf-8')
                valid, message = validator.validate_skill(temp)
                assert valid, (item_id, message)
    html = (ROOT / 'dist' / entry['html']).read_text(encoding='utf-8')
    assert not re.search(r'<(?:script|link|img|iframe)\b[^>]*(?:src|href)\s*=', html, re.I), item_id
    assert not re.search(r'\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(', html), item_id
    checks.append(item_id)
with zipfile.ZipFile(ROOT / 'dist/downloads/motion-atlas-all.zip') as archive:
    assert archive.testzip() is None
    assert len([n for n in archive.namelist() if n.endswith('.html')]) == manifest['count']
    assert archive.read('motion-atlas-samples/LICENSE') == license_text
    for entry in manifest['entries']:
        assert archive.read('motion-atlas-samples/' + entry['id'] + '.html') == (ROOT / 'dist' / entry['html']).read_bytes()
report = {'standalone_checked': len(checks), 'skill_zips_checked': len(checks), 'all_samples_zip': 'pass', 'skill_validator': 'pass' if validator else 'not_requested', 'failures': []}
(ROOT / 'reports/artifacts.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, ensure_ascii=False))

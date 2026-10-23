"""Import the MIT-licensed 1404 province/city snapshot; no runtime network calls."""
import csv
import hashlib
import io
import json
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://raw.githubusercontent.com/Hameds/IranCountryDivisions/main/'
def fetch(path):
    with urlopen(BASE + path, timeout=60) as response:
        return response.read()

raw = fetch('data/1404/iran.csv')
rows = list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))))
print('Fields:', list(rows[0]))
by_id = {str(row['Id']): row for row in rows}
provinces = [row for row in rows if row['DivisionType'] == '1']
groups = {str(row['Id']): [] for row in provinces}
for row in rows:
    if row['DivisionType'] != '5':
        continue
    parent = row
    while parent['DivisionType'] != '1':
        parent = by_id[str(parent['ParentCountryDivisionId'])]
    groups[str(parent['Id'])].append(row['Name'].strip())
locations = [{'id': row['Code'], 'name': row['Name'].strip(), 'cities': sorted(set(groups[str(row['Id'])]))} for row in provinces]
assert len(locations) == 31
city_count = sum(len(p['cities']) for p in locations)
assert city_count >= 1400
target = ROOT / 'src/data/iranLocations.ts'
target.write_text('// Imported from Hameds/IranCountryDivisions, 1404 snapshot (MIT). See docs/iran-locations-source.md.\n'
    + 'export interface IranProvince { id: string; name: string; cities: string[] }\n'
    + 'export const iranProvinces: IranProvince[] = ' + json.dumps(locations, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
licenses = ROOT / 'public/licenses'
licenses.mkdir(exist_ok=True)
(licenses / 'iran-country-divisions-MIT.txt').write_bytes(fetch('LICENSE'))
metadata = json.loads(fetch('data/1404/metadata.json'))
(ROOT / 'docs/iran-locations-source.md').write_text(
    '# Iran province/city snapshot\n\nImported 2026-10-24 from [Hameds/IranCountryDivisions](https://github.com/Hameds/IranCountryDivisions), '
    'the 1404 source snapshot. Source publisher attributes it to the Statistical Center of Iran. '
    'This local derivative keeps provinces and cities only, follows district/county parents to the province, excludes urban zones and villages, '
    'and deduplicates identical names within the same province for address selection.\n\n'
    f'Included: {len(locations)} provinces and {city_count} province/city name pairs. Upstream city count: {metadata["counts"]["city"]}. '
    f'CSV SHA-256: `{hashlib.sha256(raw).hexdigest()}`.\n\n'
    'MIT copyright: Hamed Saeedi (2020). Full license: `public/licenses/iran-country-divisions-MIT.txt`. '
    'Regenerate with `python scripts/update-iran-locations.py`; review the source and count changes before release. '
    'Forms make no external location requests. This is a versioned snapshot, not a continuously updated administrative registry.\n', encoding='utf-8')
print(f'Imported {len(locations)} provinces / {city_count} city names')

# Iran province/city snapshot

Imported 2026-10-24 from [Hameds/IranCountryDivisions](https://github.com/Hameds/IranCountryDivisions), the 1404 source snapshot. Source publisher attributes it to the Statistical Center of Iran. This local derivative keeps provinces and cities only, follows district/county parents to the province, excludes urban zones and villages, and deduplicates identical names within the same province for address selection.

Included after the owner-approved 2026-10-30 cleanup: 31 provinces and 1458 province/city name pairs (1478 before cleanup). Upstream city count: 1481. CSV SHA-256: `7fc95cc5fd20be3b960e33a9f72ec2d12ef7d87f417e12eaa26a0f6097ac0d18`.

The owner approved the separate cleanup preview on 2026-10-30. Exactly 20 numbered choices from seven provinces were removed, while their existing unnumbered names were retained. The exact list is in `scripts/data/iran-city-cleanup.json`; regeneration applies that list rather than stripping arbitrary numeric suffixes. This is a storefront display choice, not a claim about official administrative status.

MIT copyright: Hamed Saeedi (2020). Full license: `public/licenses/iran-country-divisions-MIT.txt`. Regenerate with `python scripts/update-iran-locations.py`; review the source and count changes before release. Forms make no external location requests. This is a versioned snapshot, not a continuously updated administrative registry.

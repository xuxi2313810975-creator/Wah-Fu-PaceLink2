# v4 verification · 2026-11-16

**12 Node unit/contract tests, 3 Python import tests, map browser checks, the existing full journey flow and accessibility controls passed locally.** No production deployment or on-site facility verification is claimed.

## Detailed map checks

- Imported the exact supplied `map.osm`: 597 geometry features and 215 uniquely identified places. Source-file hash recorded in `DATA_SOURCES.md`.
- Locations stay within the stated display bounds; all source feature links match their IDs. The site output omits contributor account fields.
- Complete building rings and courtyard holes are retained, including three rings for relation 2576093. The incomplete wood relation is excluded. A fixture verifies member outlines are not duplicated.
- Clipping tests ensure disconnected entries remain separate. Reversed way segments assemble into closed rings; missing edges are not invented.
- Counts for 8 lifts, 3 toilets, 2 drinking-water points and 17 shelters are retained. No benches are inferred from shelter tags.
- The route snapshot is byte-for-byte identical to v3; the sample H13 → R3 journey remains 560 m, 15 min at the slow pace, 17 min with a 2 min rest.
- Chinese landmark labels, classification filters (30 useful-facility records, 22 shop/food records, 52 stair records), landmark lookup, source cards and close controls.
- Landmark selection centres the mapped location. Map view survives category and language changes; language also preserves selection. Route/Estate buttons reset the view. Clusters zoom; labels can be hidden and restored.
- Overview progressively displays additional categories when zoomed. Desktop overview and mobile map screenshots inspected. Large-text layout checked at 320 and 390 CSS pixels without horizontal overflow.
- A chosen library and shop show the source names. Lift, shelter and stair descriptions do not promise verified operation, seating or passage on the selected route.
- No page JavaScript errors in the completed browser checks.

## Existing functions checked again with v4

- All 286 valid saved routes retain geometry, direction and distance across sections. Two withheld routes create no stages. Disconnected paths remain separate.
- API input validation, fallback from barrier-free to general walking, caching, near-zero route withholding and upstream failures.
- Full flow using three real government API route responses: intermediate position → rest space → rest screen → original destination → return home from the last manually confirmed section.
- Saved directional route reuse, already-at-home handling, error/retry states and cancellation of stale responses.
- Login-demo preference persistence, clearing, blocked-storage handling, shared-link precedence, modal keyboard focus and mobile layout.
- Read-aloud voice selection, stop/end, current-stage narration and cancellation on changes, using a deterministic mocked speech engine. Device audio quality is not established by these checks.
- Large-text layouts at 320, 390, 768, 1024 and 1440 pixels. English UI and the settings dialog translate correctly; source proper names without an English name intentionally remain available in map cards.

## Reproduce

```sh
node --test tests/*.test.cjs
python3 -m unittest discover -s tests -p test_osm_import.py
```

Browser scenarios: `tests/browser-map.mjs`, `tests/browser-flow.mjs`, `tests/browser-accessibility.mjs`. They need Playwright and Chromium, or an installed browser specified with `CHROME_PATH`. Start the local server first. Map checks also accept `BASE_URL`; other scenarios use port 4173. Results are written to `test-results/`.

Environment: Node.js, Python 3, local server, Google Chrome / Playwright. Not tested with elderly residents, iOS/Safari or Android. Map records are not a field audit, real-time lift status or a guarantee of accessible entrances. A future Vercel deployment and upstream availability remain external to these local checks.

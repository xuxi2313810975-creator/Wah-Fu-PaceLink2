# 資料來源與授權 / Data sources and notices

Route snapshot date / 路線資料日期: **2026-11-11**

Detailed map import / 詳細底圖匯入日期: **2026-11-16**（匯入日期並非所有地物的更新日期）

## Route geometry and distances

Lands Department, HKSAR Government, 3D Pedestrian Route Search API.

- API documentation: https://portal.csdi.gov.hk/csdi-webpage/apidoc/3d-pedestrian-route-search
- Dataset: https://data.gov.hk/en-data/dataset/hk-landsd-openmap-3d-pedestrian-network
- Service: https://mapapi.hkmapservice.gov.hk/PedRoute/NAServer/route/solve
- Terms: https://portal.csdi.gov.hk/csdi-webpage/doc/TNC
- Logo source: https://www.landsd.gov.hk/images/landsd_logo.svg

**Map from Lands Department. © HKSAR Government. CSDI Portal.**

Queries used `travelMode=2` (barrier-free), falling back to `travelMode=1` (shortest general walking) only when no barrier-free solution was returned. Each direction was queried separately. Distances use `Total_Length`; scenario times are computed from those distances. A returned route is not a guarantee of current physical accessibility.

原始查詢資料保存在同一份作業的 `WahFu_Walking_Analysis_2026-11-11/raw` 資料夾。新版保留原始端點路線快照；途中位置透過 `api/route.js` 查詢政府服務，並在畫面顯示查詢時間。

The source query archive is kept separately in the assignment's `WahFu_Walking_Analysis_2026-11-11/raw` folder. Version 2 retains the saved reference-endpoint routes and queries the government service through `api/route.js` for new intermediate-position journeys. Newly retrieved results show their retrieval time.

## Original reference coordinates and earlier basemap

© **OpenStreetMap contributors**, available under the **Open Database License (ODbL)**.

- Copyright and licence: https://www.openstreetmap.org/copyright
- Source bounding box: `114.130,22.246,114.143,22.258`
- Source download: https://api.openstreetmap.org/api/0.6/map?bbox=114.130,22.246,114.143,22.258
- Per-location source URLs are retained in `data.js` and linked from the selected route's source section.

Extracted neighborhood geometry is filtered for display. Building/facility bounding-box centres are used as reference coordinates, not verified entrances. Building names use OSM `name:en`; descriptions such as “market mall” clarify that a commercial complex reference point is being used, not a verified market-floor entrance. Preserve OpenStreetMap attribution and comply with ODbL when redistributing or modifying the OSM-derived database in `data.js`.

## Wah Fu (North) stop

Transport Department / Citybus open data, stop `002338`:

https://rt.data.gov.hk/v2/transport/citybus/stop/002338

The coordinate is the public stop reference location at retrieval, not a claim about every boarding pole or present-day operating arrangements.

## Market context

Hong Kong Housing Authority:

- Wah Fu I commercial facilities: https://www.housingauthority.gov.hk/tc/commercial-properties/shopping-centres/list-of-shopping-centres/details/wah-fu-1/index.html
- Wah Fu II commercial facilities: https://www.housingauthority.gov.hk/tc/commercial-properties/shopping-centres/list-of-shopping-centres/details/wah-fu-2/index.html

## D3 library

- D3 **7.9.0**, pinned local copy: `d3.v7.min.js`
- Download: https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js
- Project: https://github.com/d3/d3
- Licence: ISC, included at `D3-LICENSE`.
- SHA-256: `f2094bbf6141b359722c4fe454eb6c4b0f0e42cc10cc7af921fc158fceb86539`

The site has no remote font, map-tile or CDN dependency at runtime. No analytics or real account authentication is included; v3 adds a browser-only preferences demo. The chosen language is stored in the visitor's browser; the selected route can be represented in the URL for sharing.


## Version 2 journey calculations / 新版行程計算

The adapter accepts only endpoints within the source bounding box. Within each function instance, requests are spaced at least 850 ms apart; identical queries share a five-minute in-memory cache (up to 120 entries). This is not a global cross-instance rate limit. GET query coordinates are map reference points selected in the prototype, not device GPS. The site requests no location permission, user account or personal profile.

For named residential/destination endpoint pairs, the independently queried saved outbound or return route is reused. All other routes are obtained from the selected or last manually confirmed position. A return journey is never produced by merely reversing an outbound polyline.

Sections use cumulative 2D polyline lengths; they do not join disconnected path parts. The source 3D `Total_Length` is divided proportionally across sections. The target is approximately 120 metres per section, capped at 12 sections. Consequently this is an approximate map subdivision, not a measured walking landmark, a verified rest location, or a clinical walking prescription. Source directions, where available, are shown as related network directions rather than field-validated instructions.

The three rest candidates are Hong Fu Playground (R1), Waterfall Bay Park (R2), and Wah Lam Path Sitting-out Area (R3). Their location sources are inherited from the original OSM-derived data. Seating, cover, step-free entrances, photographs and audit dates are unverified. No ranking by walking distance or claim of seat availability is made.

Existing time assumptions and route-withholding rules continue to apply. A successful new API response does not establish present-day route safety, opening status, closure status or seat availability.

## Version 3 interface / 新版介面（2026-11-16）

The sign-in demo stores a versioned browser-only record containing a reference home ID, language and a larger-text flag. It is not authentication and does not create a server account. Existing route/language query parameters are respected. The earlier language preference may also remain in the browser independently of the demo record.

Read-aloud uses the browser Web Speech API. Available voices are supplied by the browser/operating system; Cantonese is preferred when present, with an explicit notice for another Chinese voice. No microphone or recording is used. Audio does not start automatically, and older spoken instructions are canceled when the journey content changes.

References checked on 2026-11-16: [MDN SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis), [W3C older users](https://www.w3.org/WAI/older-users/). These references inform implementation choices, not a claim of resident validation or accessibility certification.


## Version 4 supplied OSM map / 使用者提供的詳細底圖

- Input: user-supplied `map.osm`, imported on 2026-11-16. The original file is unchanged; the delivered `reference/` folder contains an exact copy outside the website upload folder.
- SHA-256: `a3d85a428d9bf6df7aa4b3541253d6e367dc03a3562d16ae04b640de16c185c7`.
- XML declared export bounds: west 114.1344160, south 22.2492830, east 114.1415670, north 22.2542820. OSM exports also include complete referenced ways extending outside the requested box.
- Display/study bounds: west 114.130, south 22.246, east 114.143, north 22.258. Line geometry is clipped; complete polygons intersecting the area are retained and clipped by the visible map viewport. This does not claim complete coverage of every feature in the larger display area.
- Output: `map-data.js`, rendered by `map-details.js`. The import script `scripts/import-osm.py` retains source IDs, bilingual names and selected facility tags. Contributor usernames and account IDs are omitted from the website output.
- Counts: 597 geometry features; 215 POI records — 39 buildings, 4 parks, 13 community facilities, 22 shops/food premises, 55 bus/transport records, 52 stair records, 8 lifts, 3 toilets, 2 drinking-water points and 17 shelters. These are map records, not independently audited facilities; nearby or overlapping records may describe related features.
- Multipolygon outer rings and courtyard holes are preserved. The incomplete wood relation `11795323` is excluded rather than connected with invented edges. Member building outlines are not duplicated as standalone fills.
- A polygon label uses a bounding-box centre, not an entrance. A line label uses a mapped vertex. English category-and-ordinal labels are used where the source lacks an English name, with the original name available in the card.
- The supplied extract contains no imported `amenity=bench` records. A shelter is shown as a shelter, never converted to a confirmed seat. Lift and wheelchair tags describe source records, not verified current usability.
- The route snapshot in `data.js` is byte-for-byte unchanged (SHA-256 `da6beaa1c76c57a2b492a1f42876a741e8dcb71a04f4b902cb0bcf25c079bdd0`). Existing route/reference sources and the three candidate rest spaces remain independent of the new display landmarks.

© OpenStreetMap contributors. The OSM-derived database remains subject to [ODbL and OpenStreetMap attribution requirements](https://www.openstreetmap.org/copyright). Each landmark retains a clickable source feature URL. Keep the on-page OpenStreetMap and Lands Department attribution when redistributing this website.

# Phase 1 — Step 5: frontend QA and responsive audit

Audit completed locally on 2026-10-30, with baseline captures from 2026-10-29. Scope is the approved customer storefront/account and seller workspace. The platform/developer console stays removed; `#/platform` and `#/platform/users` were tested as not-found cases. No backend work, real authentication, payment, order submission or operational seller writes were introduced. The owner approved publication of the final changes after this audit.

The conversation is the Project Master Instructions, as confirmed by the owner. Approved glass surfaces, typography, card dimensions, photo crops, gradients, shoe icons, floating header, mobile island, tablet menu and landscape behavior were preserved. The separately previewed city cleanup was approved on 2026-10-30 and is now applied.

## Route inventory

The complete concrete inventory and tested query/negative states are in [phase-1-step-5-routes.json](phase-1-step-5-routes.json). It contains **187 route cases**, not 187 independent page components: 143 initial cases plus 44 additional links discovered in rendered pages. Each was rendered at all five required widths, for **935 route/viewport checks**.

| Group | Route patterns and coverage |
| --- | --- |
| Landing | `#home`, `#products`, `#brands`, `#discovery`, `#about`, `#gifts`, `#journal`, `#discovery-sets` |
| Public | `#/catalog`, `#/brands`, `#/families`, `#/notes`, `#/about`, `#/contact`, `#/journal`, `#/form-studio` |
| Collections | All five `#/collections/:slug` entries, including the inherently empty gift collection |
| Catalog data | All six `#/brands/:id`, thirteen `#/families/:slug`, twenty-two `#/notes/:slug` entries |
| Products | All nine `#/product/:slug` entries, every defined volume/variant URL, invalid-variant fallback |
| Shopping | `#/compare` with empty/selected IDs, `#/cart`, `#/checkout`; populated state was seeded locally |
| Customer | `#/account` and `overview`, `profile`, `addresses`, `orders`, `wishlist`, `cabinet`, `recent`, `preferences`, `reviews`, `support`, `notifications`; both fictional order-detail routes |
| Seller | `#/seller`, `overview`, `products`, `product-new`, `brands`, `families`, `notes`, `variants`, `inventory`, `orders`, `customers`, `campaigns`, `reviews`, `content`, `shipping`, `support`, `reports`, `settings`; linked product editors and all five fictional order details |
| State/negative cases | Catalog filters and pagination; missing products, taxonomy, account/seller pages and seller records; removed platform URLs |

All 154 unique href strings collected from the baseline were accounted for: existing inventory cases, local anchors, or the 44 added query/record cases. This checks local route targets, not the availability of third-party websites.

## Method and responsive results

Production output was built first, then served statically from `dist` on `http://127.0.0.1:3101`. Existing installed Chrome and Playwright were used; no browser/dependency installation was needed. The `ui-responsive-audit` and `ui-ux-pro-max` skills informed the audit.

Before the large matrix, 21 screenshots sampled home/catalog/product detail at 360×800, 667×375, 768×1024, 1024×768, 1440×900, 2560×960 and 3440×1440. Representative hero, tablet, desktop catalog and product-detail samples were visually inspected. These checks include the previously approved iPhone SE landscape and wide-low/ultrawide compositions.

| Viewport | Route cases | Document overflow / unexpected valid-page 404 | Interactive customer journey | Affected-state follow-up |
| --- | ---: | --- | --- | --- |
| 360×800 | 187 | None found | Passed | Passed |
| 390×844 | 187 | None found | Passed | Passed |
| 768×1024 | 187 | None found | Passed | Passed |
| 1024×768 | 187 | None found | Passed | Passed |
| 1440×900 | 187 | None found | Passed | Passed |

Baseline routes were sampled at top/middle/bottom scroll positions; home also at 20% and 80%. Baseline checks found no page exceptions, broken loaded images, missing image `alt` attributes, unnamed visible buttons, or unlabelled visible fields under the harness's DOM visibility/name checks. **These are automated DOM/render checks, not 935 individually reviewed screenshots or an accessibility certification.** All routes use shared responsive components; representative screenshots cover cart, checkout, comparisons, account forms and seller tables. Not every permutation of filters, text lengths and mock data was screenshot-reviewed.

Affected states were rechecked at all five widths after fixes: five-product catalog page, empty gifts, newsletter submission, and product volume options with active comparison controls. Browser hit-testing confirmed each option's center could receive the click. The same follow-up passed at 667×375. Selected final screenshots were visually inspected, including mobile cart, mobile dropdown, tablet comparison and desktop catalog.

## Reproduced bugs and fixes

1. **Catalog page size contradicted the approved five-column layout.** Pagination still returned four products. Shared page size is now five, with the remaining four on page two. URL pagination and all nine products remain reachable.
2. **Inherently empty gift collection offered an ineffective filter reset.** It now explains that the mock collection has no products and links to the full catalog. No products were invented or reassigned.
3. **Real-product comparison showed empty note-pyramid rows.** The approved dataset only provides selected notes. Comparison now displays those under “نت‌های منتخب”; it does not fabricate top/middle/base roles. The legacy path retains its pyramid with an explicit undefined fallback.
4. **Footer shipping opened the privacy/policies dialog.** Shipping now has its own correct title and clearly mock shipping/returns explanation, without promising operational policies.
5. **Bottom chrome intercepted mobile volume-option clicks.** A real Chrome click was blocked first by the island, then by the active comparison shortcut. Mobile select panels now reserve bottom clearance for the existing controls. The island remains visible, the three-row list and its thin rail/oval remain unchanged, and seller panels without customer chrome retain their existing positioning.
6. **An unnecessarily heavy approved audience SVG contained compressible PNG data.** Lossless IDAT recompression reduced it from 535,750 to 489,742 bytes (46,008 bytes saved, about 8.6%). The decoded 1254×1254 scanlines have the same SHA-256; geometry, colors, transparency and SVG effects were preserved. This is not a vector redraw or a lossy quality change.

Regression tests cover five/four pagination, gift empty-state recovery, selected-note comparison, and the lossless asset invariant.

## Interaction and keyboard coverage

The five-width customer flow exercised header/island search from a scrolled position, typing without a jump, clear-then-close, menu open/close, catalog paging, collection recovery, brand/price and compound-note filters, cart add/plus/minus with fixed CTA height, wishlist/shared cart, comparison selection, 100 ml volume selection, invalid/valid discount, all checkout steps and fictional completion, demo-order opt-in/cancellation-dialog dismissal, eligible review save/delete, support draft, newsletter, and footer shipping dialog/Escape/focus return. Observed requests in that flow contained no non-GET/HEAD operations; this observation is not a security guarantee.

Additional checks at 390 and 1440 exercised profile persistence across navigation, address create/edit/delete with Persian-digit postal code, preference/notification persistence, cabinet ownership/liked state, and contact-form validation/valid completion. Only fictitious input was used. City-study province comparisons were checked separately at both widths.

Seller checks exercised product validation/creation, image preview, stock confirmation/update, volume creation, order progression, review approval, local support response, taxonomy create/edit/search, campaign validation, shipping settings, invalid email, fictional customer lookup, sorting/pagination, reload reset and absence of operational network writes. Visitor denial and loading/empty/error/retry/filter-reset states passed at all five required widths. Existing seller keyboard checks passed: skip link, arrow-driven fields/selects, Escape, modal Tab containment and focus return, settings persistence across navigation and storefront return. Unit tests also verify analyst read-only behavior and frontend-only role boundaries.

Semantic inspection covered landmarks, table captions/scopes, named buttons, explicit field labels, error associations, visible focus styles, RTL and Persian numerals. Existing small phone/coarse-pointer link hit areas use pseudo-elements; compact visual sizes were not enlarged. Home was additionally audited in normal and reduced-motion states.

## Raw responsive scanner findings and triage

The bundled scanner normalizes away URL hashes. It was therefore used for home, with the custom hash-aware route matrix covering the SPA. Its ten home cases (five widths × normal/reduced motion) produced **540 raw findings: 490 critical and 50 medium**. They have not been rewritten as a zero-finding result.

| Raw category | Count | Reviewed interpretation |
| --- | ---: | --- |
| Fixed/sticky overlay intersections | 457 | Scroll content geometrically intersects the approved floating header/island. Representative natural-scroll screenshots and end/interaction states were checked; not every raw intersection was visually adjudicated. The genuine blocked dropdown interaction was fixed separately. This category is not blanket-dismissed as a pass. |
| Static sibling collisions | 29 | Every pair includes `note-filter-help` inside the closed notes disclosure. Follow-up visibility checks at five widths show it is not painted; selected screenshots corroborate this. |
| Occlusion | 4 | The wide eyebrow paragraph box intersects the pause hit area. Actual right-aligned text and left-side icon do not overlap in inspected hero screenshots. |
| Tap-size hints | 50 | Element rectangles exclude existing pseudo-element phone hit areas; other hints are desktop text links. Visual controls and existing hit-area choices were preserved. This does not certify all controls as 44 px. |

The classification, actual matrix counts, asset proof and follow-up results are captured in [phase-1-step-5-results.json](phase-1-step-5-results.json).

## Performance and code-quality inspection

- All three runtime dependencies (React, React DOM, Lucide) and existing build dependencies have active uses. No speculative dependency removal or new dependency was introduced.
- Shared cart/customer state and shared form/select/card components remain in place. Seller code remains lazily loaded; no duplicate cart or broad unmeasured memoization rewrite was added.
- The lossless audience-asset change above is the measured asset optimization. Approved hero/product photos and typography were preserved. Old experiments and user-provided files were not deleted on the assumption that they were unused.
- Final production sizes: main JS about 329.00 kB / 108.29 kB gzip; seller chunk about 31.06 kB / 10.66 kB gzip; CSS about 118.20 kB / 23.49 kB gzip. These are output sizes, not Lighthouse/Core Web Vitals measurements.
- Sahel is local with `font-display:swap`; the approved Latin Google font remains an external dependency. Offline font parity is not guaranteed.

## City cleanup — owner approved and applied

The owner reviewed the separate sample and approved it on 2026-10-30. Exactly twenty numbered city choices were removed from seven provinces; their existing unnumbered names were retained. `src/data/iranLocations.ts` now has 1458 choices across the same 31 provinces. The exact removal list is versioned in `scripts/data/iran-city-cleanup.json`, and the import script preserves it during regeneration. This is an approved storefront display choice, not an authoritative geographic correction.

Post-approval verification confirmed an exact diff of those twenty removals, with no added cities, other removals or reordered names. Chrome checks at 390 and 1440 verified all twenty excluded options and their retained base names across the seven affected provinces in the account address form, which shares its location controls and data with checkout. All 34 tests and the production build passed after applying the cleanup. Evidence: `preview/phase5/city-applied.json`.

Build the isolated read-only preview after a production build:

```powershell
npm run build
node scripts/qa/city-cleanup-study.mjs
```

Then, with `dist` served on port 3101, open `http://127.0.0.1:3101/preview/city-cleanup.html`. The study now shows before-cleanup/current lists, counts, highlighted removed choices and province switching. It writes only that preview HTML and does not alter application data. Rebuilds clear `dist`, so regenerate the study afterward.

## Remaining known issues and limits

- City cleanup is approved and applied; the geography is still a versioned snapshot, not a live registry.
- Photo-backed text and glass controls require a dedicated contrast review over representative image pixels, especially small price text over bright photos. The approved opacity was not silently darkened. No complete WCAG contrast or accessibility certification is claimed.
- Raw sticky-overlay warnings retain the limits described above; selected visuals and interactive checks do not individually adjudicate all 457 sampled intersections.
- Physical mobile keyboards, real iOS/Android, screen readers, Safari and Firefox were not tested. Existing Chrome only; emulation does not substitute for these tests.
- No Lighthouse/field performance metrics, real authentication, payment, shipping or production authorization testing was performed. Those services are not implemented in this frontend phase.
- Lint is not configured in `package.json`; it was not installed or claimed as passed.

## Regression results and evidence

- `npm test`: **34/34 passed**.
- `npm run build`: **passed**, including TypeScript `tsc -b` and Vite production compilation.
- `git diff --check`: **passed**. Git's LF/CRLF conversion warning is not a whitespace failure.

Local raw evidence is intentionally under the existing ignored `preview/` directory; summaries and the inventory above are tracked documentation:

- `preview/phase5/routes.json`, `matrix.json`, `followup.json`, `interactions.json`, `admin-states.json`, `final-evidence.json`, `landscape-evidence.json`.
- `preview/phase5/sample/`, `matrix/`, `interactive/`, `final/` screenshot folders.
- `preview/phase5/skill/audit-2026-10-29T17-19-56-176Z.json`, `findings-2026-10-29T17-19-56-176Z.json`, and corresponding `summary`, Markdown and HTML reports.
- `preview/phase5/asset-proof.json`, `city-candidates.json`, `city-390.png`, `city-1440.png`.
- Hash-aware local runners: `preview/phase5-{inventory,matrix,interactions,followup,final-evidence,admin-states}.mjs`; existing `preview/admin-{interactions,keyboard}-qa.mjs` and seller-only `preview/phase5-seller-settings.mjs`. These use the already installed local Playwright package; they are not added as a runtime dependency.

Recommended commit message:

```text
Fix frontend QA findings and document Phase 1 responsive coverage
```

Work stops at Step 5. Frontend-only scope is preserved; there is no platform-console restoration, backend work in this step.

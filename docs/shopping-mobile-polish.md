# Shopping and mobile UI refinements

2026-10-24. Owner requested five changes on the current frontend store. No commit or push; existing unrelated worktree changes were preserved. Preview: `http://127.0.0.1:3101/?view=shopping-polish#/account/addresses`.

## Implemented

1. **Iran address selectors:** account address forms and checkout share the approved LuxurySelect for province and dependent city. City is unavailable before province selection and resets when the province is selected. Both fields validate against the local province/city relation, including saved-address editing and checkout reuse. The 1404 snapshot includes all 31 provinces and 1,478 distinct province/city name pairs after merging identical names within a province; upstream has 1,481 city records. No location API is called. Source, hash, license and regeneration command are in [iran-locations-source.md](iran-locations-source.md).
2. **Keyboard movement:** single-line text fields use Up/Down to focus previous/next fields. Left/Right cross fields at text boundaries, respecting each field's RTL/LTR direction; ordinary caret movement and selections remain intact. Textareas cross only at their outer text boundaries. Checkboxes can move focus within their fieldset. Modifiers/composition, radio/range/date widgets and numeric Up/Down retain native behaviour. Email and number controls with unavailable caret APIs retain horizontal editing; Tab/Shift+Tab remain available. Closed custom selectors open with Up/Down and move between fields with Left/Right; open lists support Up/Down, Home/End, Enter and Escape. Search Enter selects the first matching option. Global listeners clean up on unmount. Focused fields are brought above fixed chrome when necessary.
3. **Compact cart:** image/name, total, unit price and delete appear together; volume and quantity sit in one compact row. Redundant apply-quantity action and always-visible stock/status paragraphs were removed; stock information remains accessible to assistive technology. Quantity edits apply immediately, invalid values show a Persian message and reset on blur, plus/minus use the shared cart and minus from one removes the line. No independent cart was introduced. Valid rows measured approximately 150–151 CSS px in browser QA.
4. **Shopping icons:** existing Lucide icons distinguish contact, address, shipping, review and payment. Standard shipping has a truck, express has a bolt, with a clear selected treatment and unchanged mock costs. Labels remain available; icons are decorative and do not imply real shipping or payments.
5. **Floating mobile menu:** warm panel, 26px rounded frame, subtle border/shadow, compact icon-led links and internal scrolling replace the edge-to-edge drawer. Backdrop uses a mild 5px blur and 22% dimming. The panel fits above the existing mobile island and handles short viewports. Native modal semantics, focus containment, Escape, outside click, previous focus restoration without page jumps and reduced-motion support remain in place. The island remains in the DOM and visible behind the modal backdrop; as expected for a modal, background controls are temporarily inert.

LuxurySelect retains its approved thin rail/oval thumb. The visible list is exactly three 42px rows (130px including gaps), with internal scrolling and search. Its selected value, required hint and validation errors are described to assistive technology. Long options retain their full accessible text while ellipsizing visually.

## Approved scroll-rail follow-up

The owner requested replacing the new scrollbars with the existing thin-line/oval design. Mobile menu scrolling and all LuxurySelect lists now share `src/components/ScrollRail.tsx` and `src/styles/scroll-rail.css`: 1px warm-neutral track and a fixed 6×11px muted-gold oval on the left. The invisible input hit area is 24px wide. Native vertical range interaction supports dragging, clicking the track and keyboard navigation; viewport touch/wheel scrolling and list-option keyboard controls remain intact. The oval synchronizes with scroll position, filtering and resizing; the entire rail hides when scrolling is unnecessary. Resize/mutation observers and scroll listeners are cleaned up. Keyboard focus is indicated around the small oval rather than by a tall rectangular border.

Additional changed files: `src/components/ScrollRail.tsx` (new), `src/styles/scroll-rail.css` (new), `src/components/LuxurySelect.tsx`, `src/components/MobileNavigation.tsx`, `src/styles/luxury-select.css`, `src/styles/mobile-navigation.css`, `src/main.tsx`, and this report. The established horizontal account-tab control is preserved. No dependency or configuration change.

Validation: build passed; 21/21 automated tests passed. Targeted Chrome checks passed at widths 360, 390, 533, 768 and 1440 in 520px-high windows, verifying click/drag, Home/End, left-edge positioning, hiding after search and when the menu fits, reappearing after resize, no overflow and no application errors. The short-window shopping regression also passed at 390×520 and 768×520. A final visual inspection confirmed the thin left track and small oval. Native pseudo-element dimensions are not reliably exposed by Chrome `getComputedStyle`; visual screenshots and the CSS declarations establish track/thumb geometry, while DOM checks establish the 24px interactive area and position. Evidence: ignored `preview/scroll-rails/results.json`, `select-*.png`, `menu-*.png`. No push.

Suggested follow-up commit: `Unify menu and select scrollbars with the approved oval rail`.

## Files

Created:

- `src/data/iranLocations.ts` — typed local province/city snapshot.
- `src/lib/arrowFieldNavigation.ts` — keyboard movement with native-editing safeguards.
- `src/styles/mobile-navigation.css` — floating modal menu.
- `scripts/update-iran-locations.py` — standard-library importer, no package installation.
- `public/licenses/iran-country-divisions-MIT.txt`, `docs/iran-locations-source.md`, this report.

Modified:

- `src/components/CustomerForm.tsx`, `src/lib/customerForms.ts` — dependent selects and relational validation.
- `src/components/LuxurySelect.tsx`, `src/styles/luxury-select.css` — keyboard, disabled/error descriptions, precise three-row viewport.
- `src/pages/ShoppingPages.tsx`, `src/styles/customer.css` — compact rows and checkout icons.
- `src/components/MobileNavigation.tsx`, `src/App.tsx`, `src/main.tsx` — modal behaviour, keyboard listener lifecycle and CSS import.
- `tests/catalog.test.mjs`, `tests/approved-catalog.test.mjs`, `README.md` — geographic validation and documentation.

No dependencies, migrations, server configuration, authentication, payment integration or sensitive persistence changed. Geography adds about 12 KiB gzip to the current app bundle; the full country/village source is not shipped.

## Validation and evidence

- `npm run build`: TypeScript/Vite passed. `npm test`: 21/21 passed, including province coverage, common city membership and rejecting a city from another province. `git diff --check`: passed. No lint script is configured.
- Initial Chrome sample passed at 390×900 and 768×900. Short-window checks also passed at 390×520 and 768×520.
- Final end-to-end Chrome checks passed at widths 360, 390, 473, 533, 768, 1024 and 1440 (900px high). Measured cart row heights: 150–151px. No document overflow or application console errors.
- Tested contact keyboard movement in all four directions, preserving internal caret editing; textarea boundaries; selector keyboard opening/selection/Escape; exactly three visible list rows; missing province validation/focus; city reset; saved address editing with Persian postal digits; checkout address reuse; express-shipping cost update; review and inactive-payment UI; modal bounds, focus containment/restoration, Escape and outside dismissal. The persistent mobile island remained present.
- Ignored QA script: `preview/shopping-polish-review.mjs`, run via `node preview/image-card-study.mjs --shopping`. Results: `preview/shopping-polish/results.json` and `results-short.json`; screenshots: `cart-*.png`, `addresses-*.png`, `shipping-*.png`, `menu-*.png` in the same folder.
- A final regression sample of the approved product-card/cart controls also passed at 390 and 768px (`node preview/image-card-study.mjs --real --sample`), covering retained CTA labels, icon placement, separate volume quantities, stock limits, removal and content-linked gradients after the cart/form changes.

## Limits and next step

The geographic data is a versioned 1404 snapshot, not a live administrative registry. City-name duplicates within a province are merged because this UI does not request county/district. Physical mobile keyboards, screen readers and Safari/Firefox were not tested. All customer/shipping/payment behaviour remains demonstrative; personal form values remain in memory only. No unrelated design or future phase was started.

Next: owner review of these five refinements; commit/push to FixLandingPage only after an explicit request.

Suggested commit: `Polish mobile shopping forms, cart and navigation`.

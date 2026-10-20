# Multi-note AND filter
Date: 2026-10-20. Local preview awaiting owner approval; no commit or push.

## Behavior
Filters.noteIds replaces the single noteId field. Every selected note must occur in a product's scentNoteIds (AND). An absent or empty selection imposes no note restriction. Other search/brand/audience/family filters still combine with note selection.

A collapsible NoteFilters panel lists all 16 notes, including when results are empty. Selected options expose aria-pressed. Clicking a note on either a product card or the panel toggles that same shared selection. ActiveFilters displays one removable chip for each note, even when the selection panel is closed. Clear-all also removes note selection.

## Files
- src/types/product.ts: multi-note filter type.
- src/lib/filter.ts: all-selected-notes predicate.
- src/App.tsx: shared toggle state and component wiring.
- src/components/NoteFilters.tsx (new): accessible, keyboard-operable note selector with explanatory AND copy.
- src/components/ActiveFilters.tsx: individual note removal.
- src/components/ProductCard.tsx and ScentNoteList.tsx: propagate and expose selected note state.
- src/styles/global.css: selector layout and selected appearance.
- tests/catalog.test.mjs: AND, individual-removal result, other-filter composition, empty/duplicate/reset cases.
- README.md and this document: current behavior and verification.

## Verification
- npm test: 5 passed, 0 failed.
- npm run build: TypeScript and Vite passed.
- git diff --check: passed.
- Browser: vanilla + amber + pepper displays only Nuit Aubergine.
- Removing vanilla leaves amber + pepper and displays Nuit Aubergine and Ambre Epice.
- Adding rose to the three-note selection displays the empty state; removing rose restores the match.
- At 390px the selected chips wrap and remain visible/removable with no horizontal document overflow.
- Existing UI/UX audit separately measured the shared layout at 320–1440px; this fix does not constitute new real-device/cross-browser certification.

## Limits and configuration
Demo products only. Selection is page-local and resets on reload. No backend, API, dependency, migration or environment changes. Native details/summary and aria-pressed buttons preserve keyboard operation. The pure filter type is internal; there are no persisted legacy filters or external clients to migrate.

Suggested commit: fix: support conjunctive multi-note perfume filters
Next action: owner reviews this change together with the pending UI/UX audit before commit/push. No next roadmap phase has been started.


## Compact note sizing follow-up
At owner request, note controls were made more compact in src/styles/global.css: 16px icons (previously 20px on cards and 22px in the selector), 12–13px supporting labels, 32px desktop controls and 36px mobile/coarse-pointer controls with 8px spacing. The selection panel padding and closed height were reduced. These web targets exceed the 24px WCAG minimum; this is not a claim that they meet the stronger 44px target recommendation. Browser measurements at 360, 390 and 1440px confirmed these dimensions and no horizontal overflow. The change is CSS-only; note-selection logic is unchanged. Screenshot: ignored preview/compact-scent-notes.jpg. Suggested commit: style: compact scent note controls. No dependencies, migrations or configuration changes. Next action remains visual approval before commit/push.

## Equal-size product cards and compact collection tabs
Owner requested compact collection buttons and consistent card sizing. src/App.tsx now identifies the three catalog collection controls with catalog-tab. src/styles/global.css sizes them at 32px desktop/36px mobile with 13px labels; adds subtle rounded card borders, uniform padding and a flex-column card body; uses equal grid row tracks and margin-top:auto on the price footer. Product content remains untruncated. At 360, 390, 768, 1024 and 1440px, browser measurements confirmed equal card heights within each layout, aligned price tops and card bottoms per row (under 1px tolerance), and no horizontal overflow. The appearance preserves the owner's minimal/compact preference. Screenshot: ignored preview/aligned-product-cards.jpg. No dependencies, migrations, authentication or configuration changes. No new behavior tests added for this presentation-only change. Suggested commit: style: unify product cards and compact catalog tabs. Next action: owner review; no subsequent roadmap step implemented. Longer future content will increase all grid row heights together, rather than clipping text.

## Hover emphasis follow-up
src/styles/global.css adds hover emphasis for mouse/fine-pointer devices: product-card accent border and restrained shadow; button inset outline and contextual background; selected chips retain dark selected styling. Card geometry and text metrics are unchanged. Keyboard focus-within also emphasizes the card; reduced-motion disables its transition. Browser verified actual :hover on both a card and its favourite control at 1024px, including computed shadows. Screenshot: preview/hover-product-card.jpg (ignored). Existing favourite control still toggled correctly and test state was restored. No dependencies or configuration changes. Suggested commit: style: add restrained card and button hover emphasis. Await owner visual review before commit/push; no next phase started.

## Selected hover combination
Owner chose model 3 for cards and model 7 for buttons: fine-pointer hover translates cards upward 2px with a soft shadow; buttons invert to charcoal/white. Reduced-motion disables the card translation. The earlier outline-only hover has been replaced. CSS-only change, no new packages or migrations. Suggested commit: style: add subtle card lift and inverted button hover. Local preview pending approval; no push.

## Hover color adjustment
Owner replaced the charcoal/white button-hover treatment with sage #EDF0E8 and charcoal text/icons. Only the hover block in src/styles/global.css changed; 2px card lift and soft shadow remain. No new dependency or configuration. Suggested commit: style: use sage button hover color. Pending visual approval; no push.

## Publication approval — 2026-10-20
The owner approved all audit and follow-up changes and requested publication on FixLandingPage. This supersedes earlier pending-approval notes in this document. Final colors: white product cards, sage #D3DACC button hover, burgundy #8A4355 favourite hover with white icon. Cards lift 2px on mouse hover; reduced-motion disables movement. No main-branch merge requested.

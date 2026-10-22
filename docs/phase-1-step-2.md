# Phase 1 — Step 2: Fragrance catalog and discovery

Status: owner approved Step 2 and all follow-up refinements for commit and push on FixLandingPage. Scope stops at Step 2.

## Implementation
- Search by name, brand and notes; recommended, price, demo popularity, newest and demo rating sorting; result count and four-item pagination.
- Combined filters: brand, audience, price range, concentration, volume, family, AND scent notes, temperature, sweetness, season, occasion, mock availability and product type. Named removable chips and clear/reset empty states. Price, concentration, volume and stock match one variant consistently.
- Hash routes preserve filters, sort, page and selected variant; browser back works. Unknown routes and invalid products/families/notes have recovery links.
- Thirteen overlapping families, subfamilies and twenty educational note entries with original local vector illustrations, matching products and links into the catalog.
- Product detail gallery, explicitly labelled zoom crop, variants, per-ml price, mock stock, description, pyramid, seasonal/occasion tags, demo reviews, related/recent products, wishlist and temporary demo bag.
- Two or three products compared in a responsive attribute table. Fourth selections are disabled. Mobile table has a labelled, keyboard-scrollable internal region.
- Image/name links and compact comparison control reuse the approved white equal-height cards. Existing note/control sizes, sage hover, burgundy heart hover and reduced-motion handling are preserved.

## Created files
- src/components/{AdvancedFilters,CommercePages,ComparisonBar,DemoBag,DiscoveryNavigation,ProductGrid,StoreContext}.tsx
- src/pages/{CatalogPage,ComparisonPage,LibraryPage,ProductDetailPage}.tsx
- src/data/catalogLabels.ts
- src/lib/{catalog,demoBag,routes,storage,useHashLocation}.ts
- src/styles/catalog.css
- docs/phase-1-step-2.md

## Modified files
- src/App.tsx
- src/components/{ActiveFilters,FragranceDiscovery,Header,MobileNavigation,ProductCard,ScentNoteIcon}.tsx
- src/data/{fragranceFamilies,products,scentNotes}.ts
- src/lib/filter.ts
- src/types/{fragrance,product}.ts
- src/styles/global.css (exclude the new compact comparison control from the legacy generic minimum-height rule)
- tests/catalog.test.mjs and README.md

## Verification
- npm test: 11 tests, covering normalized search, compound filters, AND notes, focus wrap, data integrity, same-variant matching, sorting, comparison limit, route parsing and bag stock limits.
- npm run build: TypeScript and Vite production build.
- git diff --check: whitespace verification.
- Browser: catalog, product detail, comparison, family and note indexes checked at 360, 390, 768, 1024 and 1440px; no document horizontal overflow or broken images observed. Product rows retain equal-height cards. Comparison scroll stays inside its table on mobile and responds to the keyboard.
- Functional checks: price sorting/pagination, 10ml filtered result and matching detail link; 100ml sale/stock; unavailable variant disables add; bag variant/quantity/removal; compare 2/3 products and fourth limit; family → note → filtered catalog; wishlist add/remove and empty state; recently viewed; variant changes and browser back.
- No lint command exists in package scripts. No screen-reader certification or production service integration is claimed.

## Accessibility and security
Native labelled inputs/selects, semantic headings/links, visible focus, route-heading focus, skip link, dialog focus/Escape and comparison table headings are retained or added. Existing small approved controls are preserved by owner request. No secrets or customer information are introduced. Only validated demo product IDs are persisted for favourites/recent history; storage failures degrade safely. Bag state is temporary. All stock, prices, dates, popularity and review examples are explicitly fictional; no server-side security or payment is simulated.

## Assets and content limitations
Eight fictional products are sufficient to exercise the interface but not a production catalog. Some rare filter combinations intentionally have no results. Galleries reuse the existing original SVG bottle artwork with an explicitly labelled crop; real licensed multi-angle photography is pending. Shipping, returns and contact details need owner-supplied policies. Google Fonts still requires network access; local hosting is pending. No real sales counts or official partnerships are implied.

Taxonomy wording is original educational copy informed by https://ffonline.fragrancesoftheworld.com/family/details/01 and https://perfumesociety.org/fragrance-families/chypre/ . Family labels overlap and are discovery aids, not exclusive official classifications or chemical recipes.

## Configuration and next action
No new dependency, database migration or environment variable. Suggested commit: `feat: add fragrance catalog, discovery pages and product comparison`.
The owner approved the local preview, including card links, comparison placement, icon labels, romantic-date occasion, Back scroll restoration, whole-card navigation and precise note-filter result scrolling. Publication was explicitly requested. Recommended subsequent roadmap topic is Phase 1 Step 3: frontend shopping bag and checkout flow; its exact acceptance criteria require the owner's next assignment. It is not implemented here.

## Product metadata preview refinement
The owner rejected the text-heavy three-row trial. Its replacement restores a compact pill-shaped family link with a family illustration (flower for floral). Suggested seasons and occasions use passive, soft neutral labels with 15px seasonal/lifestyle icons and short text. No extra visible headings; accessible group labels preserve meaning. Existing cards and actions are unchanged. Owner approved this refinement for publication.

Added the owner-requested «قرار عاشقانه» occasion with a heart icon to the fictional Santal Crème profile. The shared occasion dictionary also exposes it in filtering and comparison without introducing claims about attraction or effects.

## History scroll restoration
Navigation now records scroll coordinates per browser-history entry and restores them on Back/Forward after the destination renders, instead of forcing the page heading or homepage anchor to the top. Positions stay in memory; a fresh full reload is outside this restoration guarantee. Filter/sort/page URLs remain intact. Browser catalog → Santal detail → Back restored exactly 620.67px to 620.67px. No visual style or dependency changes. Suggested commit: `fix: restore catalog scroll position on history navigation`.
Homepage products → Cuir detail → Back also restored exactly 2389.33px to 2389.33px. Final npm test: 11 passed; npm run build and git diff --check passed.

## Whole-card navigation
Product title links now extend their hit area over the card using a CSS pseudo-element. Prices, brand text and empty space open the same product/variant. Wishlist, scent-note and comparison buttons remain independent above the link layer. Real anchors retain keyboard navigation and native open-in-new-tab behavior; no nested interactive markup or visual geometry changes. Suggested commit: `fix: make product cards clickable while preserving independent actions`.
Browser verification: clicking Rose Voile price opened its product route; Back returned to the list. Wishlist, comparison and scent-note clicks each toggled aria-pressed while keeping #products unchanged, then were reset. Production build and whitespace check passed.

## Note-filter result navigation
Selecting or removing a scent note now brings the updated products into view after rendering, including repeat selections while already on #products. Homepage uses the existing section focus/scroll helper; catalog targets its result region. This prevents a shrinking product grid from leaving the viewport over unrelated lower sections. History Back restoration remains independent. Suggested commit: `fix: bring filtered products into view after note selection`.

Refined note-filter scroll destination to the active-filter/result region rather than the whole homepage product section. The existing document scroll padding keeps results below the sticky mobile header, omitting the section title and selector toolbar above.

Final release checks: npm test 11/11 passed; npm run build passed; git diff --check passed. No new dependencies, secrets or backend integration.

## In-row header search preview
The rejected dropdown search trial is replaced by a same-row expanding field. One magnifier rotates and travels right; mobile temporarily hides logo/menu/account/wishlist while retaining cart access. See docs/inline-header-search.md for behavior and validation. Local preview pending owner approval; no push.

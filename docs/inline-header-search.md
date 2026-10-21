# In-row animated header search — preview

Owner requested the previously agreed magnifier motion: rotate and move physically right, revealing a field behind it inside the original header row, with no panel below and no homepage space consumption. The rejected dropdown/scent-suggestion trial was removed.

Header.tsx keeps one mounted form/magnifier and uses CSS width/position transitions. Desktop/tablet actions stay available. At <=600px, logo/menu/account/wishlist fade and are removed from tab order/AT while search is open; cart remains available. Input gets focus after opening without scrolling; Enter or the moving magnifier submits; X/Escape closes and returns focus without scrolling. Existing frontend filtering and catalog routing are reused. Search query is retained on close. Reduced-motion disables transitions. No new dependencies or backend.

Changed Header.tsx, App.tsx callback (accepts optional submitted query), catalog.css, related docs. Only the search header is affected. Existing landing motion/cards/hovers are preserved.

Browser validation: stable closed/open header height and page scroll at 0 before/after opening; icon moved right. Mobile 360/390, tablet 768, laptop 1024, desktop 1440 stable open states had no horizontal overflow. Home Santal search returned 1 card; catalog submission routed to #/catalog?query=Santal and returned 1 card. Escape closed and restored focus; X closure inspected. Fonts/inputs retain RTL and visible labels/focus outline. Screenshots preview/inline-search-mobile.jpg and preview/inline-search-desktop.jpg. Physical mobile keyboard and live reduced-motion OS setting remain unverified. Build/test results below. No commit/push; next is owner visual review. Suggested commit: feat: add animated in-row header search.
Final checks: npm run build passed; npm test 11/11 passed; git diff --check passed. No push.
Latest color selection: owner replaced the pale burgundy trial with sage #D3DACC matching button hovers; border #B7C2AE and focus outline #718166. Browser confirmed rgb(211,218,204). Whitespace check passed; no build repeated for this color-only edit. Screenshot preview/search-sage.jpg. No push.

Owner approved sage in-row search and authorized push to FixLandingPage. Release includes only Header.tsx, App.tsx, catalog.css and search documentation. Final build, automated test and whitespace results recorded at release.
Release verification: npm run build passed; npm test 11/11 passed; git diff --check passed. Upstream main includes previous release via PR #5; no unrelated tree differences before this search change.

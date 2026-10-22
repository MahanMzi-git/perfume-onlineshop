# In-row animated header search — preview

Owner requested the previously agreed magnifier motion: rotate and move physically right, revealing a field behind it inside the original header row, with no panel below and no homepage space consumption. The rejected dropdown/scent-suggestion trial was removed.

Header.tsx keeps one mounted form/magnifier and uses CSS width/position transitions. Desktop/tablet actions stay available. At <=600px, logo/menu/account/wishlist fade and are removed from tab order/AT while search is open; cart remains available. Input gets focus after opening without scrolling; Enter or the moving magnifier submits; X/Escape closes and returns focus without scrolling. Existing frontend filtering and catalog routing are reused. Search query is retained on close. Reduced-motion disables transitions. No new dependencies or backend.

Changed Header.tsx, App.tsx callback (accepts optional submitted query), catalog.css, related docs. Only the search header is affected. Existing landing motion/cards/hovers are preserved.

Browser validation: stable closed/open header height and page scroll at 0 before/after opening; icon moved right. Mobile 360/390, tablet 768, laptop 1024, desktop 1440 stable open states had no horizontal overflow. Home Santal search returned 1 card; catalog submission routed to #/catalog?query=Santal and returned 1 card. Escape closed and restored focus; X closure inspected. Fonts/inputs retain RTL and visible labels/focus outline. Screenshots preview/inline-search-mobile.jpg and preview/inline-search-desktop.jpg. Physical mobile keyboard and live reduced-motion OS setting remain unverified. Build/test results below. No commit/push; next is owner visual review. Suggested commit: feat: add animated in-row header search.
Final checks: npm run build passed; npm test 11/11 passed; git diff --check passed. No push.
Latest color selection: owner replaced the pale burgundy trial with sage #D3DACC matching button hovers; border #B7C2AE and focus outline #718166. Browser confirmed rgb(211,218,204). Whitespace check passed; no build repeated for this color-only edit. Screenshot preview/search-sage.jpg. No push.

Owner approved sage in-row search and authorized push to FixLandingPage. Release includes only Header.tsx, App.tsx, catalog.css and search documentation. Final build, automated test and whitespace results recorded at release.
Release verification: npm run build passed; npm test 11/11 passed; git diff --check passed. Upstream main includes previous release via PR #5; no unrelated tree differences before this search change.

## Follow-up: typing must preserve page position

Reproduced on the notes library using native keyboard events: scrollY was 1542 before typing, 1474 after `s`, and 1406 after `a`. The root scroll-padding reserved space for the sticky header, causing browser caret scrolling to repeatedly move the page upward. While the header search is open, catalog.css now sets root scroll-padding-top to zero; the existing padding returns automatically on close. Header dimensions, search animation, colors, and route/back restoration are unchanged.

After the fix, native 
`, `t`, and `a` each preserved scrollY at exactly 1406. Enter submitted Santal to #/catalog?query=Santal, returned one product, closed the search, and restored computed root padding to 90.6667px. npm run build (TypeScript and Vite) and git diff --check passed. No new dependencies or configuration changes. Physical mobile keyboard behavior has not been verified for this follow-up. This fix is awaiting owner review; no commit or push. Suggested commit: fix: preserve scroll position while typing in header search. Next: owner review before release; pending wishlist and other roadmap work remain out of scope.

## Landing controls follow-up
Owner requested icon-only motion control and journal links to return to the landing top. Removed visible pause/play text, retained dynamic Persian accessible labels and pressed state, and used a 44px circular target. Header, footer and mobile journal links now invoke home navigation, including repeated clicks. Home navigation explicitly scrolls to top smoothly, respecting reduced-motion. Browser verified journal click from a scrolled home page reached #home at scrollY 0, and pause changed to play with aria-pressed true; resumed afterward. Build passed, 11/11 tests passed, whitespace check passed. Cross-page and physical-device checks remain unverified. No dependencies changed; no push. Suggested commit: fix: simplify motion control and return journal links to landing top.

Follow-up refinement: removed both control backgrounds, border and shadow; retained a 44px target, keyboard focus outline and darker 17px icon. Journal return from a routed page now restores the last landing departure position before smooth scrolling to top; browser Back still uses entry-specific restoration. Verified mobile-menu product-to-home return: landing visible at scrollY 3037.33 immediately after click, then 0; animation ready=true, transparent control background and 0px border. Build passed and existing 11 tests passed. Physical-device and reduced-motion setting tests remain unverified. No push.

Search clear/close refinement: the X clears a nonempty query and refocuses the input without scrolling; when already empty, it closes search. Accessible label changes between clear and close. Browser verified Santal -> X gives empty value, open=true and focus=header-query; second X gives open=false. TypeScript/Vite build passed. No styling or dependency changes; no push. Suggested commit: fix: clear search text before closing header search.

Owner approved all follow-up changes and authorized release to FixLandingPage on 2026-10-22. Validation: latest TypeScript/Vite build passed, existing suite 11/11 passed, and git diff --check passed. No new dependencies or configuration changes. Next: owner merge/review; subsequent roadmap work requires a separate request.

# Comparison and review UI — 2026-10-26

- Comparison is available in desktop navigation and a fixed entry at the bottom of the mobile menu, after the journal link, with the shared selection count.
- A compact comparison link appears above the mobile island (bottom-left on desktop) whenever selections exist, except on the comparison page itself. Existing comparison selection, three-item limit and URL sharing remain in use.
- Product cards and detail actions share a filled scale/check icon for selected items; detail text and aria-pressed also indicate the state.
- Every approved photo-catalog product has two or three explicitly fictional review fixtures. The rating near the product name and comparison/catalog sorting use the same average and count. The rating button scrolls/focuses the review section.
- Product and account review forms share one composer. Default visitors cannot submit a review. For the frontend demonstration only, enabling sample orders unlocks Libre (the delivered sample order); preparing, missing and cancelled purchases do not qualify. The state mutation checks eligibility and score/text validity, not just UI visibility.
- Saved drafts are local in-memory session data, one per product, editable across both surfaces. They do not publish or affect fixture averages. Reload clears the demo customer session.

## Production boundary

This is still Phase 1 frontend only: no real login, purchase verification or public review API exists. Real review submission must require an authenticated account and a server-verified completed purchase, with server-side ownership, validation and duplicate-review rules. Browser state is not authorization. Do not expose these demo eligibility checks as production security.

## Verification

- TypeScript/Vite build passed.
- 25 automated tests passed, including eligibility rejection and rating consistency/render checks.
- Chrome interaction checks cover selecting/removing comparisons, menu access/count, detail selected state, visitor gating, sample-order eligibility, invalid text, star selection, draft persistence across product/account navigation, and relocking after hiding fixtures.
- Viewports checked: 360×900, 500×556 and 1440×900; no document-level horizontal overflow or app page errors in these checks. Screenshot artifacts are local under preview/comparison-reviews/.
- Physical-device, screen-reader and other-browser testing not performed. No commit or push made.

# Phase 1 Step 3 — shopping and customer UI

## Scope and design preservation

Audited React 18, TypeScript, Vite, hash routing, shared StoreContext, in-memory bag, ProductGrid/ProductCard, native Dialog, local favourite/recent IDs and existing styles. No repository AGENTS.md was found. The approved card dimensions, hover colors, header search, landing motion and typography were not modified. New account and shopping layouts use existing controls, icons and tokens, with scoped CSS. No additional dependency, backend, authentication, payment or administration system was introduced.

## Implemented

- A single cart state in App/StoreContext: add, remove, change quantity and volume/concentration, merge duplicate variants within stock, unit/subtotal/total, invalid/missing variant feedback and empty state. The earlier DemoBag component remains unused; it has no separate state.
- Pure cart arithmetic and validation: AROMA10 is an explicitly mock 10% discount capped at 500,000 toman; shipping is an explicitly mock estimate of 80,000 or 150,000 toman.
- Five checkout steps with reusable Persian field validation, Iranian digit normalization for phone/postal values, error summary and focus on first invalid field. Previous-step navigation preserves entered data while the checkout page is mounted. Review shows product versions, quantities, recipient, address, shipping and total. Payment has no card fields or gateway; ending the preview creates no order and retains the bag.
- Customer routes: overview, profile editing, add/edit/delete addresses, opt-in fictional orders and detail, confirmable mock cancellation, independent wishlist, recently viewed products, cabinet (owned/tested/liked/disliked), fragrance preferences, editable local reviews, support drafts and notification choices.
- Empty account/order/wishlist/cart/recent states; unknown account route and missing order states. Existing missing-product behavior remains available.

## Storage and trust boundary

There is no authenticated user. Every new page identifies the session as an unauthenticated demo. Contact/address/profile/reviews/support and other customer data exist only in React memory, never localStorage or an API. Reload resets them. Completed contact/address steps and the shipping choice are retained in the shared in-memory customer context when editing the cart and returning. Unsaved field edits on the currently open step are discarded when leaving checkout. This is a documented frontend limitation, not order loss: orders are never created.

Only existing favourites and recently viewed product identifiers persist locally, using the project's guarded storage helper. They do not sync between devices. Cabinet/preferences/notification flags last for the current app session. Demo orders live in a central fixture file, are unrelated to checkout, and contain no customer records. Discount, price, stock and shipping would require server-side validation in a future separately authorized backend phase.

## Files

New: `src/components/CustomerContext.tsx`, `CustomerForm.tsx`, `src/pages/ShoppingPages.tsx`, `CustomerPages.tsx`, `src/lib/customerForms.ts`, `src/data/demoOrders.ts`, `src/styles/customer.css`, this document.

Modified: `src/App.tsx`, `src/main.tsx`, `src/components/CommercePages.tsx`, `StoreContext.tsx`, `src/lib/demoBag.ts`, `routes.ts`, `tests/catalog.test.mjs`, `README.md`. Added `tests/customer-render.test.mjs` for real-component render smoke tests.

## Actual validation

- `npm run build`: TypeScript and Vite passed.
- `npm test`: 17/17 passed, including four new regression tests for totals/coupon/shipping/invalid lines, stock-safe variant merge, Persian form validation and account routes.
- Browser: empty cart; product -> add -> shared cart; quantity 2; AROMA10 capped at 500,000; switching Rose Voile to 100ml produced 15,840,000 subtotal and 15,340,000 after discount. Fast shipping added 150,000, producing 15,490,000.
- Browser: empty contact errors, valid Persian-digit phone and postal values, all five steps, final explicit no-order/no-payment message.
- Browser: profile save, address add/delete with confirmation, empty order history and opt-in fixtures, order detail/cancellation with confirmation, cabinet owned/liked controls, empty wishlist.
- Account/wishlist page: measured document width within viewport at 360, 390, 768, 1024, 1440 pixels.

The initial browser session ended before the remaining responsive checks, but Chrome QA later completed the representative responsive and interactive matrix recorded below. Physical mobile keyboard, screen-reader and cross-browser testing remain unperformed.

## Review and next step

No commit or push for Step 3. Owner review of the completed local preview is next. Suggested commit: `feat: add demo shopping journey and customer account pages`.

Stop after Step 3. The user has not supplied an exact Step 4 specification, so it must be requested before beginning future roadmap work.

Follow-up QA: all 11 account sections rendered successfully without browser storage or authentication. Real-component render tests also cover populated wishlist, known/missing order, empty/valid/missing-variant cart and checkout. These are render smoke tests, not interactive browser tests. Fixed review score initialization from an existing saved draft, cleared the new-address form after save, and retained completed checkout steps in memory across cart edits. Build and whitespace validation reran after these changes; the remaining browser checks were subsequently completed in Chrome as recorded below.

## Chrome QA continuation — 2026-10-22

Chrome connected successfully in this chat. The local Vite server was initially stopped and was started at `http://127.0.0.1:5174`. The browser-unavailable statements above describe the earlier handoff, not the current tooling state.

- Address editing passed: added an entirely fictional address with Persian-digit postal code, opened its populated edit form, changed the city, saved, navigated away and returned. The edited city and address remained in the current session; the add form was empty.
- Support passed: submitting empty fields showed both errors and focused the subject. Saving fictional subject/message displayed the local draft and explicit no-message-sent notice.
- Reviews passed: saved a fictional Rose Voile review with score 3, navigated away and returned; both text and score were restored. Changing the score to 4 updated the existing displayed review.
- Preferences and notifications passed across navigation: selected floral/woody families and the restock notification, visited other sections, and confirmed the respective controls remained selected.
- Responsive visual/DOM checks passed at widths **360, 390, 768, 1024 and 1440 CSS pixels** for a populated Rose Voile cart row, checkout contact form and cost summary, populated two-product account wishlist, and the review form. No document-level horizontal overflow or obstructing overlap was observed. The account navigation deliberately scrolls horizontally at narrower widths. Review-form screenshots were taken at the existing scroll position; cart/checkout/wishlist were observed from their main content. Viewport overrides were reset afterward.
- Console inspection found no application errors; the only warning was from an unrelated Chrome extension.
- `npm test`: **17/17 passed** on this continuation. `npm run build`: **passed** (TypeScript and Vite).
- Example screenshot: `preview/step-3-qa/wishlist.jpg` (local QA artifact).

The previously listed remaining interactive account checks are now complete. Responsive evidence above covers representative forms and the shared summary; it is not an exhaustive screenshot matrix of every account form or all five checkout steps. Physical mobile keyboard, screen-reader and cross-browser testing remain unperformed. Earlier full checkout interaction results remain as recorded above.

No application source changes, commit or push were made during this QA continuation. Existing worktree changes were preserved. Stop remains at Step 3, pending owner review.

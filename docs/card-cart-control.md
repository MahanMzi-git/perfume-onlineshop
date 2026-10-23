# Product card cart feedback and quantity control

2026-10-24 — owner-requested refinement of the approved photo cards. No commit or push.

## Behaviour

- The full-width action retains its 44px height and the visible “افزودن به سبد” label after adding. Its bag glyph stays at the original left position and rotates/fades into a check over 320ms. A separate inline plus/quantity/minus group appears between the label and icon; it does not replace them. At narrow widths the retained label can wrap within the same 44px height. No card/gradient height change.
- Plus adds one through the existing shared `addToBag`; minus updates the exact product/variant through `changeBag`. Decrementing one removes that variant through `removeBag` and restores the add action. Other volumes remain separate cart lines.
- The displayed quantity is derived directly from `bagLines`, so edits on the cart page or other cards are reflected without a duplicate local cart. Only the status message is local state.
- Unavailable variants cannot be added. Plus is disabled at the demo stock limit; minus remains available. No simulated delay, network request, real order or payment is introduced.

## Accessibility and responsive behaviour

The add button retains its DOM identity so keyboard focus survives the initial switch, and can still increment the quantity. On removing the last unit, focus returns to this retained button with `preventScroll`. Controls are native buttons, never buttons nested in another button, with product/volume-specific Persian names. A single atomic status per card announces the operation and contextual quantity. Decorative bag/check/plus/minus icons are hidden from assistive technology. Visible focus uses a dark outline on the light control background. Inline plus/minus targets are 24×44 CSS pixels on mobile and 28×44 at larger widths to fit the owner's retained text and stationary icon in two-column cards. Reduced-motion disables the rotation/fade through the existing global reduction rule and the component's own override.

## Files

- New: `src/components/CardCartControl.tsx`.
- Updated: `src/components/ProductCard.tsx`, `src/styles/product-card-preview.css`, `README.md`, this report, and ignored `preview/real-cards-review.mjs`.
- No dependency, migration, environment or backend changes. Existing unrelated worktree changes are preserved.

## Validation

`npm run build` passed. `npm test`: 20/20 passed. `git diff --check` passed. Initial Chrome checks at 390 and 768 CSS pixels passed. Tested initial add, Enter to increment, demo cap of five, decrement, removal at one, restored keyboard focus, cart-to-card count updates, unchanged control height and reduced-motion suppression. Screenshots: ignored `preview/real-cards/390-cart-added.png` and `1440-cart-added.png`. Full viewport results are recorded in `preview/real-cards/results.json`.

Earlier version: Chrome checks passed at 360, 390, 482, 768, 1024 and 1440 CSS pixels before the owner requested retaining the label and keeping the icon stationary. The 390px interaction check added the 50ml and 100ml Coco Mademoiselle variants independently and verified two cart rows with quantity one each. The unavailable Miss Dior sample remained disabled. Updated-layout validation follows separately.

Retained-label revision: build and all 20 automated tests passed; whitespace validation passed. Chrome checks passed at 360, 390, 482, 533 (owner's reported width), 768, 1024 and 1440 CSS pixels. Verified unchanged icon x-position, retained label fitting its column, quantity group physically between icon and label, unchanged 44px action height, 24px-minimum target widths, cap/removal/keyboard behaviour, separate volumes and reduced-motion suppression. No application console errors. Preview: `http://127.0.0.1:3101/?view=inline-cart#products`.

Screen-reader operation, physical touch devices and non-Chrome browsers remain unverified. The existing shopping flow is frontend demo state only. Next: owner visual review; no future roadmap step has been started.

Suggested commit: `Add animated cart feedback and inline card quantity controls`.

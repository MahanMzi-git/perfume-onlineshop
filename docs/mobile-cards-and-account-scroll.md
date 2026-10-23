# Compact product cards and account tab scrollbar

Implemented at the owner's request on 2026-10-23. These changes are local and awaiting visual review; no commit or push was made.

## Changes

- Shared product cards now place an icon-only comparison control immediately below the wishlist heart, inside the product image. The scale icon has a Persian accessible name and tooltip, `aria-pressed`, and a selected-state check. Both image controls retain 44 × 44 CSS-pixel targets with an 8-pixel gap. The stretched product link remains separate from these controls.
- Removed the repeated “قیمت نمایشی” line from cards. Existing demo notices at page/section level remain; product data is still fictional demo data.
- At widths up to 600 CSS pixels, card scent-note controls use a 28-pixel visual height, 12-pixel Persian labels, 13-pixel icons and tighter padding. Existing hit-area extensions and 8-pixel row spacing remain. Desktop note sizing, card hover behavior, two-column mobile layout and aligned price footers are preserved.
- Replaced the account tab strip's native horizontal scrollbar with a one-pixel track and a small oval thumb, using the same colors as the approved select scrollbar. The control is a native labelled range input: dragging/clicking, arrow keys, Home and End work. It follows touch/trackpad scrolling and hides when no horizontal overflow exists. Active-tab centering now changes only horizontal navigation scroll, without scrolling the document vertically.

## Files

- `src/components/ProductCard.tsx`
- `src/components/ScentNoteList.tsx`
- `src/pages/CustomerPages.tsx`
- `src/styles/catalog.css`
- `src/styles/global.css`
- `src/styles/customer.css`

## Verification

- `npm test`: 17 passed, 0 failed.
- `npm run build`: TypeScript and Vite passed.
- Chrome checks at 360 × 800, 390 × 844, 492 × 800, 768 × 1024, 1024 × 768 and 1440 × 900 CSS pixels passed. No document-level horizontal overflow or application errors were observed.
- All shared homepage cards remained equal-height; price footers aligned. Measured mobile card heights were 410px at 360px width, 428px at 390px and 447px at 492px; note controls measured 28px.
- Comparison selected/deselected independently, wishlist remained independent, clicking the price opened the product via the extended link, and clicking a note still filtered products.
- Account scrollbar checks passed for track clicks, RTL arrow keys, Home/End, synchronizing after horizontal navigation scroll, bringing the active tab into view, and hiding the control for the desktop vertical navigation.
- Local QA script, screenshots and measurement JSON: `preview/card-scroll-review.mjs` and `preview/card-scroll-review/` (ignored preview artifacts).

No dependency, backend, database or configuration changes were made. Physical phone, screen-reader and Firefox/Safari interaction checks were not performed. The native range has keyboard semantics and Firefox styles, but this is not a full accessibility certification.

Next: owner visual review of the local preview. No next development phase has been started.

Suggested commit: `Polish mobile product cards and account tab scrollbar`

## Follow-up: long scent-note labels

At widths up to 600px, the card's scent-note summary measures rendered chip widths and fills each row starting with its longest label and shorter labels that fit. Names, icons, selected state and filter callbacks are preserved. DOM order follows the visual order for keyboard navigation. Desktop source order is restored above the breakpoint. ResizeObserver updates the packing after width/font changes and disconnects on unmount; no dependency was added.

Chrome checks passed at 360, 390, 430, 473, 492 and 600px, plus 768/1440px desktop-order checks and a return to 473px. Lavender and mint shared a row at every tested mobile width. Labels stayed complete inside their cards, with no horizontal document overflow or application errors. At 360px, the remaining two labels require separate rows; the layout does not truncate text or shrink it further to force two rows. Scent-note selection remained functional after resizing. `npm test`: 17/17 passed; `npm run build`: passed. Local evidence: `preview/note-packing-review/` and its `results.json`.

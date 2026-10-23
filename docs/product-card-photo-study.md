# Image-first product card study

The latest real-name/photo iteration supersedes the temporary fictional mapping described below. See [real-photo-cards.md](real-photo-cards.md) for current references, framing, verified notes and demo boundaries.

2026-10-23 — opt-in visual experiment requested by the owner. The approved card remains the default. No commit or push has been made.

## Preview

- New: `http://127.0.0.1:3101/?cardPreview=immersive#products`
- Existing: `http://127.0.0.1:3101/#products`
- Selected opacity: all immersive cards now receive the owner's chosen +20 percentage points at the nonzero gradient stops; alpha is capped at 100%. The clear starting edge remains transparent. Price badge opacity remains 80%. The previous opacity-comparison query also shows this unified selection.
- Updated photo preview: `http://127.0.0.1:3101/?cardPreview=immersive&study=portrait-bleu#home-product-results`. The Bleu de Chanel reference on fictional product p3 now uses the owner's latest portrait JPEG, `reference-12.jpg` (57,591 bytes), without re-encoding or changes to catalog identity. The earlier square reference 11 remains an alternative. Twelve source assets are retained; the eight currently displayed images total approximately 663 KiB. Production build passed after this image-only replacement; the preceding interaction checks were not rerun.

The query flag enables the shared card experiment across the current page and subsequent hash navigation. Removing the query and reloading restores the approved card. No stored preference is changed.

## Implementation

- The owner's portrait Bleu de Chanel reference (p3 only) now fills its entire card using `object-fit:cover`, centered with zero image padding. Other reference photos keep their contained framing. Gradient, text, price and controls are unchanged.
- Eight owner-supplied reference photographs sit in a full-card image layer using `object-fit:contain`, centered horizontally and positioned at 28% vertically inside a padded image area (24px top, 10px sides, 108px bottom). This keeps the source image uncropped and scales bottles down rather than enlarging them to fill a portrait frame. The photographic field is white. Their local mapping is centralized in `src/data/cardStudyImages.ts`; the default catalog and product detail data keep their original demo illustrations. The photos illustrate the layout and do not identify the fictional products.
- All gradients are black. The veil starts at 40% of card height with zero opacity. After the selected +20-point increase, the intermediate stops are 44%, 72% and 88%, capped at 100% near the bottom CTA area. Three progressively masked blur layers use 1px, 3px and 5px blur. All text has opacity 1. The owner's three villa-card screenshots informed the fade and clearer upper image.
- Card and chip borders are removed in the experiment. Price is a compact top-left badge with an 80%-opaque black background and fully opaque white text, including the displayed volume. Only the background is translucent. It allows clicking through to the product link. The heart and comparison controls remain on the upper right with independent actions and accessible names.
- Full-width “افزودن به سبد” button adds the exact displayed volume/concentration/price to the existing shared demo cart. A check and updated island count provide feedback; a live status announces the actual cart quantity. Missing/out-of-stock variants and the simulated stock limit disable the button with an explanatory label. Image/title links continue to open product details.
- Horizontal grid gaps increase by 50%: mobile 10→15px, tablet 15→22.5px, desktop 22→33px. Content side insets increase from 8→12px on mobile and 10→15px on desktop. Shared header/footer margins are unchanged.
- Cards remain equal-height. The mobile study uses 400px-high cards, preserves full note names, and retains existing note filtering, wishlist, comparison and product navigation.

Changed files: `src/components/ProductCard.tsx`, `src/main.tsx`; added `src/styles/product-card-preview.css`, `src/data/cardStudyImages.ts`, `public/images/card-study/` and this report. No dependency, database, backend or configuration change.

## Verification

- `npm test`: 17/17 passed. `npm run build`: TypeScript and Vite passed. `git diff --check`: passed.
- Chrome checks passed at 360×800, 390×844, 482×800, 768×1024, 1024×768 and 1440×900, plus short windows 482×520 and 390×520.
- Verified full-card image-layer bounds; no document overflow; equal card heights; complete note labels; zero card border; full text opacity; separate price/heart bounds; no overlap between image controls and information; full-width CTA; and the gradient/blur boundary at 40% of card height. All cards use the black tone, and the price background is `rgba(0, 0, 0, 0.8)`.
- Verified comparison, wishlist, note filtering and cart independence. Clicking and pressing Enter added two units of the same 50ml variant to one cart line. A filtered 100ml variant was added at its displayed 7,920,000-toman demo unit price; its stock cap of three was enforced. The 50ml and 100ml variants remained separate lines. The unavailable Poire Poudrée variant stayed disabled. Clicking the price badge still opens product details. Confirmed that the experiment and CTA are absent without the query flag.
- Local ignored QA artifacts: `preview/image-card-study.mjs`, `preview/image-card-study/cards-*.png`, `preview/image-card-study/colors-comparison.png`, `preview/image-card-study/results.json` and `results-short.json`.
- Photo follow-up: all eight local photographs loaded and decoded successfully at the same six widths and two short-window sizes. Their paths were verified as local `/images/card-study/` assets, with no remote hotlinks or fallback images. The default catalog continued using `/images/p*.svg` without the experiment flag. Image/card dimensions, existing interactions and mock cart checks passed with the photos.

## Reference-photo provenance

The owner supplied nine unique image URLs (one URL was repeated), one pasted WebP data URL and an additional local Bleu de Chanel JPEG. Eleven references were saved; eight are displayed, with references 05, 07 and 10 retained as alternatives. Total original bytes for the eight displayed photos are approximately 690 KiB, including a 527 KiB PNG and the new 83 KiB JPEG. Assets retain their original encoding, are loaded lazily with async decoding, and have descriptive alt text. Source URLs and SHA-256 hashes are recorded in `public/images/card-study/manifest.json`; usage limitations are in `public/images/card-study/SOURCES.md`.

Selected-opacity follow-up: production build and Chrome checks at 482×520 and 390×520 passed with the +20-point increase on all eight cards and the updated local photo. The broader viewport results above describe the preceding layout, whose dimensions and interactions were preserved.

Limitations: photo-to-product mapping is temporary and does not assert actual brand, price or fragrance correspondence. Some reference images are thumbnails or already tightly framed; contain preserves their original edges but cannot recover details absent from the source. Commercial reuse rights have not been verified. Physical mobile GPU performance, Safari/Firefox and screen-reader testing have not been performed. The gradient provides a fallback where backdrop filtering is unavailable; white text over varied photos still needs a final contrast review after the visual design is selected. This is not a complete accessibility certification. The persistent mobile island can cover lower content at some scroll positions in short windows; the CTA can be brought into view by scrolling.

Next: owner visual review before promoting this design to the default. Stop at this experiment; no future phase started.

Suggested eventual commit: `Add opt-in image-first product card study`

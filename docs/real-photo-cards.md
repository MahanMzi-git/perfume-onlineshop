# Real fragrance references — opt-in card preview

## Approved default integration

The owner approved applying this design to the site. It now loads at `http://127.0.0.1:3101/#products` with no preview query. Existing immersive preview URLs show the same approved default. `?cardPreview=legacy` retains the original comparison dataset; server rendering also uses the approved default. The historical preview notes below describe the design process, not a remaining opt-in requirement. README and default-catalog regression coverage were updated. No commit or push was requested during this integration.

Integration files: `src/data/cardStudyImages.ts` selects the approved catalog by default; `src/components/ProductCard.tsx` uses that same selection during browser and server rendering; `src/styles/product-card-preview.css` documents the new default; `README.md` records current routes. `tests/catalog.test.mjs` explicitly retains its original legacy regression fixtures; new `tests/approved-catalog.test.mjs` validates default/browser/server consistency, real-name search, compound notes, local assets and variant identities. Customer render tests now exercise the approved dataset. No dependencies or migrations changed; there is no configured lint script. Suggested commit: `Apply approved photo cards as the storefront default`. Next: owner review and explicit push instruction. Current image-rights and accessibility limitations below still apply.

Integration validation: `npm run build` passed (TypeScript and Vite); `npm test` passed 20/20; `git diff --check` passed. Chrome checks without any query passed at 360, 390, 482, 768, 1024 and 1440 CSS pixels, covering image loading, content-linked gradients, card geometry, search, note filters, detail navigation and demo cart. The explicit legacy comparison still renders the earlier cards. Updated screenshots and measurements: ignored `preview/real-cards/`.

2026-10-23. Preview: `http://127.0.0.1:3101/?cardPreview=immersive&study=real-fragrances#home-product-results`.

The owner requested full-card photos with comparable bottle scale, real product/brand names and two to four verified notes. The eight new references and the existing portrait Bleu de Chanel form nine study products. Without the immersive query, the original eight fictional products and approved card remain active. No commit or push.

## Selected identities and sources

| Reference | Brand / product | Selected Persian notes | Verification |
|---|---|---|---|
| batch-4.webp | Chanel / Coco Mademoiselle EDP | یاس، گل رز، پچولی، وتیور | [Chanel](https://www.chanel.com/us/fragrance/p/116520/coco-mademoiselle-eau-de-parfum-spray/) |
| batch-2.jpg | Dior / Sauvage | برگاموت، وانیل | [Dior EDP](https://www.dior.com/en_us/beauty/products/sauvage-eau-de-parfum-E000000376.html) |
| reference-12.jpg | Chanel / Bleu de Chanel EDP | سدر، صندل، مشک | [Chanel](https://www.chanel.com/us/fragrance/p/107350/bleu-de-chanel-eau-de-parfum-spray/) |
| batch-3.jpg | Creed / Aventus | برگاموت، پچولی | [Creed](https://www.creedfragrance.com/c/journal/aventus-your-questions-answered/) |
| batch-6.jpg | Yves Saint Laurent / Libre EDP | اسطوخودوس، وانیل، مشک | [YSL Beauty](https://www.yslbeautyus.com/fragrance/womens-fragrances/libre/libre-eau-de-parfum/3614272648401.html) |
| batch-5.jpg | Dior / Miss Dior EDP | گل رز، زنبق | [Dior floral edition](https://www.dior.com/en_us/beauty/products/Y0996484-product) |
| batch-7.jpg | Gucci / Bloom EDP | یاس، مریم | [Gucci](https://www.gucci.com/us/en/pr/beauty/fragrances/fragrances-for-women/gucci-bloom-100ml-eau-de-parfum-p-488830999990099) |
| batch-1.jpg | Dior / Jasmin des Anges EDP | یاس، زردآلو | [Dior](https://www.dior.com/en_us/beauty/products/jasmin-des-anges-Y0742427.html) |
| batch-8.jpg | Chloé / Chloé EDP | گل رز، سدر | [Chloé](https://www.chloe.com/en-us/p/fragrances/eau-de-parfum/CHCA64980408.html) |

Notes are selected brand-described facets, not complete pyramids. The new Miss Dior EDP formula differs from the older floral formula; this reference uses the rose/iris floral edition corresponding to the pictured presentation. Sauvage's exact concentration is not legible in the thumbnail; EDP is the explicitly selected study interpretation, supported by its official bergamot/vanilla description, pending package confirmation. No claim of authenticated stock or official partnerships.

## Implementation

- Central typed references and a preview-only product adapter live in `src/data/cardStudyImages.ts`. Names, brands, images and note IDs flow to listing, search, filters, detail, cart and comparison through `products.ts` and `brands.ts`; cards do not simply relabel unrelated products.
- Study product and variant IDs are separate from the original demo IDs. Existing browser-saved demo favourites/recent items may therefore be absent in this preview. The existing store still governs cart limits and totals. Removing the query and reloading restores the original dataset.
- Prices, selected volumes, stock, seasons, temperature and other shopping attributes remain local mock values, not sourced commercial facts. Product reviews are empty. Catalog and detail pages explicitly identify the demo boundary. Selected notes appear as one list rather than an invented evaporation pyramid.
- Every photo fills the card field. A softly blurred extension of that same photo fills the background; the sharp foreground uses individually sized frames and a lower-edge fade, preserving aspect ratios and avoiding oversized bottle crops. Source composition and bottle shape prevent exact physical-size equality. No raster pixels were edited or resampled.
- The chosen +20-point black gradient, 80%-black price background, full-opacity text, CTA, note filtering and independent wishlist/comparison controls are retained. Two original SVG note glyphs (apricot and tuberose) extend the existing note library only in the preview.
- Content-linked gradient follow-up: the veil now lives inside the absolutely positioned text block rather than starting at 40% of card height. Its transparent upper edge sits 24px above the brand's first line; darkening reaches 64% at that line and continues to the selected bottom strength. Its bottom aligns with the card bottom. Blur is bounded by the same veil. Actual text wrapping controls its height automatically in CSS, without measurement listeners or extra JavaScript. Thus a shorter Miss Dior block exposes more of its photograph than a taller Libre block. The independent 80%-black price badge is unchanged.
- Original source bytes are local with lazy loading and async decoding. `public/images/card-study/batch-manifest.json` records all eight new URLs, byte sizes and SHA-256 hashes. Three hosts needed PowerShell retrieval after Node fetch failed. Original reference files are retained as alternatives; commercial image reuse rights remain unverified.

Changed application files: `src/data/cardStudyImages.ts`, `src/data/products.ts`, `src/data/brands.ts`, `src/data/scentNotes.ts`, `src/types/fragrance.ts`, `src/components/ScentNoteIcon.tsx`, `src/components/ProductCard.tsx`, `src/styles/product-card-preview.css`, `src/App.tsx`, `src/pages/CatalogPage.tsx`, `src/pages/ProductDetailPage.tsx`. Added assets: `public/images/card-study/batch-*`.

## Validation

`npm run build`: TypeScript/Vite passed. `npm test`: 17/17 passed. `git diff --check`: passed. Initial Chrome sample at 390 and 768 CSS pixels passed. Final Chrome checks passed at 360, 390, 482, 768, 1024 and 1440 CSS pixels: nine images decoded, two to four notes per card, equal card heights, no page overflow or control/content collisions, real-name Aventus search, matching detail navigation, Coco Mademoiselle demo-cart identity, isolated apricot results, and jasmine-chip filtering to the three matching products. Results are recorded in ignored `preview/real-cards/results.json`; screenshots are in the same folder. The default page was verified to retain Rose Voile and no immersive cards.

Physical-device GPU/keyboard testing, Safari/Firefox and screen-reader checks have not been performed. Foreground/background blending, bottle scale and text contrast still require owner visual acceptance. No dependency, migration, backend or authentication changes.

Content-gradient verification: build, all 17 automated tests and whitespace validation passed. Chrome checks passed again at all six widths listed above. Measured every veil against its actual brand line (24px transparent feather) and card bottom; verified that when Libre has taller content, Miss Dior's veil is shorter. Existing search, notes, cart and detail checks also passed. Preview: `?cardPreview=immersive&study=content-gradient#home-product-results`. Only `ProductCard.tsx`, `product-card-preview.css`, this report and the ignored QA script changed in this follow-up. Suggested commit: `Anchor photo-card gradients to their text content`. Next remains owner visual approval; no commit or push.

Suggested eventual commit: `Refine immersive cards with verified fragrance references`.

Next: owner review of this preview, then approval before promoting the card design to the default. No future phase implemented.

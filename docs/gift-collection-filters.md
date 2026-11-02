# Gift collection imagery and filters

The owner-approved gift-set hero is served as uncropped responsive WebP (768×512: 67,778 bytes; 1536×1024: 209,560 bytes). See `public/images/gifts/SOURCES.md` for provenance. Only the gift collection renders it, before breadcrumbs and introductory copy.

Advanced and note disclosures use rounded, lightweight panels with icons, counts, native keyboard behavior and no new live blur. The gift collection uses burgundy, rose-gold, champagne and whiskey accents. Other catalog pages retain the sage palette.

The gift collection also uses a two-heart RTL price range (minimum right, maximum left), keyboard-adjustable native range inputs, price reset, and single-selection capsules for seasons, occasions and product type. Capsule semantics preserve the existing URL filter contract and collection scope. The full price ceiling derives from current catalog variants. These controls were initially isolated behind `?giftPalette=warm`; after owner approval for publication, they now render by default at `#/collections/gifts`.

Validation: production build and 46 existing tests passed before final approval. Browser checks exercised hero geometry/no crop at four widths, disclosure keyboard/selection at four widths, and price-heart dragging, keyboard, reset and capsule filtering at 360, 497 and 1440 pixels. Local ignored runners/screenshots are in `preview/gift-hero*`, `preview/filter-panels*`, `preview/gift-palette*` and `preview/gift-filter-controls-qa.mjs` / `preview/gift-controls/`. No operational products, payment or backend behavior was introduced.

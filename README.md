# Aroma — perfume storefront
A responsive Persian RTL demo storefront built with React 18, strict TypeScript and Vite. All products, brands, prices and bestseller labels are demo data.

## Commands
- npm ci: install locked dependencies.
- npm run dev: local Vite preview (default http://localhost:5173).
- npm run build: TypeScript check and production bundle.
- npm run preview: serve production output.
- npm test: run catalog/search, dialog-focus, cart and customer-validation regression tests (17 tests, no extra packages).

## Structure
- src/data and src/types: existing typed demo catalog.
- src/lib/filter.ts: product filters.
- src/components: reusable storefront UI, native dialogs and mobile drawer.
- src/styles/tokens.css: design tokens; global.css: shared styles and responsive boundaries (600/900/1200).
- public/images: local demo SVG artwork; hero-editorial.svg is an original illustration.
- src/data/homepage.ts: announcement and educational content.

Phase 1 Step 1 adds the cream/charcoal homepage, section hierarchy, working local navigation/search, browser-local wishlist, educational dialogs and a newsletter UI that never sends or stores email. Native dialogs handle focus and Escape. Product/category images have local SVG fallbacks. Step 2 adds catalog discovery and an explicitly temporary demo bag; Step 3 expands that same bag into shopping and customer pages.

## Phase 1 Step 3 — local shopping and customer preview

- `#/cart`: shared in-memory cart, quantity and volume changes, removal, stock checks, capped demo coupon `AROMA10` (10%, up to 500,000 toman).
- `#/checkout`: contact, address, demo shipping estimate, review and payment presentation. No payment gateway, order creation or payment-success claim.
- `#/account`: overview, profile, addresses, fictional order examples/details, wishlist, personal fragrance cabinet, recently viewed products, fragrance preferences, reviews, support drafts and notification preferences.
- Account forms, addresses, checkout information, cart, cabinet and preferences are in-memory only and reset on reload. Do not enter real personal data. Nothing is sent to a server. Existing wishlist and recent-product IDs retain their browser-local storage behavior.
- Order fixtures are explicitly fictional and opt-in; cancellation changes only a local sample label. Reviews are local drafts and never affect catalog scores. Support does not send messages.
- Existing product cards, landing motion, fonts and hover styles are reused. New layouts are scoped in `src/styles/customer.css`; no packages were added.

See [Step 3 implementation, validation and remaining checks](docs/phase-1-step-3.md). This local preview awaits owner review; no Step 4 work has started.

Fonts still load from Google Fonts; local hosting remains pending. No backend, real accounts, payment, admin or inventory is implemented. No lint script is configured. Regression tests run with npm test using the existing TypeScript dependency and Node test runner.

See [Step 1 audit, QA results, changed files and limitations](docs/phase-1-step-1.md). Build and browser checks were actually run; the owner approved Step 1 for a local commit. Changes are maintained on the FixLandingPage branch; main is preserved until integration.

## Repository and scope
Repository: https://github.com/MahanMzi-git/perfume-onlineshop

Node.js 18+ and npm are required. This phase is frontend-only. Future backend direction is Django/DRF with PostgreSQL; no backend dependencies are installed in this step. New roadmap steps require explicit assignment.

Local configuration and generated files are excluded by .gitignore: node_modules, dist, build metadata, environment secrets, local screenshots, test reports, logs and editor files. Keep package-lock.json tracked and use npm ci for reproducible installs. Do not commit passwords, tokens or real customer data.

## UI/UX audit
The UI UX Pro Max audit preserves the approved identity and improves readable typography, touch targets, removable filters, Persian search, persistent favourites, note illustrations and keyboard navigation. See [observed findings, changed files, checks and limits](docs/ui-ux-audit.md). The owner approved this audit and its follow-up UI refinements for publication on FixLandingPage.

## Multi-note discovery
Select several notes in the catalog note selector or on product cards. Results must contain **all** selected notes (AND), while other active filters continue to apply. Every chosen note has its own removable chip. See [verification and changed files](docs/multi-note-filter.md).

## Approved visual refinements
The approved default now uses equal-height photo cards, nine real-name fragrance references, two to four sourced notes and a content-linked black gradient. Photos fill the card field with individually balanced framing; price badges use an 80%-black background. Compact controls, sage #D3DACC button hover, burgundy #8A4355 favourite hover and reduced-motion support remain. Prices, volume options, inventory and shopping behaviour remain demo data. See [current card implementation and sources](docs/real-photo-cards.md).

No special query is needed. `?cardPreview=legacy` retains the earlier fictional catalog for comparison. Earlier documentation below describes that catalog; current example routes include `#/product/bleu-de-chanel`, `#/product/coco-mademoiselle` and `#/compare?ids=study-p1,study-p3`. Old stored demo IDs may no longer appear in favourites/recent views because the approved reference catalog uses distinct IDs.

Photo-card add actions now animate the bag into a check and expose inline plus/minus quantity controls using the shared demo cart. See [behaviour and QA](docs/card-cart-control.md).

Account/checkout addresses now use dependent Iranian province/city lists (31 provinces; 1,478 unique province/city names from the MIT-licensed 1404 snapshot). Forms support boundary-aware arrow navigation, the cart uses compact rows, checkout has visual step/shipping icons, and the mobile menu is a floating panel with a blurred backdrop. See [implementation and responsive QA](docs/shopping-mobile-polish.md) and [geography provenance](docs/iran-locations-source.md). Shopping and customer data remain frontend demos.

## Phase 1 — Step 2
Frontend catalog, compound filters, shareable hash routes, 13 fragrance families, 20 notes, reusable product details, stock-aware volume/concentration variants and comparison of 2–3 products are implemented with centralized fictional data. Existing compact card geometry and approved hovers are preserved. Product image/name links and a small comparison control were approved by the owner.

Routes: `#/catalog`, `#/families`, `#/notes`, `#/product/rose-voile`, `#/compare?ids=p1,p5`. Catalog filters, sort and pagination are encoded in the URL. Notes combine with AND; price, volume, concentration and availability must match the same variant. The demo bag is memory-only, caps quantities to mock stock, and never submits orders. Favourites and recently viewed IDs use browser-local storage.

See [Step 2 implementation, QA and limitations](docs/phase-1-step-2.md). No dependency, migration, backend, real inventory, authentication or payment changes. The owner approved Step 2 and its follow-up refinements for publication on FixLandingPage.

## Landing 3D orbit (local preview)
The selected Three.js orbit study is integrated into the homepage hero and existing category tiles. It loads only on the homepage, keeps local SVG fallbacks and preserves category actions. See [motion study and integration notes](docs/three-motion-lab.md). Published to FixLandingPage after owner approval.

The current landing orbit uses seven optimized local photo cutouts (324,748 bytes total), subtle depth and soft shadows. Reference extraction/reconstruction and QA are documented in docs/three-motion-lab.md; source attribution is in public/images/orbit-photos/SOURCES.md.

## Approved ribbon backdrop
The homepage now uses three tapered ribbons and two muted burgundy dotted orbits rotating in opposite directions, with bounded randomized radii and phases sampled at mount. Uses the existing photo orbit, pause/reduced-motion clock and actual category docking. Tablet positioning was refined to keep bottles clear of the heading. See docs/orbit-backdrop-studies.md for QA and preview screenshots. Owner approved the final responsive composition, local Sahel typography and motion controls for release on FixLandingPage.

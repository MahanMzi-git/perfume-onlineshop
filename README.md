# Aroma — perfume storefront
A responsive Persian RTL demo storefront built with React 18, strict TypeScript and Vite. All products, brands, prices and bestseller labels are demo data.

## Commands
- npm ci: install locked dependencies.
- npm run dev: local Vite preview (default http://localhost:5173).
- npm run build: TypeScript check and production bundle.
- npm run preview: serve production output.
- npm test: run catalog/search and dialog-focus regression tests (11 tests, no extra packages).

## Structure
- src/data and src/types: existing typed demo catalog.
- src/lib/filter.ts: product filters.
- src/components: reusable storefront UI, native dialogs and mobile drawer.
- src/styles/tokens.css: design tokens; global.css: shared styles and responsive boundaries (600/900/1200).
- public/images: local demo SVG artwork; hero-editorial.svg is an original illustration.
- src/data/homepage.ts: announcement and educational content.

Phase 1 Step 1 adds the cream/charcoal homepage, section hierarchy, working local navigation/search, browser-local wishlist, educational dialogs and a newsletter UI that never sends or stores email. Native dialogs handle focus and Escape. Product/category images have local SVG fallbacks. Account actions explain the unavailable functionality; Step 2 adds an explicitly temporary demo bag.

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
Minimal, compact controls; equal-height white product cards with aligned price footers; 2px card lift on mouse hover; sage #D3DACC button hover and burgundy #8A4355 favourite-button hover. Reduced-motion disables the card movement.

## Phase 1 — Step 2
Frontend catalog, compound filters, shareable hash routes, 13 fragrance families, 20 notes, reusable product details, stock-aware volume/concentration variants and comparison of 2–3 products are implemented with centralized fictional data. Existing compact card geometry and approved hovers are preserved. Product image/name links and a small comparison control were approved by the owner.

Routes: `#/catalog`, `#/families`, `#/notes`, `#/product/rose-voile`, `#/compare?ids=p1,p5`. Catalog filters, sort and pagination are encoded in the URL. Notes combine with AND; price, volume, concentration and availability must match the same variant. The demo bag is memory-only, caps quantities to mock stock, and never submits orders. Favourites and recently viewed IDs use browser-local storage.

See [Step 2 implementation, QA and limitations](docs/phase-1-step-2.md). No dependency, migration, backend, real inventory, authentication or payment changes. The owner approved Step 2 and its follow-up refinements for publication on FixLandingPage.

## Landing 3D orbit (local preview)
The selected Three.js orbit study is integrated into the homepage hero and existing category tiles. It loads only on the homepage, keeps local SVG fallbacks and preserves category actions. See [motion study and integration notes](docs/three-motion-lab.md). Published to FixLandingPage after owner approval.

The current landing orbit uses seven optimized local photo cutouts (324,748 bytes total), subtle depth and soft shadows. Reference extraction/reconstruction and QA are documented in docs/three-motion-lab.md; source attribution is in public/images/orbit-photos/SOURCES.md.

## Approved ribbon backdrop
The homepage now uses three tapered ribbons and two muted burgundy dotted orbits rotating in opposite directions, with bounded randomized radii and phases sampled at mount. Uses the existing photo orbit, pause/reduced-motion clock and actual category docking. Tablet positioning was refined to keep bottles clear of the heading. See docs/orbit-backdrop-studies.md for QA and preview screenshots. Owner approved the final responsive composition, local Sahel typography and motion controls for release on FixLandingPage.

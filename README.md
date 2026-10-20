# Aroma — Persian perfume storefront
A responsive Persian RTL demo storefront built with React 18, strict TypeScript and Vite. All products, brands, prices and bestseller labels are demo data.

## Commands
- npm ci: install locked dependencies.
- npm run dev: local Vite preview (default http://localhost:5173).
- npm run build: TypeScript check and production bundle.
- npm run preview: serve production output.

## Structure
- src/data and src/types: existing typed demo catalog.
- src/lib/filter.ts: product filters.
- src/components: reusable storefront UI, native dialogs and mobile drawer.
- src/styles/tokens.css: design tokens; global.css: shared styles and responsive boundaries (600/900/1200).
- public/images: local demo SVG artwork; hero-editorial.svg is an original illustration.
- src/data/homepage.ts: announcement and educational content.

Phase 1 Step 1 adds the cream/charcoal homepage, section hierarchy, working local navigation/search, session-only wishlist, educational dialogs and a newsletter UI that never sends or stores email. Native dialogs handle focus and Escape. Product/category images have local SVG fallbacks. Account/cart actions explain the unavailable functionality.

Fonts still load from Google Fonts; local hosting remains pending. No backend, real accounts, payment, admin or inventory is implemented. No lint or automated test scripts are configured.

See [Step 1 audit, QA results, changed files and limitations](docs/phase-1-step-1.md). Build and browser checks were actually run; the owner approved Step 1 for a local commit. Remote publication remains pending write access.

# Perfume Store — Homepage (Phase 1)

Persian RTL luxury-perfume storefront homepage built with React, TypeScript and Vite. **All products, brands and prices are fictional demo data.**
Not included: cart, checkout, auth, admin, backend, real contact details.

## Prerequisites
Node.js 18+ and npm.

## Commands
```bash
npm install
npm run dev      # development server
npm run build    # type-check + production build
npm run preview  # preview the build
```

## Structure
- `src/data/` typed mock data: products, brands, scentNotes, fragranceFamilies, categories
- `src/types/` shared types; `src/lib/filter.ts` pure filter function (brand, family, note, audience, concentration, price, niche, featured, bestseller, gift set, text query)
- `src/components/` UI; `src/styles/` tokens + global CSS; `public/images/` local SVG demo artwork

## Scent-note library
`src/data/scentNotes.ts` is the single source of truth (id, name, slug, category, icon, description). Products store note **ids** only. `ScentNoteIcon` maps each category to one SVG glyph, so a note looks identical everywhere, and a future admin panel can assign notes by id.
Niche positioning (`isNiche`) is independent of `authenticityStatus`, which is only set for verified products (none in the demo).

## Status
Verification so far was done in an offline sandbox, so it is partial:
- **Not run:** `npm install`, `npm run build` (`tsc -b` + Vite), the Vite dev server, Lighthouse. No `package-lock.json` exists yet; `npm install` will create it.
- **Run:** the source was bundled with esbuild (Lucide icons stubbed) and checked in headless Chromium at 1440, 820 and 390 px: no horizontal overflow, no broken images or console errors, RTL/`lang="fa"` set, category / family / search / note filtering, reset and empty state, mobile menu open and Escape-to-close.
- **Not verified:** TypeScript type-checking, real Lucide rendering, Vazirmatn / Cormorant Garamond (loaded from Google Fonts at runtime), keyboard-only walkthrough beyond a visible-focus check, measured contrast ratios (brand label colour adjusted by calculation).
Artwork in `public/images/` is generated placeholder SVG illustration, not product photography.

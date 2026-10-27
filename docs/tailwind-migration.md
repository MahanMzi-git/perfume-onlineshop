# Tailwind migration — 2026-10-27

**Approved follow-up:** the owner subsequently approved the five visual studies and authorized applying and pushing them. See `tailwind-refinements.md` for those intentional design changes and their separate verification. The parity findings below describe the migration alone, before the refinements.

## Scope and design contract

The entire storefront now uses the Tailwind CSS 4.3.3 Vite build integration. This is a styling implementation migration, with the approved appearance and interactions retained. No experimental card redesign was promoted to the storefront.

`src/main.tsx` loads the single `src/styles/tailwind.css` entry. That entry compiles all 15 component stylesheets plus the existing design tokens. The former stylesheet imports in `App.tsx` were consolidated into this entry in their original evaluation order.

1,324 shared declarations across those 15 stylesheets use Tailwind utilities through `@apply`. Existing semantic component names remain the public styling interface, so hover/selected/error selectors, accessibility hooks and layout behavior remain intact. This uses Tailwind component styles; it is not a claim that every bespoke CSS declaration has been replaced by an inline JSX utility.

## Configuration

- `@tailwindcss/vite` runs in both development and production builds.
- Preflight is intentionally omitted: browser defaults and the store's approved element and form styling are preserved.
- Utilities use the `tw:` prefix to avoid collisions with established names such as `.grid`.
- Existing selectors live in the `components` layer. Explicit `tw:` utilities can override them through the normal Tailwind cascade when an intentional change is needed later.
- Tailwind's `aroma-*` theme aliases reference the existing color, font, radius and shadow variables rather than introducing new values.
- Responsive utility breakpoints use 601px, 901px and 1201px, matching the existing mobile/tablet/desktop boundaries. Existing media queries remain unchanged.
- Only application source files are scanned. Experimental previews and generated output are excluded.

For future component work, direct utilities such as `className="tw:flex tw:items-center tw:gap-[8px]"` are supported, while reusable rules can use `@apply tw:flex tw:items-center tw:gap-[8px]` inside a named component selector.

## Preserved custom styling

The orbit renderer, scroll docking, ribbons, floating bottle, background crops, content-sized card gradients, progressive blur masks, shoe icons, cart checks/quantities, search morph, mobile island, menu, select scroll rails, capsule/sage inputs, checkout progress and account states keep their existing rules and behavior. Custom animation, gradients, masks, complex geometry and state-specific values remain ordinary CSS alongside Tailwind utilities where that preserves the approved design accurately.

Tailwind is a development dependency; there is no browser CDN or Tailwind runtime script in the application. The independent earlier preview studies remain local experiments.

## Verification artifacts

An isolated copy of the original production build is saved locally under `preview/tailwind-baseline-dist/`. Before/after checks use the original build on port 3104 and the migrated build on port 3105. They compare element geometry and 60 computed CSS properties, plus representative screenshots.

The comparison normalizes local server origins and equivalent zero background-position serializations. Remote Google font requests are blocked in both captures to avoid network-dependent font races; local Sahel remains loaded. Reduced-motion captures make the orbit position repeatable. Small WebGL rasterization differences can still occur independently of element styles.

Browser evidence, comparison scripts and reports are local under `preview/tailwind-parity-*`, outside the production bundle. Final results are recorded below after verification completes.

No commit or push is part of this migration without owner approval.

## Final results

- `npm test`: 25/25 passed.
- `npm run build`: TypeScript and Vite passed with Tailwind enabled.
- `git diff --check`: passed. The repository has no `lint` script.
- Primary before/after matrix: **327 paired route/state comparisons**, at 360×800, 393×852, 768×1024, 1024×768, 1440×900 and 2560×960.
- Initial sample: 12 paired home/catalog/detail comparisons. Additional aspect ratios: 9 paired comparisons at 912×1368, 1024×1366 and 3440×1440.
- There were no element-geometry changes. Six raw matrix states reported only Blink's zero-versus-used-pixel serialization of unchanged auto container margins; these are retained in the raw report and classified as equivalent in the reviewed report. An additional 18-state focused rerun matched.
- No remaining design differences, application page errors, broken loaded images or new document overflow in the reviewed checks. Lazy images not yet requested are not classified as broken images.
- The open catalog sort dropdown at 768px produces horizontal overflow in **both** builds. This pre-existing condition was preserved; changing its design or behavior is outside this migration.
- Normal-motion runtime checks passed at 393px and 1440px in both production and Vite development mode: orbit readiness, pause/resume, scroll docking checkpoints, mobile search morph/toggle, and capsule input styling.
- JavaScript stayed at 342,412 bytes (104,168 gzip). CSS changed from 86,530 to 88,265 bytes; gzip changed from 17,669 to 17,937 bytes: **+268 compressed bytes**.

Reviewed JSON: `preview/tailwind-reviewed-summary.json`. Raw matrix: `preview/tailwind-parity-matrix/summary.json`. Initial screenshots: `preview/tailwind-parity-sample/`; final interaction screenshots: `preview/tailwind-parity-matrix/`. Additional aspect ratios and focused rerun: `preview/tailwind-parity-extra/` and `preview/tailwind-parity-focused/`. Runtime results: `preview/tailwind-runtime-results.json`.

Browser checks used desktop Chrome with viewport emulation; physical mobile, other browsers and screen-reader testing were not performed during this migration.

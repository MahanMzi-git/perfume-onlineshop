# Approved storefront refinements — 2026-10-27

The owner approved all five isolated Tailwind studies and authorized applying and pushing them together with the previously completed Tailwind migration. This intentionally changes the appearance of the shared storefront components. The earlier no-appearance-change comparison in `tailwind-migration.md` describes the migration before this approval.

## Delivered

- Photo product cards: 24px corners, restrained shadow, responsive title scale, translucent capsule scent-note controls, and full-width capsule cart controls. The existing product photos, individual bottle framing, content-dependent black gradient, progressive blur, white shoe icons, cream/gold cart mark, shared quantities, variant-aware state and note packing remain in use.
- Narrow cards: quantity controls use a second row inside the same rounded control when the card is at most 240px wide. Both quantity buttons retain 44px-wide, 48px-high touch areas; the add label and bag mark remain visible. Note controls keep compact visual dimensions and expanded hit areas with sufficient row separation.
- Category podiums: floating cream captions and arrows, subtle selected state, and two columns on phones. Podium crop landmarks, bottle docking coordinates and the orbit renderer are unchanged; the existing dock geometry measures the updated responsive grid.
- Typography: consistent Persian section-heading weight, responsive sizes, English eyebrow spacing and restrained gold links. The approved hero composition and Sahel font remain intact.
- Checkout: shared native `AdaptiveDisclosure` makes the cost breakdown collapsible below 768px, with total, item count and shipping qualification always visible. Desktop breakdowns stay expanded. Checkout summary precedes the form in DOM order and moves into the sidebar on desktop. The cart uses the same summary component. Invalid-cart errors remain outside the collapsed content.
- Shipping choices: sage selected panels, circular icon backgrounds, clearer title/time/price hierarchy and capsule continuation buttons. The existing shipping and total calculations remain authoritative.
- Footer: three native mobile accordion groups and expanded desktop groups, with existing destination and policy actions retained. A catalog link is also available in the shopping group. Resizing updates disclosures and returns focus to the summary if collapsing its focused content.
- Tablet fix: the catalog sort panel opens inward from its narrow column, eliminating the previously documented 768px horizontal overflow.

All refinements compile through `src/styles/tailwind.css`; shared overrides live in `src/styles/storefront-refinements.css`. No new production dependency beyond the approved Tailwind integration was needed. Payment, authentication, orders and customer records remain explicitly mock UI.

## Verification

- `npm test`: **25/25 passed**, including cart totals, stock/variant rules, form validation, account rendering and review eligibility.
- Final `npm run build`: **passed**, TypeScript and Vite/Tailwind.
- `git diff --check`: **passed**. There is no lint script in this project.
- Initial production sample: **12 states** across 393×852, 768×1024, 1024×768 and 1440×900; home, catalog and detail screenshots reviewed before broader checks.
- Normal-motion Chrome checks: **128 states** across 360×800, 393×852, 768×1024, 1024×768, 1440×900, 2560×960 and 3440×1440. Covered orbit readiness and pause/resume, docked podiums, add/increment/decrement/remove, touch bounds, shared wishlist cart marks, cart, checkout validation, province/city choices, shipping total changes, review/payment/mock completion, responsive footer and cost disclosures, keyboard toggles, resizing, sort dropdown and mobile search. Representative detail, collection, fragrance-family and account routes also checked.
- Final targeted rerun after narrow-card spacing adjustments: **12 states** at 360, 393 and 1440px, including card counts/touch bounds and the footer policy dialog.
- No page errors, broken loaded images, new document overflow or clipped card-copy bounds in these checks. Initial sample used reduced motion; the larger interaction pass used normal motion.
- Local evidence: `preview/approved-refinements-{sample,full,touch}/report.json` and screenshots alongside; script: `preview/approved-refinements-qa.mjs`. These local QA artifacts and earlier experimental galleries are excluded from the production bundle and commit.

Browser evidence uses desktop Chrome viewport emulation. Physical mobile, other browsers and screen-reader testing were not performed; geometry assertions are not an exhaustive accessibility audit.

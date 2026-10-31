# Phase 1 — Step 4: seller operations UI

## Final owner-approved scope

Only the customer storefront/account and seller workspace remain. The owner explicitly removed the platform/developer console after reviewing the initial Step 4 preview. Its routes, navigation, persona, mock datasets, feature flags, integration/task/log/maintenance interfaces and special styling have been removed, rather than hidden. Old `#/platform` URLs resolve to the ordinary not-found page.

The Project Master Instructions are the instructions in this conversation (confirmed by the owner) and repository guidance. Existing storefront design, shopping state, customer account and approved compact cards are preserved. Work stops at Step 4; no backend, real login, payment or operational administration is implemented.

## Seller routes

The seller workspace starts at `#/seller` or `#/seller/overview`. Its navigation includes:

- Products, product creation and editing: `products`, `product-new`, `products/:id`.
- Taxonomy: `brands`, `families`, `notes`.
- Volume/pricing and inventory: `variants`, `inventory`.
- Orders and preparation timeline: `orders`, `orders/:id`.
- Fictional customer lookup: `customers`.
- Campaigns, review moderation, homepage content: `campaigns`, `reviews`, `content`.
- Shipping, support, performance reports, store/seller profile: `shipping`, `support`, `reports`, `settings`.

All paths above are under `#/seller/`. Unknown seller paths and invalid product/order IDs show a local missing-record state. The customer account remains under `#/account`.

## Demo role/access matrix (UX only)

| Selected persona | Customer storefront/account | Seller panel | Mutation |
| --- | --- | --- | --- |
| Visitor, default after reload | Existing public demo | Access-denied preview | None |
| Seller demo | Existing public demo | Read/write preview | Seller-local fixtures only |
| Read-only analyst | Existing public demo | Read-only preview | None |

The analyst is a read-only mode within the seller panel, not another console. There is no platform role. Anyone can select a labelled demo persona; this is not authentication or authorization. Backend identity verification, permissions and resource isolation must be implemented and tested in a later phase. Disabled/hidden controls protect no real resource.

## State and interactions

- One in-memory seller state is shared across seller pages, separate from customer cart/account data and original catalog fixtures. It resets on reload or leaving the seller shell. No administrative storage or server write is performed.
- Product creation/editing, taxonomy editing, sample campaigns, content drafts, shipping fees and seller/store profile forms are functional local interactions.
- The product file picker accepts PNG/JPEG/WebP up to 2 MiB. A revocable object URL provides a form preview only; images are not uploaded or saved as product media. This limitation is visible beside the picker.
- New products have one demo 50ml volume, sample price and zero stock. The variants editor can add a unique volume and edit price, volume and inventory.
- Inventory must be integer 0–9,999; volume integer 1–1,000ml and unique per product; form prices are positive safe integers within the specified limit.
- Stock changes, new volumes, order progression and review moderation require confirmation. Orders advance one preparation step at a time. No real payment, shipment or customer communication is claimed.
- Support responses are local drafts. Customers, masked phone strings, orders and every metric are explicitly fictional. Reports show fabricated product-performance values, not real sales.
- Shared tables provide Persian search, status filters, name sorting, five-row pagination and no-results reset. They become labelled cards below 601px.
- Forms use the approved capsule/sage fields and existing LuxurySelect with thin-line/oval scrolling. They show Persian validation errors and focus the first invalid field. Existing boundary-aware keyboard navigation is reused.
- Every page has explicit normal/loading/empty/error preview modes. Empty/error modes do not clear local state; retry restores the same data.
- The seller shell has separate navigation and lazy-loaded JavaScript. Customer header/island/comparison controls are not rendered inside it.

## Verification and limits

- `npm test`: 30/30 passed, including seller routing, removed-platform routing/role/data regressions, read-only access, fixture isolation, invalid numeric mutations and one-step order progression.
- `npm run build`: strict TypeScript and Vite passed after removal.
- Current seller matrix covers all 19 route states in six sizes: 360×800, 393×852, 667×375, 768×1024, 1024×768, 1440×1000 (114 checks). Loading/empty/error previews are exercised for every seller route at 393px. Results: `preview/admin-matrix-report.json` (local ignored artifact).
- Chrome workflow checks: creation/editing, file preview, validation/focus, stock cancel/confirm, new volume, order advance, review moderation, support reply, search and reload reset; tested mutations emitted no non-GET network requests.
- Additional checks during seller implementation covered taxonomy create/edit, invalid campaign percentage, shipping summary, email validation, customer lookup and sorting/pagination. Keyboard QA covered skip link, select opening, boundary navigation, Escape, modal focus containment/return, seller profile persistence and return to the unchanged five-column storefront.
- Physical mobile devices, screen readers, Safari and Firefox were not tested. Prior screenshots/reports that include a platform console describe the superseded preview and are not the current product.

The owner approved the seller-only implementation for commit and push. Work remains limited to Step 4.

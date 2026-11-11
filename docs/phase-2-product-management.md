# Phase 2 — Product management, images, and publishing

The seller creates and edits a product in the existing React panel, adds its
sellable variants and photos, and publishes it to the public catalog. Django
enforces permissions and publication rules. PostgreSQL stores catalog records.

PR #43 established the Product and Variant models and public product detail.
PR #44 added seller sign-in with Django sessions, CSRF protection, permissions,
and login lockout. Both are on `main`.

## Delivery order

| Step | Scope | Acceptance |
| --- | --- | --- |
| 1. Product drafts | Reconcile the current form with the Product model, then connect create, list, read, and edit in the React panel to the seller API. | An authorized seller creates and edits a draft, and the same values appear after reload. A user without the required permission cannot write. Public list and detail exclude the draft. |
| 2. Variants | Manage each product's SKU, volume, concentration, price in whole tomans, and active status. | Invalid prices or volumes and duplicate SKUs are rejected. Edits persist, and inactive variants are absent from public responses. |
| 3. Images | Upload, preview, remove, and choose a primary image. Support ordering if the panel exposes it. | Authorized uploads show in the panel. The server checks actual image content and size. Removal and replacement have a defined storage cleanup policy. |
| 4. Publishing and storefront | Add an explicit publish action and connect the public catalog and product detail to published records. | Incomplete drafts receive actionable errors. A valid published product appears in both public views with its image and active variants. Selecting a variant changes the SKU and price. |

## First implementation PR

Use `ali_product_drafts` for step 1. Inspect the React form and agree on a
field mapping before changing the schema. Django currently stores product
name, slug, and publication state. The form also captures brand, fragrance
family, and other product attributes. Define which fields this slice persists,
their required and optional values, and how the UI presents fields scheduled
for later steps. Every editable field in the connected form must have a
persistence path before the UI reports that it was saved.

The proposed seller API uses `GET` and `POST` on
`/api/v1/seller/products/` and `GET` and `PATCH` on
`/api/v1/seller/products/<id>/`, scoped to drafts for this slice.
Django checks view, add, and change permissions as appropriate and validates
CSRF for writes. Creation always starts as a draft. The publish action owns
the transition to public visibility in step 4.

## Phase decisions

- Product owns shared catalog information. Variant owns SKU and sellable price.
  The panel and public detail use the saved variant as the price source.
- Publication checks run in Django. Proposed minimum requirements are complete
  required product information, a valid primary image, and at least one active
  variant. Confirm the exact required fields in the publishing PR.
- Use configurable media storage. Define allowed formats, size limits, and
  cleanup behavior in the image PR before implementing upload.
- The current preview route is `#/seller/overview`. Reserve `/seller/`
  as the production entry point on the storefront origin and activate it
  during deployment. Give that link to staff when provisioning accounts.
- Inventory, checkout, orders, payments, and customer authentication are
  outside this phase.

For each implementation step, use a focused `ali_*` branch and a separate
PR. Verify the Django API and permission boundaries, run frontend tests and
the build, and exercise the affected flow in a browser against PostgreSQL.
The final browser check goes from seller sign-in to draft creation, variant
and image setup, publication, and public variant selection.

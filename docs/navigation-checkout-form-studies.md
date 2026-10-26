# Independent navigation, order progress and input studies

Implemented locally on 2026-10-25; awaiting owner review. No commit or push in this change.

## Navigation

Header menus now use real hash links: catalog; women, men, unisex, niche and gifts at `#/collections/:slug`; brands and individual brand catalogs at `#/brands` and `#/brands/:id`; fragrance families; about; contact; and journal. Category tiles and footer category links share these destinations. The magazine now has its own journal page, as part of the request for independent menu pages. The homepage remains available from the logo and mobile island.

Collection/brand filters are fixed by the page scope and retained across search, sorting, pagination and reset. Contradictory query parameters cannot switch the audience of a collection. Missing collection/brand IDs show the existing not-found state. The underlying catalog, product cards and cart remain shared. Gift collections may be empty with current reference data; no products were fabricated to fill them.

About/contact copy avoids invented business history, phone numbers, addresses or service guarantees. The contact form validates locally, sends nothing and stores nothing. Existing educational article content supplies the journal.

## Purchase and fulfillment

`OrderProgress` provides a connected RTL icon sequence from cart through contact, address, shipping, review, payment presentation and preview completion. Current, completed and pending steps have visual and screen-reader labels. This supplements the existing five validated checkout steps without bypassing them.

`OrderTracking` shows processing, packing, ready, shipped and delivered states in fictional account order details. It becomes vertical inside narrow panels. Cancellation requests retain the sample's last status with an explicit cancellation notice. Demo order references now resolve product names in the current catalog.

Completing checkout opens an explicitly labelled fulfillment-design preview with a local stage selector. It creates no order, performs no payment, sends no notification and preserves the cart. Account fixtures remain independent from checkout.

## Inputs: preview only pending style selection

`#/form-studio` offers three interactive styles: curve/cream, capsule and sage. The central `src/styles/form-fields.css` uses `data-field-style` and shared variables; no skin is enabled outside the study cards. A future approved skin can be enabled at a common ancestor without finding every input. Header search, quantity widgets, select-search, radio/checkbox/range and other specialized inputs are excluded.

Required, invalid, focused, disabled and textarea examples are included. Visible labels remain, placeholders supplement them, focus is visible and reduced-motion removes transitions. Standard shared customer forms now have centralized placeholders for name, mobile, email, address, postal code, support and reviews; coupon and price filters also have hints. No new dependencies.

## Verification

- TypeScript/Vite production build passed; `npm test`: 23/23 passed.
- Added render/route regressions for collection scope and fulfillment states.
- Chrome interactive QA: all 11 menu destinations; close/focus behavior; direct URLs; brand navigation/back; invalid routes; conflicting audience query and reset; real shared cart; all five checkout steps; required validation and Persian postal digits; completion and stage selection; fixture cancellation; three form styles with required/email validation, success, disabled fields and arrow navigation.
- Scoped responsive matrix: 320x800, 360x800, 390x844, 768x1024, 1024x768, 1440x900. Nine route/state checks per viewport (54): men's collection, brands, about, contact, form studio, empty cart, packing/delivered fixture details, populated checkout contact. No document overflow, broken loaded images or application page errors.
- Sample screenshots inspected before the compact-phone/tablet matrix; mobile stepper and narrow-panel tracking inspected after. Interactive checkout completion was tested at 390px; the responsive matrix is not every checkout step at every width.
- Local QA artifacts (ignored): `preview/navigation-checkout/sample.json`, `matrix.json`, screenshots in the same folder; runner `preview/navigation-checkout-review.mjs`.
- `git diff --check` passed. No lint script is configured. Physical mobile/keyboard and screen-reader testing were not performed.


## Approved field skin — 2026-10-25

The owner selected the capsule shape with the sage palette. The application root now enables `capsule-sage`: 28px input corners, #F0F3EE background, #C3CDBE border, #53654B focus and a soft sage shadow. Multiline fields retain practical rounded corners. Shared error/disabled states remain distinct. Specialized search, quantity, checkbox/radio/range controls keep their existing behavior/styles. The study page identifies the approved combination while retaining the other two comparisons. No push requested in this follow-up.

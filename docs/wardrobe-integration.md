# Wardrobe catalog integration

The current app uses its frontend demo catalog. Reference bottles without catalog entries are explicitly preview samples; they have session-only cabinet state. Production should call buildWardrobe with published catalog entries and omit the demo-sample flag.

The backend needs a customer-facing published perfume feed with a stable product ID, metadata for the details panel, and image URLs. Product drafts and the current product-detail endpoint do not provide this feed. A published product can be rendered from its original image while its cabinet image is pending or unavailable.

Store the uploaded original separately. Add an optional seller-provided cabinet image and an asynchronously generated transparent image. Record the processing status and source revision, so an older job cannot overwrite a newer upload. Prefer seller-provided artwork, then generated artwork, then the original. Publish independently of the processing job.

Persist a cabinet placement as a slot ID and product ID pair when stable positions must survive catalog changes. The preview uses numbered slots and demo artwork assignments; unassigned products are appended in feed order. On the server, allocate a free slot for new products and release or suppress the slot when a product is removed or unpublished.

Persist experience, opinion, and favourites per authenticated user and product ID. The preview uses existing customer session state and the existing browser favourites store for catalog items.

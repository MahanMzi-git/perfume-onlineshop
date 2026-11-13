# Wardrobe catalog integration

The wardrobe renders one entry per perfume in the supplied catalog snapshot, in feed order. The local storefront passes its existing preview catalog, with the two previously excluded perfumes omitted. Reference images without catalog products do not create extra entries. To connect the live catalog, pass a customer-facing published perfume feed to buildWardrobe and re-render with the returned array whenever the snapshot changes. The product draft and detail APIs do not supply this feed today.

Each page holds at most 16 products on four shelves. The shelf edges and slot spacing are fixed coordinates shared with the cabinet image. A partial row is centered. Product IDs identify selection and preferences separately from the calculated shelf coordinates. Removing an item compacts the catalog and clamps the current page to the last available page.

Return stable IDs, display order, fragrance metadata and image URLs with the published feed. Preserve the original image and return the dedicated seller upload or generated transparent image when available. Export transparent artwork tightly trimmed to its silhouette, or extend the feed to carry crop metadata. Local artwork bounds trim transparent padding at render time without modifying the original files.

Provide an explicit cabinetVolumeMl value associated with the volume shown in the artwork. The display defaults to a common height when this value is absent. The scale uses the cube root of the ratio to 100 mL, clamped to 0.62–1.12, with a separate slot-width limit and a preserved aspect ratio. The preview does not infer a volume from the catalog's variant list.

If seller-side processing is introduced, track its status and source revision so an older job cannot overwrite a newer upload. Publish independently of the processing job. The original is available as the fallback while a cutout is pending. Persist fragrance experience, opinions, and favourites per authenticated user and product ID when backend account storage becomes available.

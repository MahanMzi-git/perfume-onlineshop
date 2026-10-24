# Approved audience icons

Shoe icons are the default for all product cards and product detail pages, with no query parameter or preview flag. AudienceIcon shares the three assets and Persian labels. Cards use fully opaque white marks (women 30x24, men/unisex 34x24); detail pages use brown marks beside the visible audience label. The rejected portrait illustrations are removed.

The men and women files are owner-supplied SVG artwork. Unisex preserves the owner-approved generated shoe composition: an SVG wrapper embeds the PNG and removes the white contour from its alpha so the internal line remains a cutout. It is not fully vector artwork. Browser CSS masks apply the current color without changing the approved silhouette. Previous experiments are archived locally in ignored preview/audience-icon-archive and are not shipped.

Validation: production build, project tests, default URLs for cards and all three product audience types, and responsive checks at 360, 473 and 1440 CSS pixels. No commit or push is included in this promotion.

# Create a brand or fragrance family while saving a product

Owner-requested seller workflow follow-up, 2026-10-31. A seller can choose **افزودن برند جدید…** in the product form's brand list, enter a brand name and optional description, and save the product once. No separate page or brand-save action is required. The existing capsule/sage form controls, list design and storefront appearance are preserved.

The same workflow now applies to **خانوادهٔ رایحه**: choosing **افزودن خانوادهٔ رایحهٔ جدید…** reveals its name and optional description in that form. A product can create both a brand and a family in the same save. Both records become available in their respective seller libraries and subsequent product forms.

The conditional fields stay hidden for an existing brand. Switching between existing/new-brand modes retains the unsaved product and brand text; hidden brand fields do not block saving. Required-field errors are labelled, focus the invalid control and clear when that control is edited. A successful edit resets the form to the saved canonical brand.

`src/admin/productSave.ts` performs one immutable demo-state update for the product and optional brand/family. Invalid drafts create none of the records. Existing names are reused after case, Arabic kaf/yeh, repeated-whitespace and space/ZWNJ normalization; interior word boundaries are retained to avoid conflating distinct names. Existing library descriptions/status are not overwritten. Product edits retain their image and volume variants.

Scope remains frontend-only: this does not publish products to the customer catalog, persist them after leaving/reloading the seller workspace, upload photos or implement authentication. The product form now selects up to four individual scent notes from a searchable icon library, with removable selections. Fragrance-family options show Persian on the right and English on the left. New families can store their English label. A required women/men/unisex selector is saved on the seller product. Existing product fixtures derive that value from their original target audience.

Validation:

- Ten model tests cover atomic creation, invalid/no-orphan behavior, duplicate reuse without metadata loss, edit preservation and existing-library paths for brands and families. `npm test`: **44/44 passed**; `npm run build`: **passed**, including TypeScript.
- Chrome interactions at **360, 390, 768, 1024 and 1440 px** passed conditional fields, keyboard Tab to the new input, required-name validation, preservation across mode changes, product/brand creation and duplicate reuse. No document-level horizontal overflow or application exceptions were observed; requests in this flow had no non-GET/HEAD operations.
- Existing seller interaction/keyboard checks passed; final seller settings/taxonomy checks also passed. Representative mobile/desktop form screenshots were visually inspected.
- The family follow-up passed the same five widths for conditional input, keyboard navigation, validation, retained drafts, combined brand/family/product save and duplicate reuse. A mobile edit also confirmed that saved family selection replaces the temporary new-family inputs.
- Local evidence: `preview/inline-brand/results.json`, `preview/inline-brand/form-*.png`; runner `preview/inline-brand-qa.mjs`. The broader Step 5 report records its earlier audit snapshot rather than claiming the entire 935-case matrix was rerun for this follow-up.
- Family evidence: `preview/inline-family/results.json`, `preview/inline-family/form-*.png`; runner `preview/inline-family-qa.mjs`.

The owner approved publication of this follow-up with the final frontend changes.

## Icon note library and audience follow-up

The owner approved applying the note-picker study. It now uses the existing ScentNoteIcon illustrations (a generic leaf only for custom library notes without a known icon), searchable Persian/English names, four-selection cap, selection removal and accessible labelled checkboxes in a keyboard-dismissible dialog. Library, bilingual family and saved audience flows passed in Chrome at 360, 390, 768, 1024 and 1440 px. Evidence: preview/note-picker-qa.json and preview/note-library-*.png. Full unit suite: 45/45 passed; production build passed. Scope remains seller demo only; no publication, real upload or backend.

The note library now uses wrapping pill choices with the existing icon, Persian/English labels and a selected checkmark. Keyboard checkbox semantics, visible focus, search and the four-note limit remain. Capsule click/save checks passed at all five required widths; the production build passed. Local runner: preview/note-capsule-qa.mjs.

Usage follow-up: product forms now include icon capsule multi-selects for seasons, occasions and morning/evening/night. These persist independently in seller demo products, preserve existing values on edit and reject unknown options. Existing products seed their known season/occasion metadata; evening occasions seed evening/night without inventing other times. Per-volume pricing and stock remain in the existing volume/price editor, with multiple variants per product. Full tests: 46/46; production build passed. Local usage/save and volume regression evidence is in preview/usage-qa.mjs and preview/admin-interactions-qa.mjs.

# Three.js motion study — local review only

Preview: http://127.0.0.1:5174/motion-lab/index.html (explicit index.html required by Vite public-file serving).

This is an isolated visual prototype, not a redesign applied to the storefront. Existing uncommitted search-panel work is preserved. No app routes, package dependencies or lockfile changes were made for this experiment.

## Included
- Original procedural rounded perfume bottle, locally drawn label and geometric cap; no downloaded product models or licensed photos needed.
- Three moods: light atelier, muted rose and amber night; interpolated material colors.
- Gentle pointer response, scroll-driven rotation, floating scent particles and a fine orbital line.
- Interactive lift-off cap, pause/resume and reset-to-start controls.
- Mobile scene separated from the introduction, capped rendering resolution, hidden-document render skip, reduced-motion preference and a simple WebGL-failure fallback.

## Files
public/motion-lab/index.html, scene.js, three.module.js, three.core.js and THREE-LICENSE.txt. Three.js 0.180.0 is pinned and served locally; MIT license retained. Google Fonts is still external. No new runtime dependency loads on the existing storefront.

## Actual verification
JavaScript syntax check passed. Existing TypeScript/Vite build passed. Browser WebGL rendered successfully; no console errors observed. Checked 360, 390, 768, 1024 and 1440px with no document horizontal overflow. Verified mood state, pause state, cap state and inspected rendered output. Screenshots in ignored preview/ directory. No physical-device performance certification, frame-rate guarantee or reduced-motion emulation is claimed.

## Limits and next action
This is a procedural art-direction model, not photorealistic glass or a real product asset. The three choices are variations of one scene, not three complete store redesigns. Storewide motion, actual product GLB assets and production lazy loading/disposal integration remain pending owner selection. Not committed or pushed. Do not add 3D to every card; decide placement after review and performance testing. No assertion that a particular effect is universally the best or the definitive 2026 trend.

References: https://threejs.org/manual/pages/installation.html and https://threejs.org/manual/pages/responsive.html . Existing ui-ux-pro-max guidance informed restrained motion; the established cream/charcoal identity was retained.

Suggested commit after approval: feat: add isolated Three.js fragrance motion study.

## Revised orbit-to-category study
The owner rejected the original single-bottle direction and requested different perfume shapes, colors and volumes revolving around a larger premium-looking centerpiece, then sequentially landing in the six existing audience/category slots on scroll.

New independent preview: /motion-lab/orbit.html. Files: public/motion-lab/orbit.html and orbit.js. Existing production application and previous uncommitted header-search trial remain untouched.

Seven original procedural bottles: a central Atelier No.01 and six fictional 50/100/75/30/2/10ml bottles. Shapes include round, wide, rectangular, tall and sample-vial. Scroll progress staggers the six detachments and maps their canvas coordinates to actual DOM category docks; scrolling up reverses the placement. Category links lead to existing catalog/discovery routes. Pause stops orbital rotation; reduced-motion removes continuous orbit and skips the long traveling interpolation. Pixel density is capped. WebGL failure preserves category links with simple CSS symbols.

Instagram reference could not be fetched through the web tool; implementation follows the user's description, not a claimed inspection of the video. These procedural bottle shapes are an art-direction study, not final GLB product models. No commercial price or official brand claim. Browser connection recovered after starting Vite as a detached hidden process. Live WebGL verified with no console errors. Layout checked at 360/390/768/1024/1440px without document overflow. Desktop and mobile scroll verified all six bottles dock; returning to the top restores zero docked and orbit. Bottle geometry origins were centered to keep caps inside destination cards. Small-height mobile hero has a 720px minimum to avoid text overlap. Syntax check passed. No commit/push authorized for this study.

## Landing integration approved for local implementation
Owner selected the orbit study and requested it on the real landing page. Updated hero copy: «رایحه‌ای را کشف کن که امضای تو باشد.» Removed the instructional sentence from the prototype.

The orbit renderer is now an exported reusable mount with disposal of rendering loop, event listeners, geometries, materials, textures and renderer. FragranceOrbit.tsx dynamically loads it only on the homepage, observes readiness and keeps original category artwork when WebGL is unavailable. Existing category buttons and their filtering behavior remain; their image areas serve as docking targets. The canvas ignores pointer input. Rendering is skipped outside hero/category visibility and when the document is hidden. Existing header/search trial is preserved, not approved or published as part of this request.

Files: src/components/{FragranceOrbit,HeroSection,CategoryTile}.tsx, scoped additions to src/styles/catalog.css, public/motion-lab/{orbit.js,orbit.html}. No npm dependency or lockfile change. Three.js remains locally pinned with its existing MIT license. No production push until requested. Actual visual QA and final build recorded below.

Integration QA: npm test 11/11 passed, TypeScript/Vite build and whitespace check passed. Five responsive widths showed no document overflow. Category filtering still returned the two women-demo products. Entering product detail removed the canvas (zero), browser Back mounted exactly one canvas, and returning to the hero rendered successfully with no console errors. Mobile scroll reached six docked; desktop staggered docking inspected. Performance on physical devices and production-preview network behavior remain unverified.

## Compact mobile hero refinement
Owner approved reducing excess cream space on iPhone-sized screens. On successful 3D load, mobile hero height now follows copy plus a 330px orbit area, instead of an 800px/viewport minimum and hidden artwork retaining layout space. Orbit center follows the copy bottom plus 155px; bottle scales are unchanged. Desktop rules and original image fallbacks remain. Verified 360/390/440px (670px hero in observed layout), tablet/desktop without document overflow; all six bottles still dock after scrolling. JS syntax and production build passed. Screenshot: preview/landing-compact-iphone.jpg. Physical iPhone testing remains unverified. Not committed or pushed.

## Reference-inspired jewelled centerpiece
Owner supplied a Morreale Paris bottle reference and asked to replace the central bottle. Implemented a procedural cylindrical silhouette, clear rounded shoulder, jewelled silver sleeve/cap, metallic rings and diamond-shaped front emblem. The photo itself is not redistributed. Jewels are drawn into one shared 1024px canvas texture rather than separate geometry; centerpiece uses eight meshes. No image download or npm dependency introduced. Centerpiece scale adjusted to retain the existing orbit clearance. This is an approximation inspired by the reference, not a photogrammetric replica. No unverified price or world-record claim is displayed.

Changed public/motion-lab/orbit.js. JavaScript syntax check and production build passed. Visual verification completed after user refreshed: centered cylindrical jewelled bottle rendered, no console errors observed. Widths 360/390/440/768/1440px had no document overflow and exactly one canvas. Screenshot: preview/jewelled-centerpiece-mobile.jpg. Physical-device frame rate remains unmeasured. No push. Suggested commit after approval: feat: add lightweight jewelled central perfume bottle.

## Six reference-inspired orbit bottles
Owner supplied six references and requested category-specific replacements. Mapping follows existing category order: women → Carolina Herrera La Bomba butterfly; men → Creed Aventus with clear shoulders, black sleeve and tapered cap; unisex → Kilian Angels’ Share faceted amber cylinder and crystal-like cap; niche → Dunecry amber body, stone cap/sleeve and gold seam; scent discovery/sample → slim Libre atomizer selected from the three-vial reference; gifts → Baccarat Rouge 540 Extrait red body/gold cap from the attached saved NOSE HTML.

Read only image URLs from the supplied HTML; no scripts or instructions in it were executed. All six image references were visually inspected in browser. No reference photos are embedded or hotlinked by the storefront. Geometry and canvas textures are generated locally and approximate the designs. No official affiliation, product availability or actual gift-set claim is added: these remain category illustrations. Existing fictional catalog product records are unchanged. Changes are limited to public/motion-lab/orbit.js and this document. No new dependency. Original unused generic factory removed.

Models use shared simple materials, low-segment cylinders/extrusions, locally drawn labels, procedural stone texture and line-based crystal cuts; they are not high-resolution scans. Caption volumes in the older standalone prototype are demo placeholders and not real product specifications. Production catalog data and prices are not changed. No push pending visual approval. Suggested commit: feat: add reference-inspired orbit bottle models.

Verification: JS syntax check and TypeScript/Vite build passed. Live browser showed six reference-inspired models with no console errors. Widths 360/390/440/768/1440px showed no document overflow. Scroll reached six docked. Mobile and desktop screenshots saved in preview/reference-orbit-*.jpg. Physical-device performance is unmeasured; model likeness is illustrative rather than photorealistic.

## Optimized photographic orbit (current landing renderer)
All seven procedural bottles are replaced on the homepage by local transparent WebP cutouts in `public/images/orbit-photos/`. `photo-orbit.js` uses textured planes, a faint offset silhouette, soft procedural contact shadows and restrained tilt; it preserves the existing orbit and category docking. Photos are not full 3D scans. The original procedural prototype remains available for comparison.

Photo preparation used imagegen background extraction from owner-supplied references; central Morreale occlusions from the hand/caption required reconstruction. These retouched images are reference-based, not guaranteed pixel-identical packshots. Baccarat uses the original transparent NOSE packshot without generative editing. Sources and rights limitations are recorded beside the assets.

Sizes in bytes: La Bomba 48,780; Creed 30,530; Baccarat 6,522; Dunecry 42,188; Kilian 75,222; Libre 7,796; Morreale 90,792. Total 301,830 bytes (295 KiB), excluding the existing Three.js runtime. Central height 640px; orbit cutouts at most 480px. Every WebP has alpha. Assets load locally; all seven must load before hiding existing SVG fallbacks. Reduced-motion, pause and teardown remain supported. No new dependency or migration.

QA: npm test passed 11/11. Browser confirmed ready state, one canvas and no horizontal overflow at 360, 390, 440, 768, 1024 and 1440px. All six bottles docked in matching category positions on desktop. Mobile and desktop screenshots: preview/photo-orbit-mobile.jpg and preview/photo-orbit-desktop.jpg. Physical-device FPS remains unmeasured. No commit/push; next step is owner visual review. Suggested commit: feat: use optimized photo cutouts in landing fragrance orbit.

### Three-vial sample group
Owner requested all three sample vials rather than only Libre. Re-extracted Black Opium, Mon Paris and Libre together with transparent alpha from the same reference. Existing libre.webp key is retained for compatibility; it now contains the complete group (250x480, 30,714 bytes). Orbit sample scale factor increased from .65 to .85 for mobile legibility; same docking target and behavior. Updated total photo payload: 324,748 bytes. No dependency or configuration changes. Next action: owner visual review. Suggested commit: fix: show all three sample vials in fragrance orbit.
Verification: JavaScript syntax and TypeScript/Vite build passed. Live 440px preview showed all three vials with transparent gaps and no horizontal overflow; scroll reached six docked and group fitted the scent tile. Screenshot preview/three-samples-mobile.jpg. Physical-device FPS not measured. No push.

Release approval: owner approved photographic orbit including the three-vial group and requested push. Exact staged snapshot (excluding the rejected header-search trial) passed npm run build and npm test (11/11) in preview/release-check. Upstream Three.js source is preserved verbatim; git diff --check reports its pre-existing mixed indentation at three.core.js:48480. No application whitespace errors. Search trial stays local and is not part of this release.

## Orbit line occlusion fix and font selection preview
Owner requested every bottle stay visually above the orbit line at every angle. Photo materials now disable depth testing (their existing renderOrder=2 remains), and orbit line/dust disable depth writing. This prevents those translucent guides from rejecting bottle fragments on the far side. Path, scale, shadows, docking and approved controls remain unchanged. JS syntax and TypeScript/Vite build passed. Live browser verified desktop rendering and ready/no-overflow at 390px. Screenshot preview/orbit-layer-fix.jpg. No dependency/configuration changes or push.

Independent ignored preview/fonts.html compares real locally loaded Estedad, Vazirmatn, Shabnam and Sahel fonts with identical text and sizes; all four reported loaded. Font downloads are only in preview/font-samples, not loaded by the store. Sources: github.com/aminabedi68/Estedad (Google Fonts distribution) and github.com/rastikerdar/{vazirmatn,shabnam-font,sahel-font}. No store font changed; next action is owner selection. Screenshot preview/persian-font-comparison.jpg. Suggested commit: fix: keep fragrance bottles above orbit guides.

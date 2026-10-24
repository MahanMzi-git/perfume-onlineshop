# Category podium backgrounds

All six home category tiles use owner-supplied local photos. Assignment: women/coastal stone, men/woodland stump (Creed), unisex/black stone and gold, niche/floral wood, scent samples/sage fabric podium, gifts/burgundy table (Baccarat). Original image bytes are preserved in public/images/category-scenes.

src/data/categoryScenes.ts records each source aspect ratio, surface centre and crop scale. CSS fits each photo around a shared contact point at horizontal centre and 80% of the image area's height, reserving the final 42px for the category label. The crop dimensions retain the source aspect ratio. Background photos do not zoom on hover, so the stand stays aligned with the bottle. The crop removes the green reference's marginal lettering and the square wood image's top corner tag from the visible card area.

Each dock exposes a zero-size data-orbit-landing marker. photo-orbit.js targets that marker with the bottom of the bottle's photo plane, accounting for its final scale rather than centring the bottle on the whole card. Existing hero orbit paths, docking order, pause controls and reduced-motion behavior are retained. Without a marker, standalone motion-lab pages keep their previous target calculation.

Only fallback bottle images are hidden when WebGL is ready; background images remain visible. With WebGL unavailable, the same bottle photos render statically above the stands.

Validation: production build and 21/21 project tests passed. Chrome checks at 320x800, 360x800, 390x852, 600x900, 768x1024, 1024x768, 1440x900 and 1920x800 verified crop coverage, surface/marker alignment within one CSS pixel, all six bottles landed, visible backgrounds, and no document overflow/application errors. Visual samples were inspected before the matrix. Normal-motion scrolling, resize, category selection and a WebGL-unavailable fallback were checked separately. Local QA artifacts: preview/category-scenes. No lint command is configured. No commit or push was made for this change.

Renderer centering follow-up: background crops retain their approved positions. Camera bounds, canvas drawing size and screen-to-scene conversion use the actual fixed stage rectangle, including scrollbar space. A ResizeObserver synchronizes stage-only changes, such as opening a menu that locks body scroll. CSS viewport breakpoints still use window dimensions.

Centering evidence: prior canvas buffer width was 483px while its CSS stage was 468px with reserved scrollbar space. After correction, a QA-only hook inspected the actual scene/camera matrices and projected every bottle bottom centre into CSS screen coordinates. All six targets matched within 1px at 390, 483, 768 and 1440px, under auto, stable and both-edge scrollbar gutters (12 combinations). Normal scroll/resize/category actions and WebGL-unavailable fallback passed again. QA artifacts: preview/dock-centering/results.json.

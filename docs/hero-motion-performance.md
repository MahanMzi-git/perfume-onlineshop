# Hero motion performance — 2026-11-02

The approved orbit, photo assets, ribbon geometry, opacity, pixel ratio and docking destinations are retained. This change targets browser work and initial layout stability, not server capacity.

## Changes

- Mobile hero reserves its final space before the WebGL module/textures load. The ready flag now changes visibility rather than hero height. The static illustration remains a fallback.
- Orbit anchors are cached in document coordinates. Scroll projects them into viewport coordinates without reading each bottle target on every animation frame. ResizeObserver invalidates measurements after hero/copy/dock/header/root size changes; font readiness and viewport resize also invalidate them.
- Paused and fully docked scenes do not redraw until invalidated or scrolled. Animation time stops offscreen and while a native dialog is open, reducing GPU work behind menu blur. Cleanup disconnects observers and events on unmount.
- Header CSS custom properties are written only when their values change. Scroll-based header measurements run only while a menu is open; size changes still update through ResizeObserver.

## Verification

- Production build (TypeScript and Vite): passed.
- Existing Node tests: 46/46 passed.
- Chrome production-preview checks at 360×800, 390×844, 768×1024, 1024×768 and 1440×900: delayed orbit-module loading leaves hero height identical before/after readiness; steady orbit animation makes zero anchor rectangle reads during the sampled 800 ms; scrolling docks all six bottles; menus open/close; no page exceptions or horizontal document overflow.
- Instrumented WebGL draw calls remain at zero during sampled 300 ms periods with the mobile dialog open and with the animation paused, at the tested widths. Resuming scroll still updates docking positions.
- Local QA runner: `preview/orbit-performance-qa.mjs`; results/screenshots: `preview/orbit-performance/`. These are local ignored artifacts, not runtime dependencies.
- Representative mobile hero and desktop docked-content screenshots were visually inspected.

The browser runner uses the existing local Playwright installation under `preview/tailwind-qa/`. Its initial generic `playwright-core` import failed and was corrected to that installed path. Sandbox network access was denied, then the local static server was found stopped; it was started and browser verification rerun. The initial desktop menu locator click scrolled the target automatically; the final runner uses real viewport mouse coordinates to avoid introducing that tool-driven scroll into the test.

No measured FPS improvement, real iPhone performance, network-load benchmark, Core Web Vitals score, or server concurrency guarantee is claimed. Actual traffic capacity depends on future backend, database, hosting and caching. No lint script is configured.

## Repeated mobile scroll follow-up

Mobile widths below 700px now use a document-anchored canvas rather than a fixed canvas whose document position is compensated in JavaScript. This prevents the compositor's scroll from moving the underlying document ahead of a fixed WebGL scene when the main thread misses a frame. The visible slice is scissored at the existing pixel ratio; after all bottles dock, the complete static scene is drawn once so subsequent native scrolling needs no redraw. The desktop path stays fixed.

A local four-way isolation profile compared normal rendering, disabled CSS filters/backdrop filters, disabled orbit module, and both disabled. Each used 360 requestAnimationFrame samples over four scrollTo sweeps at 390×844, DPR 3. Baseline normal recorded six intervals over 33.5 ms, no-blur three, no-orbit zero, neither zero. Median/p95 were approximately 16.7/17 ms; the severe user-reported lag was not reproduced at the same severity. A final sequential run recorded nine long intervals normal, three no-blur, and zero without orbit: **no measured frame-rate improvement is established**. The document-anchor correction addresses asynchronous scroll synchronization, not a demonstrated universal GPU speedup.

`preview/mobile-wheel-qa.mjs` checks repeated actual mouse-wheel scrolling in mobile emulation and asserts both scroll movement and a stable document-space canvas origin/size. Initial CDP touch gestures did not actually scroll in this environment; those samples were rejected and replaced with wheel input with explicit scroll-position assertions. Local evidence remains under `preview/orbit-performance/`.

## Dialog unmount regression

The user reported that closing the mobile menu left the orbit stopped. The original modal observer watched only `open` attribute changes. React unmounts the menu dialog, and its effect cleanup can run after the ref is cleared, so removal does not necessarily produce an observed `open` change. The cached modal flag stayed true. The observer now also recognizes insertion/removal of dialog subtrees, while filtering unrelated DOM changes. Manual pause remains separate from temporary modal suspension. The local browser runner now checks actual WebGL draws resume after close-button removal and two repeated Escape closes; its earlier menu test checked suspension but omitted this resume assertion.

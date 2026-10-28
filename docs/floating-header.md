# Floating header — 2026-10-28

Applied the approved capsule header on all storefront routes: 24px top spacing and 24px side gutters on larger screens, 14px top spacing and 12px gutters on phones, with restrained cream surface/shadow. The sticky offsets are 16px and 10px respectively. Internal routes retain their cream page background.

On home, `HeroBackdrop` extends the existing terracotta photograph behind the header and its surrounding spacing. It measures the announcement/header/hero on resize, and cleans up its observers and pending frame on unmount. The original hero content and orbit anchors are not moved or duplicated. The background is removed when leaving home and reinstated on return.

Header measurement now includes its actual viewport bottom, updated through a passive scroll listener and a single scheduled animation frame. The mobile menu uses this coordinate so it opens below the floating header both at page top and after sticky scrolling. Menu/search/cart behavior is preserved.

Validation: 25/25 existing tests; TypeScript/Vite production build; whitespace check. Chrome: 50 route/interaction checks at 360×800, 393×852, 768×1024, 1024×768, 1440×900, and 2560×960. Covered home/orbit readiness, catalog, product, populated cart, checkout, account/addresses and return-home background lifecycle. Mobile/tablet menu geometry checked at scroll positions 0 and 500; phone search open/type/clear/close checked. No page errors or horizontal overflow; screenshots reviewed. Local evidence: `preview/floating-header-release/` and `preview/floating-header-release-qa.mjs` (not shipped). Physical mobile, other browsers and screen readers were not tested.

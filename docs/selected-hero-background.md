# Approved leaf hero background — 2026-10-28

Replaced the terracotta background reference with the owner's selected `landingpage-back3.jpg` (4816×3035, 697,239 bytes). Three WebP derivatives were encoded locally using Chrome canvas at quality 0.88, preserving the source composition without added filters, cropping or AI generation:

| Width × height | Bytes | Purpose |
| --- | ---: | --- |
| 1600×1008 | 18,760 | Phone, standard density |
| 2560×1613 | 41,696 | Desktop standard density / phone high density |
| 3840×2420 | 89,172 | Desktop high density |

CSS selects the image with the existing 700px phone boundary and a 1.5dppx high-density query. Existing center-bottom cover framing, responsive cream overlays, floating-header backdrop sizing and orbit geometry remain unchanged. The motion toggle now uses dark brown to remain visible against the light photograph. The old asset remains available for rollback but is no longer requested by the home background.

Validation: WebP headers verified, output visually inspected; `npm test` 25/25; final TypeScript/Vite build passed without image-resolution warnings; whitespace check passed. Chrome checks covered 393×852/1x, 1440×900/1x, 360×800/2x, 768×1024/1x, 1024×768/1x, 1440×900/2x, 2560×960/1x. Each loaded the expected WebP with HTTP 200; no page errors or horizontal overflow. Screenshots reviewed; orbit readiness, pause/resume, category docking scene presence, and background removal/restoration across catalog/home navigation checked. Local evidence: `preview/selected-hero-qa/`, `preview/selected-hero-qa.mjs`, `preview/selected-hero-encoding.json`; these QA artifacts and unrelated user files are not included in this commit. Physical-device and cross-browser testing were not performed.

# Sahel typography preview

Owner selected option 4 (Sahel) for an on-site preview. The Persian UI now uses local Sahel Regular, SemiBold (mapped to weights 500–600), and Bold (700–900) WOFF2 files. Font files total 107,268 bytes; original OFL license is included. Source: https://github.com/rastikerdar/sahel-font/tree/master/dist . No npm dependencies or migrations.

Changed index.html (preload local regular and remove unused remote Vazirmatn request), src/styles/global.css (font-face rules), src/styles/tokens.css (Persian family and fallback for Persian in serif headings), public/fonts/sahel. Cormorant remains for Latin branding/product headings. Existing sizes, controls, cards and hover styles retained. Independent font comparison remains in ignored preview/.

Validation: TypeScript/Vite build and git diff --check; browser inspected homepage and compact product controls. Widths 360/390/768/1024/1440 had no document overflow. Screenshots preview/sahel-home-desktop.jpg and preview/sahel-products-mobile.jpg. Physical devices and all possible text combinations are not exhaustively tested. No security functionality changed; text remains selectable, RTL and fallback fonts preserved, font-display swap used.

No commit or push. Next: owner visual approval of Sahel on the store; no further roadmap work started. Suggested commit: style: use locally hosted Sahel for Persian typography.

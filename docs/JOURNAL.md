# Journal

## 2025-12-20
- **Mobile UX Fix:** Fixed scrolling issues on mobile devices.
  - Disabled Lenis smooth scroll on touch devices.
  - Added safety timeout to Preloader to unlock body overflow.
  - Converted GSAP horizontal scroll section to standard vertical stack on mobile using `gsap.matchMedia`.
  - Optimized Three.js geometry segments for mobile performance.
- **Feature:** Refonte complète de la landing page publique (`app/(public)/page.tsx`) style "Awwards".
- **Tech:** Intégration de `gsap` (animations), `lenis` (smooth scroll) et `three` (background 3D).
- **Design:** Application stricte de la charte "Minimal Luxury" (Fraunces, Gold, Deep Black).
- **Fix:** Résolution des problèmes de build liés à `gsap.registerPlugin` en SSR et types Three.js.

## 2025-12-19
- **Design Update:** Initiating "Minimal Luxury" redesign for the public landing page.
- **Objective:** Implement a cinematic, high-trust landing page for a credit granting company.
- **Plan:**
  - Update global CSS variables with new "Ivoire/Gold/Anthracite" palette.
  - Switch fonts to Fraunces (Serif) and Inter (Sans).
  - Rebuild `app/(public)/page.tsx` with new sections: Hero, Trust, Offer, Simulator, Process, Testimonials.
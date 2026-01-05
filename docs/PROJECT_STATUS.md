# Project Status

## Current Phase
- **Public Frontend:** "Awwards-style" landing page implemented with GSAP, Three.js, and smooth scrolling.
- **Design:** "Minimal Luxury" charter fully applied to public pages.
- **Product Pages:** Modular template system with dynamic routing and centralized configuration.

## Stack
- Next.js App Router
- Tailwind CSS tokens
- Radix UI primitives
- shadcn/ui as a customizable base
- **GSAP / Lenis / Three.js** for animations and interactions
- Supabase for dynamic data
- Firebase for long-term data
- **next-intl** for i18n with per-product translation files

## Recent Completions
- Product page template system (`ProductPageTemplate`)
- 6 reusable section components with multiple variants
- Dynamic `[slug]` routing with `_config.ts`
- Separated translation files per product (`messages/[locale]/products/[slug].json`)
- **Complete product translations (all 8 products, EN + FR)**
  - Each product has: hero, stats, problem, solution (8 features), audience (4 profiles), process (3 steps), finalCta
  - Content aligned with Quickfund business philosophy (transparency, speed, coaching, atypical profiles)
- **Credit Simulator** (`/tools/simulator`)
  - SimulatorWidget component with real calculations
  - 6 products supported with pricing from business docs
  - **Country-first selection:** FR, BE, CH, ES
  - **Modular country configs:** Age, product limits, currency, legal info per country
  - SVG flags for consistent cross-browser rendering
  - Interactive sliders, real-time results, FAQ

## Immediate Focus
- Build eligibility test (`/tools/eligibility`)
- Verify mobile responsiveness
- Implement Auth flow
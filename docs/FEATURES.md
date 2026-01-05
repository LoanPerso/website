# Features

## Public
- Marketing landing
- Features and pricing pages
- About page
- **Credit Simulator** (`/tools/simulator`) ✅
  - **Country-first selection:** FR, BE, CH, ES with country-specific rules
  - **Modular configs:** Each country has its own product limits, age requirements, currency
  - 6 products with dynamic calculations
  - Interactive sliders (amount, duration) respecting country limits
  - Real-time monthly payment, total cost, TAEG
  - SVG flags (no emoji) for consistent rendering
  - FAQ accordion
- **Product Pages** (Template System) ✅ Content Complete
  - Dynamic routing via `[slug]`
  - 8 products configured with full EN/FR translations:
    | Product | Amount | Key Differentiator |
    |---------|--------|-------------------|
    | micro-credit | 20€-500€ | Dès 20€, profils atypiques |
    | consumer | 500€-5000€ | 100% transparent, taux compétitifs |
    | professional | 1000€-10000€ | Revenus variables acceptés |
    | student | 500€-5000€ | Sans garant, différé possible |
    | salary-advance | Portion salaire | Éviter le découvert |
    | leasing | Variable | Bien = garantie, taux avantageux |
    | loan-consolidation | Variable | Une seule mensualité |
    | financial-coaching | Gratuit/25€ | Coaching inclus (différenciateur clé) |
  - Modular sections with variants:
    | Section | Variants |
    |---------|----------|
    | Hero | default, centered |
    | Problem | dark/light background |
    | Solution | bento, grid, list |
    | Audience | offset, grid, centered |
    | Process | stepped, timeline, cards |
    | CTA | dark/light background |
  - Custom page override: create `products/[slug]/page.tsx` folder

## Admin
- Dashboard overview
- Settings and profile management

## Planned
- Auth module (providers + sessions)
- Billing module (plans + activation)
- Profile module (public + preferences)

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

## Admin Back Office ✅ (2026-05-28)
- Supabase project provisioned; schema + RLS + reporting views applied; demo dataset seeded.
- `/admin` back office: auth (Supabase + `admin_users`), dashboard P&L, clients, loans
  (with amortization schedule), payments, overdue tracking, products, applications, CSV import, settings.
- Typed data layer (`app/_lib/admin`), reusable admin UI components, French UI.
- Typecheck passes (`tsc --noEmit`).

## CRM clients — scoring & suivi contractuel ✅ (2026-05-28)
- Grouped sidebar (CRM / Financement / Catalogue / Système).
- Credit-scoring engine (`scoring.ts`): 0-100 score + A–D category, weighted factor
  breakdown, reason codes, missing-data handling, staleness; persisted as immutable
  `client_scores` snapshots with recompute and justified override.
- Contractual follow-up: KYC documents (statuses + expiry), interactions timeline,
  tasks/relances (per-client + global page), contracts lifecycle (+ Contrats page).
- Realistic application → client pipeline (qualify, convert with scoring + KYC carry-over
  + interaction + relance). CRM smoke data seeded (scores, docs, interactions, tasks, contracts).
- New migrations applied; typecheck passes.

## Immediate Focus
- Wire env vars (anon/url) on Netlify and confirm `/admin` works in production.
- Replace demo + CRM smoke data with real imported data.
- Consider cookie-based SSR session (`@supabase/ssr`) and audit-log population.
- Build eligibility test (`/tools/eligibility`); verify mobile responsiveness.
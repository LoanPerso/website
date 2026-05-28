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

## Admin Back Office (`/admin`) ✅
Internal tool to run the lending activity (French UI, Supabase-backed, RLS-protected).
- **Auth:** `/admin/login` (Supabase password) + `admin_users` gate.
- **Dashboard P&L:** outstanding principal, lent this month, total lent, collected,
  interest earned, active clients/loans, default rate, overdue €/count; 12-month
  disbursed-vs-collected chart; recent loans; overdue alerts.
- **Clients (CRM):** list with credit score, KYC completeness and open-task counts
  (search, filter by status/category, paginate); create/edit; detail with loans, payments
  and the full CRM stack below.
  - **Scoring crédit:** numeric score 0-100 + category A–D from a weighted engine
    (credit history, debt-to-income, income stability, disposable income, seniority,
    housing, age); factor breakdown, reason codes ("points de vigilance"), score history,
    staleness flag, on-demand recompute and justified manual override.
  - **Pièces & KYC:** document checklist (ID/income/address/bank/contract) with
    received/verified/rejected/expired statuses and expiry tracking.
  - **Suivi relationnel:** interaction timeline (notes, calls, emails, system events).
  - **Tâches & relances:** per-client and global tasks (KYC, signature, recouvrement…)
    with priority, due date and overdue flagging.
  - **Contrats:** lifecycle offer → signed → active → completed, cooling-off deadline.
- **Crédits:** list (filter status/product), create with live amortization schedule,
  detail with per-installment collection, status changes, delete.
- **Contrats:** suivi contractuel — list/filter, status transitions, KPIs (offres/signés/actifs).
- **Tâches:** centralised relances (à faire / en retard / faites) with quick complete.
- **Paiements:** history by month/method, record payment (auto-allocated to installment).
- **Impayés:** overdue installments by month / days-late, one-click collect — "who hasn't
  repaid which month".
- **Produits:** credit catalogue CRUD (amounts, durations, rates, fees).
- **Demandes:** inbound leads with score; **clickable rows open the full dossier**
  (`/admin/applications/[id]`): requested credit (product from the catalogue), identity,
  contact, employment & income, documents, and a live scoring breakdown. Pipeline workflow
  (incl. `qualified`); convert to client scores the file, carries over KYC documents, logs an
  interaction and opens a relance.
- **Import:** CSV import for clients/loans/payments with preview + history.
- **Paramètres:** admin users (role/active) + data connection info.

## Planned
- Auth module (providers + sessions)
- Billing module (plans + activation)
- Profile module (public + preferences)

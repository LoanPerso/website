# Architecture

## Frontend
- Next.js App Router with route groups: `(public)` and `(admin)`.
- Shared UI in `app/_components`.
- Feature logic in `app/_modules`.
- Data clients and utilities in `app/_lib`.

### Product Pages Architecture
```
app/_components/products/
├── index.ts                    # Exports
├── types.ts                    # TypeScript interfaces
├── ProductPageTemplate.tsx     # Main orchestrator
└── sections/
    ├── ProductHero.tsx         # Hero (variants: default, centered)
    ├── ProductProblem.tsx      # Problem statement (dark/light bg)
    ├── ProductSolution.tsx     # Features (variants: bento, grid, list)
    ├── ProductAudience.tsx     # Target profiles (variants: offset, grid, centered)
    ├── ProductProcess.tsx      # Steps (variants: stepped, timeline, cards)
    └── ProductCTA.tsx          # Final call-to-action

app/[locale]/(public)/products/
├── _config.ts                  # Centralized product configuration
├── _components/                # Listing-specific components
├── page.tsx                    # Products listing page
└── [slug]/page.tsx             # Dynamic product page
```

### Simulator Architecture (Modular Country & Product System)
```
app/_components/tools/AdvancedSimulator/
├── index.tsx                   # Main component & mode toggle
├── types.ts                    # TypeScript types (forms, results, steps)
├── config.ts                   # Default product styling (colors, icons)
├── hooks/
│   └── useSimulatorState.ts    # State machine (uses products/ for calculations)
├── components/
│   └── CountryFlags.tsx        # SVG flag components (FR, BE, CH, ES)
├── parameters/                 # JSON PARAMETERS (easily editable)
│   ├── products/
│   │   ├── micro-credit.json   # Scores, thresholds, rates, limits
│   │   ├── consumer.json
│   │   ├── professional.json
│   │   ├── student.json
│   │   ├── salary-advance.json
│   │   └── leasing.json
│   └── countries/
│       ├── france.json         # Limits, rates, legal info
│       ├── belgium.json
│       ├── switzerland.json
│       └── spain.json
├── countries/                  # TYPESCRIPT LOGIC (imports JSON)
│   ├── index.ts                # Registry & helper functions
│   ├── types.ts                # CountryConfig interface
│   └── configs/
│       ├── france.ts           # Imports france.json
│       ├── belgium.ts
│       ├── switzerland.ts
│       └── spain.ts
├── products/                   # TYPESCRIPT LOGIC (imports JSON)
│   ├── index.ts                # Registry, scoring & calculation functions
│   ├── types.ts                # ProductFullConfig, QuestionConfig, ScoringConfig
│   └── configs/
│       ├── micro-credit.ts     # Imports micro-credit.json + scoring functions
│       ├── consumer.ts
│       ├── professional.ts
│       ├── student.ts
│       ├── salary-advance.ts   # Custom flat-fee calculation
│       └── leasing.ts          # Custom degressive + residual value
└── steps/
    ├── CountrySelectStep.tsx   # Step 0: Country selection (SVG flags)
    ├── CreditTypeCarousel.tsx  # Step 1: Product selection (country-aware)
    ├── AmountDurationStep.tsx  # Step 2: Amount & duration sliders
    ├── SpecificQuestionsStep.tsx # Step 3: Dynamic questions from product config
    └── ResultsStep.tsx         # Step 4: Calculation results
```

**Separation: JSON (parameters) vs TypeScript (logic)**
| JSON Parameters (easily editable) | TypeScript Logic (rarely changed) |
|-----------------------------------|-----------------------------------|
| Scores, weights, thresholds       | Scoring functions (scoreFn)       |
| Rates, fees, limits               | Custom calculations               |
| Age ranges, ratios                | Conditional display (showIf)      |
| Response times                    | Business rules                    |

**Country Selection:**
- Dropdown with ALL countries (170+), searchable
- Configured countries (FR, BE, CH, ES) shown first with "Optimized" badge
- Non-configured countries use default parameters (same flow, generic limits)

**Adding a new configured country:**
1. Create `parameters/countries/[country].json` with limits, rates, legal info
2. Create `countries/configs/[country].ts` importing the JSON
3. Add country code to `CONFIGURED_COUNTRIES` in `countries/all-countries.ts`
4. Import and add to `COUNTRIES` registry in `countries/index.ts`

**Modifying country parameters:**
1. Edit `parameters/countries/[country].json` directly (no code change needed)

**Adding/modifying a product:**
1. Create or edit `parameters/products/[product].json` with scores, thresholds, rates
2. Create or edit `products/configs/[product].ts` importing the JSON
3. Define `questions[]` with types: number, slider, select, boolean, date
4. Define `scoring.factors[]` with fieldId, weight, scoreFn/scoreMap
5. Define `calculation` with interestMethod and optional `customCalculate`
6. Use `countryOverrides` in JSON for country-specific limits (e.g., age max)
7. Use `showIf` in TypeScript for conditional visibility

**Modifying product parameters (without code):**
1. Edit `parameters/products/[product].json` to change:
   - `scoring.baseScore`, `scoring.weights`, `scoring.thresholds`
   - `calculation.rateAdjustments`, `calculation.fees`
   - `questions.[field].min/max`, `questions.[field].scores`
   - `approvalProbability`, `responseTime`

### Translation Structure
```
messages/
├── [locale]/
│   ├── common.json             # Shared translations
│   ├── tools.json              # Simulator translations (step0-4, products, questions)
│   ├── products.json           # Listing page content
│   └── products/
│       ├── micro-credit.json   # Product page content (~70 lines each)
│       ├── consumer.json
│       └── ...
```

## API
- Route handlers under `app/api/*`.

## External Services
- Supabase for dynamic data.
- Firebase for long-term data.
- Optional Three.js for interactive visuals.

## Admin Back Office (`/admin`)
Non-localized, French back office, excluded from the i18n middleware and `noindex`.

```
app/admin/
├── layout.tsx              # AdminAuthProvider + ToastProvider, noindex
├── page.tsx                # redirect -> /admin/dashboard
├── login/page.tsx          # Supabase password auth
└── (protected)/
    ├── layout.tsx          # AdminGuard + AdminShell
    ├── dashboard/          # P&L overview
    ├── clients/[id]        # list (score/KYC/tasks) + detail (scoring, KYC, timeline, tasks, contracts)
    ├── loans/new, loans/[id]
    ├── contracts/          # contract lifecycle (CRM)
    ├── tasks/              # follow-ups / relances (CRM)
    ├── payments/ overdue/ products/ applications/ import/ settings/

app/_lib/admin/             # typed data layer over Supabase (+ RLS)
│   types, format, finance (amortization), scoring (credit-score engine),
│   clients, loans, installments, payments, products, dashboard, applications,
│   import, admin-users, scores, documents, interactions, tasks, contracts
app/_components/admin/      # shell, nav (grouped sections), auth-provider, guard,
│   kpi-card, data-table, bar-chart, status-badge, dialog, form, toast, panel, page-header
├── clients/                # score-gauge, score-panel, documents-panel,
│                           #   interactions-panel, tasks-panel, contracts-panel
└── forms/                  # client-form-dialog, payment-dialog
```

### Client credit scoring
`app/_lib/admin/scoring.ts` is the single source of truth for client-level scoring
(0-100, category A–D, weighted factor breakdown, reason codes, missing-data handling,
staleness, model version). It is distinct from the public loan simulator (loan-level).
`scores.ts` persists each computation as an immutable `client_scores` snapshot and syncs
`clients.credit_score` / `risk_category`. Recompute, manual override (with justification)
and conversion-time scoring all flow through it.

**Data flow:** client components → `app/_lib/admin/*` services → Supabase JS (anon key,
RLS enforced). Aggregates come from reporting views. No new REST routes — access is
direct to Supabase with RLS as the trust boundary. Privileged provisioning is done
server-side via `scripts/*.mjs` using the service role / management token from `.env`.

**Loan creation:** `finance.buildSchedule()` computes the annuity schedule; `loans.createLoan()`
inserts the loan then its installments (rolls back the loan if the schedule insert fails).

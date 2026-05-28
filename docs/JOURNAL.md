# Journal

## 2026-05-28 — Fiche détail Demande + correctif auth
- **Fix (auth):** spinner infini du back office au retour d'onglet. Cause : `loadAdmin` (requête `admin_users`) était `await` **dans** le callback `onAuthStateChange` ; supabase-js tient un verrou interne pendant le callback, la requête attendait `getSession()` sur ce même verrou → deadlock, `loading` bloqué. Correctif `auth-provider.tsx` : appels Supabase différés hors du callback (`setTimeout(0)`), ré-émissions `SIGNED_IN` du même utilisateur ignorées (plus de flash/loader au retour d'onglet).
- **Feature:** fiche détail d'une demande (`/admin/applications/[id]`) — le dossier complet manquait (on ne pouvait pas cliquer une demande).
  - Affiche : crédit demandé (produit issu du catalogue), identité, contact, emploi & revenus, pièces justificatives (liens), et **scoring de pré-évaluation calculé en direct** (jauge + décomposition + reason codes, flag « incomplet » car logement/historique inconnus au stade demande).
  - Workflow de statut + conversion en client depuis la fiche ; lignes de la liste rendues cliquables.
  - Lib : `getApplicationFull`, `computeApplicationScore`, `recomputeApplicationScore` ; type `LoanApplicationFull`.
  - Données : backfill des 6 demandes de démo qui étaient vides (identité, emploi, revenus, pièces) + nationalité/pièce sur toutes ; `seed.sql` (1er bloc) mis à jour pour des dossiers complets. Les 12 demandes ont désormais revenus/naissance/nationalité/pièce.

## 2026-05-28 — CRM clients : scoring & suivi contractuel
- **Feature:** Module CRM côté clients (scoring crédit complet + suivi contractuel) dans le back office `/admin`.
  - **Sidebar groupée:** `nav.ts` passe d'une liste plate à des sections — Tableau de bord (épinglé), **CRM** (Demandes, Clients, Tâches), **Financement** (Crédits, Contrats, Paiements, Impayés), **Catalogue** (Produits), **Système** (Import, Paramètres). Rendu des libellés de section dans `admin-shell.tsx`.
  - **Moteur de scoring (`app/_lib/admin/scoring.ts`):** score client 0-100, catégorie A-D (seuils 80/65/50), décomposition par facteur (historique 25 %, DTI 22 %, stabilité revenus 18 %, reste-à-vivre 12 %, ancienneté 8 %, logement 8 %, âge 7 %), reason codes, gestion des données manquantes (exclusion + renormalisation + flag « incomplet »), staleness (90 j), modèle versionné `v1`. Source de vérité unique, distincte du simulateur (loan-level).
  - **Schéma DB:** `20260528130000_crm_scoring.sql` (colonnes scoring + consentement RGPD sur `clients`, table `client_scores` historisée), `20260528130100_crm_followup.sql` (`contracts`, `client_documents`, `interactions`, `tasks` + lien pipeline `loan_applications.converted_client_id`, étape `qualified`, score), `20260528130200_crm_rls_views.sql` (RLS admin-only + vues `v_client_overview`, `v_tasks_due`).
  - **Couche données:** services `scores`, `documents`, `interactions`, `tasks`, `contracts` ; `clientsApi.listClientOverview` (vue enrichie + filtre catégorie) ; conversion demande→client enrichie (calcul du score, copie des pièces KYC, interaction et tâche de relance créées).
  - **UI (`app/_components/admin/clients/`):** jauge de score, panneau scoring (recalcul + override justifié + historique), checklist KYC, timeline relationnelle, tâches, contrats. Liste clients (colonnes score/KYC/tâches + filtre catégorie), fiche client enrichie, nouvelles pages `tasks` et `contracts`, page `applications` (score + conversion réaliste).
  - **Seed (`supabase/seed.sql`):** bloc CRM idempotent — scores + historique (64), 128 pièces KYC, 64 interactions, 37 tâches (relances/impayés), 48 contrats, 12 demandes couvrant tout le pipeline. Scores calculés en SQL en miroir du moteur TS.
  - **Vérifié:** `tsc --noEmit` OK ; migrations + seed appliqués via la Management API ; distribution des scores cohérente (A 80-96, B 65-79, C 57-63, D 40).
  - **Docs:** DATABASE, ARCHITECTURE, DATA_ARCHITECTURE, FEATURES, SECURITY, CHARTE_GRAPHIQUE, PROJECT_STATUS, features/DASHBOARD, PLAN mis à jour.

## 2026-05-28
- **Feature:** Back office d'administration complet (`/admin`) pour piloter l'activité de prêt.
  - **Provisioning Supabase:** création du projet `quickfund` (région `eu-central-1`) via la Management API + token stocké dans `.env`. `.env` câblé (URL, anon, service_role). Politique secrets ajoutée dans `CLAUDE.md` §12.
  - **Schéma DB (`supabase/migrations/`):**
    - `20260528120000_core_schema.sql` — tables `admin_users`, `products`, `clients`, `loans`, `installments`, `payments`, `loan_applications`, `import_batches`, `activity_log` + triggers (`updated_at`, références `CLI-/LN-/PAY-`) + index. Helper `is_admin()` (security definer).
    - `20260528120100_rls_policies.sql` — RLS : accès réservé aux admins actifs ; insertion publique pour `loan_applications` (funnel).
    - `20260528120200_reporting_views.sql` — vues `v_portfolio_kpis`, `v_loan_balances`, `v_installments_status`, `v_monthly_disbursements`, `v_monthly_collections` (`security_invoker`).
  - **Seed (`supabase/seed.sql`):** 8 produits réels (pricing PRICING.md) + jeu de données procédural (32 clients, 48 crédits, ~770 échéances, ~220 paiements, impayés + défauts, 14 mois d'historique).
  - **Auth admin:** page `/admin/login` (Supabase password), `AdminAuthProvider` + `AdminGuard` (vérif `admin_users`), routage `/admin` exclu du middleware i18n. Ancien scaffold `(admin)` supprimé.
  - **Couche données (`app/_lib/admin/`):** services typés clients, loans (génération d'échéancier annuité), installments, payments (ré-allocation + recompute statut prêt), products, dashboard (KPIs), applications, import CSV.
  - **UI (`app/_components/admin/`):** shell/sidebar responsive, KPI card, data table, bar chart SVG, badges de statut, dialog (Radix), contrôles de formulaire, toasts.
  - **Pages (`app/admin/(protected)/`):** dashboard P&L, clients (liste + fiche), crédits (liste + création avec aperçu d'échéancier + fiche), paiements, impayés (par mois), produits, demandes, import, paramètres.
  - **Scripts:** `scripts/db-apply.mjs` (applique migrations+seed via Management API), `scripts/create-admin.mjs` (crée un admin Auth + ligne `admin_users`).
  - **Compte admin:** `lynxerprv@gmail.com` (superadmin) créé pour la connexion.
  - **Docs:** mise à jour DATABASE, SECURITY, ARCHITECTURE, FEATURES, DATA_ARCHITECTURE, CHARTE_GRAPHIQUE, PROJECT_STATUS, features/DASHBOARD, PLAN.

## 2026-01-02
- **Enhancement:** Country-Specific Form Options System
  - **Problem:** Employment status options like "CDI/CDD" are France-specific and don't exist in other countries (e.g., Estonia uses "Permanent/Temporary")
  - **Solution:** Implemented country-specific options that are separate from language translations
  - **New JSON structure:** Each country config now has an `options` section:
    ```json
    "options": {
      "employmentStatus": ["cdi", "cdd", "freelance", ...],  // FR
      "employmentStatus": ["permanent", "temporary", ...],   // Default
      "employmentStatus": ["indefinido", "temporal", ...],   // ES
    }
    ```
  - **Dynamic option filtering:** `getProductQuestions()` in `products/index.ts` now filters options based on country config
  - **Translation keys:** Changed from product-specific keys (`simulator.advanced.employment.cdi`) to generic option keys (`simulator.advanced.options.employmentStatus.cdi`)
  - **Categories supported:** `employmentStatus`, `contractType`, `businessType`, `sector`, `businessNeed`, `loanPurpose`, `institutionType`, `studyLevel`, `assetType`, `clientType`
  - **Files modified:**
    - `parameters/countries/*.json` - Added `options` section to all 5 country files
    - `countries/types.ts` - Added `CountryOptions` interface
    - `countries/configs/*.ts` - Import options from JSON
    - `products/index.ts` - Added `QUESTION_TO_OPTIONS_CATEGORY` mapping and filtering logic
    - `products/configs/*.ts` - Updated all 6 product configs with new translation keys
    - `messages/fr/tools.json`, `messages/en/tools.json` - Added `simulator.advanced.options.*` translations
  - **Type fix:** Renamed `isBusinessClient` to `clientType` in leasing config for consistency

- **Enhancement:** Country Selector Refactoring
  - **Changed:** Country selection from 4-card grid to searchable dropdown
  - **All countries:** 170+ countries available in dropdown
  - **Configured countries:** FR, BE, CH, ES shown first with "Optimized" badge
  - **Non-configured countries:** Use default parameters (same flow, generic limits)
  - **Search:** Filter by country name (FR/EN) or ISO code
  - **Files created:**
    - `countries/all-countries.ts` - Complete list of 170+ countries with FR/EN names
    - `countries/configs/default.ts` - Default config for non-configured countries
    - `parameters/countries/default.json` - Default parameters
  - **Files modified:**
    - `steps/CountrySelectStep.tsx` - Rewritten as searchable dropdown
    - `countries/types.ts` - CountryCode now accepts any string
    - `countries/index.ts` - Added `isConfiguredCountry()` and updated `getCountryConfig()`
  - **Translations added:** `selectCountry`, `searchCountry`, `noCountryFound`, `optimized`

- **Fix:** Consumer credit loanPurpose now required (was optional)

- **Enhancement:** Simulator Parameters Separation (JSON vs TypeScript)
  - **Problem:** All parameters (scores, thresholds, rates) were hard-coded in TypeScript, making modifications difficult for non-developers
  - **Solution:** Separated editable parameters (JSON) from business logic (TypeScript)
  - **New structure:** `parameters/` directory with JSON files
    - `parameters/products/*.json` - 6 product parameter files
    - `parameters/countries/*.json` - 4 country parameter files
  - **JSON parameters (easily editable without code):**
    - Scoring: `baseScore`, `weights`, `thresholds`, `ageRanges`, `ratioRanges`
    - Calculation: `rateAdjustments`, `fees`, `residualValuePercent`
    - Questions: `min`, `max`, `step`, `scores`, `countryOverrides`
    - Other: `approvalProbability`, `responseTime`, `icon`, `color`
  - **TypeScript logic (rarely changed):**
    - Scoring functions (`scoreFn`) with business rules
    - Custom calculations (`customCalculate`) for flat/degressive methods
    - Conditional display (`showIf`) for dynamic questions
  - **Files created:**
    - `parameters/products/micro-credit.json`, `consumer.json`, `professional.json`, `student.json`, `salary-advance.json`, `leasing.json`
    - `parameters/countries/france.json`, `belgium.json`, `switzerland.json`, `spain.json`
  - **Files refactored:**
    - `products/configs/*.ts` - Now import from JSON and expose typed configs
    - `countries/configs/*.ts` - Now import from JSON and expose typed configs
  - **Documentation:** Updated ARCHITECTURE.md with new structure and modification guides

## 2026-01-01
- **Enhancement:** Simulator Modular Product Configuration System
  - **Product configs:** Created `products/` module with full configuration per product:
    - `ProductFullConfig` interface: questions, scoring, calculation, response time
    - `QuestionConfig` with types: number, slider, select, boolean, date
    - `ScoringConfig` with weighted factors and threshold-based risk categories
    - `CalculationConfig` with compound/flat/degressive methods + custom functions
  - **6 product configs:** micro-credit, consumer, professional, student, salary-advance, leasing
    - Each with unique questions (age, employment, institution type, etc.)
    - Each with unique scoring logic (weighted factors, score maps, custom functions)
    - Country overrides for questions (e.g., student max age: FR=30, BE=35, CH=28)
    - Conditional questions with `showIf` (e.g., income only if hasPartTimeJob)
    - Custom calculations (salary-advance: flat fee, leasing: residual value)
  - **Dynamic SpecificQuestionsStep:** Refactored from 784 lines of hard-coded components to 380 lines
    - Renders questions dynamically from product config
    - Reusable renderers: NumberQuestion, SliderQuestion, SelectQuestion, BooleanQuestion, DateQuestion
  - **useSimulatorState:** Simplified to use `calculateLoanResult` from products module
  - **Files created:**
    - `products/types.ts` - TypeScript interfaces
    - `products/configs/*.ts` - 6 product configurations
    - `products/index.ts` - Registry + helper functions (getVisibleQuestions, calculateRiskScore, calculateLoanResult)

- **Enhancement:** Simulator Modular Country System
  - **Country-first flow:** Simulator now asks country selection as first step
  - **Modular configs per country:** `countries/configs/[country].ts` with:
    - Age requirements (min/max, student max, salary advance min)
    - Product-specific limits (amount, duration, rates) per country
    - Currency formatting and locale settings
    - Legal info (regulatory body, cooling-off period, usury rate)
  - **SVG flags:** Replaced emoji flags with clean SVG components (`CountryFlags.tsx`)
    - Consistent rendering across all browsers/OS
    - France, Belgium, Switzerland, Spain supported
  - **CreditTypeCarousel:** Now uses country config for product limits
    - Shows only available products per country
    - Amounts/durations respect country-specific limits
    - Currency formatting uses country locale
  - **Typography:** Added `tabular-nums` to all numeric displays for proper alignment
  - **Translations:** Added step 0 (country) translations in FR/EN

- **Feature:** Advanced Credit Simulator (`/tools/simulator`)
  - Created `AdvancedSimulator` component with interactive carousel and multi-step flow
  - **Carrousel interactif** for credit type selection with GSAP animations
  - **4-step progressive flow:** Type > Amount/Duration > Profile Questions > Results
  - **Type-specific questions:**
    - **Student:** Age, institution type, field, study level, part-time job, guarantor
    - **Professional:** Business type, sector, years, revenue, financing purpose
    - **Consumer/Micro-credit:** Age, employment status, loan purpose
    - **Salary Advance:** Contract type, net salary, next payday
    - **Leasing:** Asset type, individual/business status
  - **Risk-based estimation:** Calculates risk category (A-D) and approval probability
  - **Mode toggle:** Simple (widget) vs Personalized (advanced) simulation
  - **Files created:**
    - `app/_components/tools/AdvancedSimulator/` (types, config, hooks, steps)
    - Updated `messages/[locale]/tools.json` with 150+ new translation keys
  - **UI/UX:** Fluid GSAP transitions, progress indicator, animated results

- **Previous:** Credit Simulator (`/tools/simulator`)
  - Created `SimulatorWidget` component with full calculations
  - 6 products supported: micro-credit, consumer, professional, student, salary-advance, leasing
  - Interactive sliders for amount and duration (adjusted per product)
  - Real-time calculation: monthly payment, total cost, interest, TAEG range
  - Pricing based on business docs (PRODUCTS.md, PRICING.md)
  - FAQ section with accordion
  - Full translations EN/FR (`messages/[locale]/tools.json`)
  - GSAP animations for smooth UX

## 2025-12-31
- **Content:** Complete Product Page Translations (EN + FR)
  - Created detailed content for all 7 remaining products:
    - `consumer.json` - Crédit Conso (500€-5000€, transparent, flexible)
    - `professional.json` - Crédit Pro (1000€-10000€, revenus variables acceptés)
    - `student.json` - Prêt Étudiant (500€-5000€, sans garant, différé possible)
    - `salary-advance.json` - Avance sur Salaire (éviter le découvert)
    - `leasing.json` - Leasing (taux avantageux, option d'achat)
    - `loan-consolidation.json` - Rachat de Crédits (une seule mensualité)
    - `financial-coaching.json` - Coaching Financier (gratuit avec crédit)
  - Each file contains: hero, stats, problem (where applicable), solution (8 features), audience (4 profiles), process (3 steps), finalCta
  - Aligned with Quickfund business philosophy: transparency, speed, atypical profiles, coaching included
  - Total: 14 new translation files (7 FR + 7 EN)

- **Feature:** Product Page Template System
  - Created modular template architecture for product pages (`app/_components/products/`)
  - Implemented 6 reusable section components: `ProductHero`, `ProductProblem`, `ProductSolution`, `ProductAudience`, `ProductProcess`, `ProductCTA`
  - Each section supports multiple variants (bento/grid/list, offset/grid/centered, stepped/timeline/cards)
  - Added GSAP ScrollTrigger animations for all sections
  - Created dynamic `[slug]` page routing with centralized config (`_config.ts`)
- **Refactor:** Translation Structure
  - Moved product-specific translations to separate JSON files (`messages/[locale]/products/[slug].json`)
  - Updated i18n config to load product namespaces dynamically
  - Kept `products.json` for listing page info only
- **Fix:** Footer text color issue (added `!text-white` to override parent styles)
- **Enhancement:** Bento grid layout for "Notre Approche" section with responsive col-span patterns

## 2025-12-20
- **New Feature:** Added "Interactive Service List" (`FeatureReveal`) section.
  - Implemented a hover-reveal effect where images float and follow the cursor.
  - Added cinematic focus effect (blurring inactive items).
  - Optimized for mobile (fallback to standard list).
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

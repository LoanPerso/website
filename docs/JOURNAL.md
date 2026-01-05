# Journal

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

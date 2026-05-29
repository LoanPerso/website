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
- **UI design system v2 (2026-05-28):** grayscale "Stripe/Linear" tool aesthetic — flat cards, hairline borders, dot badges, unified radius, overlay-only shadows; brand gold reserved for the logo / "Admin" pill. Scoped to `.admin-theme`; public site keeps "Minimal Luxury".
- **Dark mode (admin-only, 2026-05-28):** sun/moon toggle in the sidebar, follows the OS, stored, anti-FOUC; scoped to `/admin` routes so the public site stays light. Dark tokens in `.dark .admin-theme`.
- `/admin` back office: auth (Supabase + `admin_users`), dashboard P&L, clients, loans
  (with amortization schedule), payments, overdue tracking, products, applications, CSV import, settings.
- Typed data layer (`app/_lib/admin`), reusable admin UI components, French UI.
- Typecheck passes (`tsc --noEmit`).

## Origination de bout en bout, servicing & recouvrement ✅ (2026-05-28)
- **Funnel connecté :** demande qualifiée → contrat réel → signature → crédit + échéancier →
  déblocage → encaissement → recouvrement → solde anticipé / restructuration / perte. Fin des
  cul-de-sacs : tout persiste en base et est tracé (`activity_log`, acteur).
- **Nouvelles couches lib :** `origination`, `servicing`, `collections`, `audit`.
- **Nouvelles pages détail à onglets :** `contracts/[id]`, `products/[id]` ; **refonte servicing**
  de `loans/[id]` ; **Recouvrement** (`overdue`) à 2 vues (dossiers/échéances) ; **Paiements**
  enrichis (statut, rapprochement, remboursement/rejet).
- **Schéma :** migration `20260528150000_servicing_collections.sql` (`installments.late_fee` ;
  `loans` clôture/perte/dunning ; vue `v_loan_arrears`) appliquée.
- Typecheck **vert sur tout le projet** (`tsc --noEmit`, EXIT 0).

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

## Dossier Demande — origination & suivi "qualité bancaire" ✅ (2026-05-28)
- `/admin/applications/[id]` devient un poste d'instruction LOS à 8 onglets : Vue d'ensemble,
  Analyse financière, Fraude & AML, Décision, Tarification, Contrat, Communications, Tâches.
- Moteurs dérivés déterministes (`app/_lib/admin/application/`, seedés par id = "smoke db",
  aucune donnée réelle requise) : affordabilité (DTI/DSTI, reste à vivre, budget, engagements,
  open-banking, stress test), tarification (TAEG par IRR, assurance, usure, contre-offre),
  fraude/KYC/AML (isikukood, vélocité cross-dossiers, screening PEP/sanctions), décision
  (knockouts, octroi APPROVE/REFER/DECLINE, conditions, délégation, SLA), communications
  (NBA, consentement, modèles, doublons), contrat (FIPEN/SECCI, pack, aperçu).
- Persistance des choix analystes via migration additive `20260528140000_application_workflow.sql`
  (workflow/décision/consentement/offre sur `loan_applications`) + `interactions`/`tasks`
  par `application_id`. Édition complète de la demande, recontact, planification, génération d'offre.
- Vérifié : typecheck propre, route 200, chemin RLS lecture/écriture testé, 6 moteurs OK sur 12 demandes.

## Messagerie — boîte mail de la société ✅ (2026-05-28)
- `/admin/mail` : client mail 3 panneaux (comptes + dossiers · liste · lecteur) — gestion de
  plusieurs boîtes, mails entrants/sortants, composer/répondre/transférer, pièces jointes,
  fils reliés au CRM (client/demande), **tests de connexion SMTP/IMAP** + historique, synchro.
- **Maquette adossée à la base** (pas de SMTP/IMAP réel, aucune route/service-role/chiffrement) :
  migration `20260528160000_mailbox.sql` (`mail_accounts`/`folders`/`messages`/`attachments`/`diagnostics`,
  RLS admin-only). Couche `app/_lib/admin/mail/` via client navigateur + RLS. Identifiants
  write-only (jamais relus). Schéma prêt pour un branchement SMTP/IMAP réel.
- Vérifié : typecheck propre ; migration + seed appliqués (HTTP 201) ; 1 compte / 4 dossiers /
  8 messages / 4 diagnostics seedés ; RLS active sur les 5 tables.
- **v2 (no-modal + plein écran) :** client mail **plein écran** (sans `PageHeader`, panneaux sans
  cartes) ; **zéro modal** — composer en **panneau inline**, gestion des comptes sur une **page**
  `/admin/mail/accounts`, suppression confirmée inline. Acte la **règle CLAUDE.md no-modal** (page
  dédiée ou panneau inline). Identifiants du compte admin rotationnés (Auth Admin API).
- **v3 (bac à sable refondu) :** `/admin/mail/simulate` devient un **miroir 2 panneaux fidèle** du
  webmail (liste de conversations + lecteur en cartes à **corps complets** + composer de réponse ancré ;
  **« Nouveau mail »** = composer inline d'un entrant). Découpage par feature (`_components/admin/mail/simulate/`),
  lib `listMessagesFullByIds`, responsive mono-panneau mobile. Typecheck vert.

## Immediate Focus
- **Prod DB prête (2026-05-29) :** `quickfundProd` (ref `aqwenqsxdubyhhjkfekh`, eu-central-1) provisionnée
  **schéma-only (vierge)** ; préprod renommée `quickfundPreprod`. Reste : câbler `SUPABASE_PROD_*` dans
  l'env runtime de Netlify (`NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) et confirmer `/admin` en prod.
- Replace demo + CRM smoke data with real imported data.
- Consider cookie-based SSR session (`@supabase/ssr`) and audit-log population.
- Build eligibility test (`/tools/eligibility`); verify mobile responsiveness.
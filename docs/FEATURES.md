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
- **Origination de bout en bout:** une demande qualifiée → **génère un vrai contrat** (offre,
  termes figés) → signature (mode + délai de rétractation) → **génère le crédit** + échéancier
  → **déblocage des fonds**. Plus aucun cul-de-sac : chaque étape persiste en base et est tracée.
- **Crédits:** list (filter status/product), create with live amortization schedule, **detail
  dossier à onglets** (Synthèse · Échéancier · Paiements · **Gestion** · Chronologie) avec
  servicing réel : **déblocage**, **solde anticipé** (décompte + indemnité), **restructuration**
  (ré-amortissement du capital restant), **mise en défaut / réactivation**, **passage en perte**,
  per-installment collection, suppression.
- **Contrats:** suivi contractuel — list/filter + **page détail à onglets** (Synthèse · Termes &
  offre figés + pack SECCI/FIPEN · Signature & rétractation · Crédit lié · Chronologie) ;
  transitions réelles (envoyer l'offre, signer, expirer, annuler), **génération du crédit** et
  **déblocage** depuis le contrat.
- **Tâches:** centralised relances (à faire / en retard / faites) with quick complete.
- **Paiements:** history by month/method/**statut**, record payment (auto-allocated to
  installment), colonnes **Rapproché/Statut**, actions **rembourser/rejeter** (recalcul de
  l'échéance + du statut du crédit), KPIs encaissé/non rapprochés/remboursés.
- **Recouvrement (Impayés):** deux vues — **par dossier** (`v_loan_arrears` : niveau de relance,
  arriéré, retard max, prochaine action) avec modale de recouvrement (**relance graduée**,
  **pénalité de retard**, **promesse de paiement**, **mise en défaut**) et **par échéance**
  (encaissement direct). "Qui n'a pas remboursé, de combien, et quelle est la prochaine action".
- **Produits:** credit catalogue CRUD + **page détail** : empreinte portefeuille (crédits émis/
  actifs, capital, encours, taux moyen), **grille tarifaire par catégorie de risque** (A→D) et
  règles d'éligibilité.
- **Demandes:** inbound leads with score; **clickable rows open the banking-grade dossier**
  (`/admin/applications/[id]`) — a loan-origination workstation with 8 tabs and a workflow bar
  (status / priority / assignee / SLA / score):
  - *Vue d'ensemble:* KPI row + score gauge + financial/fraud/decision verdict cards + key info & docs.
  - *Analyse financière:* DTI/DSTI, FOIR, reste à vivre, budget reconstruction, existing
    commitments (+ consolidation), open-banking flows, income stability, stress test, alerts, verdict.
  - *Fraude & AML:* KYC/document/fraud/AML/SoF checks, PEP/sanctions screening, velocity &
    identity cluster, composite risk score, disposition (clear/review/escalate/block) + SAR.
  - *Décision:* knockouts, referral triggers, auto-decision APPROVE/REFER/DECLINE, conditions
    (stipulations), counter-offer, delegated authority, reason codes, approve/refer/decline actions.
  - *Tarification:* what-if simulator (amount/duration/rate/insurance/guarantee), rate build-up,
    APR (TAEG), usury-cap check, fees & insurance, amortization preview, lock offer.
  - *Contrat:* adapted FIPEN/SECCI offer preview + document pack; **"Générer le contrat"** crée un
    vrai contrat depuis l'offre verrouillée et ouvre le dossier contractuel (détecte un contrat déjà généré).
  - *Communications:* omnichannel recontact (call/email/SMS/WhatsApp), templates, next-best-action,
    consent & quiet-hours, duplicate detection, unified timeline, scheduled callbacks.
  - *Tâches:* per-application relances/KYC tasks.
  - Full inline editing of every application field; convert to client (scores, carries KYC, relance).
  - Heavy analytics are deterministically derived (mock "smoke db", stable per dossier); analyst
    decisions/consent/offer persist on the application + `interactions`/`tasks`.
- **Import:** CSV import for clients/loans/payments with preview + history.
- **Messagerie:** company inbox (`/admin/mail`) — a **full-screen** 3-pane mail client (accounts +
  folders · message list · reader/compose), no page header. Multiple boxes/addresses, incoming/outgoing
  mail, **compose / reply / reply-all / forward** (direction-aware recipients) as an **inline pane** (no
  modal), a **conversation thread** in the reader (all messages of a thread, across folders),
  **move-to-folder** & **mark-unread**, attachments, simulated sync.
  **CRM linking:** from the reader, associate a message to a **client** and/or **application** and change
  the application's **status** (with same-email suggestions). Account management is a dedicated
  **full-screen** page **`/admin/mail/accounts`** (master-detail: narrow sticky account list + scrolling
  form; box CRUD + **SMTP/IMAP smoke tests** + diagnostics history). **DB-backed mockup** (no real
  SMTP/IMAP; credentials write-only) — schema ready to wire to real servers later. The reader's CRM
  panel is **toggleable** from its header; a sent mail starts a conversation thread. Simulating the
  correspondent's reply lives **only in the sandbox** below (kept out of the production-style reader).
  The discreet sandbox **`/admin/mail/simulate`** is a **faithful 2-pane mirror** of the live client
  (conversation list + stacked-card reader with **full message bodies**): browse threads and **reply as
  the correspondent** from a docked composer to build a two-sided exchange, or **"Nouveau mail"** to
  inject a fresh incoming conversation. Single-pane on mobile, no modal.
- **Paramètres:** admin users (role/active) + data connection info.
- **Thème clair / sombre:** toggle (soleil/lune) dans la sidebar (+ top bar mobile), suit la préférence système, choix mémorisé (localStorage), sans flash au chargement. Limité au back office (`/admin`) — le site public reste clair pour l'instant.

## Planned
- Auth module (providers + sessions)
- Billing module (plans + activation)
- Profile module (public + preferences)

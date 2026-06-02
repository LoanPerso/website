# Decisions

Record architectural and product decisions here.

## 2026-05-30 — Prod : données business smoke migrées depuis la préprod (hors users & mails)
- **Décision :** copier en **prod** l'intégralité des données métier de la préprod — `clients` (1 367), `loan_applications` (220), `loans` (1 987), `installments` (47 688), `payments` (23 779), `ledger_entries` (38) — en **excluant** les users (`admin_users`) et la messagerie (`mail_*`). **Inverse sciemment** la clause « aucune donnée métier de démo en prod » / « ne jamais copier les données de démo » des décisions du 2026-05-29 et du 2026-05-30 (smoke).
- **Pourquoi :** demande explicite de l'utilisateur — disposer d'une prod **peuplée et crédible** (dashboard, finance, statistiques, recouvrement) sans relancer une génération côté prod. Même esprit que l'exception « messagerie smoke en prod ».
- **Nature des données — IMPORTANT :** il s'agit du **jeu smoke calibré** (fictif, généré par `generate-smoke.mjs`), **pas de vraies données client**. Les tables métier de la prod ne distinguent plus le réel du fictif → **wiper ce smoke avant toute exploitation réelle**. (Aucune donnée personnelle réelle, mais ne pas confondre avec un vrai portefeuille.)
- **Mise en œuvre :** prérequis **schéma** d'abord (prod en retard de 5 migrations 2026-05-30 → `ledger_entries`, vues P&L/`v_stats_*`, fonctions `rpc_stats_*`/cache KPI, fix `set_reference`), appliqué via `db-apply.mjs` ciblé prod. Puis `scripts/migrate-preprod-to-prod.mjs` : service role, lecture paginée / insertion chunkée, **ordre FK** (clients → applications → loans → installments → payments → ledger), **UUID & références préservés** (FK inter-tables valides ; produits aux **UUID identiques** → pas de remapping ; FK `auth.users` toutes nulles → aucun user requis). Garde-fous : refus si source = cible ou si la prod est déjà peuplée (hors `--force`), URL cible vérifiée contre le ref prod.
- **Post & vérif :** séquences `client/loan/payment_ref_seq` réalignées au max migré (1367/1987/23779) pour éviter les collisions ; `refresh_portfolio_kpis()`. Contrôles : `src=dst` sur les 6 tables, **0 orphelin FK**, **KPIs & P&L prod identiques à la préprod** (encours 591 372 €, CA 109 238 €, bénéfice affiché 70 624 €/64,7 %, bad debts 40 174 €), exclusions intactes (`admin_users` 1, `products` 8, mailbox 7/44).
- **Conséquence :** la prod sert désormais un portefeuille fictif complet ; le fix `set_reference` (no-truncate) couvre les > 9 999 lignes (payments à 23 779). Pour repartir « propre » : truncate des tables métier + reset séquences (cf. ordre du wipe dans `generate-smoke.mjs`).

## 2026-05-30 — Finance/P&L : revenus prêt dérivés, comptabilité hors-prêt en ledger
- **Décision :** le compte de résultat est **bi-source**. Les revenus de prêt (intérêts, frais de dossier, pénalités) sont **dérivés** des tables portefeuille (`installments`/`loans`) par les vues `v_pnl_*` ; seuls les éléments que le portefeuille **ne peut pas connaître** (revenu **coaching**, **dépenses** : serveurs, management loans, rebranding) sont saisis dans `ledger_entries`. On ne double-compte pas : le P&L **unit** dérivé + ledger.
- **Pourquoi :** l'outil est un moteur de *loan servicing*, pas un logiciel comptable. Mettre les revenus de prêt en saisie manuelle créerait une source de vérité concurrente du portefeuille. Le brief consolidé (CA, dépenses, marges) devient reproductible sans plan comptable complet.
- **Bad debts / encours :** les prêts **written-off** (`closure_reason='written_off'`, `write_off_amount`) sont reconnus en **perte au P&L** (`v_pnl_monthly.bad_debts`) **mais restent comptés dans l'encours** par `v_portfolio_kpis` (vue existante, statut `defaulted`, **non modifiée** ici). Conséquence assumée : l'« encours » du dashboard inclut le principal des créances passées en perte ; la réconciliation stricte du brief (encours = financé − remboursé − bad debts) n'est donc pas exacte au centime. Hors périmètre de cette tâche de réécrire la sémantique de la vue KPI.
- **Échelle :** cache KPI (`kpis_cache` + `get_portfolio_kpis`) car la vue brute coûte ~1,7 s à ~1,4k clients ; pagination obligatoire sur recouvrement/impayés (sinon déversement non virtualisé → blocage) ; index composites pour les agrégations latérales ; `count:estimated` sur `v_client_overview`.
- **Bug `set_reference` :** `lpad(n,4)` **tronquait** au-delà de 9999 → collisions de référence cassant tout insert d'entité > 9 999 lignes en prod. Corrigé (padding sans troncature) — révélé par le smoke. À surveiller : les séquences de prod si une entité approche 9 999.

## 2026-05-30 — Smoke préprod régénérée et calibrée sur le brief (jamais la prod)
- **Décision :** régénérer le jeu de démo **préprod** à l'échelle réelle (**1 367 clients**) calibré sur les chiffres du brief 2024-2025, via `scripts/generate-smoke.mjs --wipe`. La **prod n'est jamais touchée** (garde anti-ref prod dans le script).
- **Pourquoi :** répondre à la question « l'outil tient-il en usage à X clients ? » avec des données réalistes, et remplacer le suivi Excel par une masse manipulable dans l'outil.
- **Mise en œuvre :** wipe ordonné (garde `admin_users`+`products`, reset séquences) ; génération déterministe (PRNG seedé) ; mise à l'échelle des principaux pour caler encours = 591 529 € et bad debts = 40 328 € ; ledger pour coaching/dépenses. Agrégats vérifiés depuis les vues live (P&L à < 0,2 % du brief).

## 2026-05-30 — Prod : messagerie smoke peuplée (exception assumée au « pas de mails démo »)
- **Décision :** peupler la messagerie de **prod** avec des données smoke — **7 comptes business** (`contact@quickfund.ee`, `support`/`recouvrement`/`comptabilite@quickfund.fr`, `commercial`/`partenariats@quickfund.eu`, `direction@quickfund.ee`) et **27 conversations** (39 messages, 6 pièces jointes). Cela **inverse sciemment** la clause « mails » de la décision du 2026-05-29 (« aucune donnée de démo en prod »).
- **Pourquoi :** la messagerie est un **mockup adossé à la base** (aucun SMTP/IMAP réel) — ses données sont fictives par nature. Les peupler rend le back-office live crédible pour démos/captures, sans toucher aux **vraies** données métier. Les **enregistrements métier réels restent vides** en prod (clients/crédits/paiements = 0).
- **Mise en œuvre :** seed versionné **idempotent** `supabase/seed_mailbox.sql` (comptes via `on conflict`, dossiers via `unique(account_id,path)`, conversations gardées par le marqueur `thread_key like 'smk-%'`), appliqué **à la prod uniquement** via l'API Management. Les 4 dossiers standards (+ Archive/Indésirables pour `contact`/`support`) créés — le `createAccount` de l'UI ne les génère pas.
- **Conséquence :** la préprod garde son propre jeu mail ; pour aligner la préprod, appliquer le même fichier. IMAP/SMTP restent en clair (mockup, colonnes `*_password` jamais lues côté client).

## 2026-05-29 — Supabase : environnements préprod + prod séparés
- **Décision :** deux projets Supabase distincts dans la même org — **préprod** (`quickfundPreprod`, ref `vysqrahewfxamwxabhnh`, l'historique) et **prod** (`quickfundProd`, ref `aqwenqsxdubyhhjkfekh`), tous deux `eu-central-1`, plan gratuit (le plan est au niveau org chez Supabase).
- **Prod = schéma + données minimales réelles :** les 9 migrations `supabase/migrations/` (RLS 19/19), **sans le bloc démo de `seed.sql`**. Amorcée le 2026-05-30 avec le **compte admin** `fkvirtuel@gmail.com` (superadmin) et le **catalogue produits** (8 produits, identiques à la préprod / la landing). **Aucune donnée métier de démo** (clients/crédits/paiements/mails).
- **Pourquoi :** isoler les vraies données de prod du bac de préprod ; promouvoir le schéma sans jamais copier les données de démo.
- **Mise en œuvre :** création + migrations via l'API Management ; clés prod dans `.env` sous `SUPABASE_PROD_*` (jamais commitées). Renommage de la préprod purement cosmétique (ref/URL/clés inchangés) → l'app locale continue de pointer la préprod.
- **Conséquence :** sur l'hôte de prod (Netlify), mapper `SUPABASE_PROD_URL` → `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_PROD_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (+ `NEXT_PUBLIC_SITE_URL`). L'app **ne lit pas** `service_role` au runtime (auth admin = anon + RLS) — il reste **local** (CLI/admin, ex. `create-admin.mjs`).

## 2026-05-28 — Origination/servicing : persistance réelle, analytics dérivées
- **Décision :** le **cycle de vie du crédit** (demande → contrat → crédit → déblocage →
  encaissement → recouvrement → clôture) est **entièrement persisté** en base et tracé
  (`activity_log`). Les **analyses lourdes** du dossier demande (financière, fraude, tarification)
  restent **dérivées/déterministes** (la "smoke db"). On ne mélange pas les deux : ce qui engage
  juridiquement/comptablement est réel ; ce qui aide à décider peut rester calculé.
- **Snapshot de termes :** à l'origination, les conditions de l'offre sont **figées** dans
  `contracts.terms` (`ContractTermsSnapshot`). Le contrat signé garde une trace immuable même si
  le produit/la tarification évoluent ensuite. Le lien demande→contrat est porté par
  `terms->>source_application_id` (pas de FK dédiée, additif).
- **Crédit créé `draft`, non débloqué :** `createLoan` ne pose plus `disbursed_at` pour un
  `draft`. Le **déblocage est une action explicite** (`disburseLoan`) — sépare "crédit accordé/
  contractualisé" de "fonds versés".
- **Solde anticipé :** décompte = capital restant (`v_loan_balances`) + intérêts **échus**
  impayés + pénalités + **indemnité plafonnée à 1 %** (crédit conso UE). Au règlement, les
  échéances **échues** passent `paid` (intérêts acquis) et les **futures** `waived` (intérêts non
  perçus) → l'`interest_earned` du reporting reste honnête.
- **Restructuration :** on **ré-amortit le capital restant** en remplaçant la queue d'échéances
  impayées (les payées sont conservées, la séquence reprend après la dernière) ; mensualité/
  intérêts/fin recalculés. Choix d'un modèle simple et lisible pour un outil admin.
- **Pénalités de retard :** portées par `installments.late_fee`, **séparées** de `amount_due` —
  l'échéancier contractuel reste intact pendant que l'arriéré peut porter des frais.

## 2026-05-28 — Dark mode : admin d'abord, public différé
- **Décision :** le mode sombre est livré **uniquement pour le back office `/admin`**. Le site
  public reste clair pour l'instant.
- **Pourquoi :** le public est une landing "luxury" avec ~300 couleurs de charte en dur, 12
  utilitaires `dark:` épars et 23 sections déjà cinématiques — un dark mode propre y demande une
  passe section par section. L'admin, lui, est 100 % piloté par tokens → dark propre et immédiat.
- **Mise en œuvre :** classe `dark` sur `<html>` posée par un script anti-FOUC + un `ThemeProvider`
  (light/dark/système, `localStorage`), **gatés sur le préfixe `/admin`** pour que le public ne
  reçoive jamais la classe (sinon ses `dark:` s'activeraient). Tokens dark dans `.dark .admin-theme` ;
  le `.dark` global "luxury" est désactivé en attendant la passe publique.
- **Évolution :** la passe publique réintroduira un dark mode "Minimal Luxury" section par section
  et retirera le gate `/admin`.

## 2026-05-28 — Admin UI : grayscale "Linear", or réservé au branding
- **Décision :** le back office `/admin` adopte un design "outil" épuré (Stripe/Linear) en
  niveaux de gris quasi total. La palette de marque est conservée mais l'or champagne ne sert
  plus que de signature (logo + pastille "Admin") via le token `--brand-gold` ; l'accent
  fonctionnel et les liens passent en slate/encre.
- **Pourquoi :** le rendu précédent était jugé "pateux" — or réinjecté sur canvas gris,
  multiplication d'aplats teintés (~56), radius (`xl`/`full`) et ombres (`shadow-soft`)
  hétérogènes. Un système neutre, dense et cohérent sert mieux un outil de travail data-dense.
- **Mise en œuvre :** neutralisation **par token** dans `.admin-theme` (3 variables reteignent
  tout le sous-arbre, sans éditer les fichiers consommateurs), primitives partagées flat +
  badges "dot", règle **chrome** (grayscale) vs **data sémantique** (couleur fonctionnelle
  conservée). Une seule échelle de radius ; ombres réservées aux overlays (`shadow-overlay`).
- **Portée :** scoping `.admin-theme` uniquement — le site public garde intégralement la charte
  "Minimal Luxury" (or champagne, serif, ombres `soft`/`crisp`).

## 2026-05-28 — Analyses du dossier Demande : dérivées (mock) plutôt que persistées
- **Décision :** les analyses lourdes du dossier `/admin/applications/[id]` (financière,
  fraude/AML, tarification, aperçu contrat, recommandation de décision) sont **calculées en
  direct** par des moteurs purs et déterministes (`app/_lib/admin/application/`), seedés par
  l'id de demande, et ne sont **pas stockées**.
- **Pourquoi :** objectif "tout comme un vrai logiciel bancaire" mais sur données de démo
  ("smoke db", non connectées au réel). Le déterminisme par seed donne des dossiers stables
  et crédibles sans churn de schéma ni dépendance externe ; on évite d'alourdir/risquer la
  base partagée avec des tables d'analyse qui devraient de toute façon être recalculées.
- **Ce qui persiste :** uniquement les choix de l'analyste — décision d'octroi, disposition
  fraude, consentement, offre verrouillée, workflow (affectation/priorité/tags/notes) — via une
  migration **additive** sur `loan_applications` (`20260528140000`) + `interactions`/`tasks`
  (lien `application_id`). Migration appliquée via la Management API (cf. CLAUDE.md §12).
- **Évolution :** brancher de vraies sources (open-banking, bureaux de crédit, listes de
  sanctions) remplacera les générateurs mock sans changer la frontière dérivé/persisté.

## 2026-05-28 — Pas de modals : pages dédiées ou panneaux inline
- **Décision :** plus aucune fenêtre **modale / dialog superposé** pour une création, une édition,
  une gestion (comptes, paramètres) ou une composition. On utilise une **page dédiée** (route propre)
  ou un **panneau inline** dans la vue ; les confirmations (suppression…) sont **inline**.
- **Pourquoi :** les modals masquent le contexte, bornent l'espace de travail et empilent les états.
  Une page (ou un panneau pleine hauteur) donne plus de place, est partageable par URL et lit mieux
  pour un outil data-dense. Cf. CLAUDE.md Golden Rule 9 + §5.
- **Mise en œuvre (messagerie) :** `/admin/mail` passe en **plein écran** sans `PageHeader` ; la
  composition devient un **panneau inline** (`compose-pane`), la gestion des comptes une **page**
  (`/admin/mail/accounts`), la suppression une **confirmation inline**. `compose-dialog` et
  `accounts-manager` (modaux) supprimés.
- **Legacy :** les `Modal`/`ConfirmDialog` encore utilisés ailleurs dans l'admin (clients, produits,
  paiements, dossier demande) sont tolérés en l'état et **à migrer** progressivement ; aucun nouveau.

## 2026-05-28 — Messagerie : maquette en base, sans réseau (branchement réel différé)
- **Décision :** l'onglet Messagerie (`/admin/mail`) est une **maquette adossée à la base** —
  aucun envoi/réception réel, aucune dépendance externe (`nodemailer`/`imapflow`/`mailparser`),
  aucune route HTTP ni service-role. Comptes, dossiers, messages, pièces jointes et diagnostics
  vivent dans Supabase et transitent par le **client navigateur + RLS**, comme le reste de l'admin.
  Les boutons « Test SMTP/IMAP » et « Synchroniser » **simulent** (latence + contrôle de config).
- **Pourquoi :** livrer une boîte mail complète et crédible, alignée 1:1 sur l'architecture
  actuelle (`supabase.from(...)`), sans introduire de back-end mail, de secrets serveur ni de
  chiffrement pour une maquette. Le schéma porte déjà host/port/sécurité/identifiants : la feature
  est « prête à brancher ».
- **Identifiants :** stockés **en clair** pour la maquette, et **jamais relus côté navigateur**
  (les selects excluent les colonnes `*_password` — champ write-only dans l'UI). Cf. SECURITY.
- **Évolution :** le branchement réel (SMTP/IMAP, webhooks entrants, pièces binaires) passera par
  un service **serveur** (clé privilégiée hors navigateur) et le **chiffrement des identifiants**,
  sans changer le modèle de données (host/port/sécurité/identifiants déjà présents).

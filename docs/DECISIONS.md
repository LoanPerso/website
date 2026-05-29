# Decisions

Record architectural and product decisions here.

## 2026-05-29 — Supabase : environnements préprod + prod séparés
- **Décision :** deux projets Supabase distincts dans la même org — **préprod** (`quickfundPreprod`, ref `vysqrahewfxamwxabhnh`, l'historique) et **prod** (`quickfundProd`, ref `aqwenqsxdubyhhjkfekh`), tous deux `eu-central-1`, plan gratuit (le plan est au niveau org chez Supabase).
- **Prod vierge :** seul le **schéma** y est appliqué (les 9 migrations `supabase/migrations/`), **sans `seed.sql`** — aucune donnée (ni démo, ni catalogue produits) ; RLS active (19/19 tables de base).
- **Pourquoi :** isoler les vraies données de prod du bac de préprod ; promouvoir le schéma sans jamais copier les données de démo.
- **Mise en œuvre :** création + migrations via l'API Management ; clés prod dans `.env` sous `SUPABASE_PROD_*` (jamais commitées). Renommage de la préprod purement cosmétique (ref/URL/clés inchangés) → l'app locale continue de pointer la préprod.
- **Conséquence :** sur l'hôte de prod (Netlify), mapper `SUPABASE_PROD_URL/ANON_KEY/SERVICE_ROLE_KEY` dans `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`.

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

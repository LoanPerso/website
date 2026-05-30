# Journal

## 2026-05-30 — Prod : amorçage (admin + catalogue produits, sans données démo)
- **Admin prod créé :** `fkvirtuel@gmail.com` (nom *Gaylor*, **superadmin**, actif) sur `quickfundProd` — utilisateur Auth confirmé + ligne `admin_users`, via `scripts/create-admin.mjs` ciblé prod (override `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_PROJECT_REF` = valeurs `SUPABASE_PROD_*`). Identifiants identiques à la préprod.
- **Catalogue produits répliqué :** les **8 produits** de la préprod copiés à l'identique dans `public.products` (micro-crédit, conso, pro, étudiant, avance sur salaire, leasing, regroupement, coaching). Slugs **alignés 1:1** avec `productsConfig` de la landing (`app/[locale]/(public)/products/_config.ts`).
- **Aucune donnée métier de démo** en prod (clients/crédits/paiements/mails = 0).
- **Vérifié :** `admin_users` (1), `auth.users` (1, confirmé), `products` (8, actifs).
- **Note sécurité :** mot de passe admin volontairement faible (parité préprod) — **à rotationner avant ouverture publique**.
- **Docs :** DECISIONS, DATABASE, PROJECT_STATUS (corrigés : prod n'est plus « vierge » ; `service_role` non requis sur l'hôte runtime).

## 2026-05-29 — Supabase : projet prod vierge (`quickfundProd`) + préprod renommée
- **Nouveau projet prod :** `quickfundProd` (ref `aqwenqsxdubyhhjkfekh`, `eu-central-1`, org gratuite — le plan est désormais au niveau org) créé via l'API Management.
- **Migrations (schéma only) :** les **9** fichiers `supabase/migrations/` appliqués dans l'ordre (`POST /v1/projects/{ref}/database/query`, User-Agent curl pour passer le WAF Cloudflare 1010). **Aucun `seed.sql`** → **vierge** : 27 objets / 19 tables de base, **0 ligne** (clients/loans/products/mail_messages = 0), **RLS 19/19**.
- **Préprod renommée :** l'existant `quickfund` (`vysqrahewfxamwxabhnh`) → **`quickfundPreprod`** (`PATCH /v1/projects/{ref}`) — purement cosmétique : **ref/URL/clés inchangés**, l'app locale (qui pointe la préprod) intacte.
- **Secrets :** mot de passe DB prod généré localement + URL + clés anon/service_role récupérées → `.env` sous `SUPABASE_PROD_*` (jamais affichés, jamais commités) ; fichiers temporaires supprimés.
- **Docs :** `.env.example` (bloc PROD + mapping vers les vars runtime), CLAUDE.md §12.2, DECISIONS, DATABASE (Environments), SECURITY, PROJECT_STATUS.

## 2026-05-29 — Messagerie : « Simuler une réponse » retiré du vrai webmail (simulation = bac à sable uniquement)
- **Retrait du lecteur :** le bouton **« Simuler une réponse »** (fiole) et le panneau `MessageSimulateReply` quittent `message-view` — la simulation ne « fuit » plus dans le webmail de production. Composant orphelin `message-simulate-reply.tsx` **supprimé** ; prop `onSimulated` retirée de `MessageView` et de `mail/page.tsx`.
- **Où simuler désormais :** uniquement `/admin/mail/simulate` (composer ancré « Répondre en tant que {interlocuteur} » + « Nouveau mail »). Libs `simulateReplyTo`/`simulateInboundMessage` inchangées.
- **Vérification :** `tsc --noEmit` vert (EXIT 0) ; 0 référence résiduelle (`MessageSimulateReply`/`onSimulated`/`simReply`).
- **Docs :** CHARTE_GRAPHIQUE, FEATURES.

## 2026-05-29 — Messagerie : refonte visuelle du bac à sable (miroir fidèle du webmail)
- **Problème :** l'interface `/admin/mail/simulate` était « moche » — volet droit **centré** (`max-w-2xl`), bulles `ml-8/mr-8` et **snippets tronqués** (140 c.) ; elle ne reflétait pas le langage soigné du vrai webmail.
- **Refonte en miroir 2 panneaux** (réutilise tokens + composants partagés, grayscale/Linear) :
  - `conversation-list` — volet liste façon `message-list` (recherche + expéditeur/objet/**aperçu** + icône de **sens du dernier message** ↗/↙ + compteur).
  - `conversation-thread` — lecteur en **cartes empilées** (en-tête type `message-view`, **corps complets**, sortants Quickfund vs entrants interlocuteur distingués par fond/flèche) + **composer de réponse ancré** « Répondre en tant que {interlocuteur} ».
  - `new-mail-form` — composer **inline** « nouveau mail entrant » façon `compose-pane` (modèles, compte cible, expéditeur nom/e-mail, objet, message).
- **Découpage par feature :** `app/_components/admin/mail/simulate/` (`types.ts` = `SimulateConversation` + `buildConversations`, + 3 composants) ; la page devient un **orchestrateur**.
- **Corps complets :** nouvelle lib `listMessagesFullByIds` — le lecteur charge les corps de **tous** les messages listés du fil (threadé ou isolé), fini les snippets tronqués.
- **Responsive :** flux **mono-panneau** mobile (liste → détail) avec barre retour, comme le webmail ; desktop 2 colonnes via `display:contents` (`lg:grid-cols-[22rem_minmax(0,1fr)]`).
- **Inchangé & vérifié :** round-trip — mail **envoyé depuis le webmail** → apparaît en conversation (`thread_key`) → **réponse en tant qu'interlocuteur** (`simulateReplyTo`) ou **nouveau mail entrant de zéro** (`simulateInboundMessage`). **Zéro modal** (panneaux inline), grayscale, route inchangée.
- **Vérification :** `tsc --noEmit` vert (EXIT 0).
- **Docs :** CHARTE_GRAPHIQUE, FEATURES, PROJECT_STATUS.

## 2026-05-29 — Messagerie : conversations smoke à double sens (sandbox = webmail)
- **Tout mail envoyé ouvre un fil :** `sendMessage` stampe désormais un `message_id` + un `thread_key` (si absent) — un mail composé de zéro devient le départ d'une conversation à laquelle les réponses se rattachent (avant : pas de thread → impossible d'enchaîner).
- **« Simuler une réponse » dans le lecteur :** bouton (fiole) qui génère la **réponse entrante de l'interlocuteur dans le même fil** — `simulateReplyTo` (de = destinataire d'un sortant / expéditeur d'un entrant ; `in_reply_to` + `thread_key` conservés). On tape le **contenu voulu** → il « arrive » en Réception et s'ajoute à la conversation.
- **Sandbox refondue en webmail de conversations** (`/admin/mail/simulate`, reflet du smoke réel) : volet **liste des conversations** (regroupées par `thread_key`) + volet **conversation** (messages entrants/sortants empilés) avec un composer **« Répondre en tant que {interlocuteur} »** (le mail qu'on veut), plus **« Nouvelle conversation entrante »**. Lib `listAccountMessages` (regroupement) ; `simulateReplyTo` accepte un message léger (`MailMessageListItem`).
- **Vérification :** `tsc --noEmit` vert ; `/admin/mail`, `/admin/mail/simulate` compilent (HTTP 200) ; round-trip envoi→réponse dans le même fil validé en base.
- **Docs :** CHARTE_GRAPHIQUE, FEATURES, ARCHITECTURE.

## 2026-05-29 — Messagerie : vraie expérience webmail (fil de discussion, reply-all, déplacer/non lu)
- **Réponses correctes selon le sens :** répondre à un mail **envoyé** vise désormais ses **destinataires** (plus soi-même) ; répondre à un entrant vise l'expéditeur. Nouveau **Répondre à tous** (ajoute les autres destinataires/Cc en excluant le compte courant), affiché dès qu'il y a plusieurs destinataires.
- **Fil de discussion :** le lecteur affiche la **conversation** — tous les messages du même `thread_key`, **tous dossiers confondus** (entrants + envoyés), en liste cliquable (`message-thread.tsx` + lib `listThread`). Une réponse envoyée réapparaît aussitôt dans le fil **et** dans **Envoyés** (la « vue classique »).
- **Actions webmail :** **Marquer comme non lu** (entrants), **Déplacer vers** (select des dossiers du compte) — en plus de Répondre/Transférer/Drapeau/Supprimer/Lien CRM. Composer de zéro inchangé (panneau inline → Envoyés).
- **Vérification :** `tsc --noEmit` vert ; `/admin/mail`, `/admin/mail/accounts`, `/admin/mail/simulate` compilent (HTTP 200).
- **Docs :** CHARTE_GRAPHIQUE, FEATURES, ARCHITECTURE.

## 2026-05-29 — Messagerie : nettoyage « simulé », Lien CRM masquable, bac à sable de réception
- **Mentions « (simulé) » retirées** de l'UI (toasts envoi/synchro, note du composer, libellé « Tests de connexion », détails de diagnostics) **et** des données seedées + déjà en base (diagnostics + `last_*_detail` des comptes). La nature maquette reste documentée côté `/docs` uniquement.
- **Panneau « Lien CRM » masquable :** bouton (icône lien) dans l'en-tête du lecteur, **à côté de Drapeau/Supprimer**, affiche/masque le panneau ; ouvert par défaut si le message est déjà rattaché (client/demande), fermé sinon.
- **Bac à sable (un peu caché) :** nouvelle page `/admin/mail/simulate` pour gérer les données de démo — **simuler la réception d'un mail** (compte cible, expéditeur nom/e-mail, objet, corps, options lu/suivi/pièce jointe, lien client/demande optionnel) + presets FR. Lib `simulateInboundMessage` (insert `direction='in'` dans la Réception, repli sur le 1er dossier si pas d'INBOX). Accès via une **icône fiole discrète** sur la page Comptes.
- **Vérification :** `tsc --noEmit` vert ; `/admin/mail`, `/admin/mail/accounts`, `/admin/mail/simulate` compilent (HTTP 200) ; 0 mention « simul » restante en base.
- **Docs :** CHARTE_GRAPHIQUE, FEATURES, ARCHITECTURE.

## 2026-05-29 — Messagerie : sidebar repliable, association CRM des mails, page Comptes plein écran
- **Sidebar admin repliable :** `admin-shell` gagne un **toggle de repli** (rail d'icônes ~3.5rem ↔ 15rem), **persisté** (`localStorage`), libellés de groupe masqués + tooltips en mode réduit, drawer mobile inchangé (toujours déployé). La largeur est exposée en **variable CSS `--sidebar-w`** : le `padding` du `main` et les **pages plein écran épinglées à droite** (messagerie, comptes) suivent automatiquement via `lg:left-[var(--sidebar-w)]`.
- **Association CRM des mails (complétée) :** dans le lecteur, nouveau panneau inline **« Lien CRM »** (`message-crm.tsx`) pour rattacher un message à un **client** et/ou une **demande** (selects alimentés par l'annuaire chargé une fois), **changer le statut de la demande** sans quitter la boîte, et **suggestions par e-mail** (« Lier à X · même e-mail » si l'expéditeur correspond). Lib `setMessageCrmLinks` ; le statut passe par `transitionApplication` (stamp SLA + journal). Le message est rechargé après chaque action.
- **Page « Comptes de messagerie » refondue :** **plein écran** sans `PageHeader` (titre/description retirés), barre fine (← Messagerie · Comptes · Nouveau). **Master-détail à scroll indépendant** : liste **étroite et compacte** (16rem) qui **reste à l'écran** pendant qu'on scrolle le formulaire (chaque colonne a son propre `overflow-y-auto` dans un conteneur à hauteur fixe). Réagit aussi à `--sidebar-w`.
- **Vérification :** `tsc --noEmit` vert ; routes `/admin/dashboard`, `/admin/mail`, `/admin/mail/accounts` compilent (HTTP 200).
- **Docs :** CHARTE_GRAPHIQUE, FEATURES, ARCHITECTURE.

## 2026-05-29 — Ergonomie tactile de l'admin (penser « app mobile »)
- **Problèmes signalés :** (1) un scroll vertical « de trop » sur mobile, (2) les boutons restaient « enclenchés » (état survol collé) après un tap, (3) zoom automatique iOS au focus d'un champ.
- **Scroll de trop → hauteur dynamique :** les conteneurs pleine hauteur passaient par `min-h-screen` (`100vh`), qui sur mobile dépasse la zone réellement visible (barre d'URL) → ~quelques px de scroll parasite. Remplacé par `min-h-dvh` (dynamic viewport height) dans `app/admin/layout.tsx`, `admin-shell`, `login`, `admin-guard`.
- **Bouton collé au survol → `hoverOnlyWhenSupported` :** ajout de `future: { hoverOnlyWhenSupported: true }` dans `tailwind.config.ts` — toutes les variantes `hover:` ne s'appliquent plus que sur les appareils qui gèrent réellement le survol. Sur tactile, un tap ne laisse plus aucun bouton dans son état survol.
- **Zoom au focus → 16px sur mobile :** le bloc `globals.css` forçait `font-size: 13px` sur tous les `input/select/textarea` de l'admin — sous 16px, Safari iOS zoome au focus. Désormais **16px par défaut (mobile)**, `13px` seulement à partir de `sm` (densité desktop conservée).
- **Retour « app » :** `-webkit-tap-highlight-color: transparent` (plus de flash gris au tap) sur `.admin-theme` ; **retour de pression** au tap via `active:scale-[0.97]` + `touch-manipulation` + `select-none` sur le composant `Button` ; **verrou du scroll de fond** quand le menu mobile (drawer) est ouvert (`document.body.style.overflow` dans `admin-shell`) ; `overscroll-contain` sur la nav scrollable (pas de scroll-chaining).
- **Vérification :** `tsc --noEmit` vert (EXIT 0). Classes Tailwind 3.4 utilisées : `min-h-dvh`, `overscroll-contain`, `touch-manipulation`, `active:scale-*`.
- **Piste suivante (non faite) :** agrandir certaines cibles tactiles denses (boutons icône `h-8`, liens d'action `text-xs` dans les tables) vers ~44px sur mobile — à arbitrer avec la densité « Linear ».
- **Docs :** JOURNAL + CHARTE_GRAPHIQUE (section ergonomie tactile).

## 2026-05-28 — Messagerie : version mobile (flux mono-panneau)
- **Responsive mobile :** le client mail (3 colonnes sur desktop) devient un **flux mono-panneau** sur mobile — **Dossiers → Liste → Lecteur**, un seul panneau visible à la fois, avec une **barre de navigation** (retour ← + titre du dossier + bouton Composer sur la vue Liste). La composition s'affiche en **plein écran** (sa propre barre avec ✕).
- **Mise en œuvre :** wrappers de panneaux `hidden`/`flex` pilotés par un état `mobileView` ; sur `lg` ils passent en **`display:contents`** → les panneaux redeviennent les cellules de la grille 3 colonnes (**desktop inchangé**). Plein écran mobile sous la top-bar admin (`h-[calc(100dvh_-_3.5rem)]`, full-bleed via marges négatives `-mx-4 -my-8`) ; unité `dvh` pour gérer la barre d'URL mobile.
- **Navigation :** dossier → liste ; message → lecteur ; ← remonte d'un niveau ; suppression renvoie à la liste. Entrées Composer : bouton de la sidebar (vue Dossiers) + icône de la barre (vue Liste) ; Répondre/Transférer depuis le lecteur.
- **Vérification :** `tsc --noEmit` propre ; desktop (≥ lg) strictement identique.
- **Docs :** CHARTE_GRAPHIQUE (comportement mobile du client mail).

## 2026-05-28 — Messagerie v2 : plein écran, zéro modal, page Comptes (+ règle no-modal)
- **Règle projet (CLAUDE.md Golden Rule 9 + §5) :** **interdiction des modals/dialogs** pour toute création/édition/gestion/composition. Toujours une **page dédiée** (route propre) ou un **panneau inline** ; les confirmations sont **inline**. Les `Modal`/`ConfirmDialog` (`dialog.tsx`) restants sont du **legacy à migrer** — ne plus en ajouter.
- **Messagerie en plein écran :** suppression du `PageHeader` (titre/description). Le client mail occupe désormais tout l'espace à droite de la sidebar admin (`lg:fixed inset-y-0 left-60 right-0`) ; panneaux **sans cartes** (séparateurs uniquement) pour ne plus perdre de place. Sidebar refondue : bouton **Composer** en tête, liste des dossiers, pied **Synchroniser** (avec dernière synchro) + lien **Gérer les comptes** + dots SMTP/IMAP.
- **Zéro modal dans la messagerie :**
  - **Composer/Répondre/Transférer** : le modal `compose-dialog` devient un **panneau inline** (`compose-pane.tsx`) occupant la colonne lecteur pendant la rédaction.
  - **Gestion des comptes** : le modal `accounts-manager` devient une **page** `/admin/mail/accounts` (maître-détail : liste + `account-form` réutilisé), avec **Test SMTP/IMAP** + historique diagnostics.
  - **Suppression de compte** : `ConfirmDialog` → **confirmation inline**.
  - Fichiers `compose-dialog.tsx` et `accounts-manager.tsx` supprimés ; plus aucun `Modal`/`ConfirmDialog` sous `app/.../mail`.
- **Compte admin :** identifiants de connexion **changés** (e-mail `fkvirtuel@gmail.com` + mot de passe rotationné) via l'Auth Admin API (clé service_role) ; `admin_users.email` et `.env` (`ADMIN_BOOTSTRAP_*`) synchronisés. Aucune valeur secrète écrite en clair hors `.env`.
- **Vérification :** `tsc --noEmit` propre ; refonte sans nouvelle route HTTP (hors page admin `mail/accounts`).
- **Docs :** CLAUDE.md (règle 9 + §5), CHARTE_GRAPHIQUE (no-modal + layout plein écran), DECISIONS (no-modal), ARCHITECTURE (route `mail/accounts`, panneau inline), FEATURES, PROJECT_STATUS.

## 2026-05-28 — Origination de bout en bout & servicing/recouvrement (back office complet)
- **But :** rendre l'admin réellement opérationnel pour gérer 100 % d'une activité d'octroi de crédit — chaque onglet profond, avec pages détail, **tout connecté à Supabase** (fin des cul-de-sacs « smoke »). On peut désormais instruire une demande → générer un **vrai contrat** → le signer → générer le **crédit** + échéancier → **débloquer les fonds** → encaisser/rapprocher → **recouvrer** (relances, pénalités, promesses) → **solder par anticipation / restructurer / passer en perte**.
- **Pont d'origination (`app/_lib/admin/origination.ts`, nouveau) :** corrige le cul-de-sac où « approuver » ne créait jamais rien. `buildContractTerms` fige un snapshot immuable des termes (montant, durée, taux, TAEG, assurance, frais, 1re échéance, aperçu d'échéancier) ; `originateFromApplication` crée le client si besoin (réutilise `convertApplicationToClient`) puis un **contrat réel** (statut `draft`, `terms` jsonb) ; `activateContractAsLoan` transforme un contrat **signé** en crédit (`draft`) + échéancier d'amortissement et relie `contracts.loan_id`. Chaque étape journalise interaction + activité.
- **Servicing crédit (`app/_lib/admin/servicing.ts`, nouveau) :** `disburseLoan` (brouillon → actif, `disbursed_at`), `payoffQuote` + `settleLoan` (décompte de solde anticipé = capital restant + intérêts échus + pénalités + indemnité 1 % ; clôt l'échéancier — échéances dues `paid`, futures `waived` — intérêts futurs économisés), `restructureLoan` (ré-amortit le capital restant : supprime la queue impayée, régénère un échéancier, recalcule mensualité/intérêts/fin), `writeOffLoan` (perte sur encours, `defaulted` + `write_off_amount`), `setLoanStatus`/réactivation. `createLoan` ne débloque plus un prêt créé en `draft` (déblocage = étape explicite).
- **Recouvrement (`app/_lib/admin/collections.ts`, nouveau) :** `listArrears` (vue `v_loan_arrears`), échelle de relance `DUNNING_LADDER` (rappel amiable → mise en demeure → dernier avis), `recordDunningStep` (incrémente `dunning_level`, planifie `next_action_date` + tâche), `assessLateFee`/`assessLateFeeOnLoan` (pénalité 8 % min 15 € sur l'échéance la plus ancienne), `recordPromiseToPay` (promesse datée + tâche), `markDefault`.
- **Audit & acteur (`app/_lib/admin/audit.ts`, nouveau) :** `currentActor` (depuis `supabase.auth`, mis en cache, purgé à la déconnexion via `auth-provider`), `logActivity` (écrit `activity_log`, best-effort), `listActivity`. Câblé dans décision (`decided_by`), revue risque (`reviewed_by`), contrats, origination, servicing, collections, paiements.
- **Pages détail (à onglets, charte grayscale/Linear) :**
  - **Contrat `/admin/contracts/[id]` (nouveau)** : Synthèse · Termes & offre (snapshot figé + aperçu échéancier + pack documentaire SECCI/FIPEN) · Signature & rétractation · Crédit lié · Chronologie. Actions réelles : envoyer l'offre, signer (mode + délai 14 j), générer le crédit, débloquer, annuler/expirer. `StageStepper` reflète le statut réel. La liste des contrats pointe désormais vers le détail.
  - **Crédit `/admin/loans/[id]` (refondu)** : Synthèse (avancement) · Échéancier (capital/intérêts + pénalités) · Paiements (avec statut) · **Gestion** (déblocage, décompte de solde, restructuration, défaut/réactivation, passage en perte, zone sensible) · Chronologie.
  - **Produit `/admin/products/[id]` (nouveau)** : empreinte portefeuille (crédits émis/actifs, capital, encours, taux moyen), **grille tarifaire par catégorie de risque** (A→D via `suggestRate`), paramètres, règles d'éligibilité, édition. `ProductDialog` extrait en composant partagé (`forms/product-dialog.tsx`).
- **Dossier demande — onglet Contrat rewiré :** remplace la simulation (interactions seules) par un vrai bouton **« Générer le contrat »** (`originateFromApplication`) qui redirige vers le dossier contractuel ; détecte un contrat déjà généré (`findContractByApplication` via `terms->>source_application_id`) et affiche son statut + lien. L'aperçu SECCI/FIPEN est conservé.
- **Paiements `/admin/payments` (enrichi) :** filtre statut, colonnes Rapproché/Statut, actions **rembourser**/**rejeter** (`refundPayment`/`failPayment` → recalcul échéance + statut prêt), KPIs encaissé/non rapprochés/remboursés.
- **Impayés → Recouvrement `/admin/overdue` (refondu) :** deux vues (`SegmentedTabs`) — **Dossiers** (par crédit, depuis `v_loan_arrears` : niveau de relance, arriéré, retard max, prochaine action) avec **modale de recouvrement** (relancer / pénalité / promesse / défaut) et **Échéances** (liste existante + encaissement).
- **Schéma — migration additive idempotente `20260528150000_servicing_collections.sql` :** `installments.late_fee` ; `loans.closed_at/closure_reason/write_off_amount/dunning_level/next_action_date` (+ index) ; vue **`v_loan_arrears`** (exposition par crédit en arriéré, `security_invoker`, `revoke anon`). Appliquée via Management API.
- **Vérification :** `tsc --noEmit` **vert sur tout le projet** (EXIT 0) ; vue `v_loan_arrears` testée (5 dossiers en arriéré, 4 224,72 €, 73 j max) ; prêts 30 actifs / 17 soldés / 1 défaut ; 48 contrats. Aucune route HTTP introduite (client navigateur + RLS).
- **Docs :** JOURNAL, PROJECT_STATUS, FEATURES, ARCHITECTURE (couches origination/servicing/collections/audit), DATABASE (colonnes + vue), DECISIONS (modèle de solde anticipé/restructuration, snapshot de termes, audit). PLAN non coché (en attente de validation). API_ROUTES inchangé.

## 2026-05-28 — Messagerie : boîte mail de la société (maquette DB)
- **Feature :** nouvel onglet admin `/admin/mail` — la **boîte mail de la boîte**, façon client mail 3 panneaux (comptes + dossiers · liste · lecteur). Gère plusieurs adresses/boîtes, voit les mails entrants, compose/répond/transfère, plus un **smoke SMTP** et un **smoke IMAP**.
- **Maquette sans réseau, 100 % en base :** aucun envoi/réception réel, aucune dépendance externe (pas de `nodemailer`/`imapflow`/`mailparser`). Comptes, dossiers, messages, pièces jointes et diagnostics vivent dans Supabase et sont lus/écrits via le **client navigateur + RLS**, comme tout l'admin (`supabase.from(...)`). Aucune route HTTP, aucun service-role, aucun chiffrement introduits. Le schéma porte déjà host/port/sécurité/identifiants pour un branchement SMTP/IMAP réel ultérieur.
- **Schéma** — migration additive idempotente `20260528160000_mailbox.sql` : `mail_accounts` (config IMAP+SMTP, défaut/actif, signature, état des smokes `last_*_status/checked_at/detail`), `mail_folders` (rôles inbox/sent/drafts/trash…), `mail_messages` (direction in/out, threads, `to/cc` jsonb, corps texte/HTML, flags lu/suivi/répondu/brouillon, statut, liens CRM `client_id`/`application_id`), `mail_attachments` (métadonnées), `mail_diagnostics` (historique smoke). Triggers `set_updated_at`, index (account/folder/direction/received_at/seen/client/application), RLS admin-only (`*_admin_all` via `is_admin()`). **Mots de passe jamais relus côté navigateur** : les selects excluent les colonnes `*_password` (champ « write-only »).
- **Couche données** (`app/_lib/admin/mail/`, découpée par responsabilité) : `accounts` (CRUD + défaut, select sans `*_password`), `folders` (liste + compteurs non-lus par dossier), `messages` (liste filtrable/recherche, lecture pleine + pièces + liens CRM, lu/drapeau/déplacement/suppression), `compose` (`sendMessage` insère un sortant `status='sent'` dans Envoyés, marque le fil « répondu », journalise une `interaction` si lien CRM ; `saveDraft`), `diagnostics` (`runSmoke` **simulé** ~600 ms : vérifie host/port/identifiant → ok/erreur, écrit `mail_diagnostics`, met à jour `last_*_status` ; `syncMailbox` simulé stampe `last_synced_at`). Barrel + `mailApi` ajouté à `app/_lib/admin/index.ts`. Types & libellés FR (`formatDateTime`, `formatRelativeDate`, `mail*Labels`).
- **UI** (`app/_components/admin/mail/` + page `use client`) : `account-sidebar` (sélecteur de compte + dossiers avec compteur non-lus + dots SMTP/IMAP), `message-list` (recherche + filtre Tous/Non lus/Suivis, point non-lu, icônes pièce jointe/drapeau), `message-view` (en-têtes De/À/Cc/date, corps texte — HTML rendu en texte prudent sans `dangerouslySetInnerHTML`, Répondre/Transférer/Drapeau/Supprimer, pièces jointes, lien CRM), `compose-dialog` (De/À/Cc/Sujet/Corps, réponse/transfert pré-remplis + citation + signature), `accounts-manager` + `account-form` (CRUD boîte + **Test SMTP/IMAP** + historique diagnostics). Nouveau groupe nav **« Communication » → Messagerie** (icône `Mail`), après CRM. Respect strict de la charte grayscale/Linear (Panel/Modal/Field/Button/SegmentedTabs/dots tonals, aucun champagne).
- **Vérification :** `tsc --noEmit` propre ; migration + seed appliqués via la Management API (HTTP 201) ; RLS active + 1 policy `*_admin_all` sur les 5 tables ; seed = 1 compte (`contact@quickfund.ee`), 4 dossiers, 8 messages (6 entrants/2 sortants, 3 non lus, 3 reliés au CRM par e-mail), 4 diagnostics.
- **Docs :** DATABASE (5 tables + migration), FEATURES (module Messagerie), ARCHITECTURE (couche mail), CHARTE_GRAPHIQUE (composants + groupe nav), DECISIONS (maquette DB sans réseau), SECURITY (identifiants en clair en maquette → chiffrement + serveur au branchement réel), PROJECT_STATUS, PLAN (sans cocher). API_ROUTES inchangé (aucune route HTTP).

## 2026-05-28 — Dark mode admin (toggle + suivi système)
- **Feature :** mode sombre pour le back office `/admin`, façon Linear. Déclenché par un **toggle** (soleil/lune) dans la sidebar (+ top bar mobile), **suit la préférence système** par défaut, choix **mémorisé** (`localStorage`), **anti-FOUC** (script inline posant la classe `dark` sur `<html>` avant le paint).
- **Scopé `/admin` uniquement** : le script et le `ThemeProvider` ne posent la classe `dark` que sur les routes `/admin`. Le **site public reste clair** (il a ses propres utilitaires `dark:` qui ne doivent pas s'activer). Le bloc `.dark` global "luxury" est désactivé (passe publique dédiée plus tard, ~300 couleurs en dur).
- **Tokens (`globals.css`) :** `.dark .admin-theme` (non-layered) — canvas `hsl(220 13% 7%)`, panels `220 12% 10%`, texte `220 15% 92%`, borders `220 10% 20%`, primary inversé (clair), accent slate clair, `--dark-gold` → clair (liens/onglet actif), `--brand-gold` éclairci ; couleurs fonctionnelles (success/alert/error) éclaircies pour le contraste.
- **Pré-requis :** les 27 `bg-white` en dur de l'admin remplacés par `bg-background` (token) pour qu'ils basculent ; aucune autre couleur en dur dans l'admin.
- **Implémentation :** `app/_components/theme-provider.tsx` (light/dark/system, écoute `prefers-color-scheme`, gate `/admin`), `app/_components/admin/theme-toggle.tsx`, script + provider câblés dans `app/layout.tsx` (`suppressHydrationWarning` sur `<html>`).
- **Vérification :** grep — public conserve ses 12 utilitaires `dark:` sans activation hors `/admin` ; 0 `bg-white` résiduel dans l'admin. `tsc --noEmit` à relancer avant commit.

## 2026-05-28 — Admin design system v2 : épuration "Stripe/Linear" (grayscale)
- **Refonte visuelle** du back office `/admin` : passage d'un rendu jugé "pateux" (or champagne réinjecté sur canvas gris, ~56 aplats teintés, radius hétérogènes `xl`/`full`, ombre lourde `shadow-soft` `0 12px 24px`) à un système épuré, dense et neutre façon Stripe/Linear. **Palette conservée**, dosage de l'or revu.
- **Tokens (`globals.css`, scope `.admin-theme`) :** accent fonctionnel neutralisé (`--accent` champagne → slate `220 9% 46%`), `--dark-gold` → encre `222 22% 18%` (liens, onglet actif, dots, sliders deviennent neutres **par token**, sans éditer les ~20 fichiers consommateurs), focus ring slate. Nouveau `--brand-gold` `40 39% 47%` : seul or survivant, réservé au branding (logo + pastille "Admin"). `brand-gold` ajouté aux couleurs Tailwind ; `boxShadow.overlay` ajouté (overlays propres) sans toucher `soft`/`crisp` (site public).
- **Primitives partagées** (radius unifié — cartes `rounded-lg` 8px, contrôles/badges `rounded-md` 6px ; `rounded-full` réservé dots/jauges/barres) :
  - Cartes **flat** (border hairline seule, plus d'ombre) : `panel`, `kpi-card`, `data-table`.
  - Overlays en `shadow-overlay` + `rounded-lg` : `dialog`, `toast`, drawer mobile, écrans `login`/`admin-guard`.
  - **Badges "dot + texte neutre"** (fin des aplats colorés) : `status-badge` (`Badge`/`StatusBadge`/`RiskBadge`), `parts.SoftBadge`. Nouveau `ScoreChip` partagé (chip neutre + dot catégorie) — dédupliqué depuis `applications/page` et `clients/page`.
  - `VerdictBanner` / `VerdictCard` (overview) : surface neutre + filet d'accent vertical 3px (au lieu de fond teinté + `rounded-xl` + `shadow-soft`).
  - `bar-chart` : 2 séries en deux gris (`foreground/35` vs `primary`).
- **Règle de couleur posée :** le **chrome** (badges, cartes, bandeaux, nav, chips) est grayscale ; la **couleur fonctionnelle** (vert/ambre/rouge) ne subsiste que sur la **data sémantique** (barres de ratio, métriques tonales, jauge de score, flux open-banking entrées/sorties, états "coché", feedback d'erreur).
- **Périmètre :** 49 fichiers admin couverts — primitives refondues + neutralisation par token propagée à toutes les pages (dashboard, clients, loans, contracts, payments, overdue, products, tasks, import, settings, dossier application 8 onglets).
- **Vérification :** non-régression par grep — 0 `rounded-xl`, 0 ombre lourde, 0 aplat de chrome teinté ; `shadow-overlay` limité aux 5 overlays ; imports orphelins (`cn`, `RiskCategory`, `TONE_SOFT`) supprimés. `tsc --noEmit` à relancer avant commit.
- **Itération (retour utilisateur) :** workflow bar du dossier demande compactée (selects nus avec `title`/`aria-label`, bouton score en icône seule, densité réduite) ; retrait du filet d'accent vertical sur `VerdictCard` (overview) et `VerdictBanner` (parts) — le ton est porté par le titre coloré + le badge à point. Liseré tonal des `kpi-card` conservé.

## 2026-05-28 — Dossier Demande "qualité bancaire" (origination & suivi)
- **Feature:** refonte du dossier `/admin/applications/[id]` en poste d'instruction complet façon logiciel bancaire (LOS). La fiche précédente (lecture seule : crédit/identité/contact/emploi/pièces + score) est remplacée par un dossier à **8 onglets** : Vue d'ensemble, Analyse financière, Fraude & AML, Décision, Tarification, Contrat, Communications, Tâches.
- **Moteurs dérivés déterministes** (`app/_lib/admin/application/`, seedés par l'id de demande → la "smoke db", stables au reload, sans données réelles) :
  - `analysis.ts` — capacité de remboursement : DTI/DSTI, FOIR, reste à vivre par UC (OCDE), reconstruction budgétaire (charges estimées par région/foyer), engagements en cours + simulation de regroupement, analyse open-banking (flux 6 mois, découvert, rejets, jeu), stabilité & vérification revenus, **stress test** (taux/revenu), alertes (surendettement/FICP simulé), verdict 0-100.
  - `pricing.ts` — décomposition du taux (refi/risque/opex/marge/garantie), **TAEG par IRR** (frais + assurance), assurance emprunteur (âge/capital), contrôle du **taux d'usure** par pays, contre-offre par recherche d'affordabilité, bornes produit.
  - `fraud.ts` — KYC (clé isikukood EE + cohérence DOB, format passeport, e-mail jetable, VOIP, liveness), authenticité documents (doublon de pièce cross-dossiers), signaux de fraude (vélocité e-mail/tél/IBAN, cluster d'identités, géo, horaire, synthétique), screening PEP/sanctions/médias (name-match Levenshtein), SoF + FATCA/CRS, score composite + disposition.
  - `decision.ts` — knockouts (durs/souples), déclencheurs de revue, matrice d'octroi APPROVE/REFER/DECLINE + confiance, conditions (stipulations), **contre-offre**, délégation par montant (L1→comité), SLA par étape, motifs (refus motivé).
  - `comms.ts` — next-best-action, contactabilité (consentement + heures calmes), modèles de messages FR fusionnés, statut de livraison simulé, détection de doublons.
  - `contract.ts` — contexte de fusion FIPEN/SECCI, pack documentaire, blocs de l'offre, aperçu généré adapté au pays (rétractation, usure).
- **Persistance** (les analyses restent dérivées ; seules les décisions analystes persistent) — migration additive `20260528140000_application_workflow.sql` sur `loan_applications` : `assigned_to, priority, tags, internal_notes, last_contacted_at, stage_entered_at, consent, decision, risk_review, pricing, analysis_overrides` (idempotente, appliquée via Management API). Réutilise `interactions`/`tasks` (lien `application_id`) pour la chronologie/relances.
- **Couche données** (`applications.ts`) : `updateApplication`, `transitionApplication` (stamp SLA + log), `saveDecision`, `saveRiskReview`, `saveConsent`, `saveOffer` (verrouille l'offre → qualifie), `markContacted`, `assignApplication`, `setApplicationPriority`, `listApplicationInteractions/Tasks` (par demande), `listApplicationPeers` (contrôles cross-dossiers).
- **UI** (`app/_components/admin/applications/`) : barre workflow (statut/priorité/affectation/SLA/score), onglets, panels par domaine, dialog d'édition complet, primitives partagées (`parts.tsx`). Respecte la charte (Panel, ScoreGauge, StatusBadge, Modal, tokens Champagne/fonctions).
- **Vérification :** `tsc --noEmit` propre ; route compilée (HTTP 200) ; chemin de données réel testé (login admin → lecture des nouvelles colonnes via RLS → écriture d'interaction) ; les 6 moteurs exécutés sur les **12 demandes réelles** sans erreur, valeurs cohérentes (mensualité recalculée ≈ valeur du seed).

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

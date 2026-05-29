# CLAUDE.md – Project Operating Manual

> **Priorité absolue : exhaustive, pas rapide.** Avant chaque action, lire attentivement la demande, analyser tout l’environnement, identifier les impacts, construire un plan détaillé et le suivre. Prendre le temps nécessaire (analyse, recherches, tests, documentation). Mieux vaut être lent et complet que rapide et superficiel.

## 0. Golden Rules
1. **Structure le code par feature.** Chaque fonctionnalité doit être découpée de façon granulaire (modules FastAPI vs services métiers, composants front vs logique server) en suivant la structure actuelle du projet et en regroupant les fichiers par responsabilité. Eviter les codes trop long et préférer une factorisation clair et structurelle avec dossier et sous dossier.
2. **Document everything.** No feature, fix, or route is complete until all impacted docs (see Section 2) are updated.
3. **Keep `/docs/PLAN.md` aligned with reality.** Update checkboxes only after user validation.
4. **Never add or rename files in `/docs/` without explicit user approval.** Only update existing documents unless the user orders otherwise.
5. **Never touch visuals without consulting `/docs/CHARTE_GRAPHIQUE.md`.** Any new component or page must respect the design system.
6. **Always speak French with the user.** Code, commits, docs, comments remain in clean English.
7. **NE JAMAIS COMMIT ET PUSH SANS AUTORISATION EXPLICITE, ET TOUJOURS SANS MENTION DE CO-AUTHORED**
8. **NE JAMAIS BUILD OU LANCER DE SERVEUR DEV SANS AUTORISATION OU AVANT DEPLOIEMENT**
9. **INTERDICTION DES MODALS.** Aucune fenêtre modale / dialog superposé pour une création, une édition, une gestion (comptes, paramètres) ou une composition. **Toujours une page dédiée** (route propre) ou, à défaut, un **panneau inline** dans la vue. Les confirmations (suppression, etc.) sont **inline**, jamais en pop-up. Les `Modal`/`ConfirmDialog` (`app/_components/admin/dialog.tsx`) encore présents sont du **legacy à migrer** : ne **jamais** en ajouter de nouveaux. Radix `popover`/`select`/`tabs` restent autorisés (affordances transitoires non-modales).
---

## 1. Communication
- Toute conversation avec l’utilisateur se fait en FRANÇAIS.
- Les messages techniques (code, commits, doc) sont en ANGLAIS clair.
- Structure de réponse recommandée :
  1. Résumé concis
  2. Code (complet/partiel précisé)
  3. Explications
  4. Prochaines étapes suggérées

---

## 2. Documentation Workflow (Priorité absolue)

### 2.1 Emplacements obligatoires
```
/docs/
├── README.md                 # Index global
├── API_ROUTES.md             # Source de vérité des routes
├── PROJECT_STATUS.md         # Etat courant
├── JOURNAL.md                # Journal détaillé de chaque action
├── PLAN.md                   # Plan global (checklists & roadmap)
├── DATABASE.md               # Schéma PostgreSQL
├── SECURITY.md               # Sécurité / auth / permissions
├── CHARTE_GRAPHIQUE.md       # Design system
├── ARCHITECTURE.md           # Architecture technique
├── DATA_ARCHITECTURE.md      # Séparation données système/business
├── FEATURES.md               # Fonctionnalités
├── ISSUES.md                 # Gestion des issues GitHub (templates, labels, workflow)
├── logging/                  # Documentation logging
└── features/                 # Dossiers par feature
    ├── DASHBOARD.md
    ├── IMPORT_MODULE.md
    ├── IMPORT.md
    ├── AGGREGATOR_ROADMAP.md
    └── DOCUMENTATION_SYSTEM.md
```
**Tous ces fichiers/dossiers doivent exister. Créer et maintenir si manquants.**

### 2.2 Mise à jour obligatoire (à chaque modification)
1. `/docs/JOURNAL.md`
2. `/docs/API_ROUTES.md` (si route touchée)
3. `/docs/PROJECT_STATUS.md`
4. `/docs/PLAN.md` (mettre à jour sections/checkboxes seulement après validation utilisateur)

### 2.3 Mise à jour conditionnelle (selon impact)
5. `/docs/README.md`
6. `/docs/DATABASE.md`
7. `/docs/SECURITY.md`
8. `/docs/CHARTE_GRAPHIQUE.md`
9. `/docs/ARCHITECTURE.md`
10. `/docs/DATA_ARCHITECTURE.md`
11. `/docs/FEATURES.md`
12. `/docs/BUGS.md`
13. `/docs/DECISIONS.md`
14. `/docs/DOCUMENTATION_FEATURES.md`
15. `/docs/ISSUES.md` (si évolution du workflow issues)
16. `/docs/logging/…`

### 2.4 Règles spécifiques
- Copier/coller **sans exception** le format des tables dans `API_ROUTES.md`.
- `PLAN.md` : cases à cocher uniquement après validation explicite de l’utilisateur.
- Toute nouvelle page/composant UI doit être documentée dans `CHARTE_GRAPHIQUE.md` et éventuellement `features/`.

---

## 3. Code & Qualité
- Code en anglais, lisible, peu ou pas de commentaires (juste l’essentiel).
- Respect des conventions existantes (Tailwind, services FastAPI, SQLAlchemy 2.0).
- Commits en anglais, préfixes standards : `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
- Avant chaque commit : compilation OK, tests OK, linter OK, documentation OK.
- Ne jamais insérer la mention co-authored, ni aucune mention autres
---

## 4. Données & Architecture

   ```bash
   docker compose exec backend bash /app/backend/scripts/backup_db.sh
   ```

## 5. Design & Frontend
- Tailwind CSS is the styling backbone; use tokens (colors, typography, radius, shadows, spacing density) and map them in `tailwind.config`.
- Use Radix UI primitives for behavior (popover, select, tabs) without enforcing a visual style.
- **No modal overlays (see Golden Rule 9):** forms, management and composition flows live on a **dedicated page** or an **inline panel**; confirmations are inline. Do not add Radix `dialog`/`Modal`/`ConfirmDialog` for new features.
- shadcn/ui is a starting kit: copy the code, adapt to the design system, and replace anything that does not match.
- Three.js and Spline are allowed for 3D/interactive visuals when they match the design intent.

---

## 6. Sécurité
- Documenter toute évolution sécurité dans `/docs/SECURITY.md`.
- Sessions HTTPOnly, expiration roulante, validation rigoureuse des imports.
- Respecter les décisions enregistrées dans `/docs/DECISIONS.md`.
- Tout formulaire HTML doit inclure `{{ csrf_input(request) }}` (ou laisser le script `layout/base.html` l’ajouter) et s’appuyer sur le middleware CSRF.
- CORS : configurer `CORS_ALLOWED_ORIGINS` (pas de wildcard hors développement) avant toute exposition publique.

---

## 7. Outils & Bonnes pratiques
- Préférer `rg`, `sed`, scripts `python` rapides pour rechercher/modifier.
- Utiliser TODO/plan quand une tâche nécessite > 3 étapes.
- Ne jamais créer de fichiers inutiles à la racine.
- CI/CD : workflow `.github/workflows/ci.yml` (lint, `alembic upgrade head`, pytest).
- Prendre le temps de lire, analyser, tester, documenter, même si cela demande plus de ressources.

---

## 8. Checklist de session
- [ ] Code fonctionnel et testé
- [ ] `/docs/JOURNAL.md` mis à jour
- [ ] `/docs/API_ROUTES.md` mis à jour si nécessaire
- [ ] `/docs/PLAN.md` synchronisé (cases validées par l’utilisateur uniquement)
- [ ] Autres docs impactés mis à jour
- [ ] Commit propre et descriptif
- [ ] Aucun fichier temporaire oublié

---

## 9. Rappel
> Pas de route sans doc, pas d'action sans journal, pas de modification sans documentation complète. Toujours vérifier la charte graphique avant tout visuel. Toujours viser la complétude, jamais la vitesse.

## 10. GitHub Issues Management

> **⚠️ IMPORTANT : Toujours consulter `/docs/ISSUES.md` avant de créer une issue.** Ce fichier contient les templates complets, exemples et checklist à suivre.

### 11.1 Règles obligatoires
- Toute nouvelle tâche, bug ou feature doit être créée comme issue GitHub.
- **Toujours suivre les templates définis dans `/docs/ISSUES.md`** : Feature, Bug, Improvement, Task.
- Respecter le format de titre : `[Type]: Description` (ex: `[Feature]: Auto-détection Qualirepar`).

### 11.2 Champs à remplir

#### Sur l'issue GitHub
| Champ | Obligatoire | Description |
|-------|-------------|-------------|
| Template | ✅ | Feature, Bug, Improvement, ou Task |
| Label | ✅ | `enhancement`, `bug`, ou `task` |
| Type natif | ✅ | Feature, Bug, ou Task (sélecteur GitHub) |
| Assignee | ✅ | Personne responsable |

#### Sur le projet (Dashboard features)
| Champ | Obligatoire | Options |
|-------|-------------|---------|
| Status | ✅ | Feature to develop → Ready → In progress → In review → Done |
| Module | ✅ | Qualirepar, Aggregator, Autres |
| Issue types | ✅ | Bug, Feature, Enhancement, Task, Epic, Story |
| Priority | ✅ | P0 (critique) → P4 (backlog) |

### 11.3 Workflow
1. Créer l'issue avec le bon template
2. Ajouter le label approprié
3. Sélectionner le type natif GitHub
4. Assigner à quelqu'un
5. Ajouter au projet "Dashboard features"
6. Remplir tous les champs projet (Status, Module, Issue types, Priority)

---

## 12. Secrets & Environnement (.env) — RÈGLE ABSOLUE

> **TOUS les secrets, clés et tokens vivent dans `.env` (à la racine, git-ignoré). On ne les écrit JAMAIS en clair dans le code, les commandes du terminal, les commits ou la documentation.**

### 12.1 Principes non négociables
1. **Toujours lire les clés depuis `.env`** (ou `process.env`), jamais de valeur en dur.
2. **Ne jamais réafficher / réécrire un secret en clair** dans le terminal, un fichier suivi par git, ou un message. Seul `.env` contient les valeurs.
3. Pour exécuter une action nécessitant un secret (provisionner la DB, appliquer une migration, appeler une API) :
   ```bash
   set -a; source .env; set +a   # charge les variables
   curl -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" ...
   ```
   On référence `$VARIABLE`, jamais la valeur littérale.
4. **`.env` ne doit JAMAIS être commité.** Vérifier qu'il est bien dans `.gitignore` (`.env`, `.env.local`, `.env.*.local`).
5. Tout nouveau token/clé → l'ajouter dans `.env` **et** documenter son nom + usage dans cette section. Mettre à jour `.env.example` (clés vides, jamais de valeur réelle).

### 12.2 Clés connues
| Variable | Usage | Exposée client ? |
|----------|-------|:----------------:|
| `SUPABASE_ACCESS_TOKEN` | Token Management API / CLI Supabase (créer projet, appliquer migrations, lire les clés). `Authorization: Bearer $SUPABASE_ACCESS_TOKEN` | ❌ Jamais |
| `SUPABASE_PROJECT_REF` | Référence du projet **préprod** Supabase (`quickfundPreprod` = `vysqrahewfxamwxabhnh`) | ❌ |
| `SUPABASE_DB_PASSWORD` | Mot de passe Postgres du projet (connexion directe / `db push`) | ❌ Jamais |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet, client navigateur | ✅ (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon (RLS appliquée), client navigateur | ✅ (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé privilégiée (bypass RLS) pour opérations serveur uniquement | ❌ Jamais côté client |
| `SUPABASE_PROD_PROJECT_REF` | Référence du projet **prod** Supabase (`quickfundProd` = `aqwenqsxdubyhhjkfekh`) | ❌ |
| `SUPABASE_PROD_DB_PASSWORD` | Mot de passe Postgres du projet **prod** | ❌ Jamais |
| `SUPABASE_PROD_URL` | URL du projet prod (→ `NEXT_PUBLIC_SUPABASE_URL` sur l'hôte de prod) | ✅ (public) |
| `SUPABASE_PROD_ANON_KEY` | Clé anon prod, RLS appliquée (→ `NEXT_PUBLIC_SUPABASE_ANON_KEY` sur l'hôte de prod) | ✅ (public) |
| `SUPABASE_PROD_SERVICE_ROLE_KEY` | Clé service_role prod, bypass RLS (→ `SUPABASE_SERVICE_ROLE_KEY` sur l'hôte de prod) | ❌ Jamais côté client |
| `NEXT_PUBLIC_FIREBASE_*` | Config Firebase (stockage long terme) | ✅ |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Formulaire de contact | ❌ |

### 12.3 Appliquer des migrations / SQL
- Endpoint Management API : `POST https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_REF/database/query` avec `{"query": "..."}` et le header `Authorization: Bearer $SUPABASE_ACCESS_TOKEN`.
- Les fichiers SQL sources vivent dans `supabase/migrations/` (ordre par préfixe) et `supabase/seed.sql`. On applique toujours depuis ces fichiers, jamais de SQL ad hoc non versionné pour le schéma.

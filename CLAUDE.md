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
- Use Radix UI primitives for behavior (dialog, popover, select, tabs) without enforcing a visual style.
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

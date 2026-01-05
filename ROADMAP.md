# Quickfund Website Roadmap

## Structure des Pages

```
app/[locale]/
│
├── (public)/                         ✅ Landing page (fait)
│   └── page.tsx
│
├── products/                         ✅ Produits (TERMINÉ)
│   ├── page.tsx                      ✅ Liste de tous les produits
│   ├── [slug]/                       ✅ Routing dynamique (template system)
│   │   └── page.tsx
│   ├── _config.ts                    ✅ Configuration des 8 produits
│   │
│   │   Produits disponibles:
│   │   - micro-credit                ✅ Micro-crédit (20€ - 500€)
│   │   - consumer                    ✅ Crédit conso (500€ - 5000€)
│   │   - professional                ✅ Crédit pro (1000€ - 10000€)
│   │   - student                     ✅ Prêt étudiant
│   │   - salary-advance              ✅ Avance sur salaire
│   │   - leasing                     ✅ Leasing
│   │   - loan-consolidation          ✅ Rachat de crédits
│   │   - financial-coaching          ✅ Coaching financier
│
├── features/                         🆕 Pourquoi nous (pages détail)
│   ├── page.tsx                      Vue d'ensemble
│   ├── transparency/                 Transparence totale
│   │   └── page.tsx
│   ├── atypical-profiles/            Profils atypiques
│   │   └── page.tsx
│   ├── coaching/                     Coaching financier
│   │   └── page.tsx
│   └── flexibility/                  Flexibilité totale
│       └── page.tsx
│
├── tools/                            🆕 Outils
│   ├── simulator/                    Simulateur de crédit
│   │   └── page.tsx
│   └── eligibility/                  Test d'éligibilité
│       └── page.tsx
│
├── legal/                            🆕 Pages légales
│   ├── page.tsx                      Mentions légales
│   ├── privacy/                      Politique de confidentialité
│   │   └── page.tsx
│   └── terms/                        CGU
│       └── page.tsx
│
├── contact/                          🆕 Contact
│   └── page.tsx
│
├── pricing/                          🆕 Tarifs
│   └── page.tsx
│
└── about/                            🆕 L'équipe
    └── page.tsx
```

---

## Navigation

### Header (traduit en 4 langues)
| Route | FR | EN | ET | ES |
|-------|-----|-----|-----|-----|
| `/` | Accueil | Home | Avaleht | Inicio |
| `/products` | Produits | Products | Tooted | Productos |
| `/features` | Pourquoi nous | Why us | Miks meie | Por qué nosotros |
| `/pricing` | Tarifs | Pricing | Hinnad | Tarifas |

### Footer - Produits
| Route | FR | EN |
|-------|-----|-----|
| `/products/micro-credit` | Micro-crédit | Micro-loan |
| `/products/consumer` | Crédit conso | Consumer credit |
| `/products/professional` | Crédit pro | Business credit |
| `/products/student` | Prêt étudiant | Student loan |
| `/products/salary-advance` | Avance sur salaire | Salary advance |
| `/products/leasing` | Leasing | Leasing |
| `/products/loan-consolidation` | Rachat de crédits | Loan consolidation |
| `/products/financial-coaching` | Coaching financier | Financial coaching |

### Footer - Légal
| Route | FR | EN |
|-------|-----|-----|
| `/legal` | Mentions légales | Legal notice |
| `/legal/privacy` | Politique de confidentialité | Privacy policy |
| `/legal/terms` | CGU | Terms of use |

---

## Pages par Catégorie

### 1. Produits (`/products/*`)
Pages de présentation détaillée de chaque produit :
- Description complète
- Montants min/max
- Taux (TAEG)
- Conditions d'éligibilité
- Processus de demande
- FAQ spécifique au produit
- CTA vers simulateur

### 2. Pourquoi nous (`/features/*`)
Pages expliquant les avantages Quickfund :
- **Transparence** : Comment on explique les refus, pas de frais cachés
- **Profils atypiques** : Freelances, étudiants, refusés bancaires
- **Coaching** : Accompagnement budget inclus
- **Flexibilité** : Reports, remboursement anticipé gratuit

### 3. Outils (`/tools/*`)
- **Simulateur** : Calcul mensualités, TAEG, éligibilité rapide
- **Test d'éligibilité** : Questionnaire rapide avant demande complète

### 4. Légal (`/legal/*`)
- **Mentions légales** : Infos société, Finantsinspektsioon, siège social
- **Confidentialité** : RGPD, cookies, droits utilisateurs
- **CGU** : Conditions générales d'utilisation

### 5. Autres
- **Pricing** : Grille tarifaire, comparatif produits
- **About** : L'équipe, mission, valeurs
- **Contact** : Formulaire, coordonnées, FAQ générale

---

## Internationalisation (i18n)

### Langues supportées
- 🇪🇪 **Estonien** (défaut) - `/et/*`
- 🇫🇷 **Français** - `/fr/*`
- 🇬🇧 **Anglais** - `/en/*`
- 🇪🇸 **Espagnol** - `/es/*`

### Fichiers de traduction
```
messages/
├── en/
│   ├── common.json          ✅ Navigation, footer, légal, UI
│   ├── home.json            ✅ Landing page
│   ├── products.json        ✅ Liste des produits
│   └── products/            ✅ Détail par produit (NEW)
│       ├── micro-credit.json    ✅
│       ├── consumer.json        ✅
│       ├── professional.json    ✅
│       ├── student.json         ✅
│       ├── salary-advance.json  ✅
│       ├── leasing.json         ✅
│       ├── loan-consolidation.json ✅
│       └── financial-coaching.json ✅
├── fr/
│   ├── common.json          ✅
│   ├── home.json            ✅
│   ├── products.json        ✅
│   └── products/            ✅ (même structure que EN)
├── et/
│   ├── common.json          ✅
│   └── home.json            ✅
└── es/
    ├── common.json          ✅
    └── home.json            ✅
```

### À créer pour les nouvelles pages
```
messages/[locale]/
├── features.json        🆕 Pages "pourquoi nous"
├── tools.json           🆕 Simulateur, éligibilité
├── legal.json           🆕 Mentions légales, CGU, confidentialité
├── pricing.json         🆕 Page tarifs
├── about.json           🆕 Page équipe
└── contact.json         🆕 Page contact
```

---

## Composants Réutilisables

### Existants ✅
- `SiteHeader` - Header avec nav traduite
- `SiteFooter` - Footer avec liens traduits
- `Preloader` - Animation de chargement
- `RegulatoryDisclaimer` - Bandeau légal premier accès
- `CookieConsent` - Bandeau cookies
- `LanguageSwitcher` - Sélecteur de langue
- `Magnetic` - Effet magnétique sur boutons
- `HorizontalSection` - Scroll horizontal

### Composants Produits ✅ (NEW)
- `ProductPageTemplate` - Template modulaire pour pages produits
- `ProductHero` - Section hero (variants: default, centered)
- `ProductProblem` - Section problème (dark/light background)
- `ProductSolution` - Section solution (variants: bento, grid, list)
- `ProductAudience` - Section audience (variants: offset, grid, centered)
- `ProductProcess` - Section process (variants: stepped, timeline, cards)
- `ProductCTA` - Section CTA finale (dark/light background)

### Composants Outils ✅ (NEW)
- `SimulatorWidget` - Widget simulateur avec calculs (6 produits, sliders, résultats)

### À créer 🆕
- `FeatureCard` - Carte fonctionnalité (pour /features)
- `PricingTable` - Tableau comparatif tarifs
- `ContactForm` - Formulaire de contact
- `EligibilityTest` - Test d'éligibilité rapide
- `FAQAccordion` - Accordion pour FAQ
- `LegalSection` - Section légale formatée

---

## Priorité de Développement

### Phase 1 - Produits (Core) ✅ TERMINÉ
1. [x] `/products` - Liste des produits (vue d'ensemble)
2. [x] `/products/micro-credit` - Micro-crédit (20€-500€) - Core
3. [x] `/products/consumer` - Crédit conso (500€-5000€) - Core
4. [x] `/products/professional` - Crédit pro (1000€-10000€) - Core

### Phase 2 - Produits (Actifs) ✅ TERMINÉ
5. [x] `/products/student` - Prêt étudiant
6. [x] `/products/salary-advance` - Avance sur salaire
7. [x] `/products/leasing` - Leasing
8. [x] `/products/loan-consolidation` - Rachat de crédits
9. [x] `/products/financial-coaching` - Coaching financier

> **Note:** Système de template modulaire créé avec 6 sections réutilisables (Hero, Problem, Solution, Audience, Process, CTA). Traductions complètes EN/FR pour tous les produits.

### Phase 3 - Outils 🔄 EN COURS
10. [x] `/tools/simulator` - Simulateur de crédit ✅
11. [ ] `/tools/eligibility` - Test d'éligibilité

### Phase 4 - Pages complémentaires
12. [ ] `/pricing` - Page tarifs
13. [ ] `/features` - Pourquoi nous (vue d'ensemble)
14. [ ] `/features/transparency` - Transparence totale
15. [ ] `/features/atypical-profiles` - Profils atypiques
16. [ ] `/features/coaching` - Coaching financier
17. [ ] `/features/flexibility` - Flexibilité totale
18. [ ] `/about` - L'équipe
19. [ ] `/contact` - Contact

### Phase 5 - Légal (en dernier, basé sur les produits définis)
20. [ ] `/legal` - Mentions légales
21. [ ] `/legal/privacy` - Politique de confidentialité (RGPD)
22. [ ] `/legal/terms` - CGU

---

## Notes Techniques

### Routing i18n
- Toutes les routes utilisent le préfixe locale : `/fr/products`, `/en/products`
- Middleware gère la détection automatique de langue
- Redirection automatique vers la langue détectée

### SEO
- Chaque page doit avoir ses meta tags traduits
- Sitemap multilingue
- Balises hreflang pour Google

### Performance
- Pages statiques quand possible (SSG)
- Images optimisées avec next/image
- Lazy loading des composants lourds

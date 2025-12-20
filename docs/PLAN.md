# Plan

## Landing Page - Refonte Complète (Style Awwwards Premium)

> **Objectif :** Créer une expérience immersive, cinématique, digne des meilleurs sites Awwwards. Animations GSAP omniprésentes, éléments 3D, micro-interactions, easter eggs.

---

### Architecture des Sections

| # | Section | Description | Animations clés |
|---|---------|-------------|-----------------|
| 0 | **Preloader** | Entrée premium avec logo/texte animé | Counter %, text reveal, slide out |
| 1 | **Hero** | Plein écran cinématique avec 3D | Split text, orbe 3D interactive, parallax |
| 2 | **Brand Statement** | Grande phrase d'accroche | Text reveal ligne par ligne, parallax subtil |
| 3 | **Horizontal Scroll** | Showcase des produits crédit (3-4 panels) | Pin + scrub, parallax images, counters |
| 4 | **Stats** | Chiffres clés (clients, montants, vitesse) | Counters animés, stagger reveal |
| 5 | **Process** | Comment ça marche (3-4 étapes) | Timeline animée, icons qui apparaissent |
| 6 | **Features Grid** | Services détaillés avec hover premium | Image reveal au hover, scale effects |
| 7 | **Testimonials** | Citations clients | Stack/carousel animé |
| 8 | **CTA Final** | Conversion avec impact | Grand titre animé, magnetic CTA |
| 9 | **Footer** | Élégant, complet | Reveal au scroll, hover effects |

---

### Composants à Créer

#### Animations GSAP (app/_components/animations/)
- [ ] `split-text.tsx` - Texte animé caractère/mot/ligne
- [ ] `scroll-reveal.tsx` - Fade in/up/scale au scroll
- [ ] `parallax-image.tsx` - Images avec effet de profondeur
- [ ] `counter.tsx` - Compteur animé (0 → valeur)
- [ ] `text-marquee.tsx` - Texte défilant infini
- [ ] `magnetic-wrapper.tsx` - Wrapper magnetic générique
- [ ] `hover-reveal.tsx` - Révélation d'image au hover

#### 3D Three.js (app/_components/three/)
- [ ] `hero-orb.tsx` - Sphère/torus métallique gold animée
- [ ] `floating-particles.tsx` - Particules flottantes subtiles
- [ ] `noise-background.tsx` - Fond avec grain/noise animé

#### UI Components (app/_components/ui/)
- [ ] `scroll-progress.tsx` - Barre de progression globale
- [ ] `section-indicator.tsx` - Dots de navigation latéraux
- [ ] `cursor-follower.tsx` - Refonte du cursor custom
- [ ] `magnetic-button.tsx` - Amélioration avec variants
- [ ] `animated-link.tsx` - Liens avec underline animé

#### Layout (app/_components/layout/)
- [ ] `section.tsx` - Wrapper section avec animations auto
- [ ] `container.tsx` - Container responsive
- [ ] `horizontal-section.tsx` - Section scroll horizontal réutilisable

---

### Structure des Fichiers (Cible)

```
app/
├── (public)/
│   ├── page.tsx                    # Landing (imports sections)
│   ├── layout.tsx                  # SmoothScroll + Header + Footer
│   └── _sections/                  # Sections de la landing
│       ├── hero.tsx
│       ├── brand-statement.tsx
│       ├── horizontal-products.tsx
│       ├── stats.tsx
│       ├── process.tsx
│       ├── features-grid.tsx
│       ├── testimonials.tsx
│       └── cta-final.tsx
│
├── _components/
│   ├── animations/                 # GSAP components
│   │   ├── split-text.tsx
│   │   ├── scroll-reveal.tsx
│   │   ├── parallax-image.tsx
│   │   ├── counter.tsx
│   │   ├── text-marquee.tsx
│   │   └── hover-reveal.tsx
│   │
│   ├── three/                      # 3D components
│   │   ├── hero-orb.tsx
│   │   ├── floating-particles.tsx
│   │   └── noise-background.tsx
│   │
│   ├── ui/                         # UI primitives
│   │   ├── magnetic-button.tsx
│   │   ├── animated-link.tsx
│   │   ├── scroll-progress.tsx
│   │   ├── section-indicator.tsx
│   │   └── cursor-follower.tsx
│   │
│   ├── layout/                     # Layout components
│   │   ├── section.tsx
│   │   ├── container.tsx
│   │   └── horizontal-section.tsx
│   │
│   ├── preloader.tsx               # Refonte
│   ├── site-header.tsx             # Amélioration
│   ├── site-footer.tsx             # Refonte
│   └── smooth-scroll.tsx           # Garder (Lenis)
```

---

### Contenu des Sections (Quickfund)

#### 1. Hero
- **Titre:** "CRÉDIT ACCESSIBLE" (ligne 1) + "TRANSPARENT & RAPIDE" (ligne 2)
- **Sous-titre:** "De 20€ à 10 000€. Réponse en 24h. On vous dit pourquoi."
- **CTA:** "Simuler mon crédit" (magnetic button gold)
- **3D:** Orbe métallique gold qui réagit à la souris

#### 2. Brand Statement
- **Texte:** "Les banques vous ignorent. Nous, on vous écoute. Crédit transparent pour ceux que le système oublie."
- **Style:** Grande typo serif, révélation progressive

#### 3. Horizontal Scroll - Produits
- **Panel 1:** Micro-crédit (20-500€) - Image + description
- **Panel 2:** Crédit conso (500-5000€)
- **Panel 3:** Crédit pro (1000-10000€)
- **Panel 4:** CTA "Tous nos produits"

#### 4. Stats
- **Stat 1:** "24h" - Réponse garantie
- **Stat 2:** "20€" - Montant minimum
- **Stat 3:** "100%" - Transparence
- **Stat 4:** "0€" - Frais cachés

#### 5. Process
- **Étape 1:** Simulez (2 min)
- **Étape 2:** Envoyez (documents simples)
- **Étape 3:** Réponse (24h max)
- **Étape 4:** Recevez (virement instantané)

#### 6. Features Grid
- Transparence totale
- Profils atypiques acceptés
- Coaching financier inclus
- Flexibilité (report, restructuration)

#### 7. Testimonials
- 3-4 témoignages clients (à créer/récupérer)

#### 8. CTA Final
- **Titre:** "Prêt à obtenir votre crédit ?"
- **CTA:** "Commencer ma demande"

---

### Ordre d'Implémentation

#### Phase 1 : Fondations
1. [ ] Créer structure dossiers (`_sections/`, `animations/`, `three/`, `layout/`)
2. [ ] Composant `split-text.tsx` (réutilisé partout)
3. [ ] Composant `scroll-reveal.tsx` (réutilisé partout)
4. [ ] Composant `section.tsx` (wrapper)
5. [ ] Refonte `preloader.tsx`

#### Phase 2 : Hero
6. [ ] Composant `hero-orb.tsx` (3D)
7. [ ] Section `hero.tsx` complète
8. [ ] Améliorer `cursor-follower.tsx`

#### Phase 3 : Sections principales
9. [ ] Section `brand-statement.tsx`
10. [ ] Composant `horizontal-section.tsx`
11. [ ] Section `horizontal-products.tsx`
12. [ ] Composant `counter.tsx`
13. [ ] Section `stats.tsx`

#### Phase 4 : Sections secondaires
14. [ ] Section `process.tsx`
15. [ ] Composant `hover-reveal.tsx`
16. [ ] Section `features-grid.tsx`
17. [ ] Section `testimonials.tsx`
18. [ ] Section `cta-final.tsx`

#### Phase 5 : Polish
19. [ ] Refonte `site-footer.tsx`
20. [ ] Améliorer `site-header.tsx`
21. [ ] Composant `scroll-progress.tsx`
22. [ ] Easter eggs & micro-interactions
23. [ ] Tests responsive (mobile)
24. [ ] Optimisation performance

---

### Animations Détaillées par Section

#### Hero
```
Timeline (après preloader):
1. Orbe 3D fade in + scale (0.8s)
2. Ligne 1 titre: split chars reveal stagger (1s)
3. Ligne 2 titre: split chars reveal stagger (1s, delay 0.3s)
4. Sous-titre: fade up (0.6s)
5. CTA: scale in elastic (0.5s)
6. Scroll indicator: fade in loop
```

#### Brand Statement
```
ScrollTrigger (scrub):
- Chaque ligne révélée progressivement
- Opacity 0.3 → 1 au passage
- Légère translation Y
```

#### Horizontal Scroll
```
ScrollTrigger (pin + scrub):
- Container pinné
- Panels translateX de 0 à -300%
- Images parallax (vitesse différente)
- Numbers count up au passage
```

#### Stats
```
ScrollTrigger (toggle):
- Counters démarrent à l'entrée viewport
- Stagger 0.2s entre chaque stat
- Scale subtle au complete
```

---

### Easter Eggs Prévus

| Trigger | Effet |
|---------|-------|
| Hover logo | Léger glitch/distorsion |
| Hover CTA | Particules gold qui explosent |
| Konami code | Animation spéciale |
| Double-click anywhere | Ripple effect gold |
| Scroll très rapide | Blur motion temporaire |
| Idle 10s sur hero | Orbe pulse/breathe |

---

### Stack Technique Confirmée

| Tech | Usage |
|------|-------|
| Next.js 14 | Framework |
| GSAP 3.14 + ScrollTrigger | Animations |
| Lenis | Smooth scroll |
| Three.js | 3D (hero orb, particules) |
| Tailwind | Styling |
| Radix UI | Primitives accessibles |

---

### Métriques de Succès

- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 95
- [ ] Animations fluides 60fps
- [ ] Mobile responsive complet
- [ ] Temps de chargement < 3s
- [ ] Preloader < 2s

---

## Autres (Backlog)

### Data & Auth
- [ ] Define Supabase schema for dynamic data.
- [ ] Define Firebase collections for long-term data.
- [ ] Decide auth flow and session storage.

### UI Library
- [ ] Curate shadcn component list to adopt.
- [ ] Replace defaults with project design system styles.
- [ ] Add Radix primitives where behavior is needed.

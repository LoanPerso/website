# Documentation Business - Quickfund

> **Base de connaissance stratégique et opérationnelle de Quickfunds**
> Dernière mise à jour : Décembre 2025

---

## 🎯 Objectif de ce dossier

Ce dossier `/docs/business/` est la **source de vérité unique** pour toutes les informations stratégiques, financières et opérationnelles de Quickfund. Il sert à :

1. **Centraliser les connaissances** - Tout ce qui concerne l'entreprise est documenté ici
2. **Faciliter les prises de décision** - Données structurées et à jour pour décider rapidement
3. **Onboarder l'équipe** - Nouveaux membres comprennent l'entreprise en lisant ces docs
4. **Préparer les levées de fonds** - Data room prête, investisseurs informés
5. **Assister l'IA** - Claude peut répondre précisément sur l'entreprise en lisant ces fichiers

---

## 🤖 Rôle de Claude dans ce dossier

Claude (l'IA) utilise ce dossier pour :

### Ce que Claude fait
- **Lit et analyse** les documents pour comprendre l'état de l'entreprise
- **Pose des questions structurées** pour compléter les informations manquantes
- **Calcule automatiquement** les métriques (burn rate, runway, breakeven, etc.)
- **Génère des visualisations** (dashboard.html) à partir des données
- **Met à jour les documents** quand de nouvelles informations sont fournies
- **Identifie les alertes** (ex: fin programme OVH en 2027)
- **Préserve les questions** non répondues pour complétion future

### Ce que Claude ne fait pas
- Ne devine pas les informations non fournies
- Ne prend pas de décisions stratégiques à votre place
- Ne modifie pas les chiffres sans validation

### Comment interagir
```
Toi: "Mets à jour les finances avec ces infos : [données]"
Claude: Met à jour le fichier concerné + recalcule les métriques

Toi: "Quelles questions restent à répondre ?"
Claude: Liste les "Questions à répondre" de chaque fichier

Toi: "Génère un dashboard"
Claude: Crée/met à jour dashboard.html avec les dernières données
```

---

## 📊 Dashboard interactif

**[📈 Ouvrir le Dashboard](./dashboard.html)** - Visualisation graphique des données financières

Le dashboard affiche :
- KPIs clés (trésorerie, burn rate, runway, breakeven)
- Projection de trésorerie sur 24 mois
- Répartition du burn rate
- Scénarios MRR vs Burn
- Alerte critique fin 2027
- Structure de détention

---

## 📁 Structure des fichiers

```
/docs/business/
├── README.md                      ← Vous êtes ici
├── dashboard.html                 📊 Dashboard interactif
│
├── strategy/                      📊 Stratégie
│   ├── VISION.md                  Mission, vision, valeurs
│   ├── STRATEGY.md                Objectifs, OKRs, plan
│   └── COMPETITIVE.md             Concurrence, différenciateurs
│
├── products/                      🛍️ Produits & Marché
│   ├── PRODUCTS.md                Catalogue produits
│   ├── PRICING.md                 Stratégie pricing
│   └── SEGMENTS.md                Segments clients, personas
│
├── gtm/                           🚀 Go-to-Market
│   ├── GTM.md                     Acquisition, funnel, marketing
│   ├── SALES.md                   Organisation commerciale
│   └── PARTNERSHIPS.md            Partenariats
│
├── finance/                       💰 Finance ✅ COMPLÉTÉ
│   ├── FINANCIALS.md              P&L, budget, projections
│   ├── FUNDING.md                 Prêt, OVH, structure
│   └── METRICS.md                 KPIs, OKRs Q1 2026
│
├── organization/                  👥 Organisation ✅ COMPLÉTÉ
│   ├── TEAM.md                    Équipe, salaires
│   ├── HIRING.md                  Recrutement
│   └── CULTURE.md                 Valeurs, culture
│
├── operations/                    ⚙️ Opérations
│   ├── OPERATIONS.md              Process ops, incidents
│   ├── SUPPORT.md                 Support client, SLA
│   └── INFRASTRUCTURE.md          Infra technique, DC
│
└── legal/                         ⚖️ Legal & Compliance ✅ COMPLÉTÉ
    ├── LEGAL.md                   Structure OÜ estonienne
    └── COMPLIANCE.md              RGPD, certifications
```

---

## 📋 État de complétion

| Catégorie | Statut | Progression |
|-----------|--------|-------------|
| 💰 Finance | ✅ Complété | Données réelles, questions préservées |
| 👥 Organisation | ✅ Complété | Équipe et salaires documentés |
| ⚖️ Legal | ✅ Complété | Structure OÜ documentée |
| 📊 Stratégie | ✅ Complété | Vision, Strategy, Competitive |
| 🛍️ Produits | 🔄 À compléter | Templates prêts |
| 🚀 Go-to-Market | 🔄 À compléter | Templates prêts |
| ⚙️ Opérations | 🔄 À compléter | Templates prêts |

---


## 📖 Index détaillé

### 📊 Stratégie (`/strategy/`)
| Fichier | Description | Statut |
|---------|-------------|--------|
| [VISION.md](./strategy/VISION.md) | Mission, vision long terme, valeurs, positionnement marché | ✅ |
| [STRATEGY.md](./strategy/STRATEGY.md) | Objectifs 12/24 mois, OKRs, plan de croissance, risques | ✅ |
| [COMPETITIVE.md](./strategy/COMPETITIVE.md) | Analyse concurrentielle, différenciateurs, menaces | ✅ |

### 🛍️ Produits & Marché (`/products/`)
| Fichier | Description | Statut |
|---------|-------------|--------|
| [PRODUCTS.md](./products/PRODUCTS.md) | Catalogue produits détaillé, roadmap produit | 🔄 |
| [PRICING.md](./products/PRICING.md) | Stratégie pricing, grilles tarifaires, benchmark | 🔄 |
| [SEGMENTS.md](./products/SEGMENTS.md) | Segments clients, personas, ICP, géographie | 🔄 |

### 🚀 Go-to-Market (`/gtm/`)
| Fichier | Description | Statut |
|---------|-------------|--------|
| [GTM.md](./gtm/GTM.md) | Canaux d'acquisition, funnel, marketing, rétention | 🔄 |
| [SALES.md](./gtm/SALES.md) | Organisation commerciale, process vente, pipeline | 🔄 |
| [PARTNERSHIPS.md](./gtm/PARTNERSHIPS.md) | Partenariats tech/channel, programme partenaire | 🔄 |

### 💰 Finance (`/finance/`)
| Fichier | Description | Statut |
|---------|-------------|--------|
| [FINANCIALS.md](./finance/FINANCIALS.md) | P&L, burn rate, trésorerie, projections | ✅ |
| [FUNDING.md](./finance/FUNDING.md) | Prêt SEB, programme OVH, structure holding, garanties | ✅ |
| [METRICS.md](./finance/METRICS.md) | KPIs SaaS, métriques, OKRs Q1 2026 | ✅ |

### 👥 Organisation (`/organization/`)
| Fichier | Description | Statut |
|---------|-------------|--------|
| [TEAM.md](./organization/TEAM.md) | Équipe actuelle, salaires, organigramme | ✅ |
| [HIRING.md](./organization/HIRING.md) | Plan de recrutement, process, rémunération | 🔄 |
| [CULTURE.md](./organization/CULTURE.md) | Valeurs, culture de travail, remote-first | 🔄 |

### ⚙️ Opérations (`/operations/`)
| Fichier | Description | Statut |
|---------|-------------|--------|
| [OPERATIONS.md](./operations/OPERATIONS.md) | Monitoring, incidents, change management, DR | 🔄 |
| [SUPPORT.md](./operations/SUPPORT.md) | Organisation support, SLA, outils, self-service | 🔄 |
| [INFRASTRUCTURE.md](./operations/INFRASTRUCTURE.md) | Datacenters, compute, storage, network, coûts | 🔄 |

### ⚖️ Legal & Compliance (`/legal/`)
| Fichier | Description | Statut |
|---------|-------------|--------|
| [LEGAL.md](./legal/LEGAL.md) | Structure OÜ estonienne, contrats, PI, assurances | ✅ |
| [COMPLIANCE.md](./legal/COMPLIANCE.md) | RGPD, ISO 27001, HDS, SecNumCloud, NIS2 | 🔄 |

---

## 🔧 Comment utiliser

### Compléter les fichiers
1. Ouvrez le fichier concerné
2. Cherchez les sections `**Questions à répondre :**`
3. Répondez aux questions en fournissant les infos à Claude
4. Claude mettra à jour le fichier et cochera `[x]`

### Demander à Claude
```
"Quelles sont les questions non répondues dans finance ?"
"Mets à jour FUNDING.md avec : [nouvelles infos]"
"Génère le dashboard avec les dernières données"
"Calcule le nouveau runway si on réduit le burn de 20%"
```

### Priorité de complétion suggérée
1. ✅ **finance/** - État financier (FAIT)
2. ✅ **organization/TEAM.md** - Équipe (FAIT)
3. ✅ **legal/LEGAL.md** - Structure (FAIT)
4. 🔄 **strategy/VISION.md** - Identité
5. 🔄 **products/PRODUCTS.md** - Offre
6. 🔄 **products/SEGMENTS.md** - Clients

---

## 📅 Fréquence de mise à jour

| Type de changement | Fréquence |
|-------------------|-----------|
| Chiffres financiers (MRR, burn) | Mensuel |
| Équipe (arrivées/départs) | Immédiat |
| Stratégie/Vision | Trimestriel |
| Produits/Pricing | À chaque changement |
| Dashboard | Automatique (régénéré par Claude) |

---

**Total : 20 fichiers + 1 dashboard dans 7 dossiers**

*Ce dossier est maintenu par Claude Code et mis à jour lors de chaque session de travail.*

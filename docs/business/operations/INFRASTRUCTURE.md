# Infrastructure Technique - Quickfund

> **Dernière mise à jour :** Décembre 2025

---

## Vue d'ensemble

*Quelle est l'architecture technique de Quickfund ?*

| Élément | Valeur |
|---------|--------|
| Architecture | Monolithique (API + Frontend) |
| Hébergement actuel | Google Cloud Platform (GCP) |
| Migration prévue | VMCloud (entreprise du groupe) |
| Responsable infra | Fondateur |
| Équipe dev | Fondateur uniquement |

---

## Stack technique

*Quelles technologies sont utilisées ?*

### Backend

| Composant | Technologie |
|-----------|-------------|
| Langage | Python |
| Framework | FastAPI |
| Base de données | PostgreSQL |
| ORM | SQLAlchemy (probable) |

### Frontend

| Composant | Technologie |
|-----------|-------------|
| Runtime | Node.js |
| Framework | React |
| Styling | À préciser |

### Avantages de cette stack

| Avantage | Description |
|----------|-------------|
| FastAPI | Performant, async, documentation auto (OpenAPI) |
| PostgreSQL | Robuste, ACID, adapté aux données financières |
| React | Écosystème mature, composants réutilisables |

---

## Hébergement

*Où tourne l'infrastructure ?*

### Situation actuelle

| Élément | Valeur |
|---------|--------|
| Cloud provider | Google Cloud Platform (GCP) |
| Région | Europe |
| Services utilisés | Compute, Cloud SQL, Storage |
| Coût mensuel | ~1 500€ (inclut dev + pré-prod) |

### Migration prévue

| Élément | Valeur |
|---------|--------|
| Nouveau provider | VMCloud |
| Raison | Entreprise du groupe Quickfund (propriétaire) |
| Avantage | Synergie groupe, coûts réduits, contrôle total infrastructure |
| Timeline | Q1-Q2 2026 |

---

## Services internes (développés en interne)

*Quickfund développe plusieurs outils en interne.*

| Service | Description | Avantage |
|---------|-------------|----------|
| Plateforme crédit | Core business | Contrôle total |
| Outil email | Envoi emails transactionnels | Indépendance |
| Outil comptabilité | Gestion compta, lié au comptable | Personnalisé |
| Signature électronique | Signature des contrats | Pas de coût tiers |
| Stockage documents | Documents clients | Données en interne |

*Pourquoi tant d'interne ?* Contrôle, indépendance, pas de dépendance à des SaaS tiers, coûts maîtrisés.

---

## Services tiers

*Quels services externes sont utilisés ?*

| Service | Fournisseur | Usage | Coût | Criticité |
|---------|-------------|-------|:----:|:---------:|
| Paiements | Stripe | Prélèvements, versements | 1.5% / transaction | Critique |
| Vérification identité (KYC) | Stripe Identity | Vérification clients | Inclus Stripe | Critique |
| SMS | Twilio | Alertes, notifications | Faible | Moyenne |
| Cloud (actuel) | GCP | Hébergement | ~1 500€/mois | Critique |
| Cloud (futur) | VMCloud | Hébergement | Réduit (groupe) | Critique |

### Dépendances critiques

| Service | Impact si indisponible | Alternative |
|---------|------------------------|-------------|
| Stripe | Impossible de payer/encaisser | Aucune immédiate |
| Twilio | Pas de SMS (emails en fallback) | Autre provider SMS |
| GCP/VMCloud | Site down | Basculer sur l'autre |

---

## Base de données

*Comment sont stockées les données ?*

### Configuration

| Élément | Valeur |
|---------|--------|
| SGBD | PostgreSQL |
| Hébergement | GCP (Cloud SQL probable) → VMCloud |
| Taille estimée | À mesurer |

### Données stockées

| Type | Sensibilité | Volume |
|------|:-----------:|:------:|
| Clients (KYC) | Haute | Moyen |
| Demandes crédit | Haute | Moyen |
| Contrats signés | Critique | Moyen |
| Historique paiements | Critique | Élevé |
| Documents uploadés | Haute | Élevé |

### Sécurité données

| Mesure | Statut |
|--------|:------:|
| Chiffrement en transit (HTTPS/TLS) | ✅ Oui |
| Chiffrement au repos | ✅ Oui (quasi-totalité) |
| Accès restreint (IAM) | ✅ Oui |
| Backups | ✅ Oui (tous les 2 jours) |

---

## Sécurité

*Comment la sécurité est-elle gérée ?*

### Mesures en place

| Mesure | Statut | Commentaire |
|--------|:------:|-------------|
| HTTPS partout | ✅ Oui | Obligatoire |
| Authentification sécurisée | ✅ Oui | - |
| KYC via Stripe Identity | ✅ Oui | Vérification automatisée |
| Conformité RGPD | ✅ Oui | Données en Europe |
| Données stockées en interne | ✅ Oui | Pas chez des tiers |

### Accès

| Élément | Valeur |
|---------|--------|
| Accès admin | Fondateur uniquement |
| MFA | ✅ Oui (GCP, services critiques) |
| Gestion secrets | Variables d'environnement |

---

## Architecture applicative

*Comment les composants s'articulent ?*

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTS                          │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              Frontend (React)                       │
│         Site public + Espace client                 │
└─────────────────────┬───────────────────────────────┘
                      │ API calls
┌─────────────────────▼───────────────────────────────┐
│            Backend (FastAPI/Python)                 │
│    API REST + Logique métier + Scoring              │
└───────┬─────────────┬─────────────┬─────────────────┘
        │             │             │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │PostgreSQL│   │ Stripe  │   │ Twilio  │
   │   DB    │   │Paiements│   │  SMS    │
   └─────────┘   │  + KYC  │   └─────────┘
                 └─────────┘
```

---

## Monitoring et alertes

*Comment surveille-t-on l'infrastructure ?*

| Élément | Statut | Outil |
|---------|:------:|-------|
| Uptime monitoring | ✅ Oui | GCP + alertes custom |
| Logs applicatifs | ✅ Oui | GCP Logging |
| Alertes erreurs | ✅ Oui | Notifications auto |
| Métriques perf | ✅ Oui | Monitoring GCP |

**Couverture :** Alertes en place sur tous les services critiques. Notification immédiate en cas de panne.

---

## Backups

*Comment sont gérées les sauvegardes ?*

| Élément | Valeur |
|---------|--------|
| Backup base de données | ✅ Oui (GCP automatique) |
| Backup documents | ✅ Oui |
| Fréquence | Tous les 2 jours |
| Rétention | Standard GCP |
| Test de restauration | À planifier |

---

## Coûts infrastructure

*Combien coûte l'infrastructure ?*

| Poste | Fournisseur | Coût/mois |
|-------|-------------|:---------:|
| Cloud (GCP) | Google | ~1 500€ |
| Stripe | Stripe | 1.5% / transaction |
| Twilio | Twilio | Faible (~quelques €) |
| Domaines | - | Faible |
| **Total fixe** | - | **~1 500-1 600€** |

*Note :* Migration vers VMCloud (groupe propriétaire) réduira significativement les coûts cloud.

---

## Avantages de l'architecture actuelle

| Avantage | Description |
|----------|-------------|
| Indépendance | Beaucoup d'outils internes |
| Contrôle | Pas de dépendance SaaS multiples |
| Coûts | Pas d'abonnements SaaS |
| Synergie groupe | VMCloud = cloud du groupe |
| Stack moderne | FastAPI + React = performant |

---

## Résumé

| Élément | Valeur |
|---------|--------|
| Backend | Python / FastAPI |
| Frontend | Node / React |
| Base de données | PostgreSQL |
| Cloud actuel | GCP |
| Cloud futur | VMCloud (groupe) |
| Paiements + KYC | Stripe |
| SMS | Twilio |
| Email, signature, compta | Interne |
| Stockage documents | Interne |
| Responsable | Fondateur |

---

## Actions potentielles

- [x] ~~Confirmer la stratégie de backup~~ → Tous les 2 jours, automatique
- [x] ~~Documenter le monitoring en place~~ → Alertes partout
- [x] ~~Évaluer les coûts infra actuels~~ → ~1 500€/mois GCP
- [x] ~~Vérifier le chiffrement au repos~~ → Oui
- [ ] Planifier la migration GCP → VMCloud (Q1-Q2 2026)
- [ ] Planifier tests de restauration backup

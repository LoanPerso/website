# Opérations & Processus - Quickfund

> **Statut :** 🔄 À compléter
> **Dernière mise à jour :** Décembre 2025

---

## 1. Organisation opérationnelle

**Questions à répondre :**

- [ ] **Avez-vous un COO ou responsable des opérations ?**
- [ ] **Quels sont les domaines couverts par les "ops" ?** (IT, finance, RH, legal, etc.)
- [ ] **Quels processus sont formalisés ?**
- [ ] **Quels processus restent à formaliser ?**
- [ ] **Comment documentez-vous vos processus ?** (Outil, format)

### Réponses
```
COO : [Oui/Non - Nom]
Responsable ops : [Nom]

Domaines ops :
- IT/Infra : [Qui]
- Finance/Compta : [Qui]
- RH/People : [Qui]
- Legal : [Qui]
- Office management : [Qui]

Processus formalisés :
1. [À compléter]
2. [À compléter]
3. [À compléter]

Processus à formaliser :
1. [À compléter]
2. [À compléter]

Documentation : [Outil - Format]
```

---

## 2. Cycle de développement produit

**Questions à répondre :**

- [ ] **Quelle méthodologie utilisez-vous ?** (Scrum, Kanban, Shape Up, etc.)
- [ ] **Quelle est la durée de vos sprints/cycles ?**
- [ ] **Comment sont priorisées les tâches ?**
- [ ] **Comment sont estimées les tâches ?** (Story points, T-shirt sizing)
- [ ] **Quels sont vos rituels de dev ?** (Standup, retro, planning, review)
- [ ] **Comment gérez-vous les bugs vs features ?**
- [ ] **Quelle est votre fréquence de release ?**
- [ ] **Avez-vous un feature freeze ?**

### Réponses
```
Méthodologie : [Scrum/Kanban/Shape Up/Autre]
Durée cycle : [X semaines]

Priorisation : [À compléter]
Estimation : [Story points/T-shirt/Autre]

Rituels :
- Daily standup : [Durée - Heure]
- Sprint planning : [Durée - Fréquence]
- Sprint review : [Durée - Fréquence]
- Retro : [Durée - Fréquence]

Gestion bugs : [À compléter]
Fréquence release : [À compléter]
Feature freeze : [Oui/Non - Quand]
```

---

## 3. Déploiement et CI/CD

**Questions à répondre :**

- [ ] **Quel est votre process de déploiement ?**
- [ ] **Utilisez-vous du CI/CD ?** (Outils)
- [ ] **Combien de déploiements par jour/semaine ?**
- [ ] **Avez-vous des environnements de staging/preprod ?**
- [ ] **Comment gérez-vous les rollbacks ?**
- [ ] **Avez-vous des feature flags ?**
- [ ] **Qui peut déployer en production ?**

### Réponses
```
CI/CD : [Oui/Non]
Outils CI/CD : [GitHub Actions/GitLab CI/Jenkins/etc.]

Environnements :
- Dev : [À compléter]
- Staging : [À compléter]
- Preprod : [À compléter]
- Production : [À compléter]

Déploiements :
- Fréquence : [X/jour ou X/semaine]
- Process : [À compléter]
- Autorisés : [Qui]

Feature flags : [Oui/Non - Outil]
Rollback : [À compléter]
```

---

## 4. Monitoring et observabilité

**Questions à répondre :**

- [ ] **Comment monitorez-vous vos systèmes ?** (APM, logs, metrics)
- [ ] **Quels outils de monitoring utilisez-vous ?**
- [ ] **Avez-vous des dashboards de monitoring ?**
- [ ] **Quelles alertes sont configurées ?**
- [ ] **Qui reçoit les alertes ?**
- [ ] **Quel est votre MTTD (Mean Time To Detect) ?**

### Stack monitoring
| Type | Outil | Usage |
|------|-------|-------|
| APM | [Datadog/NewRelic/etc.] | [À compléter] |
| Logs | [Datadog/ELK/etc.] | [À compléter] |
| Metrics | [Prometheus/Grafana/etc.] | [À compléter] |
| Uptime | [Pingdom/UptimeRobot/etc.] | [À compléter] |
| Error tracking | [Sentry/Rollbar/etc.] | [À compléter] |

### Alertes
| Alerte | Seuil | Priorité | Notifié |
|--------|-------|----------|---------|
| [Alerte 1] | [Seuil] | [P1/P2/P3] | [Qui] |
| [Alerte 2] | [Seuil] | [P1/P2/P3] | [Qui] |
| [Alerte 3] | [Seuil] | [P1/P2/P3] | [Qui] |

### Réponses
```
MTTD : [X minutes]
Dashboards : [URL/Outil]
```

---

## 5. Gestion des incidents

**Questions à répondre :**

- [ ] **Avez-vous un process de gestion d'incidents formalisé ?**
- [ ] **Comment classifiez-vous les incidents ?** (Sévérité)
- [ ] **Qui est on-call ?** (Rotation, compensation)
- [ ] **Quel est le temps de réponse cible par sévérité ?**
- [ ] **Comment communiquez-vous en cas d'incident ?** (Interne, clients)
- [ ] **Faites-vous des post-mortems ?**
- [ ] **Quel est votre MTTR (Mean Time To Resolve) ?**

### Classification des incidents
| Sévérité | Définition | Temps de réponse | Temps de résolution |
|----------|------------|------------------|---------------------|
| SEV1 - Critique | [À compléter] | [X min] | [X heures] |
| SEV2 - Majeur | [À compléter] | [X min] | [X heures] |
| SEV3 - Mineur | [À compléter] | [X heures] | [X jours] |
| SEV4 - Low | [À compléter] | [X jours] | [Best effort] |

### On-call
```
Rotation : [X personnes, X semaines]
Compensation : [À compléter]
Outils : [PagerDuty/Opsgenie/etc.]
Escalation : [À compléter]
```

### Post-mortems
```
Obligatoire pour : [SEV1/SEV2]
Template : [Lien]
Délai : [X jours après résolution]
MTTR actuel : [X heures]
```

---

## 6. Sécurité opérationnelle

**Questions à répondre :**

- [ ] **Avez-vous une politique de sécurité ?**
- [ ] **Comment gérez-vous les accès ?** (SSO, MFA)
- [ ] **Comment gérez-vous les secrets ?** (Vault, etc.)
- [ ] **Faites-vous des audits de sécurité ?** (Pentests)
- [ ] **Avez-vous un plan de réponse aux incidents sécurité ?**
- [ ] **Formez-vous l'équipe à la sécurité ?**

### Réponses
```
Politique sécurité : [Oui/Non - Lien]

Accès :
- SSO : [Oui/Non - Fournisseur]
- MFA : [Obligatoire/Optionnel]
- Gestion accès : [Outil]

Secrets :
- Outil : [Vault/AWS Secrets Manager/etc.]
- Rotation : [Automatique/Manuelle]

Audits :
- Pentests : [Fréquence - Dernier]
- Audit code : [Oui/Non]
- Bug bounty : [Oui/Non]

Formation sécurité : [À compléter]
```

---

## 7. Disaster Recovery et continuité

**Questions à répondre :**

- [ ] **Avez-vous un plan de reprise d'activité (PRA/DRP) ?**
- [ ] **Avez-vous un plan de continuité d'activité (PCA/BCP) ?**
- [ ] **Quel est votre RTO (Recovery Time Objective) ?**
- [ ] **Quel est votre RPO (Recovery Point Objective) ?**
- [ ] **Comment sont gérées les backups ?**
- [ ] **Avez-vous testé votre DRP récemment ?**
- [ ] **Avez-vous un site de secours ?**

### Réponses
```
DRP : [Oui/Non - Lien]
BCP : [Oui/Non - Lien]

RTO : [X heures]
RPO : [X heures]

Backups :
- Fréquence : [X fois/jour]
- Rétention : [X jours]
- Localisation : [À compléter]
- Chiffrement : [Oui/Non]
- Test restauration : [Fréquence]

Dernier test DRP : [Date]
Site de secours : [Oui/Non - Localisation]
```

---

## 8. Change management

**Questions à répondre :**

- [ ] **Comment gérez-vous les changements majeurs ?** (Infra, process)
- [ ] **Avez-vous un CAB (Change Advisory Board) ?**
- [ ] **Comment sont documentés les changements ?**
- [ ] **Comment sont communiqués les changements ?**

### Réponses
```
Process de change : [À compléter]
CAB : [Oui/Non - Composition]
Documentation changes : [Où]
Communication : [Comment]

Types de changements :
- Standard (pré-approuvé) : [Exemples]
- Normal (nécessite approbation) : [Exemples]
- Urgent : [Process]
```

---

## 9. Vendor management

**Questions à répondre :**

- [ ] **Quels sont vos fournisseurs critiques ?** (Cloud, SaaS, etc.)
- [ ] **Avez-vous des SLA avec vos fournisseurs ?**
- [ ] **Comment évaluez-vous vos fournisseurs ?**
- [ ] **Avez-vous des alternatives identifiées ?** (Plan B)

### Fournisseurs critiques
| Fournisseur | Service | Criticité | SLA | Coût/mois | Alternative |
|-------------|---------|-----------|-----|-----------|-------------|
| [Fournisseur 1] | [À compléter] | [Haute/Moyenne] | [X%] | [€] | [À compléter] |
| [Fournisseur 2] | [À compléter] | [Haute/Moyenne] | [X%] | [€] | [À compléter] |
| [Fournisseur 3] | [À compléter] | [Haute/Moyenne] | [X%] | [€] | [À compléter] |

---

## 10. Documentation technique

**Questions à répondre :**

- [ ] **Où est centralisée votre documentation technique ?**
- [ ] **La documentation est-elle à jour ?**
- [ ] **Qui maintient la documentation ?**
- [ ] **Avez-vous de la documentation d'architecture ?**
- [ ] **Avez-vous des runbooks opérationnels ?**

### Réponses
```
Documentation centralisée : [Outil - URL]
À jour : [Oui/Non/Partiellement]
Responsable : [Qui]

Types de docs :
- Architecture : [Oui/Non - Lien]
- API : [Oui/Non - Lien]
- Runbooks : [Oui/Non - Lien]
- Onboarding dev : [Oui/Non - Lien]
- ADR (Architecture Decision Records) : [Oui/Non - Lien]
```

---

## 11. Métriques opérationnelles

**Questions à répondre :**

- [ ] **Quelles métriques ops suivez-vous ?**
- [ ] **Quel est votre uptime actuel ?**
- [ ] **Combien d'incidents par mois ?**
- [ ] **Quel est votre MTTR ?**
- [ ] **Quel est votre lead time for changes ?**
- [ ] **Quel est votre deployment frequency ?**
- [ ] **Quel est votre change failure rate ?**

### Métriques DORA
| Métrique | Valeur actuelle | Objectif | Benchmark "Elite" |
|----------|-----------------|----------|-------------------|
| Deployment frequency | [X/jour ou X/semaine] | [À compléter] | Multiple/jour |
| Lead time for changes | [X heures/jours] | [À compléter] | < 1 heure |
| Change failure rate | [X%] | [À compléter] | < 15% |
| MTTR | [X heures] | [À compléter] | < 1 heure |

### Autres métriques
| Métrique | Valeur actuelle | Objectif |
|----------|-----------------|----------|
| Uptime | [X%] | [X%] |
| Incidents SEV1/mois | [X] | [X] |
| Incidents SEV2/mois | [X] | [X] |
| Time to first response (incidents) | [X min] | [X min] |

---

## 12. Automatisation

**Questions à répondre :**

- [ ] **Quels processus sont automatisés ?**
- [ ] **Quels processus devraient être automatisés ?**
- [ ] **Utilisez-vous de l'Infrastructure as Code ?** (Terraform, etc.)
- [ ] **Avez-vous des scripts d'automatisation ?** (Où)

### Réponses
```
Processus automatisés :
1. [À compléter]
2. [À compléter]
3. [À compléter]

À automatiser :
1. [À compléter]
2. [À compléter]

Infrastructure as Code :
- Outil : [Terraform/Pulumi/CloudFormation/etc.]
- Couverture : [X% de l'infra]

Scripts : [Repo/Dossier]
```

---

## Résumé exécutif

*(À générer automatiquement une fois les questions répondues)*

| Élément | Contenu |
|---------|---------|
| Méthodologie | [Scrum/Kanban/etc.] |
| Déploiements/semaine | [X] |
| Uptime | [X%] |
| MTTR | [X heures] |
| Incidents SEV1/mois | [X] |

---

**Total questions : 58**
**Répondues : 0/58**

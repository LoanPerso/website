# Opérations & Processus - Quickfund

> **Dernière mise à jour :** Décembre 2025

---

## Organisation opérationnelle

*Comment l'entreprise fonctionne-t-elle au quotidien ?*

**Philosophie :** Automatisation maximale, intervention humaine minimale.

| Élément | Valeur |
|---------|--------|
| COO | ❌ Non (fondateur gère tout) |
| Équipe ops | 1 personne (fondateur) + 1 freelance (saisie) |
| Processus formalisés | Partiellement |
| Documentation | Limitée |

*Pourquoi si lean ?* L'entreprise a été conçue pour fonctionner en "pilote automatique". Le fondateur n'intervient que sur les exceptions.

---

## Processus métier principaux

*Quels sont les processus critiques pour Quickfund ?*

### 1. Traitement des demandes de crédit

| Étape | Automatisé ? | Responsable |
|-------|:------------:|-------------|
| Réception demande | ✅ Oui | Système |
| Collecte documents | ✅ Oui | Système |
| Vérification identité | ⚠️ Partiel | Système + review manuel si doute |
| Scoring crédit | ✅ Oui | Algorithme |
| Décision (acceptation/refus) | ✅ Oui | Algorithme |
| Génération offre | ✅ Oui | Système |
| Signature électronique | ✅ Oui | Système |
| Versement fonds | ✅ Oui | Système |

**Délai moyen :** 24-48h de la demande au versement.

### 2. Suivi des remboursements

| Étape | Automatisé ? | Responsable |
|-------|:------------:|-------------|
| Prélèvement mensuel | ✅ Oui | SEPA |
| Confirmation paiement | ✅ Oui | Système |
| Détection impayé | ✅ Oui | Système |
| Relance niveau 1 | ✅ Oui | Email auto |
| Relance niveau 2 | ⚠️ Partiel | Email/SMS |
| Relance niveau 3 | ❌ Manuel | Fondateur |
| Recouvrement | ❌ Manuel | Fondateur/Externe |

### 3. Gestion des clients

| Tâche | Automatisé ? | Fréquence |
|-------|:------------:|:---------:|
| Espace client | ✅ Oui | Permanent |
| Relevés/Attestations | ✅ Oui | Sur demande |
| Support questions | ❌ Manuel | À la demande |
| Modifications contrat | ⚠️ Partiel | Rare |

---

## Processus actuellement manuels

*Quelles tâches nécessitent encore une intervention humaine ?*

| Processus | Fréquence | Qui | Temps estimé |
|-----------|:---------:|-----|:------------:|
| Dossiers complexes | 60-70% des demandes | Fondateur | Variable |
| Documents illisibles | Occasionnel | Freelance | ~5 min/dossier |
| Impayés niveau 3 | Selon besoin | Fondateur | Variable |
| Support client | ~8% des clients | Fondateur | Variable |
| Comptabilité | Mensuel | Fondateur/Comptable | ~2h/mois |
| Reporting réglementaire | Périodique | Fondateur | Variable |

---

## Processus à améliorer

*Quels processus posent problème ou manquent de formalisation ?*

### Problème #1 : Suivi des métriques

| Élément | Problème |
|---------|----------|
| Symptôme | ~50K€ perdus en 2 ans par manque de suivi |
| Cause | Pas de dashboard, pas d'alertes |
| Solution Q1 2026 | Mettre en place un tableau de bord |

### ~~Problème #2 : Suivi des impayés~~ ✅ RÉSOLU

| Élément | Statut |
|---------|--------|
| Alertes automatiques | ✅ En place |
| Détection | Automatique |
| Vérification | Manuelle en complément |

*Les alertes automatiques sont désormais en place. Le fondateur reçoit une notification et vérifie manuellement.*

### Problème #3 : Documentation processus

| Élément | Problème |
|---------|----------|
| Symptôme | Connaissance dans la tête du fondateur |
| Cause | 2 ans de fonctionnement informel |
| Solution | Documenter les processus critiques |

---

## Gestion des risques opérationnels

*Quels risques opérationnels existent ?*

| Risque | Probabilité | Impact | Mitigation |
|--------|:-----------:|:------:|------------|
| Fondateur indisponible | Moyenne | Critique | Documenter, automatiser plus |
| Panne système | Faible | Élevé | Backups, monitoring |
| Fraude client | Moyenne | Moyen | Vérification identité |
| Impayés massifs | Moyenne | Élevé | Scoring, relances précoces |
| Erreur de versement | Faible | Moyen | Double vérification |

---

## Conformité et réglementaire

*Quelles obligations réglementaires affectent les opérations ?*

| Obligation | Fréquence | Responsable | Statut |
|------------|:---------:|-------------|:------:|
| Reporting FSA Estonie | Périodique | Fondateur | ✅ |
| KYC (Know Your Customer) | Chaque client | Système | ✅ |
| AML (Anti-Money Laundering) | Permanent | Système | ✅ |
| RGPD | Permanent | Système | ✅ |
| Conservation documents | Permanent | Système | ✅ |

---

## Outils opérationnels

*Quels outils supportent les opérations quotidiennes ?*

| Fonction | Outil | Commentaire |
|----------|-------|-------------|
| Plateforme crédit | Interne | Core business |
| Paiements | Stripe | Prélèvements, versements |
| KYC / Vérification identité | Stripe Identity | Automatisé |
| Signature électronique | Interne | Développé en interne |
| Email transactionnel | Interne | Développé en interne |
| SMS / Alertes | Twilio | Notifications |
| Comptabilité | Interne | Lié au comptable externe |
| Stockage documents | Interne | Hébergé en interne |

*Philosophie :* Maximum d'outils développés en interne pour garder le contrôle et réduire les coûts SaaS.

---

## Métriques opérationnelles

*Que devrait-on mesurer ? (À mettre en place Q1 2026)*

| Métrique | Importance | Trackée ? |
|----------|:----------:|:---------:|
| Temps traitement demande | Haute | ❌ |
| Taux d'acceptation | Haute | ❌ |
| Taux d'impayés | Critique | ⚠️ Partiel |
| Volume demandes/jour | Haute | ❌ |
| Tickets support/jour | Moyenne | ❌ |
| Temps réponse support | Moyenne | ❌ |

---

## Scalabilité opérationnelle

*Les opérations peuvent-elles absorber une croissance ?*

| Facteur | Scalable ? | Limite |
|---------|:----------:|--------|
| Traitement demandes | ✅ Oui | Automatisé |
| Versements | ✅ Oui | Limité par liquidité |
| Support | ⚠️ Partiellement | 1 personne = goulot |
| Impayés | ⚠️ Partiellement | Nécessite process |
| Compliance | ⚠️ Partiellement | Dépend du volume |

**Limite actuelle :** Le fondateur seul. Si le volume explose, il faudra recruter ou automatiser encore plus.

---

## Disaster Recovery opérationnel

*Que se passe-t-il si quelque chose tourne mal ?*

| Scénario | Plan actuel |
|----------|-------------|
| Panne plateforme | Restaurer depuis backup |
| Fraude détectée | Blocage manuel, investigation |
| Impayés massifs | Resserrer le scoring, relances agressives |
| Fondateur indisponible | ⚠️ Problème critique (personne clé unique) |

---

## Résumé

| Élément | Valeur |
|---------|--------|
| Équipe ops | 1 personne + 1 freelance |
| Niveau automatisation | ~30-40% automatisé (60-70% manuel) |
| Processus documentés | Partiellement |
| Alertes impayés | ✅ En place |
| Problème restant | Pas de suivi métriques (~50K€ perdus) |
| Risque principal | Fondateur = personne clé unique |
| Priorité Q1 2026 | Dashboard + documentation |

---

## Actions Q1 2026

- [ ] Mettre en place un dashboard opérationnel
- [x] ~~Configurer des alertes impayés~~ → En place (auto + vérif manuelle)
- [ ] Documenter les processus critiques
- [ ] Définir des SLA internes (temps traitement, réponse)
- [ ] Identifier les tâches à automatiser encore

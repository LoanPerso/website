# Finances & P&L - Quickfund

> **Derniere mise a jour :** Decembre 2025

---

## Situation financiere actuelle

*Quel est l'etat financier de Quickfund ?*

| Element | Valeur |
|---------|--------|
| Tresorerie | 80 000 EUR |
| CA 2024 | 30 000 EUR |
| CA 2025 | ~40 000 EUR |
| CA cumule (2 ans) | ~70 000 EUR |
| Rentable | Oui (depuis le debut) |
| Burn rate | Negatif (profitable) |
| Runway | Illimite |
| Dettes | 0 EUR |

*Point fort :* Entreprise rentable des le depart, pas de besoin de financement externe.

---

## Revenus

*D'ou viennent les revenus ?*

### Sources de revenus

| Source | Description | % du CA |
|--------|-------------|:-------:|
| Interets | Interets sur prets | Majoritaire |
| Frais de dossier | Frais fixes par pret | A calculer |
| Penalites retard | Frais en cas d'impaye | Faible |

### Modele economique

| Element | Valeur |
|---------|--------|
| Type de revenus | Interets (non recurrent) |
| Marge sur interets | A calculer |
| Ticket moyen | 500-3000 EUR (estime) |
| Duree moyenne pret | 3-12 mois (estime) |

*Note :* Contrairement au SaaS, le credit ne genere pas de MRR au sens strict. Les revenus dependent du volume de prets actifs.

---

## Couts et depenses

*Quels sont les postes de couts ?*

### Structure de couts

| Poste | Type | Montant/mois |
|-------|------|:------------:|
| Fondateur | Fixe | Variable (dividendes) |
| Freelance saisie | Variable | ~1 800 EUR net |
| Infrastructure (GCP) | Fixe | ~1 500 EUR |
| Stripe | Variable | 1.5% / transaction |
| Twilio | Variable | Faible |
| Comptable | Fixe | 0 EUR (mutualise groupe) |
| Domaines/SSL | Fixe | Faible |
| **Total fixe estime** | - | **~3 300 EUR/mois** |

*Avantage :* Structure de couts tres legere grace a l'automatisation et aux outils internes.

### Repartition des couts

| Categorie | % estime |
|-----------|:--------:|
| RH (fondateur + freelance) | ~50% |
| Infrastructure | ~30% |
| Services tiers | ~15% |
| Autre | ~5% |

---

## P&L simplifie

*Comment se presente le P&L ?*

| Ligne | Annuel (estime) |
|-------|:---------------:|
| **Revenus** | |
| Interets percus | ~40-60K EUR |
| Frais | A calculer |
| **CA Total** | **40-60K EUR/an** |
| | |
| **Couts** | |
| RH | A preciser |
| Infrastructure | A preciser |
| Services tiers | A preciser |
| **Total couts** | **A calculer** |
| | |
| **Resultat** | **Positif** |

*Note :* Chiffres approximatifs. Le CA total sur 2 ans est de 80-120K EUR.

---

## Unit economics

*Quelle est la rentabilite par pret ?*

| Metrique | Valeur | Cible |
|----------|:------:|:-----:|
| Montant moyen pret | A calculer | - |
| Marge brute/pret | A calculer | >10% |
| CAC | A calculer | <50 EUR |
| LTV | A calculer | A definir |
| LTV/CAC | A calculer | >3 |

### Calcul LTV (theorique)

```
LTV = Marge par pret x Nombre de prets par client
```

*A calculer Q1 2026 une fois les metriques en place.*

---

## Tresorerie et cash management

*Comment est geree la tresorerie ?*

| Element | Valeur |
|---------|--------|
| Banque principale | Revolut Business |
| Tresorerie actuelle | 80 000 EUR |
| Gestion liquidite | Fondateur |
| Reserve de liquidite | Oui (pour debloquer prets) |

### Flux de tresorerie

| Flux entrant | Flux sortant |
|--------------|--------------|
| Remboursements clients | Deblocage nouveaux prets |
| Interets percus | Charges fixes |
| Frais de dossier | Services tiers |

*Risque identifie :* Dependance a une banque pour la liquidite (cf STRATEGY.md).

---

## Historique financier

*Evolution depuis la creation.*

| Annee | CA | Resultat | Evenement |
|-------|:--:|:--------:|-----------|
| 2023 (Nov-Dec) | Faible | A l'equilibre | Lancement |
| 2024 | 30 000 EUR | Positif | Croissance organique |
| 2025 | ~40 000 EUR | Positif | "Pilote automatique" |

*Note :* L'entreprise a fonctionne en "pilote automatique" pendant 2 ans avec une intervention minimale du fondateur.

---

## Comptabilite et reporting

*Comment est geree la comptabilite ?*

| Element | Valeur |
|---------|--------|
| Expert-comptable | Oui (mutualise groupe) |
| Outil comptabilite | Interne (developpe maison) |
| Exercice fiscal | Decembre |
| Clotures | Annuelles |
| DAF/CFO | Non (fondateur gere) |
| Commissaire aux comptes | Non requis |

### Obligations (Estonie)

| Obligation | Frequence |
|------------|:---------:|
| Declaration TVA | Periodique |
| Comptes annuels | Annuel |
| Reporting FSA | Periodique |

---

## Budget et projections

*Y a-t-il un budget formalise ?*

| Element | Valeur |
|---------|--------|
| Budget annuel | Non formalise |
| Projections | Non formalisees |
| Scenarios | Non modelises |

*Pourquoi pas de budget formel ?* Equipe d'1 personne, couts stables et previsibles, pas d'investisseur demandant du reporting.

### Objectifs 2026 (informels)

| Element | Objectif |
|---------|----------|
| Croissance CA | A definir |
| Nouveaux clients | A definir |
| Reduction impayes | Oui |
| Dashboard metriques | Oui (Q1) |

---

## Risques financiers

*Quels sont les risques identifies ?*

| Risque | Probabilite | Impact | Mitigation |
|--------|:-----------:|:------:|------------|
| Impayes massifs | Moyenne | Eleve | Scoring, relances |
| Perte liquidite bancaire | Faible | Critique | Diversifier |
| Fraude | Faible | Moyen | KYC Stripe |
| Erreur comptable | Faible | Moyen | Comptable externe |

### Concentration

| Element | Valeur |
|---------|--------|
| Top 1 client | A calculer |
| Top 5 clients | A calculer |
| Risque concentration | A evaluer |

---

## Resume

| Element | Valeur |
|---------|--------|
| Tresorerie | 80 000 EUR |
| CA 2024 | 30 000 EUR |
| CA 2025 | ~40 000 EUR |
| Rentable | Oui |
| Couts fixes/mois | ~3 300 EUR |
| Dettes | 0 EUR |
| Banque | Revolut Business |
| Comptable | Mutualise groupe |

---

## Actions potentielles

- [ ] Formaliser un suivi mensuel des finances
- [ ] Calculer les unit economics precis
- [ ] Modeliser des scenarios de croissance
- [ ] Evaluer la concentration clients
- [ ] Documenter les flux de tresorerie

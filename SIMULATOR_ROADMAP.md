# Roadmap Simulateur de Credit

> Module complet de simulation de credit avec scoring realiste, questions adaptees par produit et optimisation par pays.

---

## Etat Actuel

### Structure
```
AdvancedSimulator/
├── products/
│   └── configs/           # 6 produits configures
│       ├── micro-credit.ts
│       ├── consumer.ts
│       ├── professional.ts
│       ├── student.ts
│       ├── salary-advance.ts
│       └── leasing.ts
├── parameters/
│   ├── products/          # JSON avec scoring/limites
│   │   ├── micro-credit.json
│   │   ├── consumer.json
│   │   ├── professional.json
│   │   ├── student.json
│   │   ├── salary-advance.json
│   │   └── leasing.json
│   └── countries/         # 4 pays + default
├── countries/
│   └── configs/           # FR, BE, CH, ES
├── types.ts               # Types TypeScript complets
└── hooks/
    └── useSimulatorState.ts
```

### Progression globale

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Questions completes par produit | ✅ COMPLETE |
| Phase 2 | Optimisation par pays | ❌ A faire |
| Phase 3 | Structure traductions | ❌ A faire |
| Phase 4 | Badge "Optimise pour" | ❌ A faire |

---

## Phase 1 : Questions completes par produit ✅ COMPLETE

### Tableau recapitulatif

| Produit | Questions | Sections | Scoring | FR | EN | Build |
|---------|-----------|----------|---------|----|----|-------|
| Consumer | 17 | 10 | ✅ | ✅ | ✅ | ✅ |
| Micro-credit | 12 | 8 | ✅ | ✅ | ✅ | ✅ |
| Professionnel | 11 | 6 | ✅ | ✅ | ✅ | ✅ |
| Etudiant | 12 | 7 | ✅ | ✅ | ✅ | ✅ |
| Avance salaire | 9 | 5 | ✅ | ✅ | ✅ | ✅ |
| Leasing | 12 | 8 | ✅ | ✅ | ✅ | ✅ |

---

## Detail par produit

### 1.1 Credit Consommation (Consumer)

**Fichiers** :
- `parameters/products/consumer.json`
- `products/configs/consumer.ts`
- `messages/fr/tools.json` -> `simulator.advanced.consumer.*`
- `messages/en/tools.json` -> `simulator.advanced.consumer.*`

**Montants** : 500€ - 75,000€
**Duree** : 6 - 84 mois

#### Questions implementees (17)

| Section | Question | Type | Condition |
|---------|----------|------|-----------|
| identity | age | number | - |
| identity | maritalStatus | select | - |
| employment | employmentStatus | select | - |
| employment | employmentDuration | select | si employe (pas retired) |
| housing | housingStatus | select | - |
| housing | rentAmount | slider | si locataire |
| income | incomeType | select | - |
| income | monthlyIncome | slider | - |
| income | spouseIncome | slider | si marie/pacse |
| income | otherIncome | slider | - |
| expenses | monthlyExpenses | slider | - |
| expenses | existingLoans | slider | - |
| expenses | dependents | number | - |
| banking | creditHistory | select | - |
| banking | hasRecentOverdrafts | select | - |
| coBorrower | hasCoBorrower | select | - |
| coBorrower | coBorrowerIncome | slider | si co-emprunteur |
| savings | savingsAmount | slider | - |
| loan | loanPurpose | select | - |
| insurance | wantsInsurance | select | - |

#### Scoring

| Facteur | Poids |
|---------|-------|
| age | 5% |
| maritalStatus | 5% |
| employmentStatus | 15% |
| employmentDuration | 10% |
| housingStatus | 8% |
| incomeType | 5% |
| debtRatio | 17% |
| remainingIncome | 15% |
| creditHistory | 12% |
| hasRecentOverdrafts | 3% |
| hasCoBorrower | 3% |
| wantsInsurance | 2% |

#### Tests a effectuer

- [ ] Selectionner "Credit consommation" affiche les 17 questions
- [ ] Questions conditionnelles :
  - [ ] `rentAmount` apparait seulement si `housingStatus = tenant`
  - [ ] `spouseIncome` apparait seulement si `maritalStatus = married/pacs`
  - [ ] `employmentDuration` n'apparait pas si `employmentStatus = retired`
  - [ ] `coBorrowerIncome` apparait seulement si `hasCoBorrower = yes`
- [ ] Scoring calcule correctement (profil optimal = categorie A)
- [ ] Traductions FR affichees correctement
- [ ] Traductions EN affichees correctement (changer langue)
- [ ] Resultat affiche : mensualite, taux, cout total, categorie risque

---

### 1.2 Micro-credit

**Fichiers** :
- `parameters/products/micro-credit.json`
- `products/configs/micro-credit.ts`
- `messages/fr/tools.json` -> `simulator.advanced.microcredit.*`
- `messages/en/tools.json` -> `simulator.advanced.microcredit.*`

**Montants** : 50€ - 3,000€
**Duree** : 1 - 12 mois

#### Questions implementees (12)

| Section | Question | Type | Condition |
|---------|----------|------|-----------|
| identity | age | number | - |
| identity | maritalStatus | select | - |
| employment | employmentStatus | select | - |
| employment | employmentDuration | select | si employe (pas retired/unemployed) |
| income | incomeType | select | - |
| income | monthlyIncome | slider | - |
| housing | housingStatus | select | - |
| housing | rentAmount | slider | si locataire |
| expenses | monthlyExpenses | slider | - |
| expenses | existingLoans | slider | - |
| expenses | dependents | number | - |
| banking | creditHistory | select | - |
| banking | hasRecentOverdrafts | select | - |
| loan | loanPurpose | select | - |
| insurance | wantsInsurance | select | - |

#### Options loanPurpose
- emergency : Urgence
- bills : Factures
- medical : Frais medicaux
- repair : Reparation
- other : Autre

#### Scoring

| Facteur | Poids |
|---------|-------|
| age | 5% |
| maritalStatus | 5% |
| employmentStatus | 20% |
| employmentDuration | 10% |
| incomeType | 5% |
| housingStatus | 8% |
| debtRatio | 15% |
| remainingIncome | 12% |
| creditHistory | 12% |
| hasRecentOverdrafts | 5% |
| wantsInsurance | 3% |

#### Tests a effectuer

- [ ] Selectionner "Micro-credit" affiche les 12 questions
- [ ] Montant max limite a 3000€
- [ ] Duree max limitee a 12 mois
- [ ] Questions conditionnelles :
  - [ ] `rentAmount` apparait si `housingStatus = tenant`
  - [ ] `employmentDuration` n'apparait pas si `retired` ou `unemployed`
- [ ] Options loanPurpose specifiques micro-credit (emergency, bills, medical, repair, other)
- [ ] Traductions FR/EN correctes
- [ ] Taux plus eleves que consumer (produit plus risque)

---

### 1.3 Credit Professionnel

**Fichiers** :
- `parameters/products/professional.json`
- `products/configs/professional.ts`
- `messages/fr/tools.json` -> `simulator.advanced.professional.*`
- `messages/en/tools.json` -> `simulator.advanced.professional.*`

**Montants** : 1,000€ - 150,000€
**Duree** : 6 - 84 mois

#### Questions implementees (11)

| Section | Question | Type | Condition |
|---------|----------|------|-----------|
| identity | age | number | - |
| business | businessType | select | - |
| business | sector | select | - |
| business | yearsInBusiness | number | - |
| business | employees | number | - |
| income | annualRevenue | slider | - |
| income | monthlyProfit | slider | - |
| income | existingBusinessLoans | slider | - |
| banking | creditHistory | select | - |
| banking | hasBusinessAccount | select | - |
| loan | businessNeed | select | - |
| insurance | wantsInsurance | select | - |

#### Options businessType
- freelance, auto-entrepreneur, tpe, startup, sarl, sas, sa, eirl, sprl, sl, other

#### Options sector
- tech, health, services, commerce, construction, industry, food, transport, other

#### Options businessNeed
- treasury, investment, equipment, stock, expansion, other

#### Scoring

| Facteur | Poids |
|---------|-------|
| age | 5% |
| businessType | 10% |
| sector | 10% |
| yearsInBusiness | 20% |
| employees | 5% |
| revenueToLoanRatio | 20% |
| profitability | 10% |
| creditHistory | 12% |
| hasBusinessAccount | 3% |
| wantsInsurance | 5% |

#### Tests a effectuer

- [ ] Selectionner "Credit professionnel" affiche les 11 questions
- [ ] Pas de questions emploi individuel (questions business uniquement)
- [ ] Options businessType specifiques pro
- [ ] Options sector affichees
- [ ] Scoring prend en compte ratio CA/montant demande
- [ ] Traductions FR/EN correctes
- [ ] Profil entreprise etablie (>5 ans, bon CA) = categorie A

---

### 1.4 Pret Etudiant

**Fichiers** :
- `parameters/products/student.json`
- `products/configs/student.ts`
- `messages/fr/tools.json` -> `simulator.advanced.student.*`
- `messages/en/tools.json` -> `simulator.advanced.student.*`

**Montants** : 1,000€ - 50,000€
**Duree** : 12 - 120 mois

#### Questions implementees (12)

| Section | Question | Type | Condition |
|---------|----------|------|-----------|
| identity | age | number | - |
| studies | institutionType | select | - |
| studies | studyLevel | select | - |
| studies | remainingYears | number | - |
| income | hasPartTimeJob | select | - |
| income | partTimeIncome | slider | si job etudiant |
| income | hasScholarship | select | - |
| income | scholarshipAmount | slider | si bourse |
| housing | housingStatus | select | - |
| guarantor | hasGuarantor | select | - |
| guarantor | guarantorRelationship | select | si garant |
| guarantor | guarantorIncome | slider | si garant |
| loan | loanPurpose | select | - |
| insurance | wantsInsurance | select | - |

#### Options institutionType
- university, business-school, engineering-school, art-school, medical-school, law-school, other

#### Options studyLevel
- l1, l2, l3, m1, m2, doctorate, other

#### Options guarantorRelationship
- parent, grandparent, sibling, other

#### Options housingStatus (etudiant)
- withParents, studentResidence, rental, other

#### Options loanPurpose (etudiant)
- tuition, living, equipment, internship, other

#### Scoring

| Facteur | Poids |
|---------|-------|
| age | 5% |
| institutionType | 15% |
| studyLevel | 10% |
| remainingYears | 5% |
| hasPartTimeJob | 10% |
| hasScholarship | 5% |
| housingStatus | 5% |
| hasGuarantor | 25% |
| guarantorQuality | 15% |
| wantsInsurance | 5% |

#### Tests a effectuer

- [ ] Selectionner "Pret etudiant" affiche les 12 questions
- [ ] Questions conditionnelles :
  - [ ] `partTimeIncome` apparait si `hasPartTimeJob = yes`
  - [ ] `scholarshipAmount` apparait si `hasScholarship = yes`
  - [ ] `guarantorRelationship` et `guarantorIncome` apparaissent si `hasGuarantor = yes`
- [ ] Options housing specifiques etudiants (withParents, studentResidence...)
- [ ] Options loanPurpose specifiques etudiants (tuition, living...)
- [ ] Garant = impact majeur sur score (25%)
- [ ] Traductions FR/EN correctes

---

### 1.5 Avance sur Salaire

**Fichiers** :
- `parameters/products/salary-advance.json`
- `products/configs/salary-advance.ts`
- `messages/fr/tools.json` -> `simulator.advanced.salaryAdvance.*`
- `messages/en/tools.json` -> `simulator.advanced.salaryAdvance.*`

**Montants** : 100€ - 2,000€
**Duree** : 1 - 3 mois

#### Questions implementees (9)

| Section | Question | Type | Condition |
|---------|----------|------|-----------|
| identity | age | number | - |
| employment | contractType | select | - |
| employment | employmentDuration | select | - |
| income | netSalary | slider | - |
| income | paydayFrequency | select | - |
| banking | hasDirectDeposit | select | - |
| banking | hasRecentOverdrafts | select | - |
| loan | advancePurpose | select | - |

#### Options contractType
- cdi, fonctionnaire, cdd

#### Options paydayFrequency
- monthly, biweekly, weekly

#### Options advancePurpose
- bills, emergency, medical, other

#### Scoring

| Facteur | Poids |
|---------|-------|
| age | 5% |
| contractType | 30% |
| employmentDuration | 15% |
| salaryToAdvanceRatio | 20% |
| paydayFrequency | 5% |
| hasDirectDeposit | 15% |
| hasRecentOverdrafts | 10% |

#### Tests a effectuer

- [ ] Selectionner "Avance sur salaire" affiche les 9 questions
- [ ] Montant max limite a 2000€
- [ ] Duree max limitee a 3 mois
- [ ] Options contractType limitees (CDI, fonctionnaire, CDD uniquement)
- [ ] Pas de questions business
- [ ] Scoring favorise CDI/fonctionnaire
- [ ] Traductions FR/EN correctes

---

### 1.6 Leasing

**Fichiers** :
- `parameters/products/leasing.json`
- `products/configs/leasing.ts`
- `messages/fr/tools.json` -> `simulator.advanced.leasing.*`
- `messages/en/tools.json` -> `simulator.advanced.leasing.*`

**Montants** : 1,000€ - 100,000€
**Duree** : 12 - 60 mois

#### Questions implementees (12)

| Section | Question | Type | Condition |
|---------|----------|------|-----------|
| identity | age | number | - |
| asset | assetType | select | - |
| asset | assetCondition | select | - |
| identity | clientType | select | - |
| employment | employmentStatus | select | si individual |
| employment | employmentDuration | select | si individual et pas retired |
| income | monthlyIncome | slider | si individual |
| business | yearsInBusiness | number | si business |
| business | annualRevenue | slider | si business |
| banking | creditHistory | select | - |
| loan | buyOption | select | - |
| insurance | wantsInsurance | select | - |

#### Options assetType
- vehicle, professional-equipment, it-equipment, machinery, medical-equipment, industrial, other

#### Options assetCondition
- new, recent, used

#### Options clientType
- individual, business

#### Options buyOption
- yes (avec option d'achat), no (leasing simple)

#### Scoring

| Facteur | Poids |
|---------|-------|
| age | 5% |
| assetType | 15% |
| assetCondition | 10% |
| clientType | 10% |
| employmentOrBusiness | 20% |
| incomeOrRevenue | 15% |
| creditHistory | 15% |
| buyOption | 5% |
| wantsInsurance | 5% |

#### Tests a effectuer

- [ ] Selectionner "Leasing" affiche les questions
- [ ] Questions conditionnelles :
  - [ ] Si `clientType = individual` : questions emploi/revenus individuels
  - [ ] Si `clientType = business` : questions business (yearsInBusiness, annualRevenue)
  - [ ] `employmentDuration` n'apparait pas si `retired`
- [ ] Options assetType completes (vehicle, equipment, machinery...)
- [ ] Options assetCondition (new, recent, used)
- [ ] Option d'achat (buyOption) presente
- [ ] Calcul avec valeur residuelle (10%)
- [ ] Traductions FR/EN correctes
- [ ] Business = scoring plus favorable

---

## Tests globaux Phase 1

### Fonctionnement general

- [ ] Navigation entre etapes fonctionne
- [ ] Bouton "Precedent" conserve les donnees
- [ ] Changement de produit reinitialise le formulaire
- [ ] Changement de pays met a jour les options
- [ ] Slider affiche les valeurs min/max correctes
- [ ] Champs number respectent min/max
- [ ] Questions required bloquent si vides

### Resultats

- [ ] Mensualite calculee correctement
- [ ] Taux effectif affiche
- [ ] Cout total = mensualite x duree
- [ ] Categorie risque (A/B/C/D) affichee
- [ ] Probabilite d'approbation affichee
- [ ] Temps de reponse estime affiche
- [ ] Score brut visible (0-100)
- [ ] Facteurs de score detailles

### Traductions

- [ ] FR : Toutes les questions traduites
- [ ] FR : Toutes les options traduites
- [ ] FR : Resultats traduits
- [ ] EN : Toutes les questions traduites
- [ ] EN : Toutes les options traduites
- [ ] EN : Resultats traduits

### Responsive

- [ ] Mobile : Formulaire lisible
- [ ] Mobile : Sliders fonctionnels
- [ ] Mobile : Resultats lisibles
- [ ] Tablet : Layout correct
- [ ] Desktop : Layout correct

---

## Phase 2 : Optimisation par pays (A FAIRE)

### Objectif
Adapter les options par pays (types de contrats, structures juridiques, etc.)

### 2.1 France
- Types contrats : CDI, CDD, Freelance, Auto-entrepreneur, Fonctionnaire
- Structures pro : Auto-entrepreneur, EURL, SARL, SAS, SASU
- Taux d'usure applicable
- Delai retractation 14 jours

### 2.2 Belgique
- Types contrats : CDI, CDD, Independant, Fonctionnaire
- Structures pro : Independant, SPRL, SA, SRL
- Langues : FR, NL, DE

### 2.3 Suisse
- Monnaie : CHF
- Permis de sejour (B, C, L)
- Structures : Raison individuelle, Sarl, SA

### 2.4 Espagne
- Types contrats : Indefinido, Temporal, Autonomo
- Structures : Autonomo, SL, SA

---

## Phase 3 : Structure traductions (A FAIRE)

### Objectif
Refactorer les traductions en fichiers separes par produit

### Structure cible
```
messages/
├── fr/
│   └── simulator/
│       ├── common.json
│       ├── micro-credit.json
│       ├── consumer.json
│       ├── professional.json
│       ├── student.json
│       ├── salary-advance.json
│       └── leasing.json
├── en/
│   └── simulator/...
├── es/
│   └── simulator/...
└── nl/
    └── simulator/...
```

---

## Phase 4 : Badge "Optimise pour" (A FAIRE)

### Objectif
Afficher un badge indiquant le pays optimise pour chaque produit

### Implementation
- Badge sur carte produit : "Optimise pour la France"
- Tooltip expliquant les adaptations
- Indicateur dans les resultats

---

## Notes techniques

### Convention de nommage
- Questions : `camelCase` (monthlyIncome, hasGuarantor)
- Cles traduction : `simulator.advanced.{product}.{section}.{field}`
- Scores : 0-100, ponderes en %

### Fichiers par produit
1. `parameters/products/{product}.json` - Parametres et scoring
2. `products/configs/{product}.ts` - Questions et logique
3. `messages/{locale}/tools.json` - Traductions (section simulator.advanced.{product})

### Types TypeScript
Tous les types sont dans `types.ts` :
- `MicroCreditData`, `ConsumerData`, `ProfessionalData`
- `StudentData`, `SalaryAdvanceData`, `LeasingData`
- Enums pour chaque option (BusinessSector, AssetType, etc.)

---

*Derniere mise a jour : Janvier 2025 - Phase 1 COMPLETE*

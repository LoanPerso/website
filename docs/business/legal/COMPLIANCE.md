# Compliance & Conformite - Quickfund

> **Derniere mise a jour :** Decembre 2025

---

## Cadre reglementaire

*Quel est le cadre reglementaire de Quickfund ?*

| Element | Valeur |
|---------|--------|
| Secteur | Credit a la consommation |
| Regulateur | FSA Estonie |
| Pays d'operation | France (clients) |
| Licence | Credit institution (Estonie) |
| Statut | Conforme |

*Pourquoi l'Estonie ?* Structure OU estonienne avec licence FSA. Permet d'operer dans l'UE via le passeport europeen.

---

## Reglementations applicables

*Quelles reglementations s'appliquent ?*

| Reglementation | Applicable | Conforme |
|----------------|:----------:|:--------:|
| RGPD | Oui | Oui |
| KYC/AML | Oui | Oui |
| FSA Estonie | Oui | Oui |
| Consumer Credit Directive | Oui | Oui |
| ePrivacy | Oui | Oui |
| DORA | A evaluer | A verifier |
| NIS2 | A evaluer | A verifier |

---

## RGPD / Protection des donnees

*Comment Quickfund gere-t-il les donnees personnelles ?*

### Responsabilites

| Element | Valeur |
|---------|--------|
| DPO | Non (pas obligatoire <250 employes) |
| Responsable traitement | Quickfund OU |
| Registre des traitements | A formaliser |
| Politique de confidentialite | Oui (site) |

### Donnees collectees

| Type de donnee | Base legale | Duree conservation |
|----------------|-------------|:------------------:|
| Identite (nom, adresse) | Contrat | Duree du pret + 5 ans |
| Documents (KYC) | Obligation legale | 5 ans apres fin relation |
| Bancaires | Contrat | Duree du pret + 5 ans |
| Historique prets | Obligation legale | 10 ans |

### Mesures de securite

| Mesure | Statut |
|--------|:------:|
| Chiffrement en transit (HTTPS) | Oui |
| Chiffrement au repos | A verifier |
| Acces restreint | Oui |
| Stockage en Europe | Oui |

---

## KYC / AML

*Comment Quickfund verifie-t-il l'identite des clients ?*

| Element | Valeur |
|---------|--------|
| Fournisseur KYC | Stripe Identity |
| Verification automatique | Oui |
| Review manuel si doute | Oui (fondateur) |
| Stockage documents | Interne |

### Process KYC

| Etape | Automatise | Outil |
|-------|:----------:|-------|
| Verification identite | Oui | Stripe Identity |
| Verification document | Oui | Stripe Identity |
| Screening AML | Oui | Stripe |
| Cas suspects | Manuel | Fondateur |

### Conformite AML

| Element | Statut |
|---------|:------:|
| Detection transactions suspectes | Oui |
| Reporting autorites | Si necessaire |
| Formation AML | N/A (1 personne) |

---

## Reporting regulateur

*Quelles obligations envers le FSA ?*

| Obligation | Frequence | Responsable |
|------------|:---------:|:-----------:|
| Reporting FSA | Periodique | Fondateur |
| Comptes annuels | Annuel | Comptable |
| Notification incidents | Si besoin | Fondateur |

---

## Securite de l'information

*Comment est geree la securite ?*

| Element | Valeur |
|---------|--------|
| PSSI | Non formalisee |
| RSSI | Non (fondateur gere) |
| Pentests internes | Oui (realises en interne) |
| Audits securite internes | Oui (realises en interne) |
| Pentests/Audits externes | Prevu prochainement |

### Mesures en place

| Mesure | Statut |
|--------|:------:|
| HTTPS partout | Oui |
| Authentification securisee | Oui |
| MFA admin | Oui |
| Backups | Oui (GCP, tous les 2 jours) |
| Monitoring | Oui (alertes partout) |

### Acces

| Element | Valeur |
|---------|--------|
| Acces admin | Fondateur uniquement |
| Gestion secrets | Variables d'environnement |
| Revue des acces | N/A (1 personne) |

---

## Continuite d'activite

*Existe-t-il un plan de continuite ?*

| Element | Valeur |
|---------|--------|
| PCA | Non formalise |
| PRA | Non formalise |
| Backups | Oui (GCP automatique) |
| Site de secours | VMCloud (prevu) |

### Risques operationnels

| Risque | Impact | Mitigation |
|--------|:------:|------------|
| Panne plateforme | Eleve | Restaurer depuis backup |
| Fondateur indisponible | Critique | Documenter les process |
| Panne Stripe | Critique | Pas d'alternative immediate |

---

## Gestion des risques

*Comment sont geres les risques ?*

| Element | Valeur |
|---------|--------|
| Cartographie des risques | Non formalisee |
| Comite des risques | Non (1 personne) |
| Methodologie | Informelle |

### Top risques identifies

| Risque | Probabilite | Impact |
|--------|:-----------:|:------:|
| Dependance banque liquidite | Moyenne | Critique |
| Fondateur = personne cle | Haute | Critique |
| Impayes massifs | Moyenne | Eleve |
| Fraude client | Moyenne | Moyen |

---

## Ethique et anti-corruption

*Quickfund a-t-il des politiques ethiques ?*

| Element | Valeur |
|---------|--------|
| Code de conduite | Non formalise |
| Politique anti-corruption | N/A (1 personne, pas de tiers) |
| Whistleblowing | N/A |
| Sapin II | Non applicable (Estonie) |

*Valeurs appliquees :* Transparence, respect, pragmatisme (cf VISION.md).

---

## Accessibilite

*Le produit est-il accessible ?*

| Element | Valeur |
|---------|--------|
| Standard suivi | A evaluer |
| Niveau actuel | A evaluer |
| Declaration accessibilite | Non |
| Audit realise | Non |

*A considerer :* Mettre en conformite avec RGAA/WCAG si l'activite grandit.

---

## RSE / Environnement

*Quickfund a-t-il des engagements RSE ?*

| Element | Valeur |
|---------|--------|
| Politique RSE | Non formalisee |
| Bilan carbone | Non realise |
| B-Corp | Non |

*Note :* Structure legere = empreinte faible. Pas de bureaux physiques, equipe minimale, infrastructure cloud mutualisee.

---

## Documentation compliance

*Ou est stockee la documentation ?*

| Element | Valeur |
|---------|--------|
| Centralisation | Interne |
| Acces | Fondateur |
| Pret pour audit | A ameliorer |

### Documents obligatoires

| Document | Existe | A jour |
|----------|:------:|:------:|
| Licence FSA | Oui | Oui |
| Statuts | Oui | Oui |
| Politique confidentialite | Oui | Oui |
| CGU/CGV | Oui | Oui |
| Registre traitements | A formaliser | - |

---

## Resume

| Element | Valeur |
|---------|--------|
| Regulateur | FSA Estonie |
| Licence | Oui (credit) |
| RGPD | Conforme |
| KYC/AML | Stripe Identity |
| Securite formalisee | Non |
| PCA/PRA | Non |
| Audit externe | Non realise |

---

## Actions potentielles

- [x] ~~Verifier le chiffrement au repos~~ → Oui, quasi-totalite chiffree
- [x] ~~Audits securite internes~~ → Realises
- [ ] Formaliser le registre des traitements RGPD
- [ ] Evaluer les obligations DORA/NIS2
- [ ] Documenter un PCA/PRA basique
- [ ] Realiser audit de securite externe (prevu prochainement)

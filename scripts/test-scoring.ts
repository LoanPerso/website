/**
 * Test Script for Credit Scoring Logic
 *
 * Tests different profiles against the business strategy defined in docs/business/products/PRICING.md
 *
 * Run with: npx tsx scripts/test-scoring.ts
 */

import * as fs from "fs";
import * as path from "path";

// Read JSON files
const microCreditParams = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../app/_components/tools/AdvancedSimulator/parameters/products/micro-credit.json"), "utf-8")
);
const consumerParams = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../app/_components/tools/AdvancedSimulator/parameters/products/consumer.json"), "utf-8")
);

interface TestProfile {
  name: string;
  description: string;
  data: {
    age: number;
    employmentStatus: string;
    employmentDuration?: string;
    housingStatus: string;
    creditHistory: string;
    monthlyIncome: number;
    monthlyExpenses: number;
    amount: number;
    duration: number;
    loanPurpose?: string;
  };
  expectedCategory: "A" | "B" | "C" | "D";
  expectedApproval: "high" | "medium" | "low";
}

// Define test profiles based on docs/business/products/SEGMENTS.md personas
const testProfiles: TestProfile[] = [
  // Category A profiles (score >= 80 for micro-credit, >= 75 for consumer)
  {
    name: "Profil Idéal - CDI stable",
    description: "35 ans, CDI > 2 ans, propriétaire, excellent historique, faible endettement",
    data: {
      age: 35,
      employmentStatus: "cdi",
      employmentDuration: "more-than-2-years",
      housingStatus: "owner",
      creditHistory: "excellent",
      monthlyIncome: 3000,
      monthlyExpenses: 800,
      amount: 500,
      duration: 6,
      loanPurpose: "auto",
    },
    expectedCategory: "A",
    expectedApproval: "high",
  },

  // Category B profiles
  {
    name: "Marie - Refusée bancaire mais stable",
    description: "38 ans, CDI, locataire, bon historique (incident ancien), revenus corrects",
    data: {
      age: 38,
      employmentStatus: "cdi",
      employmentDuration: "1-to-2-years",
      housingStatus: "tenant",
      creditHistory: "good",
      monthlyIncome: 2200,
      monthlyExpenses: 700,
      amount: 1000,
      duration: 12,
      loanPurpose: "homeImprovement",
    },
    expectedCategory: "B",
    expectedApproval: "high",
  },

  // Young profile without history
  {
    name: "Alex - Jeune sans historique",
    description: "22 ans, premier CDD, hébergé chez parents, pas d'historique",
    data: {
      age: 22,
      employmentStatus: "cdd",
      employmentDuration: "less-than-6-months",
      housingStatus: "hosted",
      creditHistory: "good",
      monthlyIncome: 1200,
      monthlyExpenses: 200,
      amount: 300,
      duration: 3,
    },
    expectedCategory: "B",
    expectedApproval: "high",
  },

  // Freelance profile
  {
    name: "Thomas - Freelance stable",
    description: "32 ans, freelance > 2 ans, locataire, bon historique",
    data: {
      age: 32,
      employmentStatus: "freelance",
      employmentDuration: "more-than-2-years",
      housingStatus: "tenant",
      creditHistory: "good",
      monthlyIncome: 3500,
      monthlyExpenses: 1200,
      amount: 2000,
      duration: 12,
      loanPurpose: "equipment",
    },
    expectedCategory: "B",
    expectedApproval: "high",
  },

  // Category C profiles
  {
    name: "Profil à risque modéré",
    description: "45 ans, CDD, locataire, historique moyen, endettement moyen",
    data: {
      age: 45,
      employmentStatus: "cdd",
      employmentDuration: "6-months-to-1-year",
      housingStatus: "tenant",
      creditHistory: "mixed",
      monthlyIncome: 1800,
      monthlyExpenses: 700,
      amount: 500,
      duration: 6,
    },
    expectedCategory: "C",
    expectedApproval: "medium",
  },

  // Category D profiles (high risk)
  {
    name: "Marc - Profil à risque",
    description: "50 ans, sans emploi, hébergé, incidents récents, endettement élevé",
    data: {
      age: 50,
      employmentStatus: "unemployed",
      housingStatus: "hosted",
      creditHistory: "incidents",
      monthlyIncome: 800,
      monthlyExpenses: 500,
      amount: 300,
      duration: 3,
    },
    expectedCategory: "D",
    expectedApproval: "low",
  },

  // Student profile
  {
    name: "Étudiant avec garant potentiel",
    description: "21 ans, étudiant, hébergé, pas d'historique, petit revenu",
    data: {
      age: 21,
      employmentStatus: "student",
      housingStatus: "hosted",
      creditHistory: "good",
      monthlyIncome: 500,
      monthlyExpenses: 100,
      amount: 200,
      duration: 6,
    },
    expectedCategory: "C",
    expectedApproval: "medium",
  },

  // Retiree profile
  {
    name: "Retraité stable",
    description: "65 ans, retraité, propriétaire, excellent historique",
    data: {
      age: 65,
      employmentStatus: "retired",
      housingStatus: "owner",
      creditHistory: "excellent",
      monthlyIncome: 2500,
      monthlyExpenses: 600,
      amount: 1000,
      duration: 12,
      loanPurpose: "travel",
    },
    expectedCategory: "A",
    expectedApproval: "high",
  },
];

// Scoring function (replicating the logic from the product configs)
function calculateScore(profile: TestProfile["data"], product: "micro-credit" | "consumer"): { score: number; category: "A" | "B" | "C" | "D" } {
  const params = product === "micro-credit" ? microCreditParams : consumerParams;
  let totalScore = params.scoring.baseScore;

  // Age score
  const age = profile.age;
  const ageRanges = params.scoring.ageRanges;
  let ageScore = ageRanges.default;
  if (age >= ageRanges.optimal.min && age <= ageRanges.optimal.max) ageScore = ageRanges.optimal.score;
  else if (age >= ageRanges.good.min && age <= ageRanges.good.max) ageScore = ageRanges.good.score;
  else if (ageRanges.acceptable1 && age >= ageRanges.acceptable1.min && age <= ageRanges.acceptable1.max) ageScore = ageRanges.acceptable1.score;
  else if (ageRanges.acceptable2 && age >= ageRanges.acceptable2.min && age <= ageRanges.acceptable2.max) ageScore = ageRanges.acceptable2.score;
  else if (ageRanges.acceptable && age >= ageRanges.acceptable.min && age <= ageRanges.acceptable.max) ageScore = ageRanges.acceptable.score;
  totalScore += (ageScore / 100) * params.scoring.weights.age;

  // Employment status score
  const employmentScores = params.questions.employmentStatus.scores;
  const employmentScore = employmentScores[profile.employmentStatus] || 50;
  totalScore += (employmentScore / 100) * params.scoring.weights.employmentStatus;

  // Employment duration score (if applicable)
  if (profile.employmentDuration && params.scoring.weights.employmentDuration) {
    const durationScores = params.questions.employmentDuration.scores;
    const durationScore = durationScores[profile.employmentDuration] || 50;
    totalScore += (durationScore / 100) * params.scoring.weights.employmentDuration;
  }

  // Housing status score
  const housingScores = params.questions.housingStatus.scores;
  const housingScore = housingScores[profile.housingStatus] || 50;
  totalScore += (housingScore / 100) * params.scoring.weights.housingStatus;

  // Credit history score
  const creditScores = params.questions.creditHistory.scores;
  const creditScore = creditScores[profile.creditHistory] || 50;
  totalScore += (creditScore / 100) * params.scoring.weights.creditHistory;

  // Debt ratio score
  const monthlyPayment = profile.amount / profile.duration;
  const totalMonthlyDebt = profile.monthlyExpenses + monthlyPayment;
  const ratio = profile.monthlyIncome > 0 ? totalMonthlyDebt / profile.monthlyIncome : 1;
  const debtRatioRanges = params.scoring.debtRatioRanges;
  let debtRatioScore = debtRatioRanges.default;
  if (ratio <= debtRatioRanges.excellent.maxRatio) debtRatioScore = debtRatioRanges.excellent.score;
  else if (ratio <= debtRatioRanges.good.maxRatio) debtRatioScore = debtRatioRanges.good.score;
  else if (ratio <= debtRatioRanges.acceptable.maxRatio) debtRatioScore = debtRatioRanges.acceptable.score;
  else if (ratio <= debtRatioRanges.risky.maxRatio) debtRatioScore = debtRatioRanges.risky.score;
  totalScore += (debtRatioScore / 100) * params.scoring.weights.debtRatio;

  // Loan purpose score (consumer only)
  if (product === "consumer" && profile.loanPurpose && params.questions.loanPurpose) {
    const purposeScores = params.questions.loanPurpose.scores;
    const purposeScore = purposeScores[profile.loanPurpose] || 50;
    totalScore += (purposeScore / 100) * params.scoring.weights.loanPurpose;
  }

  // Clamp score
  totalScore = Math.max(0, Math.min(100, totalScore));

  // Determine category
  const thresholds = params.scoring.thresholds;
  let category: "A" | "B" | "C" | "D";
  if (totalScore >= thresholds.A) category = "A";
  else if (totalScore >= thresholds.B) category = "B";
  else if (totalScore >= thresholds.C) category = "C";
  else category = "D";

  return { score: Math.round(totalScore * 10) / 10, category };
}

// Calculate rate
function calculateRate(category: "A" | "B" | "C" | "D", product: "micro-credit" | "consumer"): number {
  const params = product === "micro-credit" ? microCreditParams : consumerParams;
  const baseRate = params.calculation.baseRate;
  const adjustment = params.calculation.rateAdjustments[category];
  return Math.max(params.calculation.minRate, Math.min(params.calculation.maxRate, baseRate + adjustment));
}

// Run tests
console.log("╔═══════════════════════════════════════════════════════════════════════════════╗");
console.log("║                    TEST DE LA LOGIQUE DE SCORING                              ║");
console.log("║  Basé sur la stratégie définie dans docs/business/products/PRICING.md        ║");
console.log("╚═══════════════════════════════════════════════════════════════════════════════╝\n");

let passed = 0;
let failed = 0;

for (const profile of testProfiles) {
  const product = profile.data.loanPurpose ? "consumer" : "micro-credit";
  const result = calculateScore(profile.data, product);
  const rate = calculateRate(result.category, product);
  const approval = product === "micro-credit"
    ? microCreditParams.approvalProbability[result.category]
    : consumerParams.approvalProbability[result.category];

  const categoryMatch = result.category === profile.expectedCategory;
  const approvalMatch = approval === profile.expectedApproval;

  const status = categoryMatch && approvalMatch ? "✅ PASS" : "❌ FAIL";
  if (categoryMatch && approvalMatch) passed++;
  else failed++;

  console.log(`┌─────────────────────────────────────────────────────────────────────────────────┐`);
  console.log(`│ ${profile.name.padEnd(77)} │`);
  console.log(`├─────────────────────────────────────────────────────────────────────────────────┤`);
  console.log(`│ ${profile.description.padEnd(77)} │`);
  console.log(`├───────────────────┬──────────────────┬──────────────────┬──────────────────────┤`);
  console.log(`│ Produit: ${product.padEnd(8)} │ Score: ${String(result.score).padEnd(9)} │ Cat: ${result.category.padEnd(12)} │ Taux: ${rate.toFixed(1)}%           │`);
  console.log(`├───────────────────┴──────────────────┴──────────────────┴──────────────────────┤`);
  console.log(`│ Attendu: Cat ${profile.expectedCategory}, ${profile.expectedApproval.padEnd(6)} | Obtenu: Cat ${result.category}, ${approval.padEnd(6)}   ${status.padStart(21)} │`);
  console.log(`└─────────────────────────────────────────────────────────────────────────────────┘`);
  console.log();
}

console.log("═══════════════════════════════════════════════════════════════════════════════════");
console.log(`                    RÉSULTATS: ${passed} PASSÉS, ${failed} ÉCHOUÉS                           `);
console.log("═══════════════════════════════════════════════════════════════════════════════════");

// Afficher les grilles de taux par catégorie
console.log("\n┌─────────────────────────────────────────────────────────────────────────────────┐");
console.log("│                         GRILLE DE TAUX PAR CATÉGORIE                           │");
console.log("├──────────────────────┬──────────┬──────────┬──────────┬──────────┬─────────────┤");
console.log("│ Produit              │  Cat A   │  Cat B   │  Cat C   │  Cat D   │ Approbation │");
console.log("├──────────────────────┼──────────┼──────────┼──────────┼──────────┼─────────────┤");

for (const prod of ["micro-credit", "consumer"] as const) {
  const params = prod === "micro-credit" ? microCreditParams : consumerParams;
  const rateA = calculateRate("A", prod);
  const rateB = calculateRate("B", prod);
  const rateC = calculateRate("C", prod);
  const rateD = calculateRate("D", prod);
  console.log(`│ ${prod.padEnd(20)} │ ${rateA.toFixed(1)}%     │ ${rateB.toFixed(1)}%     │ ${rateC.toFixed(1)}%     │ ${rateD.toFixed(1)}%     │ A/B:high    │`);
}
console.log("└──────────────────────┴──────────┴──────────┴──────────┴──────────┴─────────────┘");

console.log("\n📊 Critères de scoring (basés sur PRICING.md):");
console.log("   • Stabilité revenus (25%): CDI=100, CDD=70, Freelance=60, Chômeur=20");
console.log("   • Historique crédit (25%): Excellent=100, Bon=75, Moyen=45, Incidents=20");
console.log("   • Ratio endettement (20%): <30%=100, <40%=75, <50%=50, <70%=25");
console.log("   • Ancienneté emploi (10%): >2ans=100, 1-2ans=80, 6m-1an=50, <6m=30");
console.log("   • Logement (10%): Proprio=100, Locataire=70, Hébergé=40");
console.log("   • Âge (10%): 26-45=100, 46-55=85, 18-25=70, 56-65=70");

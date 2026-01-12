/**
 * Complete Scoring Logic for Credit Simulator
 *
 * This module implements the full scoring logic based on the business strategy
 * defined in docs/business/products/PRICING.md
 */

import {
  SimulatorFormData,
  SimulationResult,
  ScoreFactor,
  FinancialAnalysis,
  CreditType
} from "../types";

// Type for product parameters
interface ProductParams {
  id: string;
  questions: {
    employmentStatus?: { scores: Record<string, number> };
    employmentDuration?: { scores: Record<string, number> };
    housingStatus?: { scores: Record<string, number> };
    creditHistory?: { scores: Record<string, number> };
    loanPurpose?: { scores: Record<string, number> };
  };
  scoring: {
    baseScore: number;
    weights: Record<string, number>;
    thresholds: { A: number; B: number; C: number };
    ageRanges: Record<string, { min?: number; max?: number; score: number }>;
    debtRatioRanges: Record<string, { maxRatio?: number; score: number }>;
    remainingIncomeRanges: Record<string, { minPerPerson?: number; score: number }>;
  };
  limits: {
    maxDebtRatio: number;
    minRemainingIncomePerPerson: number;
    maxAmountMultiplier: number;
    baseMinRemainingIncome: number;
    perDependentAmount: number;
  };
  calculation: {
    baseRate: number;
    minRate: number;
    maxRate: number;
    rateAdjustments: Record<string, number>;
  };
  approvalProbability: Record<string, string>;
  responseTime: { default: string; fastTrack?: string };
}

// Load product parameters
import microCreditParams from "../parameters/products/micro-credit.json";
import consumerParams from "../parameters/products/consumer.json";

const productParamsMap: Record<string, ProductParams> = {
  "micro-credit": microCreditParams as unknown as ProductParams,
  "consumer": consumerParams as unknown as ProductParams,
};

/**
 * Calculate the financial analysis for a loan application
 */
export function calculateFinancialAnalysis(
  formData: SimulatorFormData,
  monthlyPayment: number,
  params: ProductParams
): FinancialAnalysis {
  const data = formData as unknown as Record<string, unknown>;

  const monthlyIncome = (data.monthlyIncome as number) || 0;
  const monthlyExpenses = (data.monthlyExpenses as number) || 0;
  const existingLoans = (data.existingLoans as number) || 0;
  const dependents = (data.dependents as number) || 0;

  // Total people in household (applicant + dependents)
  const householdSize = 1 + dependents;

  // Total monthly charges before new loan
  const totalMonthlyCharges = monthlyExpenses + existingLoans;

  // Total debt after new loan
  const totalDebtAfterLoan = totalMonthlyCharges + monthlyPayment;

  // Remaining income (reste à vivre)
  const remainingIncome = monthlyIncome - totalDebtAfterLoan;

  // Debt ratio
  const debtRatio = monthlyIncome > 0 ? totalDebtAfterLoan / monthlyIncome : 1;

  // Remaining income per person
  const remainingIncomePerPerson = householdSize > 0 ? remainingIncome / householdSize : 0;

  // Minimum required remaining income
  const minRemainingIncome = params.limits.baseMinRemainingIncome +
    (dependents * params.limits.perDependentAmount);

  // Calculate max recommended amount
  const maxMonthlyPayment = Math.max(0,
    (monthlyIncome * params.limits.maxDebtRatio) - totalMonthlyCharges
  );
  const maxRecommendedAmount = maxMonthlyPayment * formData.duration;

  // Warning flags
  const isAmountTooHigh = formData.amount > maxRecommendedAmount * 1.2; // 20% tolerance
  const isRemainingIncomeTooLow = remainingIncome < minRemainingIncome;

  return {
    monthlyIncome,
    totalMonthlyCharges,
    proposedPayment: monthlyPayment,
    totalDebtAfterLoan,
    remainingIncome,
    debtRatio,
    remainingIncomePerPerson,
    minRemainingIncome,
    maxRecommendedAmount: Math.round(maxRecommendedAmount),
    isAmountTooHigh,
    isRemainingIncomeTooLow,
  };
}

/**
 * Calculate individual score factors with explanations
 */
export function calculateScoreFactors(
  formData: SimulatorFormData,
  financialAnalysis: FinancialAnalysis,
  params: ProductParams,
  t: (key: string) => string
): ScoreFactor[] {
  const factors: ScoreFactor[] = [];
  const data = formData as unknown as Record<string, unknown>;
  const weights = params.scoring.weights;

  // 1. Age score
  if (data.age) {
    const age = data.age as number;
    const ageRanges = params.scoring.ageRanges;
    let ageScore = ageRanges.default?.score || 50;

    if (ageRanges.optimal && age >= (ageRanges.optimal.min || 0) && age <= (ageRanges.optimal.max || 100)) {
      ageScore = ageRanges.optimal.score;
    } else if (ageRanges.good && age >= (ageRanges.good.min || 0) && age <= (ageRanges.good.max || 100)) {
      ageScore = ageRanges.good.score;
    } else if (ageRanges.acceptable1 && age >= (ageRanges.acceptable1.min || 0) && age <= (ageRanges.acceptable1.max || 100)) {
      ageScore = ageRanges.acceptable1.score;
    } else if (ageRanges.acceptable2 && age >= (ageRanges.acceptable2.min || 0) && age <= (ageRanges.acceptable2.max || 100)) {
      ageScore = ageRanges.acceptable2.score;
    } else if (ageRanges.acceptable && age >= (ageRanges.acceptable.min || 0) && age <= (ageRanges.acceptable.max || 100)) {
      ageScore = ageRanges.acceptable.score;
    }

    const contribution = (ageScore / 100) * (weights.age || 0);
    factors.push({
      id: "age",
      label: t("simulator.advanced.scoreFactors.age"),
      impact: ageScore >= 80 ? "positive" : ageScore >= 60 ? "neutral" : "negative",
      score: ageScore,
      weight: weights.age || 0,
      contribution,
    });
  }

  // 2. Employment status
  if (data.employmentStatus && params.questions.employmentStatus) {
    const status = data.employmentStatus as string;
    const scores = params.questions.employmentStatus.scores;
    const score = scores[status] || 50;
    const contribution = (score / 100) * (weights.employmentStatus || 0);

    factors.push({
      id: "employmentStatus",
      label: t("simulator.advanced.scoreFactors.employmentStatus"),
      impact: score >= 80 ? "positive" : score >= 60 ? "neutral" : "negative",
      score,
      weight: weights.employmentStatus || 0,
      contribution,
    });
  }

  // 3. Employment duration
  if (data.employmentDuration && params.questions.employmentDuration) {
    const duration = data.employmentDuration as string;
    const scores = params.questions.employmentDuration.scores;
    const score = scores[duration] || 50;
    const contribution = (score / 100) * (weights.employmentDuration || 0);

    factors.push({
      id: "employmentDuration",
      label: t("simulator.advanced.scoreFactors.employmentDuration"),
      impact: score >= 80 ? "positive" : score >= 50 ? "neutral" : "negative",
      score,
      weight: weights.employmentDuration || 0,
      contribution,
    });
  }

  // 4. Housing status
  if (data.housingStatus && params.questions.housingStatus) {
    const housing = data.housingStatus as string;
    const scores = params.questions.housingStatus.scores;
    const score = scores[housing] || 50;
    const contribution = (score / 100) * (weights.housingStatus || 0);

    factors.push({
      id: "housingStatus",
      label: t("simulator.advanced.scoreFactors.housingStatus"),
      impact: score >= 80 ? "positive" : score >= 60 ? "neutral" : "negative",
      score,
      weight: weights.housingStatus || 0,
      contribution,
    });
  }

  // 5. Credit history
  if (data.creditHistory && params.questions.creditHistory) {
    const history = data.creditHistory as string;
    const scores = params.questions.creditHistory.scores;
    const score = scores[history] || 50;
    const contribution = (score / 100) * (weights.creditHistory || 0);

    factors.push({
      id: "creditHistory",
      label: t("simulator.advanced.scoreFactors.creditHistory"),
      impact: score >= 75 ? "positive" : score >= 50 ? "neutral" : "negative",
      score,
      weight: weights.creditHistory || 0,
      contribution,
    });
  }

  // 6. Debt ratio
  {
    const ratio = financialAnalysis.debtRatio;
    const ranges = params.scoring.debtRatioRanges;
    let score = ranges.default?.score || 5;

    if (ranges.excellent && ratio <= (ranges.excellent.maxRatio || 0)) {
      score = ranges.excellent.score;
    } else if (ranges.good && ratio <= (ranges.good.maxRatio || 0)) {
      score = ranges.good.score;
    } else if (ranges.acceptable && ratio <= (ranges.acceptable.maxRatio || 0)) {
      score = ranges.acceptable.score;
    } else if (ranges.risky && ratio <= (ranges.risky.maxRatio || 0)) {
      score = ranges.risky.score;
    } else if (ranges.veryRisky && ratio <= (ranges.veryRisky.maxRatio || 0)) {
      score = ranges.veryRisky.score;
    }

    const contribution = (score / 100) * (weights.debtRatio || 0);
    factors.push({
      id: "debtRatio",
      label: t("simulator.advanced.scoreFactors.debtRatio"),
      impact: score >= 80 ? "positive" : score >= 50 ? "neutral" : "negative",
      score,
      weight: weights.debtRatio || 0,
      contribution,
    });
  }

  // 7. Remaining income
  {
    const remainingPerPerson = financialAnalysis.remainingIncomePerPerson;
    const ranges = params.scoring.remainingIncomeRanges;
    let score = ranges.default?.score || 5;

    if (ranges.excellent && remainingPerPerson >= (ranges.excellent.minPerPerson || 0)) {
      score = ranges.excellent.score;
    } else if (ranges.good && remainingPerPerson >= (ranges.good.minPerPerson || 0)) {
      score = ranges.good.score;
    } else if (ranges.acceptable && remainingPerPerson >= (ranges.acceptable.minPerPerson || 0)) {
      score = ranges.acceptable.score;
    } else if (ranges.tight && remainingPerPerson >= (ranges.tight.minPerPerson || 0)) {
      score = ranges.tight.score;
    } else if (ranges.veryTight && remainingPerPerson >= (ranges.veryTight.minPerPerson || 0)) {
      score = ranges.veryTight.score;
    }

    const contribution = (score / 100) * (weights.remainingIncome || 0);
    factors.push({
      id: "remainingIncome",
      label: t("simulator.advanced.scoreFactors.remainingIncome"),
      impact: score >= 80 ? "positive" : score >= 50 ? "neutral" : "negative",
      score,
      weight: weights.remainingIncome || 0,
      contribution,
    });
  }

  // 8. Loan purpose (consumer only)
  if (data.loanPurpose && params.questions.loanPurpose) {
    const purpose = data.loanPurpose as string;
    const scores = params.questions.loanPurpose.scores;
    const score = scores[purpose] || 50;
    const contribution = (score / 100) * (weights.loanPurpose || 0);

    factors.push({
      id: "loanPurpose",
      label: t("simulator.advanced.scoreFactors.loanPurpose"),
      impact: score >= 80 ? "positive" : score >= 60 ? "neutral" : "negative",
      score,
      weight: weights.loanPurpose || 0,
      contribution,
    });
  }

  return factors;
}

/**
 * Generate warnings based on the financial analysis
 */
export function generateWarnings(
  financialAnalysis: FinancialAnalysis,
  params: ProductParams,
  t: (key: string) => string
): string[] {
  const warnings: string[] = [];

  if (financialAnalysis.isAmountTooHigh) {
    warnings.push(
      t("simulator.advanced.warnings.amountTooHigh")
        .replace("{max}", financialAnalysis.maxRecommendedAmount.toString())
    );
  }

  if (financialAnalysis.isRemainingIncomeTooLow) {
    warnings.push(
      t("simulator.advanced.warnings.remainingIncomeLow")
        .replace("{min}", Math.round(financialAnalysis.minRemainingIncome).toString())
    );
  }

  if (financialAnalysis.debtRatio > params.limits.maxDebtRatio) {
    warnings.push(
      t("simulator.advanced.warnings.debtRatioHigh")
        .replace("{ratio}", Math.round(financialAnalysis.debtRatio * 100).toString())
        .replace("{max}", Math.round(params.limits.maxDebtRatio * 100).toString())
    );
  }

  return warnings;
}

/**
 * Generate recommendations to improve the application
 */
export function generateRecommendations(
  formData: SimulatorFormData,
  financialAnalysis: FinancialAnalysis,
  scoreFactors: ScoreFactor[],
  t: (key: string) => string
): string[] {
  const recommendations: string[] = [];

  // Find negative factors
  const negativeFactors = scoreFactors.filter(f => f.impact === "negative");

  // Amount too high
  if (financialAnalysis.isAmountTooHigh && financialAnalysis.maxRecommendedAmount > 0) {
    recommendations.push(
      t("simulator.advanced.recommendations.reduceAmount")
        .replace("{amount}", financialAnalysis.maxRecommendedAmount.toString())
    );
  }

  // Suggest longer duration if debt ratio is high
  if (financialAnalysis.debtRatio > 0.4 && formData.duration < 24) {
    recommendations.push(t("simulator.advanced.recommendations.longerDuration"));
  }

  // Credit history issues
  const creditFactor = scoreFactors.find(f => f.id === "creditHistory");
  if (creditFactor && creditFactor.score < 50) {
    recommendations.push(t("simulator.advanced.recommendations.improveCreditHistory"));
  }

  // Remaining income too low
  if (financialAnalysis.remainingIncomePerPerson < 400) {
    recommendations.push(t("simulator.advanced.recommendations.reduceExpenses"));
  }

  // Limit to 3 recommendations
  return recommendations.slice(0, 3);
}

/**
 * Calculate the complete simulation result
 */
export function calculateCompleteResult(
  formData: SimulatorFormData,
  t: (key: string) => string
): SimulationResult | null {
  const creditType = formData.creditType;
  if (!creditType) return null;

  const params = productParamsMap[creditType];
  if (!params) {
    // Fallback for other credit types - use a basic calculation
    return calculateBasicResult(formData);
  }

  // Calculate monthly payment (simplified)
  const rate = params.calculation.baseRate / 100 / 12;
  const n = formData.duration;
  const monthlyPayment = formData.amount * (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
  const totalCost = monthlyPayment * n;
  const totalInterest = totalCost - formData.amount;

  // Calculate financial analysis
  const financialAnalysis = calculateFinancialAnalysis(formData, monthlyPayment, params);

  // Calculate score factors
  const scoreFactors = calculateScoreFactors(formData, financialAnalysis, params, t);

  // Calculate total score
  const rawScore = Math.min(100, Math.max(0,
    params.scoring.baseScore + scoreFactors.reduce((sum, f) => sum + f.contribution, 0)
  ));

  // Determine risk category
  const thresholds = params.scoring.thresholds;
  let riskCategory: "A" | "B" | "C" | "D";
  if (rawScore >= thresholds.A) riskCategory = "A";
  else if (rawScore >= thresholds.B) riskCategory = "B";
  else if (rawScore >= thresholds.C) riskCategory = "C";
  else riskCategory = "D";

  // Calculate adjusted rate
  const rateAdjustment = params.calculation.rateAdjustments[riskCategory] || 0;
  const effectiveRate = Math.max(
    params.calculation.minRate,
    Math.min(params.calculation.maxRate, params.calculation.baseRate + rateAdjustment)
  );

  // Recalculate with effective rate
  const effectiveMonthlyRate = effectiveRate / 100 / 12;
  const finalMonthlyPayment = formData.amount *
    (effectiveMonthlyRate * Math.pow(1 + effectiveMonthlyRate, n)) /
    (Math.pow(1 + effectiveMonthlyRate, n) - 1);
  const finalTotalCost = finalMonthlyPayment * n;
  const finalTotalInterest = finalTotalCost - formData.amount;

  // Generate warnings and recommendations
  const warnings = generateWarnings(financialAnalysis, params, t);
  const recommendations = generateRecommendations(formData, financialAnalysis, scoreFactors, t);

  // Get approval probability
  const approvalProbability = (params.approvalProbability[riskCategory] || "medium") as "high" | "medium" | "low";

  // Get response time
  const estimatedResponseTime = riskCategory === "A" && params.responseTime.fastTrack
    ? params.responseTime.fastTrack
    : params.responseTime.default;

  return {
    monthlyPayment: Math.round(finalMonthlyPayment * 100) / 100,
    totalCost: Math.round(finalTotalCost * 100) / 100,
    totalInterest: Math.round(finalTotalInterest * 100) / 100,
    effectiveRate,
    riskCategory,
    approvalProbability,
    estimatedResponseTime,
    rawScore: Math.round(rawScore * 10) / 10,
    scoreFactors,
    financialAnalysis,
    warnings,
    recommendations,
  };
}

/**
 * Basic result calculation for products without full scoring
 */
function calculateBasicResult(formData: SimulatorFormData): SimulationResult {
  const rate = 12 / 100 / 12; // Default 12% annual
  const n = formData.duration;
  const monthlyPayment = formData.amount * (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
  const totalCost = monthlyPayment * n;
  const totalInterest = totalCost - formData.amount;

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    effectiveRate: 12,
    riskCategory: "B",
    approvalProbability: "high",
    estimatedResponseTime: "24-48h",
    rawScore: 60,
    scoreFactors: [],
    financialAnalysis: {
      monthlyIncome: 0,
      totalMonthlyCharges: 0,
      proposedPayment: monthlyPayment,
      totalDebtAfterLoan: monthlyPayment,
      remainingIncome: 0,
      debtRatio: 0,
      remainingIncomePerPerson: 0,
      minRemainingIncome: 400,
      maxRecommendedAmount: formData.amount,
      isAmountTooHigh: false,
      isRemainingIncomeTooLow: false,
    },
    warnings: [],
    recommendations: [],
  };
}

/**
 * Cache simulation data for later submission
 */
const SIMULATION_CACHE_KEY = "quickfund_simulation_cache";

export interface SimulationCache {
  formData: SimulatorFormData;
  result: SimulationResult;
  timestamp: number;
  expiresAt: number;
}

export function saveSimulationToCache(formData: SimulatorFormData, result: SimulationResult): void {
  const cache: SimulationCache = {
    formData,
    result,
    timestamp: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  };

  try {
    localStorage.setItem(SIMULATION_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Failed to save simulation to cache:", e);
  }
}

export function getSimulationFromCache(): SimulationCache | null {
  try {
    const cached = localStorage.getItem(SIMULATION_CACHE_KEY);
    if (!cached) return null;

    const cache: SimulationCache = JSON.parse(cached);

    // Check if expired
    if (Date.now() > cache.expiresAt) {
      localStorage.removeItem(SIMULATION_CACHE_KEY);
      return null;
    }

    return cache;
  } catch (e) {
    console.warn("Failed to get simulation from cache:", e);
    return null;
  }
}

export function clearSimulationCache(): void {
  try {
    localStorage.removeItem(SIMULATION_CACHE_KEY);
  } catch (e) {
    console.warn("Failed to clear simulation cache:", e);
  }
}

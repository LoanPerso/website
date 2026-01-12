/**
 * Product Configuration Registry
 *
 * Central registry for all product-specific configurations.
 * Each product has its own questions, scoring logic, and calculation method.
 */

export * from "./types";

import { CreditType, SimulatorFormData, SimulationResult, ScoreFactor, FinancialAnalysis } from "../types";
import { CountryCode, CountryOptions } from "../countries/types";
import { getProductLimits, getCountryConfig } from "../countries";
import {
  calculateFinancialAnalysis,
  calculateScoreFactors,
  generateWarnings,
  generateRecommendations,
} from "../utils/scoring";
import {
  ProductFullConfig,
  ProductRegistry,
  ScoringConfig,
  CalculationConfig,
  QuestionConfig,
} from "./types";

// Import product configs
import { MICRO_CREDIT_CONFIG } from "./configs/micro-credit";
import { CONSUMER_CONFIG } from "./configs/consumer";
import { PROFESSIONAL_CONFIG } from "./configs/professional";
import { STUDENT_CONFIG } from "./configs/student";
import { SALARY_ADVANCE_CONFIG } from "./configs/salary-advance";
import { LEASING_CONFIG } from "./configs/leasing";

// ============================================================
// REGISTRY
// ============================================================

export const PRODUCT_CONFIGS: ProductRegistry = {
  "micro-credit": MICRO_CREDIT_CONFIG,
  consumer: CONSUMER_CONFIG,
  professional: PROFESSIONAL_CONFIG,
  student: STUDENT_CONFIG,
  "salary-advance": SALARY_ADVANCE_CONFIG,
  leasing: LEASING_CONFIG,
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get product configuration
 */
export function getProductConfig(productId: CreditType): ProductFullConfig {
  return PRODUCT_CONFIGS[productId];
}

/**
 * Map question IDs to country options categories
 */
const QUESTION_TO_OPTIONS_CATEGORY: Record<string, keyof CountryOptions> = {
  employmentStatus: "employmentStatus",
  contractType: "contractType",
  businessType: "businessType",
  sector: "sector",
  businessNeed: "businessNeed",
  loanPurpose: "loanPurpose",
  institutionType: "institutionType",
  studyLevel: "studyLevel",
  assetType: "assetType",
  clientType: "clientType",
};

/**
 * Get questions for a product, with country-specific overrides and options filtering
 */
export function getProductQuestions(
  productId: CreditType,
  countryCode: CountryCode
): QuestionConfig[] {
  const config = getProductConfig(productId);
  const countryConfig = getCountryConfig(countryCode);
  const countryOptions = countryConfig.options;

  return config.questions.map((question) => {
    // Apply country overrides if they exist
    let updatedQuestion = question;
    if (question.countryOverrides?.[countryCode]) {
      updatedQuestion = { ...question, ...question.countryOverrides[countryCode] };
    }

    // Filter options for select questions based on country options
    if (updatedQuestion.type === "select" && updatedQuestion.options) {
      const optionsCategory = QUESTION_TO_OPTIONS_CATEGORY[updatedQuestion.id];

      if (optionsCategory && countryOptions[optionsCategory]) {
        const availableValues = countryOptions[optionsCategory];

        // Filter options to only include those available in this country
        const filteredOptions = updatedQuestion.options.filter((option) =>
          availableValues.includes(option.value)
        );

        return { ...updatedQuestion, options: filteredOptions };
      }
    }

    return updatedQuestion;
  });
}

/**
 * Filter questions based on conditional display
 */
export function getVisibleQuestions(
  productId: CreditType,
  countryCode: CountryCode,
  formData: SimulatorFormData
): QuestionConfig[] {
  const questions = getProductQuestions(productId, countryCode);

  return questions.filter((question) => {
    if (!question.showIf) return true;
    return question.showIf(formData, countryCode);
  });
}

/**
 * Calculate risk score for a product
 */
export function calculateRiskScore(
  productId: CreditType,
  formData: SimulatorFormData,
  countryCode: CountryCode
): { score: number; category: "A" | "B" | "C" | "D" } {
  const config = getProductConfig(productId);
  const { scoring } = config;

  let totalScore = scoring.baseScore;

  for (const factor of scoring.factors) {
    const fieldValue = (formData as unknown as Record<string, unknown>)[factor.fieldId];

    if (fieldValue === undefined || fieldValue === null) continue;

    let factorScore = 0;

    if (factor.scoreFn) {
      factorScore = factor.scoreFn(fieldValue, formData, countryCode);
    } else if (factor.scoreMap) {
      factorScore = factor.scoreMap[String(fieldValue)] || 0;
    }

    // Apply weight (factor.weight is 0-100, representing percentage)
    totalScore += (factorScore / 100) * factor.weight;
  }

  // Clamp score to 0-100
  totalScore = Math.max(0, Math.min(100, totalScore));

  // Determine category
  let category: "A" | "B" | "C" | "D";
  if (totalScore >= scoring.thresholds.A) {
    category = "A";
  } else if (totalScore >= scoring.thresholds.B) {
    category = "B";
  } else if (totalScore >= scoring.thresholds.C) {
    category = "C";
  } else {
    category = "D";
  }

  return { score: totalScore, category };
}

/**
 * Calculate loan result
 */
export function calculateLoanResult(
  productId: CreditType,
  formData: SimulatorFormData,
  countryCode: CountryCode,
  overrideRate?: number | null
): SimulationResult {
  const config = getProductConfig(productId);
  const countryLimits = getProductLimits(countryCode, productId);

  // Calculate risk
  const { score, category } = calculateRiskScore(productId, formData, countryCode);

  // Get rate based on risk category (using product rates) or use override
  const { baseRate, minRate, maxRate } = config.calculation;
  let effectiveRate: number;

  if (overrideRate !== null && overrideRate !== undefined) {
    // Use custom rate, but still clamp within product limits
    effectiveRate = Math.max(minRate, Math.min(maxRate, overrideRate));
  } else {
    // Calculate based on risk category
    const rateAdjustment = config.calculation.rateAdjustments[category];
    effectiveRate = Math.max(
      minRate,
      Math.min(maxRate, baseRate + rateAdjustment)
    );
  }

  // Calculate payment
  const { calculation } = config;
  let monthlyPayment: number;
  let totalCost: number;
  let totalInterest: number;

  if (calculation.customCalculate) {
    // Use custom calculation
    const result = calculation.customCalculate(
      formData.amount,
      formData.duration,
      effectiveRate,
      formData
    );
    monthlyPayment = result.monthlyPayment;
    totalCost = result.totalCost;
    totalInterest = result.totalInterest;
  } else {
    // Standard compound interest calculation
    const monthlyRate = effectiveRate / 100 / 12;
    const n = formData.duration;

    if (monthlyRate === 0) {
      monthlyPayment = formData.amount / n;
    } else {
      monthlyPayment =
        (formData.amount * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
        (Math.pow(1 + monthlyRate, n) - 1);
    }

    // Add fees
    if (calculation.fees?.applicationFeePercent) {
      const appFee = formData.amount * (calculation.fees.applicationFeePercent / 100);
      monthlyPayment += appFee / n;
    }
    if (calculation.fees?.managementFee) {
      monthlyPayment += calculation.fees.managementFee;
    }

    totalCost = monthlyPayment * n;
    totalInterest = totalCost - formData.amount;
  }

  // Get response time
  let estimatedResponseTime = config.responseTime.default;
  if (config.responseTime.conditions) {
    for (const condition of config.responseTime.conditions) {
      if (condition.check(formData, category)) {
        estimatedResponseTime = condition.time;
        break;
      }
    }
  }

  // Calculate financial analysis (for products that support it)
  const data = formData as unknown as Record<string, unknown>;
  const monthlyIncome = (data.monthlyIncome as number) || 0;
  const monthlyExpenses = (data.monthlyExpenses as number) || 0;
  const existingLoans = (data.existingLoans as number) || 0;
  const dependents = (data.dependents as number) || 0;
  const householdSize = 1 + dependents;

  const totalMonthlyCharges = monthlyExpenses + existingLoans;
  const totalDebtAfterLoan = totalMonthlyCharges + monthlyPayment;
  const remainingIncome = monthlyIncome - totalDebtAfterLoan;
  const debtRatio = monthlyIncome > 0 ? totalDebtAfterLoan / monthlyIncome : 1;
  const remainingIncomePerPerson = householdSize > 0 ? remainingIncome / householdSize : 0;

  // Default limits (overridden by product-specific config if available)
  const maxDebtRatio = 0.45;
  const baseMinRemainingIncome = 400;
  const perDependentAmount = 150;
  const minRemainingIncome = baseMinRemainingIncome + (dependents * perDependentAmount);

  const maxMonthlyPayment = Math.max(0, (monthlyIncome * maxDebtRatio) - totalMonthlyCharges);
  const maxRecommendedAmount = Math.round(maxMonthlyPayment * formData.duration);

  const isAmountTooHigh = formData.amount > maxRecommendedAmount * 1.2;
  const isRemainingIncomeTooLow = remainingIncome < minRemainingIncome && monthlyIncome > 0;

  const financialAnalysis: FinancialAnalysis = {
    monthlyIncome,
    totalMonthlyCharges,
    proposedPayment: monthlyPayment,
    totalDebtAfterLoan,
    remainingIncome,
    debtRatio,
    remainingIncomePerPerson,
    minRemainingIncome,
    maxRecommendedAmount,
    isAmountTooHigh,
    isRemainingIncomeTooLow,
  };

  // Calculate score factors (with raw IDs as labels - translated in UI)
  const scoreFactors: ScoreFactor[] = [];
  for (const factor of config.scoring.factors) {
    const fieldValue = (formData as unknown as Record<string, unknown>)[factor.fieldId];
    if (fieldValue === undefined || fieldValue === null) continue;

    let factorScore = 0;
    if (factor.scoreFn) {
      factorScore = factor.scoreFn(fieldValue, formData, countryCode);
    } else if (factor.scoreMap) {
      factorScore = factor.scoreMap[String(fieldValue)] || 0;
    }

    const contribution = (factorScore / 100) * factor.weight;
    scoreFactors.push({
      id: factor.fieldId,
      label: factor.fieldId, // Will be translated in UI
      impact: factorScore >= 80 ? "positive" : factorScore >= 50 ? "neutral" : "negative",
      score: factorScore,
      weight: factor.weight,
      contribution,
    });
  }

  // Generate warnings (as IDs to be translated in UI)
  const warnings: string[] = [];
  if (isAmountTooHigh && monthlyIncome > 0) {
    warnings.push(`amountTooHigh:${maxRecommendedAmount}`);
  }
  if (isRemainingIncomeTooLow) {
    warnings.push(`remainingIncomeLow:${Math.round(minRemainingIncome)}`);
  }
  if (debtRatio > maxDebtRatio && monthlyIncome > 0) {
    warnings.push(`debtRatioHigh:${Math.round(debtRatio * 100)}:${Math.round(maxDebtRatio * 100)}`);
  }

  // Generate recommendations (as IDs)
  const recommendations: string[] = [];
  if (isAmountTooHigh && maxRecommendedAmount > 0) {
    recommendations.push(`reduceAmount:${maxRecommendedAmount}`);
  }
  if (debtRatio > 0.4 && formData.duration < 24) {
    recommendations.push("longerDuration");
  }
  const creditFactor = scoreFactors.find(f => f.id === "creditHistory");
  if (creditFactor && creditFactor.score < 50) {
    recommendations.push("improveCreditHistory");
  }
  if (remainingIncomePerPerson < 400 && remainingIncomePerPerson > 0) {
    recommendations.push("reduceExpenses");
  }

  return {
    monthlyPayment,
    totalCost,
    totalInterest,
    effectiveRate,
    riskCategory: category,
    approvalProbability: config.approvalProbability[category],
    estimatedResponseTime,
    rawScore: Math.round(score * 10) / 10,
    scoreFactors,
    financialAnalysis,
    warnings: warnings.slice(0, 3),
    recommendations: recommendations.slice(0, 3),
  };
}

/**
 * Get required fields for a product
 */
export function getRequiredFields(
  productId: CreditType,
  countryCode: CountryCode,
  formData: SimulatorFormData
): string[] {
  const questions = getVisibleQuestions(productId, countryCode, formData);
  return questions.filter((q) => q.required).map((q) => q.id);
}

/**
 * Check if all required fields are filled
 */
export function areRequiredFieldsFilled(
  productId: CreditType,
  countryCode: CountryCode,
  formData: SimulatorFormData
): boolean {
  const requiredFields = getRequiredFields(productId, countryCode, formData);

  for (const fieldId of requiredFields) {
    const value = (formData as unknown as Record<string, unknown>)[fieldId];
    if (value === undefined || value === null || value === "") {
      return false;
    }
  }

  return true;
}

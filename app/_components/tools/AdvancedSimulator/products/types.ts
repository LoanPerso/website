/**
 * Product Configuration Types
 *
 * Each product has its own:
 * - Questions to ask the user
 * - Scoring logic
 * - Calculation method
 * - Display settings
 */

import { CreditType, SimulatorFormData, SimulationResult } from "../types";
import { CountryCode } from "../countries/types";

// ============================================================
// QUESTION TYPES
// ============================================================

export type QuestionType =
  | "number"      // Age, income, etc.
  | "select"      // Single choice from options
  | "multiselect" // Multiple choices
  | "boolean"     // Yes/No
  | "date"        // Date picker
  | "slider";     // Range slider

export interface QuestionOption {
  value: string;
  labelKey: string;         // Translation key
  descriptionKey?: string;  // Optional description translation key
  score?: number;           // Score contribution for this option
}

export interface QuestionConfig {
  id: string;
  type: QuestionType;
  labelKey: string;           // Translation key for question
  subtitleKey?: string;       // Translation key for subtitle
  required: boolean;
  // For number/slider type
  min?: number;
  max?: number;
  step?: number;
  unit?: string;              // "years", "euros", etc.
  // For select/multiselect type
  options?: QuestionOption[];
  // Conditional display
  showIf?: (formData: SimulatorFormData, countryCode: CountryCode) => boolean;
  // Country-specific overrides
  countryOverrides?: Partial<Record<CountryCode, Partial<QuestionConfig>>>;
}

// ============================================================
// SCORING TYPES
// ============================================================

export interface ScoringFactor {
  fieldId: string;            // Which form field to check
  weight: number;             // 0-100, how important this factor is
  scoreMap?: Record<string, number>;  // Value -> score mapping
  // Or a custom scoring function
  scoreFn?: (value: unknown, formData: SimulatorFormData, countryCode: CountryCode) => number;
}

export interface ScoringConfig {
  baseScore: number;          // Starting score (0-100)
  factors: ScoringFactor[];
  // Category thresholds
  thresholds: {
    A: number;  // >= this = A
    B: number;  // >= this = B
    C: number;  // >= this = C
    // Below C = D
  };
}

// ============================================================
// CALCULATION TYPES
// ============================================================

export type InterestMethod =
  | "simple"      // Simple interest
  | "compound"    // Standard compound interest (most credits)
  | "flat"        // Flat rate (salary advance)
  | "degressive"; // Degressive (leasing)

export interface CalculationConfig {
  interestMethod: InterestMethod;
  // Base interest rate for this product (%)
  baseRate: number;
  // Minimum possible rate (%)
  minRate: number;
  // Maximum possible rate (%)
  maxRate: number;
  // Rate adjustment based on risk category
  rateAdjustments: {
    A: number;  // e.g., -1 (better rate)
    B: number;  // e.g., 0 (base rate)
    C: number;  // e.g., +2
    D: number;  // e.g., +4
  };
  // Optional fees
  fees?: {
    applicationFee?: number;        // Fixed fee
    applicationFeePercent?: number; // Percentage of amount
    insurancePercent?: number;      // Monthly insurance
    managementFee?: number;         // Monthly management fee
  };
  // Custom calculation override
  customCalculate?: (
    amount: number,
    duration: number,
    rate: number,
    formData: SimulatorFormData
  ) => {
    monthlyPayment: number;
    totalCost: number;
    totalInterest: number;
  };
}

// ============================================================
// RESPONSE TIME CONFIG
// ============================================================

export interface ResponseTimeConfig {
  default: string;  // e.g., "24-48h"
  // Faster for certain conditions
  conditions?: Array<{
    check: (formData: SimulatorFormData, riskCategory: string) => boolean;
    time: string;
  }>;
}

// ============================================================
// FULL PRODUCT CONFIG
// ============================================================

export interface ProductFullConfig {
  id: CreditType;

  // Display
  icon: string;
  color: string;
  descriptionKey: string;

  // Questions specific to this product
  questions: QuestionConfig[];

  // Scoring logic
  scoring: ScoringConfig;

  // Calculation method
  calculation: CalculationConfig;

  // Response time
  responseTime: ResponseTimeConfig;

  // Approval probability mapping from risk category
  approvalProbability: {
    A: "high" | "medium" | "low";
    B: "high" | "medium" | "low";
    C: "high" | "medium" | "low";
    D: "high" | "medium" | "low";
  };
}

// ============================================================
// REGISTRY TYPE
// ============================================================

export type ProductRegistry = Record<CreditType, ProductFullConfig>;

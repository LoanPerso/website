/**
 * Country Configuration Types
 *
 * This file defines the structure for country-specific configurations.
 * Each country can have different:
 * - Minimum age requirements
 * - Available credit products
 * - Amount/duration limits per product
 * - Interest rate ranges
 * - Required questions per product type
 */

import { CreditType } from "../types";

// Configured countries with specific parameters
export type ConfiguredCountryCode = "FR" | "BE" | "CH" | "ES";

// Any country code (for the dropdown)
export type CountryCode = string;

export interface ProductLimits {
  minAmount: number;
  maxAmount: number;
  minDuration: number; // in months
  maxDuration: number;
  minRate: number; // annual percentage rate
  maxRate: number;
  available: boolean;
}

export interface CountryProductConfig {
  "micro-credit": ProductLimits;
  consumer: ProductLimits;
  professional: ProductLimits;
  student: ProductLimits;
  "salary-advance": ProductLimits;
  leasing: ProductLimits;
}

export interface AgeRequirements {
  minAge: number;
  maxAge: number;
  studentMaxAge: number;
  salaryAdvanceMinAge: number;
}

export interface CountryFormatting {
  currencyCode: string;
  currencySymbol: string;
  currencyPosition: "before" | "after";
  decimalSeparator: string;
  thousandsSeparator: string;
  dateFormat: string;
}

export interface CountryLegalInfo {
  regulatoryBody: string;
  maxUsurateMultiplier: number; // e.g., 1.33 for France (taux d'usure)
  coolingOffPeriod: number; // days for withdrawal
  mandatoryInsurance: boolean;
}

// Country-specific options for form fields
export interface CountryOptions {
  employmentStatus: string[];
  contractType: string[];
  businessType: string[];
  sector: string[];
  businessNeed: string[];
  loanPurpose: string[];
  institutionType: string[];
  studyLevel: string[];
  assetType: string[];
  clientType: string[];
}

export interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string; // ISO country code for flag display
  locale: string;
  options: CountryOptions;
  age: AgeRequirements;
  products: CountryProductConfig;
  formatting: CountryFormatting;
  legal: CountryLegalInfo;
  availableProducts: CreditType[];
}

export interface CountryRegistry {
  [key: string]: CountryConfig;
}

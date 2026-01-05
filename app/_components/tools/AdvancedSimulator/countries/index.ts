/**
 * Country Configuration Registry
 *
 * Central registry for all country-specific configurations.
 * Countries with specific configs get personalized parameters.
 * Other countries use the default configuration.
 */

export * from "./types";
export * from "./all-countries";

import { FRANCE_CONFIG } from "./configs/france";
import { BELGIUM_CONFIG } from "./configs/belgium";
import { SWITZERLAND_CONFIG } from "./configs/switzerland";
import { SPAIN_CONFIG } from "./configs/spain";
import { DEFAULT_CONFIG } from "./configs/default";
import { CountryCode, ConfiguredCountryCode, CountryConfig, CountryRegistry } from "./types";
import { CreditType } from "../types";
import { hasCountryConfig, getCountryName } from "./all-countries";

// Registry of configured countries (with specific parameters)
export const COUNTRIES: CountryRegistry = {
  FR: FRANCE_CONFIG,
  BE: BELGIUM_CONFIG,
  CH: SWITZERLAND_CONFIG,
  ES: SPAIN_CONFIG,
};

// List of configured country codes
export const CONFIGURED_COUNTRY_CODES: ConfiguredCountryCode[] = ["FR", "BE", "CH", "ES"];

// Default country for fallback
export const DEFAULT_COUNTRY: ConfiguredCountryCode = "FR";

/**
 * Check if a country has specific configuration
 */
export function isConfiguredCountry(code: CountryCode): code is ConfiguredCountryCode {
  return hasCountryConfig(code);
}

/**
 * Get country configuration by code
 * Returns specific config for configured countries, default config otherwise
 */
export function getCountryConfig(code: CountryCode): CountryConfig {
  if (isConfiguredCountry(code)) {
    return COUNTRIES[code];
  }
  // Return default config with country code and name updated
  return {
    ...DEFAULT_CONFIG,
    code,
    name: getCountryName(code, "fr"),
  };
}

/**
 * Get available products for a country
 */
export function getAvailableProducts(code: CountryCode): CreditType[] {
  const config = getCountryConfig(code);
  return config.availableProducts;
}

/**
 * Get product limits for a specific country and product
 */
export function getProductLimits(code: CountryCode, product: CreditType) {
  const config = getCountryConfig(code);
  return config.products[product];
}

/**
 * Format currency according to country rules
 */
export function formatCurrency(amount: number, code: CountryCode): string {
  const config = getCountryConfig(code);
  const { currencyCode } = config.formatting;

  const formatted = new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return formatted;
}

/**
 * Check if a user's age is valid for a product in a country
 */
export function isAgeValidForProduct(
  age: number,
  product: CreditType,
  code: CountryCode
): boolean {
  const config = getCountryConfig(code);

  if (age < config.age.minAge || age > config.age.maxAge) {
    return false;
  }

  if (product === "student" && age > config.age.studentMaxAge) {
    return false;
  }

  if (product === "salary-advance" && age < config.age.salaryAdvanceMinAge) {
    return false;
  }

  return true;
}

/**
 * Check if a product is available in a country
 */
export function isProductAvailable(product: CreditType, code: CountryCode): boolean {
  const config = getCountryConfig(code);
  return config.products[product]?.available ?? false;
}

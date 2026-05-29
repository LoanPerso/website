// Shared constants for the application dossier engines.
// Country/legal figures mirror the public simulator parameters
// (app/_components/tools/AdvancedSimulator/parameters/countries/*.json).

export type CountryCode = "EE" | "FR" | "ES" | "DEFAULT";

export interface CountryLegal {
  name: string;
  regulator: string;
  usuryMultiplier: number; // usury ceiling = reference rate × multiplier
  coolingOffDays: number; // right of withdrawal
  mandatoryInsurance: boolean;
}

export const COUNTRY_LEGAL: Record<CountryCode, CountryLegal> = {
  EE: { name: "Estonie", regulator: "Finantsinspektsioon", usuryMultiplier: 1.5, coolingOffDays: 14, mandatoryInsurance: false },
  FR: { name: "France", regulator: "ACPR / Banque de France", usuryMultiplier: 1.33, coolingOffDays: 14, mandatoryInsurance: false },
  ES: { name: "Espagne", regulator: "Banco de España", usuryMultiplier: 1.5, coolingOffDays: 14, mandatoryInsurance: false },
  DEFAULT: { name: "—", regulator: "—", usuryMultiplier: 1.5, coolingOffDays: 14, mandatoryInsurance: false },
};

export function countryLegal(code: string | null | undefined): CountryLegal {
  const key = (code ?? "").toUpperCase() as CountryCode;
  return COUNTRY_LEGAL[key] ?? COUNTRY_LEGAL.DEFAULT;
}

// Monthly cost-of-living anchors (single adult, EUR) used to reconstruct a budget
// when the applicant did not declare expenses. EE is the base; FR/ES scaled.
export interface RegionCost {
  housing: number;
  living: number;
  utilities: number;
  transport: number;
}

export const REGION_COST: Record<CountryCode, RegionCost> = {
  EE: { housing: 380, living: 430, utilities: 90, transport: 110 },
  FR: { housing: 780, living: 620, utilities: 130, transport: 150 },
  ES: { housing: 560, living: 520, utilities: 110, transport: 120 },
  DEFAULT: { housing: 500, living: 500, utilities: 110, transport: 120 },
};

export function regionCost(code: string | null | undefined): RegionCost {
  const key = (code ?? "").toUpperCase() as CountryCode;
  return REGION_COST[key] ?? REGION_COST.DEFAULT;
}

// Residual-income floor (reste à vivre) per person, EUR/month.
export const RESIDUAL_FLOOR: Record<CountryCode, number> = {
  EE: 450,
  FR: 600,
  ES: 520,
  DEFAULT: 500,
};

export function residualFloor(code: string | null | undefined): number {
  const key = (code ?? "").toUpperCase() as CountryCode;
  return RESIDUAL_FLOOR[key] ?? RESIDUAL_FLOOR.DEFAULT;
}

// Affordability cutoffs (debt-to-income).
export const DTI_WARN = 0.33;
export const DTI_MAX = 0.4;
export const DTI_KNOCKOUT = 0.5;

// Risk-based pricing: rate premium added on top of funding + opex + margin (% points).
export const RATE_BUILDUP = {
  funding: 0, // own funds
  opexCap: 4,
  margin: 4,
  riskPremium: { A: 1, B: 3, C: 6, D: 9 } as Record<string, number>,
};

// Borrower insurance (ADI): monthly cost ≈ capital × rate% × age factor.
export const INSURANCE_MONTHLY_RATE = 0.3; // % of capital per month (mirrors consumer.json)

// SLA budget per stage, in hours (time allowed before the case ages out).
export const SLA_HOURS: Record<string, number> = {
  draft: 72,
  submitted: 4,
  under_review: 24,
  qualified: 48,
  approved: 24,
  rejected: 0,
  cancelled: 0,
};

// Decision authority tiers by requested amount.
export const AUTHORITY_TIERS = [
  { tier: "L1", maxAmount: 5000, role: "Conseiller", roleKey: "viewer" },
  { tier: "L2", maxAmount: 20000, role: "Analyste crédit", roleKey: "admin" },
  { tier: "L3", maxAmount: 50000, role: "Responsable crédit", roleKey: "superadmin" },
  { tier: "committee", maxAmount: Infinity, role: "Comité de crédit", roleKey: "superadmin" },
] as const;

// Disposable e-mail / VOIP heuristics (KYC data-quality).
export const DISPOSABLE_EMAIL_DOMAINS = [
  "mailinator.com", "yopmail.com", "guerrillamail.com", "10minutemail.com",
  "tempmail.com", "trashmail.com", "getnada.com", "sharklasers.com",
];

// Mock screening lists (PEP / sanctions / adverse media) — purely illustrative.
export const SCREENING_NAMES = {
  PEP: ["Viktor Ivanov", "Elena Petrova", "Marko Saar", "Jean Dubois"],
  EU: ["Sergei Volkov", "Ahmed Hassan"],
  OFAC: ["Dmitri Sokolov", "Carlos Mendez"],
  UN: ["Ali Rahman"],
  adverse_media: ["Romain Faure", "Sofia Lopez", "Karl Saar"],
} as Record<string, string[]>;

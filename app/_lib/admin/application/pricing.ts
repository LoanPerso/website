// Pricing / rate / offer-structuring engine (derived, deterministic).
//
// Builds a risk-based offer from the application + the product catalogue: rate
// build-up, fees, optional borrower insurance, APR (TAEG via IRR), usury check
// and an affordability-aware counter-offer search. Reuses the annuity engine.

import { buildSchedule, monthlyPaymentFor, suggestRate, type ScheduleRow } from "../finance";
import type { LoanApplicationFull, Product, RiskCategory } from "../types";
import { countryLegal, INSURANCE_MONTHLY_RATE, RATE_BUILDUP } from "./constants";
import { ageFromBirth, clamp, round2 } from "./seed";

export type GuaranteeKind = "none" | "guarantor" | "co_borrower" | "collateral";

export interface PricingOptions {
  rate?: number;
  amount?: number;
  duration?: number;
  insurance?: boolean;
  guarantee?: GuaranteeKind;
}

export interface RateBuildUp {
  funding: number;
  riskPremium: number;
  opex: number;
  margin: number;
  guaranteeBonus: number;
  nominalRate: number;
}

export interface OfferPricing {
  productSlug: string | null;
  productName: string | null;
  country: string | null;
  category: RiskCategory;
  amount: number;
  durationMonths: number;
  rateBuildUp: RateBuildUp;
  appliedRate: number;
  fees: { applicationFeePercent: number; applicationFee: number };
  insurance: { enabled: boolean; monthlyCost: number; totalCost: number };
  amortization: { monthlyPayment: number; totalInterest: number; totalRepayable: number; schedule: ScheduleRow[] };
  taeg: number;
  totals: { monthlyWithInsurance: number; totalCost: number; totalDue: number };
  usury: { ceiling: number; reference: number; multiplier: number; exceeds: boolean };
  guarantee: GuaranteeKind;
  rateBounds: { min: number; max: number };
  amountBounds: { min: number; max: number };
  durationBounds: { min: number; max: number };
}

const GUARANTEE_BONUS: Record<GuaranteeKind, number> = {
  none: 0,
  guarantor: -0.5,
  co_borrower: -0.75,
  collateral: -1,
};

export function findProduct(products: Product[], app: LoanApplicationFull): Product | null {
  return products.find((p) => p.slug === app.credit_type) ?? products[0] ?? null;
}

// Annualised APR (TAEG): the monthly internal rate of return that discounts every
// payment (incl. insurance) back to the net amount released (amount − fees).
export function computeTaeg(
  netReleased: number,
  payments: number[],
  insuranceMonthly: number
): number {
  if (netReleased <= 0 || !payments.length) return 0;
  const cash = payments.map((p) => p + insuranceMonthly);
  const npv = (i: number) => cash.reduce((s, p, k) => s + p / Math.pow(1 + i, k + 1), -netReleased);
  let lo = 0;
  let hi = 0.5; // 50% monthly — well above any usury ceiling
  if (npv(lo) < 0) return 0;
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (npv(mid) > 0) lo = mid;
    else hi = mid;
  }
  const monthly = (lo + hi) / 2;
  return round2((Math.pow(1 + monthly, 12) - 1) * 100);
}

function insuranceMonthly(amount: number, age: number | null, enabled: boolean): number {
  if (!enabled) return 0;
  const ageFactor = 1 + Math.max(0, (age ?? 35) - 45) * 0.03;
  return round2(amount * (INSURANCE_MONTHLY_RATE / 100) * ageFactor);
}

export function computePricing(
  app: LoanApplicationFull,
  product: Product | null,
  opts: PricingOptions = {}
): OfferPricing {
  const category = (app.score_category ?? "C") as RiskCategory;
  const amount = round2(opts.amount ?? Number(app.amount ?? 0));
  const duration = Math.round(opts.duration ?? (Number(app.duration) || 12));
  const guarantee = opts.guarantee ?? "none";
  const insuranceOn = opts.insurance ?? false;
  const age = ageFromBirth(app.birth_date);

  const minRate = product ? Number(product.min_rate) : 5;
  const maxRate = product ? Number(product.max_rate) : 22;
  const feePct = product ? Number(product.application_fee_percent) : 1;

  // Rate build-up. Reconciled so the default lands on suggestRate(min,max,category).
  const riskPremium = RATE_BUILDUP.riskPremium[category] ?? 5;
  const opex = round2(clamp((250 / Math.max(amount, 250)) * 100, 1, RATE_BUILDUP.opexCap));
  const guaranteeBonus = GUARANTEE_BONUS[guarantee];
  const built = RATE_BUILDUP.funding + riskPremium + opex + RATE_BUILDUP.margin + guaranteeBonus;
  const nominalRate = round2(clamp(built, minRate, maxRate));
  const suggested = round2(clamp(suggestRate(minRate, maxRate, category) + guaranteeBonus, minRate, maxRate));
  const appliedRate = round2(clamp(opts.rate ?? suggested, minRate, maxRate));

  const calc = buildSchedule(amount, appliedRate, duration, new Date().toISOString().slice(0, 10));
  const applicationFee = round2(amount * (feePct / 100));
  const insMonthly = insuranceMonthly(amount, age, insuranceOn);
  const insTotal = round2(insMonthly * duration);

  const taeg = computeTaeg(amount - applicationFee, calc.schedule.map((s) => s.amount_due), insMonthly);
  const monthlyWithInsurance = round2(calc.monthlyPayment + insMonthly);
  const totalCost = round2(calc.totalInterest + applicationFee + insTotal);
  const totalDue = round2(amount + totalCost);

  const legal = countryLegal(app.country);
  const reference = round2((minRate + maxRate) / 2 + 4); // illustrative market-average TAEG
  const ceiling = round2(reference * legal.usuryMultiplier);

  return {
    productSlug: product?.slug ?? app.credit_type,
    productName: product?.name ?? null,
    country: app.country,
    category,
    amount,
    durationMonths: duration,
    rateBuildUp: { funding: RATE_BUILDUP.funding, riskPremium, opex, margin: RATE_BUILDUP.margin, guaranteeBonus, nominalRate },
    appliedRate,
    fees: { applicationFeePercent: feePct, applicationFee },
    insurance: { enabled: insuranceOn, monthlyCost: insMonthly, totalCost: insTotal },
    amortization: { monthlyPayment: calc.monthlyPayment, totalInterest: calc.totalInterest, totalRepayable: calc.totalRepayable, schedule: calc.schedule },
    taeg,
    totals: { monthlyWithInsurance, totalCost, totalDue },
    usury: { ceiling, reference, multiplier: legal.usuryMultiplier, exceeds: taeg > ceiling },
    guarantee,
    rateBounds: { min: minRate, max: maxRate },
    amountBounds: { min: product ? Number(product.min_amount) : 0, max: product ? Number(product.max_amount) : amount * 2 },
    durationBounds: { min: product ? Number(product.min_duration_months) : 1, max: product ? Number(product.max_duration_months) : Math.max(duration, 84) },
  };
}

export interface CounterOffer {
  amount: number;
  duration: number;
  rate: number;
  monthlyPayment: number;
  deltaAmount: number;
  deltaMonthly: number;
  reachable: boolean;
}

// Search for terms whose payment fits the affordability target: stretch the
// duration first (cheaper monthly), then trim the amount in 100 € steps.
export function findCounterOffer(
  app: LoanApplicationFull,
  product: Product | null,
  targetPayment: number,
  baseRate: number
): CounterOffer {
  const reqAmount = Number(app.amount ?? 0);
  const reqDuration = Number(app.duration ?? 12) || 12;
  const reqMonthly = Number(app.monthly_payment) || monthlyPaymentFor(reqAmount, baseRate, reqDuration);
  const maxDuration = product ? Number(product.max_duration_months) : 84;
  const minAmount = product ? Number(product.min_amount) : 200;

  let amount = reqAmount;
  const duration = Math.min(maxDuration, Math.max(reqDuration, reqDuration));
  // 1) stretch duration to product max
  let monthly = monthlyPaymentFor(amount, baseRate, maxDuration);
  if (monthly <= targetPayment) {
    return offer(amount, maxDuration, baseRate, monthly, reqAmount, reqMonthly, true);
  }
  // 2) reduce amount at the stretched duration
  while (amount > minAmount) {
    amount = round2(amount - 100);
    monthly = monthlyPaymentFor(amount, baseRate, maxDuration);
    if (monthly <= targetPayment) {
      return offer(amount, maxDuration, baseRate, monthly, reqAmount, reqMonthly, true);
    }
  }
  monthly = monthlyPaymentFor(minAmount, baseRate, maxDuration);
  return offer(minAmount, maxDuration, baseRate, monthly, reqAmount, reqMonthly, monthly <= targetPayment);

  function offer(a: number, d: number, r: number, m: number, ra: number, rm: number, reachable: boolean): CounterOffer {
    return {
      amount: round2(a),
      duration: d,
      rate: round2(r),
      monthlyPayment: round2(m),
      deltaAmount: round2(a - ra),
      deltaMonthly: round2(m - rm),
      reachable,
    };
  }
}

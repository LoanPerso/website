// Client-level credit scoring engine — single source of truth for the back office.
//
// Distinct from the public loan simulator (which scores a *prospective loan* with its
// new instalment). This model grades a *client* on standing financials only, producing
// a 0-100 score, an A–D category, an explainable factor breakdown, reason codes
// (top negative contributors, for adverse-action transparency) and a completeness flag.
//
// Missing inputs are never silently scored as neutral: the factor is excluded and the
// remaining weights are renormalised, with `complete=false` flagged when income is
// unknown or too little weight is available.

import type { RiskCategory } from "./types";

export const SCORING_MODEL_VERSION = "v1";
export const SCORE_STALE_AFTER_DAYS = 90;

export type FactorCode =
  | "credit_history"
  | "dti"
  | "income_stability"
  | "disposable_income"
  | "seniority"
  | "housing"
  | "age";

export interface ScoreFactor {
  code: FactorCode;
  label: string;
  weight: number; // base weight (factors sum to 100)
  raw: string; // human-readable input value
  score: number | null; // 0-100 sub-score, null when the input is missing
  contribution: number; // points added to the final score after renormalisation
  status: "ok" | "unknown";
}

export interface ReasonCode {
  code: FactorCode;
  label: string;
  score: number;
}

export interface ScoreResult {
  score: number; // 0-100
  category: RiskCategory; // A/B/C/D
  factors: ScoreFactor[];
  reasonCodes: ReasonCode[]; // up to 3 worst factors ("points de vigilance")
  dti: number | null; // debt-to-income ratio (0..1+)
  disposablePerHead: number | null; // reste à vivre per household member
  complete: boolean;
  modelVersion: string;
}

export interface ScoringInput {
  employmentStatus?: string | null;
  employmentSince?: string | null; // ISO date
  housingStatus?: string | null;
  creditHistory?: string | null;
  monthlyNetIncome?: number | null;
  monthlyExpenses?: number | null;
  existingMonthlyDebt?: number | null; // sum of monthly payments on active loans
  birthDate?: string | null; // ISO date
  dependents?: number | null;
}

// Weights sum to 100. Age is intentionally capped low (EU proxy-discrimination risk);
// dependents are folded into reste-à-vivre rather than given an independent weight.
const WEIGHTS: Record<FactorCode, number> = {
  credit_history: 25,
  dti: 22,
  income_stability: 18,
  disposable_income: 12,
  seniority: 8,
  housing: 8,
  age: 7,
};

const LABELS: Record<FactorCode, string> = {
  credit_history: "Historique de crédit",
  dti: "Taux d'endettement",
  income_stability: "Stabilité des revenus",
  disposable_income: "Reste à vivre",
  seniority: "Ancienneté emploi",
  housing: "Logement",
  age: "Âge",
};

const CREDIT_HISTORY: Record<string, number> = { excellent: 100, good: 75, mixed: 45, incidents: 20 };
const EMPLOYMENT: Record<string, number> = {
  cdi: 100,
  retired: 90,
  freelance: 65,
  cdd: 60,
  student: 40,
  unemployed: 20,
};
const HOUSING: Record<string, number> = { owner: 100, tenant: 70, hosted: 40 };

const CREDIT_HISTORY_LABELS: Record<string, string> = {
  excellent: "Excellent",
  good: "Bon",
  mixed: "Moyen",
  incidents: "Incidents",
};

export const SCORE_THRESHOLDS = { A: 80, B: 65, C: 50 } as const;

export function categoryFromScore(score: number): RiskCategory {
  if (score >= SCORE_THRESHOLDS.A) return "A";
  if (score >= SCORE_THRESHOLDS.B) return "B";
  if (score >= SCORE_THRESHOLDS.C) return "C";
  return "D";
}

export function isScoreStale(updatedAt: string | null | undefined): boolean {
  if (!updatedAt) return true;
  const d = new Date(updatedAt);
  if (Number.isNaN(d.getTime())) return true;
  const days = (Date.now() - d.getTime()) / 86_400_000;
  return days > SCORE_STALE_AFTER_DAYS;
}

function dtiScore(ratio: number): number {
  if (ratio <= 0.25) return 100;
  if (ratio <= 0.33) return 85;
  if (ratio <= 0.4) return 60;
  if (ratio <= 0.5) return 35;
  return 15;
}

function disposableScore(perHead: number): number {
  if (perHead >= 1200) return 100;
  if (perHead >= 800) return 85;
  if (perHead >= 500) return 65;
  if (perHead >= 250) return 40;
  if (perHead >= 0) return 20;
  return 0;
}

function seniorityScore(months: number): number {
  if (months >= 24) return 100;
  if (months >= 12) return 80;
  if (months >= 6) return 50;
  return 30;
}

function ageScore(age: number): number {
  if (age >= 26 && age <= 45) return 100;
  if (age >= 46 && age <= 55) return 90;
  if (age >= 56 && age <= 65) return 80;
  if (age >= 18 && age <= 25) return 70;
  if (age >= 66 && age <= 75) return 70;
  return 40;
}

function num(v: number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function monthsSince(iso: string): number | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  return Math.max(0, (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
}

function ageFromBirth(iso: string): number | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function computeClientScore(input: ScoringInput): ScoreResult {
  const subs: { code: FactorCode; score: number | null; raw: string }[] = [];

  const history = input.creditHistory?.toLowerCase().trim();
  subs.push({
    code: "credit_history",
    score: history && history in CREDIT_HISTORY ? CREDIT_HISTORY[history] : null,
    raw: history ? CREDIT_HISTORY_LABELS[history] ?? history : "—",
  });

  const employment = input.employmentStatus?.toLowerCase().trim();
  subs.push({
    code: "income_stability",
    score: employment && employment in EMPLOYMENT ? EMPLOYMENT[employment] : null,
    raw: employment ? employment.toUpperCase() : "—",
  });

  const housing = input.housingStatus?.toLowerCase().trim();
  subs.push({
    code: "housing",
    score: housing && housing in HOUSING ? HOUSING[housing] : null,
    raw: housing ?? "—",
  });

  const income = num(input.monthlyNetIncome);
  const expenses = num(input.monthlyExpenses) ?? 0;
  const debt = num(input.existingMonthlyDebt) ?? 0;

  let dti: number | null = null;
  if (income && income > 0) {
    dti = debt / income;
    subs.push({ code: "dti", score: dtiScore(dti), raw: `${Math.round(dti * 100)} %` });
  } else {
    subs.push({ code: "dti", score: null, raw: "revenu inconnu" });
  }

  let perHead: number | null = null;
  if (income && income > 0) {
    const dependents = Math.max(0, Math.floor(num(input.dependents) ?? 0));
    perHead = (income - expenses - debt) / (1 + dependents);
    subs.push({ code: "disposable_income", score: disposableScore(perHead), raw: `${Math.round(perHead)} €` });
  } else {
    subs.push({ code: "disposable_income", score: null, raw: "revenu inconnu" });
  }

  const seniorityMonths = input.employmentSince ? monthsSince(input.employmentSince) : null;
  subs.push({
    code: "seniority",
    score: seniorityMonths === null ? null : seniorityScore(seniorityMonths),
    raw: seniorityMonths === null ? "—" : `${seniorityMonths} mois`,
  });

  const age = input.birthDate ? ageFromBirth(input.birthDate) : null;
  subs.push({
    code: "age",
    score: age === null ? null : ageScore(age),
    raw: age === null ? "—" : `${age} ans`,
  });

  const knownWeight = subs.reduce((s, f) => s + (f.score === null ? 0 : WEIGHTS[f.code]), 0);

  const factors: ScoreFactor[] = subs.map((f) => {
    const contribution =
      f.score === null || knownWeight === 0 ? 0 : (WEIGHTS[f.code] / knownWeight) * f.score;
    return {
      code: f.code,
      label: LABELS[f.code],
      weight: WEIGHTS[f.code],
      raw: f.raw,
      score: f.score,
      contribution: Math.round(contribution * 10) / 10,
      status: f.score === null ? "unknown" : "ok",
    };
  });

  const score = Math.max(
    0,
    Math.min(100, Math.round(factors.reduce((s, f) => s + f.contribution, 0)))
  );

  const incomeKnown = !!(income && income > 0);
  const complete = incomeKnown && knownWeight >= 70;

  const reasonCodes: ReasonCode[] = factors
    .filter((f): f is ScoreFactor & { score: number } => f.status === "ok" && f.score! < 100)
    .map((f) => ({ code: f.code, label: f.label, score: f.score, gap: (f.weight * (100 - f.score)) / 100 }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3)
    .map(({ code, label, score }) => ({ code, label, score }));

  return {
    score,
    category: categoryFromScore(score),
    factors,
    reasonCodes,
    dti,
    disposablePerHead: perHead,
    complete,
    modelVersion: SCORING_MODEL_VERSION,
  };
}

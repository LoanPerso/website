// Underwriting / decisioning engine (derived, deterministic).
//
// Combines the credit score, the affordability analysis, the offer pricing and the
// fraud/AML verdict into an auto-decision (APPROVE / REFER / DECLINE) with
// knock-outs, conditions (stipulations), delegated authority and an SLA timer.

import { computeClientScore, type ScoreResult } from "../scoring";
import type { ApplicationStatus, LoanApplicationFull, RiskCategory } from "../types";
import type { AffordabilityAnalysis } from "./analysis";
import type { FraudAmlResult } from "./fraud";
import { findCounterOffer, type CounterOffer, type OfferPricing } from "./pricing";
import type { Product } from "../types";
import { AUTHORITY_TIERS, DTI_KNOCKOUT, DTI_MAX, DTI_WARN, SLA_HOURS } from "./constants";
import { ageFromBirth, clamp, hoursSince, toIsoDate } from "./seed";

export type Outcome = "APPROVE" | "REFER" | "DECLINE";

export interface Knockout {
  code: string;
  label: string;
  severity: "hard" | "soft";
  detail: string;
}

export interface Stipulation {
  code: string;
  label: string;
  required: boolean;
}

export interface DecisionResult {
  outcome: Outcome;
  confidence: number;
  score: number;
  category: RiskCategory;
  scoreResult: ScoreResult;
  dti: number;
  dsti: number;
  knockouts: Knockout[];
  referralTriggers: string[];
  reasonCodes: { code: string; label: string }[];
  stipulations: Stipulation[];
  counterOffer: CounterOffer | null;
  needsCounterOffer: boolean;
  authority: { tier: string; role: string; withinLimit: boolean; amount: number };
  sla: { stage: string; slaHours: number; ageHours: number; remainingHours: number; band: "ok" | "warn" | "breach" };
  suggestedStatus: ApplicationStatus;
  modelVersion: string;
}

const OUTCOME_LABELS: Record<Outcome, string> = { APPROVE: "Accord", REFER: "À étudier", DECLINE: "Refus" };
export { OUTCOME_LABELS };

function scoreFromApp(app: LoanApplicationFull): ScoreResult {
  return computeClientScore({
    employmentStatus: app.contract_type,
    employmentSince: toIsoDate(app.start_date),
    monthlyNetIncome: app.monthly_net_income,
    monthlyExpenses: null,
    existingMonthlyDebt: 0,
    birthDate: toIsoDate(app.birth_date),
  });
}

export function evaluateDecision(
  app: LoanApplicationFull,
  ctx: { analysis: AffordabilityAnalysis; pricing: OfferPricing; fraud: FraudAmlResult; product: Product | null }
): DecisionResult {
  const { analysis, pricing, fraud, product } = ctx;
  const scoreResult = scoreFromApp(app);
  const score = app.score ?? scoreResult.score;
  const category = (app.score_category ?? scoreResult.category) as RiskCategory;
  const amount = Number(app.amount ?? 0);
  const age = ageFromBirth(app.birth_date);
  const dti = analysis.ratios.dtiBefore;
  const dsti = analysis.ratios.dtiAfter;

  // --- Knockouts ---------------------------------------------------------
  const knockouts: Knockout[] = [];
  if (age != null && age < 18) knockouts.push({ code: "age_min", label: "Âge minimum", severity: "hard", detail: `${age} ans` });
  if (age != null && age + Number(app.duration ?? 0) / 12 > 80) knockouts.push({ code: "age_term", label: "Âge au terme", severity: "hard", detail: "> 80 ans à l'échéance" });
  if (!["EE", "FR", "ES"].includes((app.country ?? "").toUpperCase())) knockouts.push({ code: "country", label: "Pays non desservi", severity: "hard", detail: app.country ?? "—" });
  if (!app.monthly_net_income || Number(app.monthly_net_income) <= 0) knockouts.push({ code: "income", label: "Revenu non renseigné", severity: "hard", detail: "Capacité non évaluable" });
  if ((app.contract_type ?? "").toLowerCase() === "unemployed") knockouts.push({ code: "employment", label: "Sans emploi", severity: amount > 3000 ? "hard" : "soft", detail: `Montant ${amount} €` });
  if (dsti > DTI_KNOCKOUT) knockouts.push({ code: "dsti", label: "Endettement excessif", severity: "hard", detail: `${Math.round(dsti * 100)}% > 50%` });
  if (pricing.usury.exceeds) knockouts.push({ code: "usury", label: "Taux d'usure dépassé", severity: "hard", detail: `TAEG ${pricing.taeg}% > ${pricing.usury.ceiling}%` });
  if (fraud.recommended === "block") knockouts.push({ code: "fraud", label: "Risque de fraude bloquant", severity: "hard", detail: "Vérification LCB-FT / fraude" });

  const hardKnockout = knockouts.some((k) => k.severity === "hard");

  // --- Referral triggers -------------------------------------------------
  const referralTriggers: string[] = [];
  if (dsti > DTI_WARN && dsti <= DTI_KNOCKOUT) referralTriggers.push(`Endettement ${Math.round(dsti * 100)}% (> 33%)`);
  if (category === "C") referralTriggers.push("Catégorie de risque C");
  if (fraud.recommended === "escalate" || fraud.recommended === "review") referralTriggers.push("Revue fraude/LCB-FT requise");
  if (!scoreResult.complete) referralTriggers.push("Données de scoring incomplètes");
  if (analysis.residual.band !== "ok") referralTriggers.push("Reste à vivre sous le seuil");
  if (analysis.stability.probation) referralTriggers.push("Période d'essai en cours");

  // --- Outcome -----------------------------------------------------------
  let outcome: Outcome;
  if (hardKnockout || category === "D" || fraud.recommended === "block") outcome = "DECLINE";
  else if (category === "A" && dsti <= DTI_WARN && analysis.verdict.decision === "go" && fraud.recommended === "clear") outcome = "APPROVE";
  else outcome = "REFER";

  let confidence = score;
  if (!scoreResult.complete) confidence -= 15;
  if (outcome === "DECLINE" && hardKnockout) confidence = clamp(95, 0, 100);
  confidence = clamp(Math.round(confidence), 0, 100);

  // --- Counter-offer when the requested terms fail affordability ---------
  const needsCounterOffer = !hardKnockout && analysis.ratios.headroom < 0;
  const counterOffer = needsCounterOffer
    ? findCounterOffer(app, product, analysis.ratios.maxAffordablePayment, pricing.appliedRate)
    : null;

  // --- Stipulations (conditions of a conditional approval) ---------------
  const stipulations: Stipulation[] = [];
  if (!app.document_income_url) stipulations.push({ code: "income_doc", label: "Fournir le dernier justificatif de revenus", required: true });
  if (!app.document_id_url) stipulations.push({ code: "id_doc", label: "Fournir une pièce d'identité valide", required: true });
  if (!app.document_bank_url) stipulations.push({ code: "bank_doc", label: "Fournir un relevé bancaire (3 mois)", required: false });
  if (analysis.stability.incomeVerified === "gap") stipulations.push({ code: "income_verify", label: "Vérifier le revenu (écart bulletin/déclaré)", required: true });
  if (analysis.stability.probation) stipulations.push({ code: "employment_verify", label: "Confirmer la fin de période d'essai", required: true });
  if (dsti > DTI_WARN) stipulations.push({ code: "dti_review", label: "Justifier la soutenabilité de l'endettement", required: true });
  if (fraud.recommended === "review" || fraud.recommended === "escalate") stipulations.push({ code: "kyc_review", label: "Revue KYC/LCB-FT à finaliser", required: true });

  // --- Reason codes (adverse-action transparency) ------------------------
  const reasonCodes: { code: string; label: string }[] = [];
  for (const k of knockouts) reasonCodes.push({ code: k.code, label: k.label });
  for (const r of scoreResult.reasonCodes) reasonCodes.push({ code: r.code, label: r.label });
  const dedupReasons = reasonCodes.filter((r, i, a) => a.findIndex((x) => x.code === r.code) === i).slice(0, 5);

  // --- Delegated authority ----------------------------------------------
  const tier = AUTHORITY_TIERS.find((t) => amount <= t.maxAmount) ?? AUTHORITY_TIERS[AUTHORITY_TIERS.length - 1];

  // --- SLA ---------------------------------------------------------------
  const stage = app.status;
  const slaHours = SLA_HOURS[stage] ?? 24;
  const ageHours = Math.round(hoursSince(app.stage_entered_at ?? app.created_at));
  const remainingHours = Math.round(slaHours - ageHours);
  const ratio = slaHours > 0 ? ageHours / slaHours : 0;
  const band: "ok" | "warn" | "breach" = ratio > 1 ? "breach" : ratio > 0.8 ? "warn" : "ok";

  const suggestedStatus: ApplicationStatus =
    outcome === "APPROVE" ? "approved" : outcome === "DECLINE" ? "rejected" : "under_review";

  return {
    outcome,
    confidence,
    score,
    category,
    scoreResult,
    dti,
    dsti,
    knockouts,
    referralTriggers,
    reasonCodes: dedupReasons,
    stipulations,
    counterOffer,
    needsCounterOffer,
    authority: { tier: tier.tier, role: tier.role, withinLimit: amount <= tier.maxAmount, amount },
    sla: { stage, slaHours, ageHours, remainingHours, band },
    suggestedStatus,
    modelVersion: "dec-v1",
  };
}

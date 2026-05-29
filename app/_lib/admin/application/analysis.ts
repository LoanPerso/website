// Financial / affordability analysis engine (derived, deterministic).
//
// Reconstructs a full borrower budget from the application data. Household
// expenses and existing commitments are not collected in the funnel, so they are
// *estimated* from income, household and region — every estimate is drawn from a
// PRNG seeded by the application id, so the dossier is stable across reloads.

import { monthlyPaymentFor } from "../finance";
import type { LoanApplicationFull } from "../types";
import { DTI_MAX, DTI_WARN, regionCost, residualFloor } from "./constants";
import { ageFromBirth, clamp, monthsSince, rngFrom, round2 } from "./seed";

export type Band = "ok" | "warn" | "breach";

export interface ExistingCommitment {
  label: string;
  lender: string;
  type: "revolving" | "auto" | "perso" | "store";
  balance: number;
  monthly: number;
  ratePct: number;
  monthsLeft: number;
}

export interface MonthAggregate {
  month: string; // YYYY-MM
  inflow: number;
  outflow: number;
  endBalance: number;
}

export interface AffordabilityEstimates {
  housing: number;
  living: number;
  utilities: number;
  transport: number;
  otherDebt: number;
}

export interface AffordabilityOverrides extends Partial<AffordabilityEstimates> {
  ratePlus?: number; // stress: +X points on the rate
  incomeMinus?: number; // stress: -Y% on income
  consolidate?: boolean; // simulate consolidating existing commitments
}

export interface WaterfallSlice {
  key: string;
  label: string;
  amount: number;
  tone: "income" | "fixed" | "debt" | "new" | "residual";
}

export interface AffordabilityAnalysis {
  inputs: {
    netIncome: number;
    newPayment: number;
    amount: number;
    duration: number;
    rate: number;
    contractType: string | null;
    maritalStatus: string | null;
    age: number | null;
    seniorityMonths: number | null;
    householdSize: number;
    dependents: number;
    equivalence: number;
    country: string | null;
    city: string | null;
    estimated: AffordabilityEstimates;
  };
  ratios: {
    dtiBefore: number;
    dtiAfter: number;
    foir: number;
    debtService: number;
    band: Band;
    cutoff: { warn: number; max: number };
    maxAffordablePayment: number;
    maxLoanAmount: number;
    headroom: number;
  };
  residual: {
    household: number;
    perHead: number;
    floorPerHead: number;
    floorHousehold: number;
    band: Band;
  };
  waterfall: WaterfallSlice[];
  commitments: ExistingCommitment[];
  commitmentsTotalMonthly: number;
  openBanking: {
    months: MonthAggregate[];
    salaryRegularity: "régulier" | "variable" | "irrégulier";
    overdraftDays: number;
    nsfCount: number;
    avgBalance: number;
    gamblingPct: number;
    riskyMerchants: string[];
    inflow: number;
    outflow: number;
  };
  stability: {
    contractScore: number;
    probation: boolean;
    seniorityBand: string;
    incomeVerified: "matched" | "gap" | "unverified";
    payslipVsDeclaredPct: number;
  };
  stress: {
    ratePlus: number;
    incomeMinus: number;
    paymentStressed: number;
    dtiStressed: number;
    residualStressed: number;
    passes: boolean;
  };
  flags: { code: string; severity: "info" | "warn" | "critical"; label: string }[];
  verdict: { decision: "go" | "caution" | "no_go"; score: number; reasons: string[] };
}

const EMPLOYMENT_SCORE: Record<string, number> = {
  cdi: 100, tahtajatu: 100, retired: 90, freelance: 65, fie: 65, cdd: 60, tahtajaline: 60, student: 40, unemployed: 20,
};

function bandFor(ratio: number): Band {
  if (ratio <= DTI_WARN) return "ok";
  if (ratio <= DTI_MAX) return "warn";
  return "breach";
}

// Invert the annuity formula: largest principal whose payment ≤ target.
function maxPrincipalFor(targetPayment: number, annualRatePct: number, months: number): number {
  if (targetPayment <= 0 || months <= 0) return 0;
  let lo = 0;
  let hi = targetPayment * months * 2 + 1000;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (monthlyPaymentFor(mid, annualRatePct, months) > targetPayment) hi = mid;
    else lo = mid;
  }
  return round2(lo);
}

export function analyzeApplication(
  app: LoanApplicationFull,
  overrides: AffordabilityOverrides = {}
): AffordabilityAnalysis {
  const rng = rngFrom(app.id + "|fin");
  const netIncome = Number(app.monthly_net_income ?? 0);
  const amount = Number(app.amount ?? 0);
  const duration = Number(app.duration ?? 12) || 12;
  const rate = Number(app.effective_rate ?? 12) || 12;
  const newPayment = round2(Number(app.monthly_payment) || monthlyPaymentFor(amount, rate, duration));

  const age = ageFromBirth(app.birth_date);
  const seniorityMonths = monthsSince(app.start_date);
  const contractType = app.contract_type;
  const maritalStatus = app.marital_status;

  // Household — dependents are not in the funnel, so derive a plausible count.
  const coupled = ["married", "pacs", "pacsé", "couple", "marié"].includes((maritalStatus ?? "").toLowerCase());
  const dependents = (coupled ? 1 : 0) + rng.int(0, 2);
  const adults = coupled ? 2 : 1;
  const householdSize = adults + dependents;
  const equivalence = 1 + 0.5 * (adults - 1) + 0.3 * dependents; // OECD-modified

  // Estimated monthly expenses (region-anchored, scaled by household).
  const base = regionCost(app.country);
  const cityMult = 0.9 + rng.next() * 0.3;
  const est: AffordabilityEstimates = {
    housing: overrides.housing ?? round2(base.housing * cityMult * Math.sqrt(equivalence)),
    living: overrides.living ?? round2(base.living * equivalence),
    utilities: overrides.utilities ?? round2(base.utilities + 40 * (equivalence - 1)),
    transport: overrides.transport ?? round2(base.transport * cityMult),
    otherDebt: overrides.otherDebt ?? round2(netIncome * (0.04 + 0.06 * rng.next())),
  };

  // Existing commitments (mock) summing roughly to the estimated other-debt line.
  const commitments = buildCommitments(rng, est.otherDebt, rate);
  const commitmentsTotalMonthly = round2(commitments.reduce((s, c) => s + c.monthly, 0));

  // Consolidation: replace every commitment with one annuity over the loan term.
  let existingDebt = commitmentsTotalMonthly;
  if (overrides.consolidate && commitments.length) {
    const balance = commitments.reduce((s, c) => s + c.balance, 0);
    existingDebt = monthlyPaymentFor(balance, rate, duration);
  }

  const ratios = computeRatios(netIncome, existingDebt, newPayment, est, rate, duration);
  const floorPerHead = residualFloor(app.country);
  const floorHousehold = round2(floorPerHead * equivalence + 150 * dependents);
  const household = round2(
    netIncome - est.living - est.housing - est.utilities - est.transport - existingDebt - newPayment
  );
  const perHead = round2(household / equivalence);

  const waterfall: WaterfallSlice[] = [
    { key: "income", label: "Revenu net", amount: round2(netIncome), tone: "income" },
    { key: "housing", label: "Logement", amount: est.housing, tone: "fixed" },
    { key: "living", label: "Vie courante", amount: est.living, tone: "fixed" },
    { key: "utilities", label: "Charges/énergie", amount: est.utilities, tone: "fixed" },
    { key: "transport", label: "Transport", amount: est.transport, tone: "fixed" },
    { key: "existing", label: "Crédits en cours", amount: round2(existingDebt), tone: "debt" },
    { key: "new", label: "Nouvelle mensualité", amount: newPayment, tone: "new" },
    { key: "residual", label: "Reste à vivre", amount: household, tone: "residual" },
  ];

  const openBanking = buildOpenBanking(rng, netIncome, ratios.dtiAfter, contractType);
  const stability = buildStability(rng, contractType, seniorityMonths);
  const stress = buildStress(
    overrides.ratePlus ?? 3,
    overrides.incomeMinus ?? 0.1,
    { netIncome, amount, rate, duration, existingDebt, est, equivalence, floorPerHead }
  );

  const flags = buildFlags(ratios, perHead, floorPerHead, openBanking, rng);
  const verdict = buildVerdict(ratios, perHead, floorPerHead, flags, stress);

  return {
    inputs: {
      netIncome: round2(netIncome), newPayment, amount, duration, rate,
      contractType, maritalStatus, age, seniorityMonths,
      householdSize, dependents, equivalence: round2(equivalence),
      country: app.country, city: app.city, estimated: est,
    },
    ratios,
    residual: { household, perHead, floorPerHead, floorHousehold, band: perHead < floorPerHead ? (perHead < floorPerHead * 0.7 ? "breach" : "warn") : "ok" },
    waterfall,
    commitments,
    commitmentsTotalMonthly,
    openBanking,
    stability,
    stress,
    flags,
    verdict,
  };
}

function computeRatios(
  netIncome: number,
  existingDebt: number,
  newPayment: number,
  est: AffordabilityEstimates,
  rate: number,
  duration: number
) {
  const safeIncome = netIncome > 0 ? netIncome : 1;
  const dtiBefore = round2(existingDebt / safeIncome);
  const dtiAfter = round2((existingDebt + newPayment) / safeIncome);
  const debtService = dtiAfter;
  const foir = round2((existingDebt + newPayment + est.living + est.housing + est.utilities) / safeIncome);
  const maxAffordablePayment = round2(Math.max(0, DTI_MAX * netIncome - existingDebt));
  const maxLoanAmount = maxPrincipalFor(maxAffordablePayment, rate, duration);
  const headroom = round2(maxAffordablePayment - newPayment);
  return {
    dtiBefore, dtiAfter, foir, debtService,
    band: bandFor(dtiAfter),
    cutoff: { warn: DTI_WARN, max: DTI_MAX },
    maxAffordablePayment, maxLoanAmount, headroom,
  };
}

function buildCommitments(rng: ReturnType<typeof rngFrom>, otherDebt: number, rate: number): ExistingCommitment[] {
  const count = otherDebt > 0 ? rng.int(1, 3) : 0;
  if (!count) return [];
  const lenders = ["Swedbank", "SEB", "LHV", "Cetelem", "Cofidis", "BNP", "Santander"];
  const types: ExistingCommitment["type"][] = ["revolving", "auto", "perso", "store"];
  const out: ExistingCommitment[] = [];
  let remaining = otherDebt;
  for (let i = 0; i < count; i++) {
    const share = i === count - 1 ? remaining : round2(remaining * rng.range(0.3, 0.6));
    remaining = round2(remaining - share);
    const monthly = Math.max(15, round2(share));
    const monthsLeft = rng.int(6, 54);
    const r = round2(rate + rng.range(-2, 6));
    const balance = round2(monthly * monthsLeft * 0.92);
    const type = rng.pick(types);
    out.push({
      label: { revolving: "Crédit renouvelable", auto: "Crédit auto", perso: "Prêt perso", store: "Crédit magasin" }[type],
      lender: rng.pick(lenders),
      type,
      balance,
      monthly,
      ratePct: r,
      monthsLeft,
    });
  }
  return out;
}

function buildOpenBanking(
  rng: ReturnType<typeof rngFrom>,
  netIncome: number,
  dtiAfter: number,
  contractType: string | null
) {
  const months: MonthAggregate[] = [];
  let balance = round2(netIncome * (0.3 + 0.6 * rng.next()) - (dtiAfter > 0.4 ? 400 : 0));
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const inflow = round2(netIncome * rng.range(0.97, 1.05));
    const outflow = round2(netIncome * rng.range(0.82, 1.02));
    balance = round2(balance + inflow - outflow);
    months.push({ month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, inflow, outflow, endBalance: balance });
  }
  const regular = ["cdi", "tahtajatu", "retired"].includes((contractType ?? "").toLowerCase());
  const merchants = ["Bolt", "Wolt", "Olympic Casino", "Coolbet", "Amazon", "Rimi", "Maxima"];
  const gambling = rng.chance(0.15) ? round2(rng.range(0.02, 0.08)) : 0;
  return {
    months,
    salaryRegularity: regular ? ("régulier" as const) : rng.chance(0.5) ? ("variable" as const) : ("irrégulier" as const),
    overdraftDays: clamp(Math.round((dtiAfter - 0.3) * 60 + rng.range(0, 5)), 0, 31),
    nsfCount: dtiAfter > 0.45 ? rng.int(0, 3) : 0,
    avgBalance: round2(months.reduce((s, m) => s + m.endBalance, 0) / months.length),
    gamblingPct: gambling,
    riskyMerchants: gambling > 0 ? [merchants[2], merchants[3]] : [],
    inflow: round2(months.reduce((s, m) => s + m.inflow, 0)),
    outflow: round2(months.reduce((s, m) => s + m.outflow, 0)),
  };
}

function buildStability(rng: ReturnType<typeof rngFrom>, contractType: string | null, seniorityMonths: number | null) {
  const ct = (contractType ?? "").toLowerCase();
  const contractScore = EMPLOYMENT_SCORE[ct] ?? 50;
  const probation = (seniorityMonths ?? 99) < 3 && ["cdi", "cdd", "tahtajatu", "tahtajaline"].includes(ct);
  const months = seniorityMonths ?? 0;
  const seniorityBand = months >= 24 ? "≥ 2 ans" : months >= 12 ? "1–2 ans" : months >= 6 ? "6–12 mois" : "< 6 mois";
  const payslipVsDeclaredPct = round2(1 + (rng.next() - 0.5) * 0.1);
  const incomeVerified = Math.abs(1 - payslipVsDeclaredPct) < 0.03 ? "matched" : "gap";
  return { contractScore, probation, seniorityBand, incomeVerified: incomeVerified as "matched" | "gap", payslipVsDeclaredPct };
}

function buildStress(
  ratePlus: number,
  incomeMinus: number,
  ctx: { netIncome: number; amount: number; rate: number; duration: number; existingDebt: number; est: AffordabilityEstimates; equivalence: number; floorPerHead: number }
) {
  const stressedIncome = ctx.netIncome * (1 - incomeMinus);
  const paymentStressed = monthlyPaymentFor(ctx.amount, ctx.rate + ratePlus, ctx.duration);
  const dtiStressed = round2((ctx.existingDebt + paymentStressed) / (stressedIncome > 0 ? stressedIncome : 1));
  const householdStressed =
    stressedIncome - ctx.est.living - ctx.est.housing - ctx.est.utilities - ctx.est.transport - ctx.existingDebt - paymentStressed;
  const residualStressed = round2(householdStressed / ctx.equivalence);
  return {
    ratePlus,
    incomeMinus,
    paymentStressed: round2(paymentStressed),
    dtiStressed,
    residualStressed,
    passes: dtiStressed <= 0.4 && residualStressed >= ctx.floorPerHead * 0.8,
  };
}

function buildFlags(
  ratios: AffordabilityAnalysis["ratios"],
  perHead: number,
  floorPerHead: number,
  ob: AffordabilityAnalysis["openBanking"],
  rng: ReturnType<typeof rngFrom>
) {
  const flags: AffordabilityAnalysis["flags"] = [];
  if (ratios.dtiAfter > DTI_MAX) flags.push({ code: "dti", severity: "warn", label: `Taux d'endettement ${Math.round(ratios.dtiAfter * 100)}% > 40%` });
  if (perHead < floorPerHead) flags.push({ code: "residual", severity: "warn", label: `Reste à vivre ${Math.round(perHead)} € < seuil ${floorPerHead} €` });
  if (ob.overdraftDays > 15) flags.push({ code: "overdraft", severity: "warn", label: `${ob.overdraftDays} jours à découvert sur 30j` });
  if (ob.nsfCount > 0) flags.push({ code: "nsf", severity: "critical", label: `${ob.nsfCount} rejet(s) de prélèvement` });
  if (ob.gamblingPct > 0) flags.push({ code: "gambling", severity: "warn", label: `Dépenses de jeu ${Math.round(ob.gamblingPct * 100)}% des sorties` });
  if (rng.chance(0.08) && ratios.dtiAfter > 0.4) flags.push({ code: "ficp", severity: "critical", label: "Inscription FICP (simulée)" });
  if (!flags.length) flags.push({ code: "ok", severity: "info", label: "Aucune alerte budgétaire détectée" });
  return flags;
}

function buildVerdict(
  ratios: AffordabilityAnalysis["ratios"],
  perHead: number,
  floorPerHead: number,
  flags: AffordabilityAnalysis["flags"],
  stress: AffordabilityAnalysis["stress"]
): AffordabilityAnalysis["verdict"] {
  let score = 100;
  const reasons: string[] = [];
  if (ratios.band === "breach") { score -= 25; reasons.push("Endettement au-dessus du seuil"); }
  else if (ratios.band === "warn") { score -= 10; reasons.push("Endettement à surveiller"); }
  if (perHead < floorPerHead) { score -= 20; reasons.push("Reste à vivre insuffisant"); }
  for (const f of flags) {
    if (f.severity === "critical") { score -= 15; reasons.push(f.label); }
    else if (f.severity === "warn" && f.code !== "dti" && f.code !== "residual") score -= 8;
  }
  if (!stress.passes) { score -= 10; reasons.push("Échec du test de résistance"); }
  score = clamp(Math.round(score), 0, 100);
  const decision = score >= 70 ? "go" : score >= 45 ? "caution" : "no_go";
  if (!reasons.length) reasons.push("Capacité de remboursement confortable");
  return { decision, score, reasons: reasons.slice(0, 4) };
}

// Contract / offer document model (derived, deterministic).
//
// Builds the merge context that populates the pre-contractual offer (SECCI / FIPEN)
// and the document pack an EU consumer lender issues. The locked offer persists in
// the existing `contracts` table; this module only shapes the preview + terms JSON.

import { formatCurrency } from "../format";
import type { LoanApplicationFull } from "../types";
import { countryLegal } from "./constants";
import type { OfferPricing } from "./pricing";

export interface ContractMergeContext {
  lender: { name: string; address: string; regulator: string };
  borrower: { name: string; address: string; birthDate: string | null; idNumber: string | null; email: string | null; phone: string | null };
  credit: {
    product: string | null;
    amount: number;
    durationMonths: number;
    debitRate: number;
    taeg: number;
    monthlyPayment: number;
    monthlyWithInsurance: number;
    applicationFee: number;
    totalInterest: number;
    totalCost: number;
    totalDue: number;
    firstDueDate: string;
  };
  insurance: { taken: boolean; monthly: number; total: number };
  legal: { country: string; coolingOffDays: number; usuryCeiling: number; jurisdiction: string };
  schedulePreview: { sequence: number; due_date: string; amount_due: number }[];
}

export interface DocumentPackItem {
  kind: string;
  label: string;
  required: boolean;
}

export const DOCUMENT_PACK: DocumentPackItem[] = [
  { kind: "secci", label: "Information précontractuelle (FIPEN / SECCI)", required: true },
  { kind: "agreement", label: "Contrat de crédit", required: true },
  { kind: "schedule", label: "Tableau d'amortissement", required: true },
  { kind: "ipid", label: "Document d'information assurance (IPID)", required: false },
  { kind: "sepa", label: "Mandat de prélèvement SEPA", required: true },
  { kind: "withdrawal", label: "Bordereau de rétractation", required: true },
];

export const OFFER_BLOCKS: string[] = [
  "En-tête prêteur",
  "Identité des parties",
  "Caractéristiques du crédit",
  "Encadré TAEG & coût total",
  "Tableau d'amortissement",
  "Assurance facultative",
  "Frais de dossier",
  "Mandat SEPA",
  "Droit de rétractation (14 jours)",
  "Mentions légales",
  "Signature",
];

export function buildMergeContext(app: LoanApplicationFull, pricing: OfferPricing): ContractMergeContext {
  const legal = countryLegal(app.country);
  const firstDue = pricing.amortization.schedule[0]?.due_date ?? new Date().toISOString().slice(0, 10);
  return {
    lender: {
      name: "Quickfund OÜ",
      address: "Narva mnt 5, 10117 Tallinn, Estonie",
      regulator: legal.regulator,
    },
    borrower: {
      name: `${app.first_name ?? ""} ${app.last_name ?? ""}`.trim() || "—",
      address: [app.address, app.postal_code, app.city, app.address_country ?? app.country].filter(Boolean).join(", "),
      birthDate: app.birth_date,
      idNumber: app.id_number,
      email: app.email,
      phone: app.phone,
    },
    credit: {
      product: pricing.productName ?? pricing.productSlug,
      amount: pricing.amount,
      durationMonths: pricing.durationMonths,
      debitRate: pricing.appliedRate,
      taeg: pricing.taeg,
      monthlyPayment: pricing.amortization.monthlyPayment,
      monthlyWithInsurance: pricing.totals.monthlyWithInsurance,
      applicationFee: pricing.fees.applicationFee,
      totalInterest: pricing.amortization.totalInterest,
      totalCost: pricing.totals.totalCost,
      totalDue: pricing.totals.totalDue,
      firstDueDate: firstDue,
    },
    insurance: { taken: pricing.insurance.enabled, monthly: pricing.insurance.monthlyCost, total: pricing.insurance.totalCost },
    legal: {
      country: legal.name,
      coolingOffDays: legal.coolingOffDays,
      usuryCeiling: pricing.usury.ceiling,
      jurisdiction: legal.name,
    },
    schedulePreview: pricing.amortization.schedule.slice(0, 6).map((s) => ({ sequence: s.sequence, due_date: s.due_date, amount_due: s.amount_due })),
  };
}

// Compact, human-readable summary line used in the offer header.
export function offerHeadline(pricing: OfferPricing): string {
  return `${formatCurrency(pricing.amount)} sur ${pricing.durationMonths} mois · ${pricing.appliedRate}% (TAEG ${pricing.taeg}%) · ${formatCurrency(pricing.totals.monthlyWithInsurance, 2)}/mois`;
}

// Communication / recontact / case-management engine (derived, deterministic).
//
// Next-best-action, contactability (consent + quiet hours), message templates,
// mock delivery status and duplicate-contact detection. Sends are mocked: the UI
// writes an `interactions` row, this module just shapes the payloads.

import type { LoanApplicationFull } from "../types";
import { applicationStatusLabels, formatCurrency } from "../format";
import { hashSeed, hoursSince } from "./seed";

export type Channel = "call" | "email" | "sms" | "whatsapp";
export type DeliveryStatus = "queued" | "sent" | "delivered" | "read" | "bounced" | "failed";
export type CallOutcome = "reached" | "no_answer" | "busy" | "wrong_number" | "callback" | "voicemail";

export const CALL_OUTCOME_LABELS: Record<CallOutcome, string> = {
  reached: "Joint",
  no_answer: "Sans réponse",
  busy: "Occupé",
  wrong_number: "Mauvais numéro",
  callback: "Rappel demandé",
  voicemail: "Messagerie",
};

export const DELIVERY_LABELS: Record<DeliveryStatus, string> = {
  queued: "En file",
  sent: "Envoyé",
  delivered: "Délivré",
  read: "Lu",
  bounced: "Rejeté",
  failed: "Échec",
};

export interface ApplicationConsent {
  marketing_opt_in: boolean;
  channels: { call: boolean; email: boolean; sms: boolean; whatsapp: boolean };
  preferred_channel: Channel;
  do_not_contact: boolean;
  quiet_start: string; // "20:00"
  quiet_end: string; // "08:00"
}

export const DEFAULT_CONSENT: ApplicationConsent = {
  marketing_opt_in: false,
  channels: { call: true, email: true, sms: true, whatsapp: false },
  preferred_channel: "email",
  do_not_contact: false,
  quiet_start: "20:00",
  quiet_end: "08:00",
};

export function readConsent(raw: unknown): ApplicationConsent {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_CONSENT };
  return { ...DEFAULT_CONSENT, ...(raw as Partial<ApplicationConsent>), channels: { ...DEFAULT_CONSENT.channels, ...((raw as { channels?: object }).channels ?? {}) } };
}

export interface MessageTemplate {
  id: string;
  stage: "missing_docs" | "offer_ready" | "reminder" | "decline" | "welcome";
  channel: "email" | "sms";
  label: string;
  subject?: string;
  body: string;
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "welcome_email",
    stage: "welcome",
    channel: "email",
    label: "Accusé de réception",
    subject: "Votre demande Quickfund {{ref}}",
    body: "Bonjour {{prenom}},\n\nNous avons bien reçu votre demande de {{produit}} de {{montant}}. Un conseiller l'étudie et reviendra vers vous sous 48h.\n\nCordialement,\nL'équipe Quickfund",
  },
  {
    id: "missing_docs_email",
    stage: "missing_docs",
    channel: "email",
    label: "Pièces manquantes",
    subject: "Pièces à compléter — demande {{ref}}",
    body: "Bonjour {{prenom}},\n\nPour poursuivre l'étude de votre demande de {{montant}}, merci de nous transmettre : {{pieces_manquantes}}.\n\nMerci,\n{{agent}} — Quickfund",
  },
  {
    id: "offer_ready_email",
    stage: "offer_ready",
    channel: "email",
    label: "Offre prête",
    subject: "Votre offre Quickfund est disponible",
    body: "Bonjour {{prenom}},\n\nBonne nouvelle : votre offre de {{produit}} de {{montant}} est prête. Vous pouvez la consulter et la signer en ligne.\n\n{{agent}} — Quickfund",
  },
  {
    id: "reminder_sms",
    stage: "reminder",
    channel: "sms",
    label: "Relance SMS",
    body: "Quickfund : bonjour {{prenom}}, votre dossier {{ref}} est en attente. Rappelez-nous pour le finaliser.",
  },
  {
    id: "decline_email",
    stage: "decline",
    channel: "email",
    label: "Décision défavorable",
    subject: "Suite à votre demande {{ref}}",
    body: "Bonjour {{prenom}},\n\nAprès étude, nous ne pouvons donner une suite favorable à votre demande de {{montant}}. Vous pouvez demander un réexamen sous 30 jours.\n\n{{agent}} — Quickfund",
  },
];

export function renderTemplate(
  tpl: MessageTemplate,
  app: LoanApplicationFull,
  extra: { agent?: string; missingDocs?: string } = {}
): { subject?: string; body: string } {
  const map: Record<string, string> = {
    prenom: app.first_name ?? "",
    nom: app.last_name ?? "",
    montant: app.amount != null ? formatCurrency(app.amount) : "—",
    produit: app.credit_type ?? "crédit",
    ref: app.id.slice(0, 8).toUpperCase(),
    agent: extra.agent ?? "L'équipe Quickfund",
    pieces_manquantes: extra.missingDocs ?? "vos justificatifs",
  };
  const sub = (s?: string) => s?.replace(/\{\{(\w+)\}\}/g, (_, k) => map[k] ?? `{{${k}}}`);
  return { subject: sub(tpl.subject), body: sub(tpl.body) ?? "" };
}

export interface CommsState {
  nextBestAction: { code: string; label: string; channel: Channel | null } | null;
  contactable: boolean;
  quietHours: boolean;
  ageHours: number;
  consent: ApplicationConsent;
}

export function computeCommsState(app: LoanApplicationFull, missingDocsCount = 0): CommsState {
  const consent = readConsent(app.consent);
  const ageHours = Math.round(hoursSince(app.last_contacted_at ?? app.created_at));
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const qs = parseTime(consent.quiet_start);
  const qe = parseTime(consent.quiet_end);
  const quietHours = qs > qe ? hour >= qs || hour < qe : hour >= qs && hour < qe;
  const contactable = !consent.do_not_contact && !quietHours;

  let nba: CommsState["nextBestAction"] = null;
  if (consent.do_not_contact) nba = { code: "dnc", label: "Ne pas contacter (opposition)", channel: null };
  else if (app.status === "submitted" && ageHours > 4) nba = { code: "first_contact", label: "Premier contact à réaliser", channel: consent.preferred_channel };
  else if (missingDocsCount > 0) nba = { code: "missing_docs", label: `Demander ${missingDocsCount} pièce(s) manquante(s)`, channel: "email" };
  else if (app.status === "qualified") nba = { code: "send_offer", label: "Envoyer l'offre", channel: "email" };
  else if (app.status === "approved" && !app.converted_client_id) nba = { code: "chase_sign", label: "Relancer pour signature", channel: consent.preferred_channel };
  else if (app.status === "under_review") nba = { code: "follow_up", label: "Relance J+3", channel: consent.preferred_channel };

  return { nextBestAction: nba, contactable, quietHours, ageHours, consent };
}

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) + (m || 0) / 60;
}

// Mock delivery status, stable per interaction.
export function mockDelivery(interactionId: string, channel: string): DeliveryStatus {
  if (channel === "call" || channel === "note" || channel === "meeting" || channel === "system") return "delivered";
  const r = (hashSeed(interactionId) % 100) / 100;
  if (channel === "email") return r < 0.02 ? "bounced" : r < 0.08 ? "read" : "delivered";
  return r < 0.05 ? "failed" : "delivered";
}

export interface DuplicateHint {
  id: string;
  name: string;
  reason: string;
}

export function findDuplicates(app: LoanApplicationFull, peers: LoanApplicationFull[]): DuplicateHint[] {
  const email = (app.email ?? "").toLowerCase();
  const phone = (app.phone ?? "").replace(/[^\d+]/g, "");
  return peers
    .filter((p) => p.id !== app.id)
    .filter((p) => (email && (p.email ?? "").toLowerCase() === email) || (phone && (p.phone ?? "").replace(/[^\d+]/g, "") === phone))
    .map((p) => ({
      id: p.id,
      name: `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "—",
      reason: (p.email ?? "").toLowerCase() === email ? "Même e-mail" : "Même téléphone",
    }));
}

export function stageLabel(status: string): string {
  return applicationStatusLabels[status] ?? status;
}

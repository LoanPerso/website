// Formatting helpers for the admin UI (FR locale, EUR).

const FR = "fr-FR";

export function formatCurrency(value: number | null | undefined, fractionDigits = 0): string {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat(FR, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n);
}

export function formatNumber(value: number | null | undefined, fractionDigits = 0): string {
  return new Intl.NumberFormat(FR, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number(value ?? 0));
}

export function formatPercent(value: number | null | undefined, fractionDigits = 2): string {
  return `${formatNumber(value, fractionDigits)} %`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(FR, { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

export function formatMonth(month: string): string {
  // month is "YYYY-MM"
  const [y, m] = month.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return new Intl.DateTimeFormat(FR, { month: "short", year: "2-digit" }).format(d);
}

export function fullName(first?: string | null, last?: string | null): string {
  return [first, last].filter(Boolean).join(" ").trim() || "—";
}

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Human labels (FR) for enums --------------------------------------------------
export const loanStatusLabels: Record<string, string> = {
  draft: "Brouillon",
  active: "En cours",
  paid_off: "Soldé",
  defaulted: "En défaut",
  cancelled: "Annulé",
};

export const clientStatusLabels: Record<string, string> = {
  prospect: "Prospect",
  active: "Actif",
  inactive: "Inactif",
  blacklisted: "Bloqué",
};

export const installmentStatusLabels: Record<string, string> = {
  pending: "À venir",
  partial: "Partiel",
  paid: "Payé",
  late: "En retard",
  waived: "Annulé",
};

export const paymentMethodLabels: Record<string, string> = {
  sepa: "Prélèvement SEPA",
  transfer: "Virement",
  card: "Carte",
  cash: "Espèces",
  mobile_money: "Mobile money",
  other: "Autre",
};

export const paymentStatusLabels: Record<string, string> = {
  pending: "En attente",
  completed: "Validé",
  failed: "Échoué",
  refunded: "Remboursé",
};

export const applicationStatusLabels: Record<string, string> = {
  draft: "Brouillon",
  submitted: "Reçue",
  under_review: "En étude",
  qualified: "Qualifiée",
  approved: "Approuvée",
  rejected: "Refusée",
  cancelled: "Annulée",
};

export const documentTypeLabels: Record<string, string> = {
  id: "Pièce d'identité",
  income: "Justificatif de revenus",
  address: "Justificatif de domicile",
  bank: "Relevé bancaire / RIB",
  contract: "Contrat signé",
  kbis: "Extrait Kbis",
  other: "Autre",
};

export const documentStatusLabels: Record<string, string> = {
  missing: "Manquant",
  received: "Reçu",
  verified: "Vérifié",
  rejected: "Rejeté",
  expired: "Expiré",
};

export const interactionTypeLabels: Record<string, string> = {
  note: "Note",
  call: "Appel",
  email: "Email",
  sms: "SMS",
  meeting: "Rendez-vous",
  system: "Système",
};

export const taskStatusLabels: Record<string, string> = {
  open: "À faire",
  done: "Fait",
  cancelled: "Annulé",
};

export const taskPriorityLabels: Record<string, string> = {
  low: "Basse",
  normal: "Normale",
  high: "Haute",
  urgent: "Urgente",
};

export const taskCategoryLabels: Record<string, string> = {
  follow_up: "Relance",
  kyc: "KYC / Pièces",
  signature: "Signature",
  collection: "Recouvrement",
  review: "Revue",
  other: "Autre",
};

export const contractStatusLabels: Record<string, string> = {
  draft: "Brouillon",
  offer_sent: "Offre envoyée",
  signed: "Signé",
  active: "Actif",
  completed: "Soldé",
  cancelled: "Annulé",
  expired: "Expiré",
};

export const signatureMethodLabels: Record<string, string> = {
  e_sign: "Signature électronique",
  paper: "Papier",
  in_person: "En agence",
};

export const scoreSourceLabels: Record<string, string> = {
  application: "Demande",
  recompute: "Recalcul",
  manual: "Manuel",
  conversion: "Conversion",
  seed: "Initial",
};

export const scoreFactorLabels: Record<string, string> = {
  credit_history: "Historique de crédit",
  dti: "Taux d'endettement",
  income_stability: "Stabilité des revenus",
  disposable_income: "Reste à vivre",
  seniority: "Ancienneté emploi",
  housing: "Logement",
  age: "Âge",
};

// Date + time (FR), e.g. "28/05/2026 14:32".
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(FR, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

// Relative time for recent events ("à l'instant", "il y a 5 min", "hier"),
// falling back to a plain date once older than a week.
export function formatRelativeDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const sec = Math.round((Date.now() - d.getTime()) / 1000);
  if (sec < 0) return formatDateTime(value);
  if (sec < 60) return "à l'instant";
  const min = Math.round(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `il y a ${hr} h`;
  const day = Math.round(hr / 24);
  if (day === 1) return "hier";
  if (day < 7) return `il y a ${day} j`;
  return formatDate(value);
}

// Mailbox enum labels ----------------------------------------------------------
export const mailFolderRoleLabels: Record<string, string> = {
  inbox: "Réception",
  sent: "Envoyés",
  drafts: "Brouillons",
  trash: "Corbeille",
  archive: "Archives",
  spam: "Indésirables",
  other: "Autre",
};

export const mailDirectionLabels: Record<string, string> = {
  in: "Entrant",
  out: "Sortant",
};

export const mailDiagnosticKindLabels: Record<string, string> = {
  smtp: "SMTP (envoi)",
  imap: "IMAP (réception)",
};

export const mailSecurityLabels: Record<string, string> = {
  ssl: "SSL/TLS",
  starttls: "STARTTLS",
  none: "Aucune",
};

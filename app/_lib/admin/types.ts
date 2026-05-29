// Domain types mirroring the Supabase schema (supabase/migrations).

export type RiskCategory = "A" | "B" | "C" | "D";

export type ClientStatus = "prospect" | "active" | "inactive" | "blacklisted";
export type LoanStatus = "draft" | "active" | "paid_off" | "defaulted" | "cancelled";
export type InstallmentStatus = "pending" | "partial" | "paid" | "late" | "waived";
export type PaymentMethod = "sepa" | "transfer" | "card" | "cash" | "mobile_money" | "other";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "qualified"
  | "approved"
  | "rejected"
  | "cancelled";
export type AdminRole = "superadmin" | "admin" | "viewer";

export type ScoreSource = "application" | "recompute" | "manual" | "conversion" | "seed";
export type DocumentType = "id" | "income" | "address" | "bank" | "contract" | "kbis" | "other";
export type DocumentStatus = "missing" | "received" | "verified" | "rejected" | "expired";
export type InteractionType = "note" | "call" | "email" | "sms" | "meeting" | "system";
export type InteractionDirection = "in" | "out";
export type TaskStatus = "open" | "done" | "cancelled";
export type TaskPriority = "low" | "normal" | "high" | "urgent";
export type TaskCategory = "follow_up" | "kyc" | "signature" | "collection" | "review" | "other";
export type ContractStatus =
  | "draft"
  | "offer_sent"
  | "signed"
  | "active"
  | "completed"
  | "cancelled"
  | "expired";
export type SignatureMethod = "e_sign" | "paper" | "in_person";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  min_amount: number;
  max_amount: number;
  min_duration_months: number;
  max_duration_months: number;
  min_rate: number;
  max_rate: number;
  default_rate: number;
  application_fee_percent: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  reference: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  national_id: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  marital_status: string | null;
  dependents: number | null;
  employment_status: string | null;
  employer_name: string | null;
  monthly_net_income: number | null;
  monthly_expenses: number | null;
  housing_status: string | null;
  credit_history: string | null;
  risk_category: RiskCategory | null;
  status: ClientStatus;
  notes: string | null;
  employment_since: string | null;
  credit_score: number | null;
  score_updated_at: string | null;
  score_is_stale: boolean;
  score_override: number | null;
  score_override_reason: string | null;
  consent_given_at: string | null;
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  reference: string | null;
  client_id: string;
  product_id: string | null;
  principal_amount: number;
  annual_rate: number;
  duration_months: number;
  monthly_payment: number;
  total_interest: number;
  total_repayable: number;
  application_fee: number;
  purpose: string | null;
  risk_category: RiskCategory | null;
  status: LoanStatus;
  start_date: string;
  end_date: string | null;
  disbursed_at: string | null;
  // Servicing & collections (migration 20260528150000)
  closed_at: string | null;
  closure_reason: "settled_early" | "paid_off" | "written_off" | "cancelled" | null;
  write_off_amount: number;
  dunning_level: number;
  next_action_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Installment {
  id: string;
  loan_id: string;
  sequence: number;
  due_date: string;
  amount_due: number;
  principal_component: number;
  interest_component: number;
  amount_paid: number;
  late_fee: number;
  status: InstallmentStatus;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  reference: string | null;
  loan_id: string;
  client_id: string | null;
  installment_id: string | null;
  amount: number;
  payment_date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  notes: string | null;
  created_at: string;
}

export type ApplicationPriority = "low" | "normal" | "high" | "urgent";

export interface LoanApplication {
  id: string;
  status: ApplicationStatus;
  credit_type: string | null;
  amount: number | null;
  duration: number | null;
  monthly_payment: number | null;
  effective_rate: number | null;
  country: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  converted_client_id: string | null;
  rejection_reason: string | null;
  source: string | null;
  score: number | null;
  score_category: RiskCategory | null;
  priority: ApplicationPriority | null;
  assigned_to: string | null;
  tags: string[] | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

// Full application row (all KYC/funnel + workflow columns) — used by the dossier.
export interface LoanApplicationFull extends LoanApplication {
  user_id: string | null;
  birth_date: string | null;
  birth_place: string | null;
  nationality: string | null;
  marital_status: string | null;
  id_type: string | null;
  id_number: string | null;
  address: string | null;
  postal_code: string | null;
  address_country: string | null;
  employer_name: string | null;
  employer_address: string | null;
  job_title: string | null;
  contract_type: string | null;
  start_date: string | null;
  monthly_net_income: number | null;
  document_id_url: string | null;
  document_income_url: string | null;
  document_address_url: string | null;
  document_bank_url: string | null;
  // Workflow / analyst-decision (additive migration 20260528140000)
  internal_notes: string | null;
  stage_entered_at: string | null;
  consent: ApplicationConsentRow | null;
  decision: ApplicationDecisionRow | null;
  risk_review: ApplicationRiskReviewRow | null;
  pricing: ApplicationPricingRow | null;
  analysis_overrides: Record<string, number | boolean> | null;
}

// Persisted JSON shapes (snapshots written by the dossier; engines stay derived).
export interface ApplicationConsentRow {
  marketing_opt_in?: boolean;
  channels?: { call?: boolean; email?: boolean; sms?: boolean; whatsapp?: boolean };
  preferred_channel?: string;
  do_not_contact?: boolean;
  quiet_start?: string;
  quiet_end?: string;
}

export interface ApplicationDecisionRow {
  outcome: "APPROVE" | "REFER" | "DECLINE";
  status: ApplicationStatus;
  confidence?: number;
  reason_codes?: { code: string; label: string }[];
  stipulations?: { code: string; label: string; required: boolean; satisfied?: boolean }[];
  justification?: string | null;
  decided_by?: string | null;
  decided_at: string;
}

export interface ApplicationRiskReviewRow {
  disposition: "clear" | "review" | "escalate" | "block";
  composite?: number;
  aml_rating?: string;
  sar_filed?: boolean;
  notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at: string;
}

export interface ApplicationPricingRow {
  amount: number;
  duration_months: number;
  applied_rate: number;
  taeg: number;
  monthly_payment: number;
  monthly_with_insurance: number;
  insurance: boolean;
  guarantee: string;
  total_cost: number;
  locked_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface ImportBatch {
  id: string;
  entity: "clients" | "loans" | "payments";
  filename: string | null;
  total_rows: number;
  inserted_rows: number;
  failed_rows: number;
  status: "pending" | "completed" | "partial" | "failed";
  error_log: unknown;
  created_at: string;
}

// View rows
export interface PortfolioKpis {
  total_clients: number;
  active_clients: number;
  total_loans: number;
  active_loans: number;
  defaulted_loans: number;
  total_disbursed: number;
  total_collected: number;
  outstanding_principal: number;
  interest_earned: number;
  overdue_amount: number;
  overdue_installments: number;
  overdue_loans: number;
  default_rate_pct: number;
}

export interface MonthlyDisbursement {
  month: string;
  loans_count: number;
  total_principal: number;
  total_interest: number;
}

export interface MonthlyCollection {
  month: string;
  payments_count: number;
  total_collected: number;
}

export interface OverdueInstallment {
  id: string;
  loan_id: string;
  sequence: number;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  status: InstallmentStatus;
  loan_reference: string | null;
  loan_status: LoanStatus;
  client_id: string;
  client_reference: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  is_overdue: boolean;
  days_late: number;
}

export interface LoanArrears {
  loan_id: string;
  loan_reference: string | null;
  loan_status: LoanStatus;
  client_id: string;
  client_reference: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  dunning_level: number;
  next_action_date: string | null;
  overdue_count: number;
  overdue_amount: number;
  late_fees: number;
  max_days_late: number;
  oldest_due_date: string;
  outstanding_total: number;
}

export type Result<T> = { data: T | null; error: string | null };

// Joined shapes used by the UI
export type LoanWithClient = Loan & {
  client?: Pick<Client, "id" | "reference" | "first_name" | "last_name"> | null;
  product?: Pick<Product, "id" | "slug" | "name"> | null;
};

export type ClientWithStats = Client & {
  loans_count?: number;
  active_loans_count?: number;
  total_borrowed?: number;
};

// --- CRM: scoring, documents, interactions, tasks, contracts -----------------

export interface ClientScore {
  id: string;
  client_id: string;
  score: number;
  category: RiskCategory;
  factors: ScoreFactorSnapshot[];
  reason_codes: ReasonCodeSnapshot[];
  dti: number | null;
  is_complete: boolean;
  model_version: string;
  source: ScoreSource;
  computed_by: string | null;
  computed_at: string;
}

export interface ScoreFactorSnapshot {
  code: string;
  label: string;
  weight: number;
  raw: string;
  score: number | null;
  contribution: number;
  status: "ok" | "unknown";
}

export interface ReasonCodeSnapshot {
  code: string;
  label: string;
  score: number;
}

export interface ClientDocument {
  id: string;
  client_id: string;
  application_id: string | null;
  type: DocumentType;
  label: string | null;
  url: string | null;
  status: DocumentStatus;
  issued_on: string | null;
  expires_on: string | null;
  rejection_reason: string | null;
  verified_by: string | null;
  verified_at: string | null;
  uploaded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: string;
  client_id: string | null;
  application_id: string | null;
  loan_id: string | null;
  contract_id: string | null;
  type: InteractionType;
  direction: InteractionDirection | null;
  subject: string | null;
  body: string | null;
  occurred_at: string;
  created_by: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  client_id: string | null;
  loan_id: string | null;
  application_id: string | null;
  contract_id: string | null;
  installment_id: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  assigned_to: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskWithClient = Task & {
  client_reference: string | null;
  first_name: string | null;
  last_name: string | null;
  is_overdue: boolean;
};

export interface Contract {
  id: string;
  reference: string | null;
  client_id: string;
  loan_id: string | null;
  product_id: string | null;
  status: ContractStatus;
  principal_amount: number | null;
  annual_rate: number | null;
  duration_months: number | null;
  monthly_payment: number | null;
  terms: unknown;
  offer_sent_at: string | null;
  offer_expires_on: string | null;
  signed_at: string | null;
  signature_method: SignatureMethod | null;
  withdrawal_deadline: string | null;
  document_url: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ContractWithRefs = Contract & {
  client?: Pick<Client, "id" | "reference" | "first_name" | "last_name"> | null;
  loan?: Pick<Loan, "id" | "reference" | "status"> | null;
  product?: Pick<Product, "id" | "slug" | "name"> | null;
};

// Snapshot of the offer terms frozen into contracts.terms at origination, so the
// signed agreement keeps an immutable record even if the product/pricing changes.
export interface ContractTermsSnapshot {
  amount: number;
  duration_months: number;
  annual_rate: number;
  taeg: number | null;
  monthly_payment: number;
  monthly_with_insurance: number | null;
  application_fee: number;
  total_interest: number | null;
  total_cost: number | null;
  total_due: number | null;
  insurance: boolean;
  guarantee: string | null;
  first_due_date: string | null;
  cooling_off_days: number | null;
  product_slug: string | null;
  product_name: string | null;
  source_application_id: string | null;
  schedule_preview?: { sequence: number; due_date: string; amount_due: number }[];
  generated_at: string;
}

// Row of v_client_overview (clients + latest score + KYC/tasks/loans aggregates).
export type ClientOverview = Client & {
  latest_score: number | null;
  latest_category: RiskCategory | null;
  latest_score_at: string | null;
  latest_score_complete: boolean | null;
  open_tasks: number;
  overdue_tasks: number;
  docs_total: number;
  docs_verified: number;
  docs_expiring: number;
  loans_count: number;
  active_loans: number;
  total_borrowed: number;
  active_contracts: number;
};

// --- Mailbox: company inbox (accounts, folders, messages, diagnostics) --------
// DB-backed mockup — no real SMTP/IMAP. The schema carries connection settings so
// it can be wired to real servers later (see migration 20260528160000_mailbox).

export type MailDirection = "in" | "out";
export type MailFolderRole = "inbox" | "sent" | "drafts" | "trash" | "archive" | "spam" | "other";
export type MailMessageStatus = "received" | "sent" | "draft" | "queued" | "failed";
export type MailSecurity = "ssl" | "starttls" | "none";
export type MailCheckStatus = "unknown" | "ok" | "error";
export type MailDiagnosticKind = "smtp" | "imap";

export interface MailAddress {
  name?: string | null;
  address: string;
}

// Account read shape — the *_password columns are write-only and never selected.
export interface MailAccount {
  id: string;
  label: string;
  email: string;
  display_name: string | null;
  signature: string | null;
  imap_host: string | null;
  imap_port: number | null;
  imap_security: MailSecurity;
  imap_username: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_security: MailSecurity;
  smtp_username: string | null;
  is_active: boolean;
  is_default: boolean;
  last_synced_at: string | null;
  last_smtp_status: MailCheckStatus;
  last_smtp_checked_at: string | null;
  last_smtp_detail: string | null;
  last_imap_status: MailCheckStatus;
  last_imap_checked_at: string | null;
  last_imap_detail: string | null;
  created_at: string;
  updated_at: string;
}

export interface MailFolder {
  id: string;
  account_id: string;
  name: string;
  path: string;
  role: MailFolderRole;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MailMessage {
  id: string;
  account_id: string;
  folder_id: string | null;
  direction: MailDirection;
  message_uid: string | null;
  message_id: string | null;
  in_reply_to: string | null;
  thread_key: string | null;
  from_name: string | null;
  from_address: string | null;
  to_addresses: MailAddress[];
  cc_addresses: MailAddress[];
  subject: string | null;
  snippet: string | null;
  body_text: string | null;
  body_html: string | null;
  has_attachments: boolean;
  size_bytes: number;
  is_seen: boolean;
  is_flagged: boolean;
  is_answered: boolean;
  is_draft: boolean;
  status: MailMessageStatus;
  client_id: string | null;
  application_id: string | null;
  sent_at: string | null;
  received_at: string | null;
  created_at: string;
  updated_at: string;
}

// Light projection for the message list (no bodies).
export type MailMessageListItem = Omit<MailMessage, "body_text" | "body_html">;

export interface MailAttachment {
  id: string;
  message_id: string;
  filename: string | null;
  content_type: string | null;
  size_bytes: number;
  is_inline: boolean;
  url: string | null;
  created_at: string;
}

// Full message (reader): body + attachments + resolved CRM links.
export type MailMessageFull = MailMessage & {
  attachments: MailAttachment[];
  client?: Pick<Client, "id" | "reference" | "first_name" | "last_name"> | null;
  application?: Pick<LoanApplication, "id" | "first_name" | "last_name" | "status"> | null;
};

export interface MailDiagnostic {
  id: string;
  account_id: string;
  kind: MailDiagnosticKind;
  ok: boolean;
  detail: string | null;
  latency_ms: number | null;
  ran_by: string | null;
  ran_at: string;
}

// Folder enriched with message counters (for the account sidebar).
export type MailFolderWithCount = MailFolder & { unread: number; total: number };

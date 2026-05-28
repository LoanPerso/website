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
  created_at: string;
  updated_at: string;
}

// Full application row (all KYC/funnel columns) — used by the detail dossier.
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
  loan?: Pick<Loan, "id" | "reference"> | null;
  product?: Pick<Product, "id" | "slug" | "name"> | null;
};

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

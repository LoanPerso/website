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

// Finance / P&L (migration 20260530170000) ---------------------------------
export type LedgerKind = "revenue" | "expense";
export type LedgerRevenueCategory = "coaching" | "other";
export type LedgerExpenseCategory = "server_fees" | "management_loans" | "rebranding" | "other";
export type LedgerCategory = LedgerRevenueCategory | LedgerExpenseCategory;

export interface LedgerEntry {
  id: string;
  kind: LedgerKind;
  category: string;
  label: string | null;
  amount: number;
  currency: string;
  period_month: string; // ISO date, first day of the month
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Consolidated P&L per month (v_pnl_monthly): loan-derived revenue + ledger.
export interface PnlMonthly {
  month: string; // "YYYY-MM"
  interest: number;
  application_fees: number;
  penalties: number;
  coaching: number;
  other_revenue: number;
  total_revenue: number;
  expenses: number;
  displayed_profit: number;
  bad_debts: number;
  economic_profit: number;
}

// Single-row P&L totals (v_pnl_summary).
export interface PnlSummary {
  interest: number;
  application_fees: number;
  penalties: number;
  coaching: number;
  other_revenue: number;
  total_revenue: number;
  expenses: number;
  displayed_profit: number;
  bad_debts: number;
  economic_profit: number;
  displayed_margin_pct: number;
  economic_margin_pct: number;
}

// Analytics — Statistiques workspace (migration 20260530180000) -------------
export interface StatPortfolioOverview {
  active_loans: number; outstanding: number; avg_balance: number;
  median_balance: number; p90_balance: number; avg_rate: number; avg_term: number;
}
export interface StatBucket { bucket: string; label: string; loans: number; principal: number; outstanding: number; }
export interface StatDurationBucket { bucket: string; label: string; loans: number; principal: number; }
export interface StatProduct {
  slug: string; name: string; loans: number; active_loans: number; disbursed: number;
  outstanding: number; defaulted: number; written_off: number; avg_rate: number; interest_earned: number;
}
export interface StatCountry { country: string; clients: number; active_loans: number; outstanding: number; }
export interface StatRiskCategory {
  category: string; loans: number; exposure: number; defaulted: number;
  written_off: number; avg_rate: number; default_rate_pct: number;
}
export interface StatScoreBand { band: string; label: string; clients: number; avg_score: number; }
export interface StatDpdBucket { bucket: string; label: string; installments: number; loans: number; amount: number; late_fees: number; }
export interface StatDunning { dunning_level: number; loans: number; arrears: number; late_fees: number; }
export interface StatCashflowMonth {
  month: string; realized: number; projected_due: number; projected_principal: number; projected_interest: number;
}
export interface StatVintage {
  cohort: string; loans: number; disbursed: number; repaid_principal: number; outstanding: number;
  written_off: number; defaulted: number; repaid_pct: number; default_pct: number;
}
export interface StatClientsOverview {
  total_clients: number; active_clients: number; borrowers: number; multi_loan_clients: number; avg_income: number;
}
export interface StatClientStatus { status: string; clients: number; }
export interface StatIncomeBand { band: string; label: string; clients: number; }
export interface StatClientExposure {
  client_id: string; reference: string | null; first_name: string; last_name: string;
  risk_category: RiskCategory | null; active_loans: number; exposure: number;
}
export interface StatFunnel { status: string; apps: number; amount: number; avg_score: number; }
export interface StatFunnelOverview {
  total: number; converted: number; approved: number; rejected: number;
  conversion_rate: number; avg_score: number; total_amount: number;
}
export interface StatSource { source: string; apps: number; converted: number; }

export type Result<T> = { data: T | null; error: string | null };

// ===========================================================================
// Analytics RPC payloads (migration 20260530190000_analytics_rpc)
// One json payload per "Statistiques" page; every sub-aggregation shares the
// same server-side filter (date window + dimensions). See rpc_stats_*().
// ===========================================================================

// Shared filter surface driven by the FilterBar. `from`/`to` are ISO yyyy-mm-dd
// (null = unbounded); each dimension is null when "all".
export interface StatsFilters {
  from: string | null;
  to: string | null;
  product?: string | null;
  country?: string | null;
  risk?: string | null;
  status?: string | null;
  source?: string | null;
}

// Portfolio --------------------------------------------------------------------
export interface PortfolioOverview {
  loans: number; active_loans: number; disbursed: number; outstanding: number;
  avg_balance: number; median_balance: number; p90_balance: number;
  avg_rate: number; avg_term: number; written_off: number; defaulted: number;
  default_rate_pct: number; interest_earned: number;
}
export interface AmountBucket { bucket: string; label: string; loans: number; principal: number; outstanding: number; }
export interface DurationBucket { bucket: string; label: string; loans: number; principal: number; outstanding: number; }
export interface PortfolioProduct {
  slug: string; name: string; loans: number; active_loans: number;
  disbursed: number; outstanding: number; avg_rate: number; default_rate_pct: number;
}
export interface PortfolioCountry { country: string; loans: number; active_loans: number; outstanding: number; }
export interface PortfolioStatusRow { status: string; loans: number; principal: number; outstanding: number; }
export interface OriginationMonth { month: string; loans: number; disbursed: number; }
export interface PortfolioStats {
  overview: PortfolioOverview;
  amount_buckets: AmountBucket[];
  duration_buckets: DurationBucket[];
  by_product: PortfolioProduct[];
  by_country: PortfolioCountry[];
  by_status: PortfolioStatusRow[];
  origination_monthly: OriginationMonth[];
}

// Products ---------------------------------------------------------------------
export interface ProductsTotals {
  products: number; loans: number; active_loans: number; disbursed: number;
  outstanding: number; interest_earned: number; written_off: number;
}
export interface ProductRow {
  slug: string; name: string; loans: number; active_loans: number; disbursed: number;
  outstanding: number; defaulted: number; written_off: number; avg_rate: number; avg_term: number;
  default_rate_pct: number; interest_earned: number; yield_pct: number; avg_ticket: number;
}
export interface ProductsStats { totals: ProductsTotals; products: ProductRow[]; }

// Risk & scoring ---------------------------------------------------------------
export interface RiskOverview {
  exposure: number; loans: number; defaulted: number; written_off: number;
  avg_rate: number; default_rate_pct: number;
}
export interface RiskCategoryRow {
  category: string; loans: number; exposure: number; disbursed: number; defaulted: number;
  written_off: number; avg_rate: number; default_rate_pct: number; share_pct: number;
}
export interface ScoreBandRow { band: string; label: string; clients: number; avg_score: number; exposure: number; }
export interface DefaultByAmountRow { bucket: string; label: string; loans: number; defaulted: number; default_rate_pct: number; }
export interface ExposureByProductRow { slug: string; name: string; exposure: number; }
export interface RiskStats {
  overview: RiskOverview; by_category: RiskCategoryRow[]; score_bands: ScoreBandRow[];
  default_by_amount: DefaultByAmountRow[]; exposure_by_product: ExposureByProductRow[];
}

// Vintages / cohorts -----------------------------------------------------------
export interface VintageOverview {
  cohorts: number; disbursed: number; repaid_principal: number; outstanding: number;
  written_off: number; loans: number; avg_repaid_pct: number; avg_default_pct: number; weighted_loss_pct: number;
}
export interface CohortRow {
  cohort: string; loans: number; disbursed: number; repaid_principal: number; outstanding: number;
  written_off: number; defaulted: number; avg_rate: number; avg_term: number;
  repaid_pct: number; default_pct: number; loss_pct: number;
}
export interface VintagesStats { overview: VintageOverview; cohorts: CohortRow[]; }

// Collections ------------------------------------------------------------------
export interface CollectionsSummary {
  total_overdue_amount: number; total_late_fees: number; arrears_loans: number;
  affected_clients: number; overdue_count: number; outstanding_at_risk: number; avg_days_late: number;
}
export interface DpdBucketRow { bucket: string; label: string; installments: number; loans: number; amount: number; late_fees: number; }
export interface DunningRow { dunning_level: number; loans: number; arrears: number; late_fees: number; }
export interface CollectionsProductRow { slug: string; name: string; arrears_loans: number; overdue_amount: number; late_fees: number; }
export interface CollectionsRiskRow { category: string; arrears_loans: number; overdue_amount: number; }
export interface TopArrearRow {
  loan_id: string; loan_reference: string | null; first_name: string; last_name: string;
  overdue_amount: number; late_fees: number; max_days_late: number; dunning_level: number; overdue_count: number;
}
export interface CollectionsStats {
  summary: CollectionsSummary; dpd_buckets: DpdBucketRow[]; dunning: DunningRow[];
  by_product: CollectionsProductRow[]; by_risk: CollectionsRiskRow[]; top_arrears: TopArrearRow[];
}

// Cashflow ---------------------------------------------------------------------
export interface CashflowSummary {
  realized_total: number; realized_count: number; projected_total: number;
  projected_principal: number; projected_interest: number; months: number; future_months: number;
}
export interface CashflowMonthRow {
  month: string; realized: number; realized_count: number;
  projected_due: number; projected_principal: number; projected_interest: number;
}
export interface CashflowMethodRow { method: string; amount: number; count: number; }
export interface CashflowStats { summary: CashflowSummary; monthly: CashflowMonthRow[]; by_method: CashflowMethodRow[]; }

// Clients ----------------------------------------------------------------------
export interface ClientsOverview {
  total_clients: number; active_clients: number; blacklisted: number; borrowers: number;
  multi_loan_clients: number; avg_income: number; avg_score: number; total_exposure: number;
}
export interface ClientStatusRow { status: string; clients: number; }
export interface IncomeBandRow { band: string; label: string; clients: number; }
export interface ClientScoreBandRow { band: string; label: string; clients: number; avg_score: number; }
export interface ClientsCountryRow { country: string; clients: number; borrowers: number; exposure: number; }
export interface ClientsRiskRow { category: string; clients: number; exposure: number; }
export interface ClientExposureRow {
  client_id: string; reference: string | null; first_name: string; last_name: string;
  risk_category: RiskCategory | null; active_loans: number; exposure: number;
}
export interface NewClientsMonthRow { month: string; clients: number; }
export interface ClientsStats {
  overview: ClientsOverview; by_status: ClientStatusRow[]; by_income: IncomeBandRow[];
  by_score_band: ClientScoreBandRow[]; by_country: ClientsCountryRow[]; by_risk: ClientsRiskRow[];
  top_exposure: ClientExposureRow[]; new_clients_monthly: NewClientsMonthRow[];
}

// Funnel / origination ---------------------------------------------------------
export interface FunnelOverview {
  total: number; converted: number; approved: number; rejected: number; under_review: number;
  conversion_rate: number; approval_rate: number; avg_score: number; total_amount: number; avg_amount: number;
}
export interface FunnelStatusRow { status: string; apps: number; amount: number; avg_score: number; }
export interface FunnelSourceRow { source: string; apps: number; converted: number; conversion_rate: number; amount: number; }
export interface FunnelScoreBandRow { band: string; label: string; apps: number; converted: number; }
export interface FunnelAmountBandRow { band: string; label: string; apps: number; amount: number; }
export interface FunnelStats {
  overview: FunnelOverview; by_status: FunnelStatusRow[]; by_source: FunnelSourceRow[];
  by_score_band: FunnelScoreBandRow[]; by_amount_band: FunnelAmountBandRow[];
}

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

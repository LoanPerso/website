// Country codes (any ISO country code)
export type CountryCode = string;

// Configured countries with specific parameters
export type ConfiguredCountryCode = "FR" | "BE" | "CH" | "ES";

// Credit product types
export type CreditType =
  | "micro-credit"
  | "consumer"
  | "professional"
  | "student"
  | "salary-advance"
  | "leasing";

// Product configuration
export interface ProductConfig {
  id: CreditType;
  minAmount: number;
  maxAmount: number;
  minDuration: number;
  maxDuration: number;
  minRate: number;
  maxRate: number;
  step: number;
  icon: string;
  color: string;
}

// Employment status
export type EmploymentStatus =
  | "cdi"
  | "cdd"
  | "freelance"
  | "auto-entrepreneur"
  | "fonctionnaire"
  | "student"
  | "unemployed"
  | "retired";

// Marital status
export type MaritalStatus =
  | "single"
  | "married"
  | "pacs"
  | "divorced"
  | "widowed";

// Income type
export type IncomeType =
  | "salary"
  | "pension"
  | "benefits"
  | "rental"
  | "business"
  | "other";

// Housing status
export type HousingStatus =
  | "owner"
  | "tenant"
  | "hosted"
  | "other";

// Credit history
export type CreditHistory =
  | "excellent"
  | "good"
  | "mixed"
  | "incidents";

// Employment duration
export type EmploymentDuration =
  | "less-than-6-months"
  | "6-months-to-1-year"
  | "1-to-2-years"
  | "more-than-2-years";

// Business type for professional credit
export type BusinessType =
  | "freelance"
  | "auto-entrepreneur"
  | "tpe"
  | "startup";

// Business need type
export type BusinessNeedType =
  | "treasury"
  | "investment"
  | "equipment"
  | "other";

// Study level
export type StudyLevel =
  | "l1"
  | "l2"
  | "l3"
  | "m1"
  | "m2"
  | "doctorate"
  | "other";

// Institution type
export type InstitutionType =
  | "university"
  | "business-school"
  | "engineering-school"
  | "art-school"
  | "other";

// Asset type for leasing
export type AssetType =
  | "vehicle"
  | "professional-equipment"
  | "it-equipment"
  | "machinery"
  | "other";

// Loan purpose for consumer credit
export type LoanPurpose =
  | "auto"
  | "home-improvement"
  | "equipment"
  | "event"
  | "travel"
  | "other";

// Base form data
export interface BaseFormData {
  country: CountryCode | null;
  creditType: CreditType | null;
  amount: number;
  duration: number;
  age: number | null;
}

// Loan purpose for micro-credit (simpler than consumer)
export type MicroCreditPurpose =
  | "emergency"
  | "bills"
  | "medical"
  | "repair"
  | "other";

// Micro-credit specific
export interface MicroCreditData extends BaseFormData {
  creditType: "micro-credit";
  // Identity
  maritalStatus: MaritalStatus | null;
  // Employment
  employmentStatus: EmploymentStatus | null;
  employmentDuration: EmploymentDuration | null;
  // Income
  incomeType: IncomeType | null;
  monthlyIncome: number | null;
  // Housing
  housingStatus: HousingStatus | null;
  rentAmount: number | null;
  // Expenses
  monthlyExpenses: number | null;
  existingLoans: number | null;        // Monthly payment for existing loans
  dependents: number | null;           // Number of dependents (children, etc.)
  // Banking
  creditHistory: CreditHistory | null;
  hasRecentOverdrafts: YesNo | null;
  // Loan
  loanPurpose: MicroCreditPurpose | null;
  // Insurance
  wantsInsurance: YesNo | null;
}

// Consumer credit specific
export interface ConsumerData extends BaseFormData {
  creditType: "consumer";
  // Identity & Family
  maritalStatus: MaritalStatus | null;
  // Employment
  employmentStatus: EmploymentStatus | null;
  employmentDuration: EmploymentDuration | null;
  // Housing
  housingStatus: HousingStatus | null;
  rentAmount: number | null;           // Monthly rent if tenant
  // Income
  incomeType: IncomeType | null;
  monthlyIncome: number | null;
  spouseIncome: number | null;         // If married/pacs
  otherIncome: number | null;          // Additional income (benefits, rental...)
  // Household expenses
  monthlyExpenses: number | null;
  existingLoans: number | null;        // Monthly payment for existing loans
  dependents: number | null;           // Number of dependents (children, etc.)
  // Banking
  creditHistory: CreditHistory | null;
  hasRecentOverdrafts: YesNo | null;
  // Co-borrower
  hasCoBorrower: YesNo | null;
  coBorrowerIncome: number | null;
  // Savings
  savingsAmount: number | null;
  // Loan details
  loanPurpose: LoanPurpose | null;
  // Insurance
  wantsInsurance: YesNo | null;
}

// Business sector type
export type BusinessSector =
  | "tech"
  | "health"
  | "services"
  | "commerce"
  | "construction"
  | "industry"
  | "food"
  | "transport"
  | "other";

// Extended business type (includes legal forms)
export type ExtendedBusinessType =
  | BusinessType
  | "sarl"
  | "sas"
  | "sa"
  | "eirl"
  | "sprl"
  | "sl"
  | "other";

// Extended business need type
export type ExtendedBusinessNeedType =
  | BusinessNeedType
  | "stock"
  | "expansion";

// Professional credit specific
export interface ProfessionalData extends BaseFormData {
  creditType: "professional";
  // Business info
  businessType: ExtendedBusinessType | null;
  sector: BusinessSector | null;
  yearsInBusiness: number | null;
  employees: number | null;
  // Financials
  annualRevenue: number | null;
  monthlyProfit: number | null;
  existingBusinessLoans: number | null;
  // Banking
  creditHistory: CreditHistory | null;
  hasBusinessAccount: YesNo | null;
  // Loan
  businessNeed: ExtendedBusinessNeedType | null;
  // Insurance
  wantsInsurance: YesNo | null;
}

// Yes/No type for select fields
export type YesNo = "yes" | "no";

// Extended institution type
export type ExtendedInstitutionType =
  | InstitutionType
  | "medical-school"
  | "law-school";

// Guarantor relationship type
export type GuarantorRelationship =
  | "parent"
  | "grandparent"
  | "sibling"
  | "other";

// Student housing status
export type StudentHousingStatus =
  | "withParents"
  | "studentResidence"
  | "rental"
  | "other";

// Student loan purpose
export type StudentLoanPurpose =
  | "tuition"
  | "living"
  | "equipment"
  | "internship"
  | "other";

// Student loan specific
export interface StudentData extends BaseFormData {
  creditType: "student";
  // Studies
  institutionType: ExtendedInstitutionType | null;
  fieldOfStudy: string | null;
  studyLevel: StudyLevel | null;
  remainingYears: number | null;
  // Income
  hasPartTimeJob: YesNo | null;
  partTimeIncome: number | null;
  hasScholarship: YesNo | null;
  scholarshipAmount: number | null;
  // Housing
  housingStatus: StudentHousingStatus | null;
  // Guarantor
  hasGuarantor: YesNo | null;
  guarantorRelationship: GuarantorRelationship | null;
  guarantorIncome: number | null;
  // Loan
  loanPurpose: StudentLoanPurpose | null;
  // Insurance
  wantsInsurance: YesNo | null;
}

// Salary advance contract type
export type SalaryAdvanceContractType = "cdi" | "fonctionnaire" | "cdd";

// Payday frequency
export type PaydayFrequency = "monthly" | "biweekly" | "weekly";

// Salary advance purpose
export type SalaryAdvancePurpose = "bills" | "emergency" | "medical" | "other";

// Salary advance specific
export interface SalaryAdvanceData extends BaseFormData {
  creditType: "salary-advance";
  // Employment
  contractType: SalaryAdvanceContractType | null;
  employmentDuration: EmploymentDuration | null;
  // Income
  netSalary: number | null;
  nextPayday: Date | null;
  paydayFrequency: PaydayFrequency | null;
  // Banking
  hasDirectDeposit: YesNo | null;
  hasRecentOverdrafts: YesNo | null;
  // Loan
  advancePurpose: SalaryAdvancePurpose | null;
}

// Client type for leasing
export type ClientType = "individual" | "business";

// Asset condition
export type AssetCondition = "new" | "recent" | "used";

// Extended asset type
export type ExtendedAssetType =
  | AssetType
  | "medical-equipment"
  | "industrial"
  | "other";

// Leasing specific
export interface LeasingData extends BaseFormData {
  creditType: "leasing";
  // Asset
  assetType: ExtendedAssetType | null;
  assetCondition: AssetCondition | null;
  // Client type
  clientType: ClientType | null;
  // Individual fields
  employmentStatus: EmploymentStatus | null;
  employmentDuration: EmploymentDuration | null;
  monthlyIncome: number | null;
  // Business fields
  yearsInBusiness: number | null;
  annualRevenue: number | null;
  // Banking
  creditHistory: CreditHistory | null;
  // Insurance
  wantsInsurance: YesNo | null;
  // Leasing options
  buyOption: YesNo | null;
}

// Union type for all form data
export type SimulatorFormData =
  | MicroCreditData
  | ConsumerData
  | ProfessionalData
  | StudentData
  | SalaryAdvanceData
  | LeasingData
  | BaseFormData;

// Score factor for explanation
export interface ScoreFactor {
  id: string;
  label: string;
  impact: "positive" | "neutral" | "negative";
  score: number;        // 0-100
  weight: number;       // Weight in the total score
  contribution: number; // Actual contribution to total score
}

// Financial analysis
export interface FinancialAnalysis {
  monthlyIncome: number;
  totalMonthlyCharges: number;      // expenses + existing loans
  proposedPayment: number;          // New loan monthly payment
  totalDebtAfterLoan: number;       // Total debt including new loan
  remainingIncome: number;          // Reste à vivre
  debtRatio: number;                // Total debt / income (%)
  remainingIncomePerPerson: number; // Reste à vivre per person
  minRemainingIncome: number;       // Minimum required remaining income
  maxRecommendedAmount: number;     // Max loan amount based on profile
  isAmountTooHigh: boolean;         // Warning flag
  isRemainingIncomeTooLow: boolean; // Warning flag
}

// Simulation result
export interface SimulationResult {
  monthlyPayment: number;
  totalCost: number;
  totalInterest: number;
  effectiveRate: number;
  riskCategory: "A" | "B" | "C" | "D";
  approvalProbability: "high" | "medium" | "low";
  estimatedResponseTime: string;
  // New fields for transparency
  rawScore: number;                 // 0-100 score
  scoreFactors: ScoreFactor[];      // Breakdown of score
  financialAnalysis: FinancialAnalysis;
  warnings: string[];               // Any warnings for the user
  recommendations: string[];        // Suggestions to improve chances
}

// Step in the simulator flow
export type SimulatorStep =
  | "country"
  | "credit-type"
  | "amount-duration"
  | "specific-questions"
  | "results";

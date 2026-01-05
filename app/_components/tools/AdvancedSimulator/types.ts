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
  | "student"
  | "unemployed"
  | "retired";

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

// Micro-credit specific
export interface MicroCreditData extends BaseFormData {
  creditType: "micro-credit";
  employmentStatus: EmploymentStatus | null;
}

// Consumer credit specific
export interface ConsumerData extends BaseFormData {
  creditType: "consumer";
  employmentStatus: EmploymentStatus | null;
  loanPurpose: LoanPurpose | null;
}

// Professional credit specific
export interface ProfessionalData extends BaseFormData {
  creditType: "professional";
  businessType: BusinessType | null;
  sector: string | null;
  yearsInBusiness: number | null;
  annualRevenue: number | null;
  businessNeed: BusinessNeedType | null;
}

// Yes/No type for select fields
export type YesNo = "yes" | "no";

// Student loan specific
export interface StudentData extends BaseFormData {
  creditType: "student";
  institutionType: InstitutionType | null;
  fieldOfStudy: string | null;
  studyLevel: StudyLevel | null;
  hasPartTimeJob: boolean | null;
  partTimeIncome: number | null;
  hasGuarantor: YesNo | null;
}

// Salary advance specific
export interface SalaryAdvanceData extends BaseFormData {
  creditType: "salary-advance";
  contractType: "cdi" | "cdd" | null;
  netSalary: number | null;
  nextPayday: Date | null;
}

// Client type for leasing
export type ClientType = "individual" | "business";

// Leasing specific
export interface LeasingData extends BaseFormData {
  creditType: "leasing";
  assetType: AssetType | null;
  clientType: ClientType | null;
  yearsInBusiness?: number | null;
  employmentStatus?: EmploymentStatus | null;
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

// Simulation result
export interface SimulationResult {
  monthlyPayment: number;
  totalCost: number;
  totalInterest: number;
  effectiveRate: number;
  riskCategory: "A" | "B" | "C" | "D";
  approvalProbability: "high" | "medium" | "low";
  estimatedResponseTime: string;
}

// Step in the simulator flow
export type SimulatorStep =
  | "country"
  | "credit-type"
  | "amount-duration"
  | "specific-questions"
  | "results";

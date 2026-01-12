import { ProductFullConfig } from "../types";
import params from "../../parameters/products/micro-credit.json";

export const MICRO_CREDIT_CONFIG: ProductFullConfig = {
  id: "micro-credit",
  icon: params.icon,
  color: params.color,
  descriptionKey: "simulator.advanced.products.microcredit.description",

  questions: [
    // ============================================================
    // SECTION: IDENTITY
    // ============================================================
    {
      id: "age",
      type: "number",
      section: "identity",
      labelKey: "simulator.advanced.questions.age",
      subtitleKey: "simulator.advanced.questions.ageSubtitle",
      required: true,
      min: params.questions.age.min,
      max: params.questions.age.max,
      unit: "years",
    },
    {
      id: "maritalStatus",
      type: "select",
      section: "identity",
      labelKey: "simulator.advanced.microcredit.identity.maritalStatus",
      required: true,
      options: [
        { value: "single", labelKey: "simulator.advanced.consumer.maritalStatus.single", score: params.questions.maritalStatus.scores.single },
        { value: "married", labelKey: "simulator.advanced.consumer.maritalStatus.married", score: params.questions.maritalStatus.scores.married },
        { value: "pacs", labelKey: "simulator.advanced.consumer.maritalStatus.pacs", score: params.questions.maritalStatus.scores.pacs },
        { value: "divorced", labelKey: "simulator.advanced.consumer.maritalStatus.divorced", score: params.questions.maritalStatus.scores.divorced },
        { value: "widowed", labelKey: "simulator.advanced.consumer.maritalStatus.widowed", score: params.questions.maritalStatus.scores.widowed },
      ],
    },

    // ============================================================
    // SECTION: EMPLOYMENT
    // ============================================================
    {
      id: "employmentStatus",
      type: "select",
      section: "employment",
      labelKey: "simulator.advanced.microcredit.employment.title",
      subtitleKey: "simulator.advanced.microcredit.employment.subtitle",
      required: true,
      options: [
        { value: "tahtajatu", labelKey: "simulator.advanced.options.employmentStatus.tahtajatu", score: params.questions.employmentStatus.scores.tahtajatu },
        { value: "tahtajaline", labelKey: "simulator.advanced.options.employmentStatus.tahtajaline", score: params.questions.employmentStatus.scores.tahtajaline },
        { value: "fie", labelKey: "simulator.advanced.options.employmentStatus.fie", score: params.questions.employmentStatus.scores.fie },
        { value: "retired", labelKey: "simulator.advanced.options.employmentStatus.retired", score: params.questions.employmentStatus.scores.retired },
        { value: "student", labelKey: "simulator.advanced.options.employmentStatus.student", score: params.questions.employmentStatus.scores.student },
        { value: "unemployed", labelKey: "simulator.advanced.options.employmentStatus.unemployed", score: params.questions.employmentStatus.scores.unemployed },
      ],
    },
    {
      id: "employmentDuration",
      type: "select",
      section: "employment",
      labelKey: "simulator.advanced.employmentDuration.title",
      subtitleKey: "simulator.advanced.employmentDuration.subtitle",
      required: true,
      showIf: (formData) => {
        const status = (formData as unknown as Record<string, unknown>).employmentStatus;
        return status !== "student" && status !== "unemployed" && status !== "retired";
      },
      options: [
        { value: "more-than-2-years", labelKey: "simulator.advanced.employmentDuration.moreThan2Years", score: params.questions.employmentDuration.scores["more-than-2-years"] },
        { value: "1-to-2-years", labelKey: "simulator.advanced.employmentDuration.1to2Years", score: params.questions.employmentDuration.scores["1-to-2-years"] },
        { value: "6-months-to-1-year", labelKey: "simulator.advanced.employmentDuration.6monthsTo1Year", score: params.questions.employmentDuration.scores["6-months-to-1-year"] },
        { value: "less-than-6-months", labelKey: "simulator.advanced.employmentDuration.lessThan6Months", score: params.questions.employmentDuration.scores["less-than-6-months"] },
      ],
    },

    // ============================================================
    // SECTION: INCOME
    // ============================================================
    {
      id: "incomeType",
      type: "select",
      section: "income",
      labelKey: "simulator.advanced.microcredit.income.type",
      required: true,
      options: [
        { value: "salary", labelKey: "simulator.advanced.consumer.incomeType.salary", score: params.questions.incomeType.scores.salary },
        { value: "pension", labelKey: "simulator.advanced.consumer.incomeType.pension", score: params.questions.incomeType.scores.pension },
        { value: "business", labelKey: "simulator.advanced.consumer.incomeType.business", score: params.questions.incomeType.scores.business },
        { value: "rental", labelKey: "simulator.advanced.consumer.incomeType.rental", score: params.questions.incomeType.scores.rental },
        { value: "benefits", labelKey: "simulator.advanced.consumer.incomeType.benefits", score: params.questions.incomeType.scores.benefits },
        { value: "other", labelKey: "simulator.advanced.consumer.incomeType.other", score: params.questions.incomeType.scores.other },
      ],
    },
    {
      id: "monthlyIncome",
      type: "slider",
      section: "income",
      labelKey: "simulator.advanced.microcredit.income.monthly",
      subtitleKey: "simulator.advanced.microcredit.income.monthlySubtitle",
      required: true,
      min: params.questions.monthlyIncome.min,
      max: params.questions.monthlyIncome.max,
      step: params.questions.monthlyIncome.step,
      unit: "euros",
    },

    // ============================================================
    // SECTION: HOUSING
    // ============================================================
    {
      id: "housingStatus",
      type: "select",
      section: "housing",
      labelKey: "simulator.advanced.microcredit.housing.title",
      subtitleKey: "simulator.advanced.microcredit.housing.subtitle",
      required: true,
      options: [
        { value: "owner", labelKey: "simulator.advanced.housing.owner", score: params.questions.housingStatus.scores.owner },
        { value: "tenant", labelKey: "simulator.advanced.housing.tenant", score: params.questions.housingStatus.scores.tenant },
        { value: "hosted", labelKey: "simulator.advanced.housing.hosted", score: params.questions.housingStatus.scores.hosted },
        { value: "other", labelKey: "simulator.advanced.housing.other", score: params.questions.housingStatus.scores.other },
      ],
    },
    {
      id: "rentAmount",
      type: "slider",
      section: "housing",
      labelKey: "simulator.advanced.microcredit.housing.rent",
      required: true,
      showIf: (formData) => {
        const status = (formData as unknown as Record<string, unknown>).housingStatus;
        return status === "tenant";
      },
      min: params.questions.rentAmount.min,
      max: params.questions.rentAmount.max,
      step: params.questions.rentAmount.step,
      unit: "euros",
    },

    // ============================================================
    // SECTION: EXPENSES
    // ============================================================
    {
      id: "monthlyExpenses",
      type: "slider",
      section: "expenses",
      labelKey: "simulator.advanced.microcredit.expenses.monthly",
      subtitleKey: "simulator.advanced.microcredit.expenses.monthlySubtitle",
      required: true,
      min: params.questions.monthlyExpenses.min,
      max: params.questions.monthlyExpenses.max,
      step: params.questions.monthlyExpenses.step,
      unit: "euros",
    },
    {
      id: "existingLoans",
      type: "slider",
      section: "expenses",
      labelKey: "simulator.advanced.microcredit.expenses.existingLoans",
      subtitleKey: "simulator.advanced.microcredit.expenses.existingLoansSubtitle",
      required: true,
      min: params.questions.existingLoans.min,
      max: params.questions.existingLoans.max,
      step: params.questions.existingLoans.step,
      unit: "euros",
    },
    {
      id: "dependents",
      type: "number",
      section: "expenses",
      labelKey: "simulator.advanced.microcredit.expenses.dependents",
      subtitleKey: "simulator.advanced.microcredit.expenses.dependentsSubtitle",
      required: true,
      min: params.questions.dependents.min,
      max: params.questions.dependents.max,
    },

    // ============================================================
    // SECTION: BANKING
    // ============================================================
    {
      id: "creditHistory",
      type: "select",
      section: "banking",
      labelKey: "simulator.advanced.microcredit.banking.creditHistory",
      subtitleKey: "simulator.advanced.microcredit.banking.creditHistorySubtitle",
      required: true,
      options: [
        { value: "excellent", labelKey: "simulator.advanced.creditHistory.excellent", score: params.questions.creditHistory.scores.excellent },
        { value: "good", labelKey: "simulator.advanced.creditHistory.good", score: params.questions.creditHistory.scores.good },
        { value: "mixed", labelKey: "simulator.advanced.creditHistory.mixed", score: params.questions.creditHistory.scores.mixed },
        { value: "incidents", labelKey: "simulator.advanced.creditHistory.incidents", score: params.questions.creditHistory.scores.incidents },
      ],
    },
    {
      id: "hasRecentOverdrafts",
      type: "select",
      section: "banking",
      labelKey: "simulator.advanced.microcredit.banking.overdrafts",
      subtitleKey: "simulator.advanced.microcredit.banking.overdraftsSubtitle",
      required: true,
      options: [
        { value: "no", labelKey: "simulator.advanced.common.no", score: params.questions.hasRecentOverdrafts.scores.no },
        { value: "yes", labelKey: "simulator.advanced.common.yes", score: params.questions.hasRecentOverdrafts.scores.yes },
      ],
    },

    // ============================================================
    // SECTION: LOAN
    // ============================================================
    {
      id: "loanPurpose",
      type: "select",
      section: "loan",
      labelKey: "simulator.advanced.microcredit.loan.purpose",
      subtitleKey: "simulator.advanced.microcredit.loan.purposeSubtitle",
      required: true,
      options: [
        { value: "emergency", labelKey: "simulator.advanced.microcredit.loan.emergency", score: params.questions.loanPurpose.scores.emergency },
        { value: "bills", labelKey: "simulator.advanced.microcredit.loan.bills", score: params.questions.loanPurpose.scores.bills },
        { value: "medical", labelKey: "simulator.advanced.microcredit.loan.medical", score: params.questions.loanPurpose.scores.medical },
        { value: "repair", labelKey: "simulator.advanced.microcredit.loan.repair", score: params.questions.loanPurpose.scores.repair },
        { value: "other", labelKey: "simulator.advanced.microcredit.loan.other", score: params.questions.loanPurpose.scores.other },
      ],
    },

    // ============================================================
    // SECTION: INSURANCE
    // ============================================================
    {
      id: "wantsInsurance",
      type: "select",
      section: "insurance",
      labelKey: "simulator.advanced.microcredit.insurance.wants",
      subtitleKey: "simulator.advanced.microcredit.insurance.wantsSubtitle",
      required: true,
      options: [
        { value: "yes", labelKey: "simulator.advanced.common.yes", score: params.questions.wantsInsurance.scores.yes },
        { value: "no", labelKey: "simulator.advanced.common.no", score: params.questions.wantsInsurance.scores.no },
      ],
    },
  ],

  scoring: {
    baseScore: params.scoring.baseScore,
    factors: [
      {
        fieldId: "age",
        weight: params.scoring.weights.age,
        scoreFn: (value) => {
          const age = value as number;
          const ranges = params.scoring.ageRanges;
          if (age >= ranges.optimal.min && age <= ranges.optimal.max) return ranges.optimal.score;
          if (age >= ranges.good.min && age <= ranges.good.max) return ranges.good.score;
          if (age >= ranges.acceptable.min && age <= ranges.acceptable.max) return ranges.acceptable.score;
          if (age >= ranges.senior.min && age <= ranges.senior.max) return ranges.senior.score;
          return ranges.default;
        },
      },
      {
        fieldId: "maritalStatus",
        weight: params.scoring.weights.maritalStatus,
        scoreMap: params.questions.maritalStatus.scores,
      },
      {
        fieldId: "employmentStatus",
        weight: params.scoring.weights.employmentStatus,
        scoreMap: params.questions.employmentStatus.scores,
      },
      {
        fieldId: "employmentDuration",
        weight: params.scoring.weights.employmentDuration,
        scoreMap: params.questions.employmentDuration.scores,
      },
      {
        fieldId: "incomeType",
        weight: params.scoring.weights.incomeType,
        scoreMap: params.questions.incomeType.scores,
      },
      {
        fieldId: "housingStatus",
        weight: params.scoring.weights.housingStatus,
        scoreMap: params.questions.housingStatus.scores,
      },
      {
        fieldId: "creditHistory",
        weight: params.scoring.weights.creditHistory,
        scoreMap: params.questions.creditHistory.scores,
      },
      {
        fieldId: "hasRecentOverdrafts",
        weight: params.scoring.weights.hasRecentOverdrafts,
        scoreMap: params.questions.hasRecentOverdrafts.scores,
      },
      {
        fieldId: "loanPurpose",
        weight: params.scoring.weights.loanPurpose,
        scoreMap: params.questions.loanPurpose.scores,
      },
      {
        fieldId: "debtRatio",
        weight: params.scoring.weights.debtRatio,
        scoreFn: (_, formData) => {
          const data = formData as unknown as Record<string, unknown>;
          const income = (data.monthlyIncome as number) || 0;
          const expenses = (data.monthlyExpenses as number) || 0;
          const rentAmount = (data.rentAmount as number) || 0;
          const existingLoans = (data.existingLoans as number) || 0;
          const amount = formData.amount || 500;
          const duration = formData.duration || 6;

          const monthlyPayment = amount / duration;
          const totalMonthlyDebt = expenses + rentAmount + existingLoans + monthlyPayment;

          if (income <= 0) return params.scoring.debtRatioRanges.default;

          const ratio = totalMonthlyDebt / income;
          const ranges = params.scoring.debtRatioRanges;

          if (ratio <= ranges.excellent.maxRatio) return ranges.excellent.score;
          if (ratio <= ranges.good.maxRatio) return ranges.good.score;
          if (ratio <= ranges.acceptable.maxRatio) return ranges.acceptable.score;
          if (ratio <= ranges.risky.maxRatio) return ranges.risky.score;
          if (ratio <= ranges.veryRisky.maxRatio) return ranges.veryRisky.score;
          return ranges.default;
        },
      },
      {
        fieldId: "remainingIncome",
        weight: params.scoring.weights.remainingIncome,
        scoreFn: (_, formData) => {
          const data = formData as unknown as Record<string, unknown>;
          const income = (data.monthlyIncome as number) || 0;
          const expenses = (data.monthlyExpenses as number) || 0;
          const rentAmount = (data.rentAmount as number) || 0;
          const existingLoans = (data.existingLoans as number) || 0;
          const dependents = (data.dependents as number) || 0;
          const amount = formData.amount || 500;
          const duration = formData.duration || 6;

          const monthlyPayment = amount / duration;
          const totalCharges = expenses + rentAmount + existingLoans + monthlyPayment;
          const remainingIncome = income - totalCharges;
          const householdSize = 1 + dependents;
          const remainingPerPerson = householdSize > 0 ? remainingIncome / householdSize : 0;

          const ranges = params.scoring.remainingIncomeRanges;

          if (remainingPerPerson >= ranges.excellent.minPerPerson) return ranges.excellent.score;
          if (remainingPerPerson >= ranges.good.minPerPerson) return ranges.good.score;
          if (remainingPerPerson >= ranges.acceptable.minPerPerson) return ranges.acceptable.score;
          if (remainingPerPerson >= ranges.tight.minPerPerson) return ranges.tight.score;
          if (remainingPerPerson >= ranges.veryTight.minPerPerson) return ranges.veryTight.score;
          return ranges.default;
        },
      },
    ],
    thresholds: params.scoring.thresholds,
  },

  calculation: {
    interestMethod: params.calculation.interestMethod as "compound" | "flat" | "degressive",
    baseRate: params.calculation.baseRate,
    minRate: params.calculation.minRate,
    maxRate: params.calculation.maxRate,
    rateAdjustments: params.calculation.rateAdjustments,
    fees: params.calculation.fees,
  },

  responseTime: {
    default: params.responseTime.default,
    conditions: [
      {
        check: (formData, riskCategory) => {
          const amount = formData.amount || 0;
          const conditions = params.responseTime.fastTrackConditions;
          const categoryOrder = ["A", "B", "C", "D"];
          const minCategoryIndex = categoryOrder.indexOf(conditions.minCategory);
          const currentCategoryIndex = categoryOrder.indexOf(riskCategory);
          return amount <= conditions.maxAmount && currentCategoryIndex <= minCategoryIndex;
        },
        time: params.responseTime.fastTrack,
      },
    ],
  },

  approvalProbability: params.approvalProbability as Record<"A" | "B" | "C" | "D", "high" | "medium" | "low">,
};

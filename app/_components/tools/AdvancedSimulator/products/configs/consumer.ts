import { ProductFullConfig } from "../types";
import params from "../../parameters/products/consumer.json";

export const CONSUMER_CONFIG: ProductFullConfig = {
  id: "consumer",
  icon: params.icon,
  color: params.color,
  descriptionKey: "simulator.advanced.products.consumer.description",

  questions: [
    // ============================================================
    // SECTION 1: IDENTITÉ & SITUATION FAMILIALE
    // ============================================================
    {
      id: "age",
      type: "number",
      labelKey: "simulator.advanced.questions.age",
      subtitleKey: "simulator.advanced.questions.ageSubtitle",
      required: true,
      min: params.questions.age.min,
      max: params.questions.age.max,
      unit: "years",
      section: "identity",
    },
    {
      id: "maritalStatus",
      type: "select",
      labelKey: "simulator.advanced.consumer.maritalStatus.title",
      subtitleKey: "simulator.advanced.consumer.maritalStatus.subtitle",
      required: true,
      section: "identity",
      options: [
        { value: "single", labelKey: "simulator.advanced.consumer.maritalStatus.single", score: params.questions.maritalStatus.scores.single },
        { value: "married", labelKey: "simulator.advanced.consumer.maritalStatus.married", score: params.questions.maritalStatus.scores.married },
        { value: "pacs", labelKey: "simulator.advanced.consumer.maritalStatus.pacs", score: params.questions.maritalStatus.scores.pacs },
        { value: "divorced", labelKey: "simulator.advanced.consumer.maritalStatus.divorced", score: params.questions.maritalStatus.scores.divorced },
        { value: "widowed", labelKey: "simulator.advanced.consumer.maritalStatus.widowed", score: params.questions.maritalStatus.scores.widowed },
      ],
    },
    {
      id: "dependents",
      type: "number",
      labelKey: "simulator.advanced.dependents.title",
      subtitleKey: "simulator.advanced.dependents.subtitle",
      required: true,
      min: params.questions.dependents.min,
      max: params.questions.dependents.max,
      section: "identity",
    },

    // ============================================================
    // SECTION 2: EMPLOI & SITUATION PROFESSIONNELLE
    // ============================================================
    {
      id: "employmentStatus",
      type: "select",
      labelKey: "simulator.advanced.employment.title",
      subtitleKey: "simulator.advanced.employment.subtitle",
      required: true,
      section: "employment",
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
      labelKey: "simulator.advanced.employmentDuration.title",
      subtitleKey: "simulator.advanced.employmentDuration.subtitle",
      required: true,
      section: "employment",
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
    // SECTION 3: REVENUS
    // ============================================================
    {
      id: "incomeType",
      type: "select",
      labelKey: "simulator.advanced.consumer.incomeType.title",
      subtitleKey: "simulator.advanced.consumer.incomeType.subtitle",
      required: true,
      section: "income",
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
      labelKey: "simulator.advanced.income.title",
      subtitleKey: "simulator.advanced.income.subtitle",
      required: true,
      min: params.questions.monthlyIncome.min,
      max: params.questions.monthlyIncome.max,
      step: params.questions.monthlyIncome.step,
      unit: "euros",
      section: "income",
    },
    {
      id: "spouseIncome",
      type: "slider",
      labelKey: "simulator.advanced.consumer.spouseIncome.title",
      subtitleKey: "simulator.advanced.consumer.spouseIncome.subtitle",
      required: false,
      min: params.questions.spouseIncome.min,
      max: params.questions.spouseIncome.max,
      step: params.questions.spouseIncome.step,
      unit: "euros",
      section: "income",
      showIf: (formData) => {
        const status = (formData as unknown as Record<string, unknown>).maritalStatus;
        return status === "married" || status === "pacs";
      },
    },
    {
      id: "otherIncome",
      type: "slider",
      labelKey: "simulator.advanced.consumer.otherIncome.title",
      subtitleKey: "simulator.advanced.consumer.otherIncome.subtitle",
      required: false,
      min: params.questions.otherIncome.min,
      max: params.questions.otherIncome.max,
      step: params.questions.otherIncome.step,
      unit: "euros",
      section: "income",
    },

    // ============================================================
    // SECTION 4: LOGEMENT
    // ============================================================
    {
      id: "housingStatus",
      type: "select",
      labelKey: "simulator.advanced.housing.title",
      subtitleKey: "simulator.advanced.housing.subtitle",
      required: true,
      section: "housing",
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
      labelKey: "simulator.advanced.consumer.rentAmount.title",
      subtitleKey: "simulator.advanced.consumer.rentAmount.subtitle",
      required: true,
      min: params.questions.rentAmount.min,
      max: params.questions.rentAmount.max,
      step: params.questions.rentAmount.step,
      unit: "euros",
      section: "housing",
      showIf: (formData) => {
        const status = (formData as unknown as Record<string, unknown>).housingStatus;
        return status === "tenant";
      },
    },

    // ============================================================
    // SECTION 5: CHARGES DU FOYER
    // ============================================================
    {
      id: "monthlyExpenses",
      type: "slider",
      labelKey: "simulator.advanced.expenses.title",
      subtitleKey: "simulator.advanced.expenses.subtitle",
      required: true,
      min: params.questions.monthlyExpenses.min,
      max: params.questions.monthlyExpenses.max,
      step: params.questions.monthlyExpenses.step,
      unit: "euros",
      section: "expenses",
    },
    {
      id: "existingLoans",
      type: "slider",
      labelKey: "simulator.advanced.existingLoans.title",
      subtitleKey: "simulator.advanced.existingLoans.subtitle",
      required: true,
      min: params.questions.existingLoans.min,
      max: params.questions.existingLoans.max,
      step: params.questions.existingLoans.step,
      unit: "euros",
      section: "expenses",
    },

    // ============================================================
    // SECTION 6: SITUATION BANCAIRE
    // ============================================================
    {
      id: "creditHistory",
      type: "select",
      labelKey: "simulator.advanced.creditHistory.title",
      subtitleKey: "simulator.advanced.creditHistory.subtitle",
      required: true,
      section: "banking",
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
      labelKey: "simulator.advanced.consumer.overdrafts.title",
      subtitleKey: "simulator.advanced.consumer.overdrafts.subtitle",
      required: true,
      section: "banking",
      options: [
        { value: "no", labelKey: "simulator.advanced.no", score: params.questions.hasRecentOverdrafts.scores.no },
        { value: "yes", labelKey: "simulator.advanced.yes", score: params.questions.hasRecentOverdrafts.scores.yes },
      ],
    },
    {
      id: "savingsAmount",
      type: "slider",
      labelKey: "simulator.advanced.consumer.savings.title",
      subtitleKey: "simulator.advanced.consumer.savings.subtitle",
      required: false,
      min: params.questions.savingsAmount.min,
      max: params.questions.savingsAmount.max,
      step: params.questions.savingsAmount.step,
      unit: "euros",
      section: "banking",
    },

    // ============================================================
    // SECTION 7: CO-EMPRUNTEUR
    // ============================================================
    {
      id: "hasCoBorrower",
      type: "select",
      labelKey: "simulator.advanced.consumer.coBorrower.title",
      subtitleKey: "simulator.advanced.consumer.coBorrower.subtitle",
      required: true,
      section: "coBorrower",
      options: [
        { value: "no", labelKey: "simulator.advanced.consumer.coBorrower.no", score: params.questions.hasCoBorrower.scores.no },
        { value: "yes", labelKey: "simulator.advanced.consumer.coBorrower.yes", score: params.questions.hasCoBorrower.scores.yes },
      ],
    },
    {
      id: "coBorrowerIncome",
      type: "slider",
      labelKey: "simulator.advanced.consumer.coBorrowerIncome.title",
      subtitleKey: "simulator.advanced.consumer.coBorrowerIncome.subtitle",
      required: true,
      min: params.questions.coBorrowerIncome.min,
      max: params.questions.coBorrowerIncome.max,
      step: params.questions.coBorrowerIncome.step,
      unit: "euros",
      section: "coBorrower",
      showIf: (formData) => {
        const hasCo = (formData as unknown as Record<string, unknown>).hasCoBorrower;
        return hasCo === "yes";
      },
    },

    // ============================================================
    // SECTION 8: PROJET DE CRÉDIT
    // ============================================================
    {
      id: "loanPurpose",
      type: "select",
      labelKey: "simulator.advanced.consumer.purposeTitle",
      required: true,
      section: "loan",
      options: [
        { value: "auto", labelKey: "simulator.advanced.options.loanPurpose.auto", score: params.questions.loanPurpose.scores.auto },
        { value: "homeImprovement", labelKey: "simulator.advanced.options.loanPurpose.homeImprovement", score: params.questions.loanPurpose.scores.homeImprovement },
        { value: "equipment", labelKey: "simulator.advanced.options.loanPurpose.equipment", score: params.questions.loanPurpose.scores.equipment },
        { value: "event", labelKey: "simulator.advanced.options.loanPurpose.event", score: params.questions.loanPurpose.scores.event },
        { value: "travel", labelKey: "simulator.advanced.options.loanPurpose.travel", score: params.questions.loanPurpose.scores.travel },
        { value: "other", labelKey: "simulator.advanced.options.loanPurpose.other", score: params.questions.loanPurpose.scores.other },
      ],
    },

    // ============================================================
    // SECTION 9: ASSURANCE
    // ============================================================
    {
      id: "wantsInsurance",
      type: "select",
      labelKey: "simulator.advanced.consumer.insurance.title",
      subtitleKey: "simulator.advanced.consumer.insurance.subtitle",
      required: false,
      section: "insurance",
      options: [
        { value: "yes", labelKey: "simulator.advanced.consumer.insurance.yes", score: params.questions.wantsInsurance.scores.yes },
        { value: "no", labelKey: "simulator.advanced.consumer.insurance.no", score: params.questions.wantsInsurance.scores.no },
      ],
    },
  ],

  scoring: {
    baseScore: params.scoring.baseScore,
    factors: [
      // Age
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
      // Marital Status
      {
        fieldId: "maritalStatus",
        weight: params.scoring.weights.maritalStatus,
        scoreMap: params.questions.maritalStatus.scores,
      },
      // Employment
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
      // Income Type
      {
        fieldId: "incomeType",
        weight: params.scoring.weights.incomeType,
        scoreMap: params.questions.incomeType.scores,
      },
      // Housing
      {
        fieldId: "housingStatus",
        weight: params.scoring.weights.housingStatus,
        scoreMap: params.questions.housingStatus.scores,
      },
      // Banking
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
      // Co-borrower
      {
        fieldId: "hasCoBorrower",
        weight: params.scoring.weights.hasCoBorrower,
        scoreMap: params.questions.hasCoBorrower.scores,
      },
      // Loan purpose
      {
        fieldId: "loanPurpose",
        weight: params.scoring.weights.loanPurpose,
        scoreMap: params.questions.loanPurpose.scores,
      },
      // Debt ratio (calculated)
      {
        fieldId: "debtRatio",
        weight: params.scoring.weights.debtRatio,
        scoreFn: (_, formData) => {
          const data = formData as unknown as Record<string, unknown>;
          // Total income = main + spouse + other + co-borrower
          const mainIncome = (data.monthlyIncome as number) || 0;
          const spouseIncome = (data.spouseIncome as number) || 0;
          const otherIncome = (data.otherIncome as number) || 0;
          const coBorrowerIncome = data.hasCoBorrower === "yes" ? ((data.coBorrowerIncome as number) || 0) : 0;
          const totalIncome = mainIncome + spouseIncome + otherIncome + coBorrowerIncome;

          // Total charges = expenses + rent (if tenant) + existing loans + new payment
          const expenses = (data.monthlyExpenses as number) || 0;
          const rentAmount = data.housingStatus === "tenant" ? ((data.rentAmount as number) || 0) : 0;
          const existingLoans = (data.existingLoans as number) || 0;
          const amount = formData.amount || 1000;
          const duration = formData.duration || 12;
          const monthlyPayment = amount / duration;

          const totalCharges = expenses + rentAmount + existingLoans + monthlyPayment;

          if (totalIncome <= 0) return params.scoring.debtRatioRanges.default;

          const ratio = totalCharges / totalIncome;
          const ranges = params.scoring.debtRatioRanges;

          if (ratio <= ranges.excellent.maxRatio) return ranges.excellent.score;
          if (ratio <= ranges.good.maxRatio) return ranges.good.score;
          if (ratio <= ranges.acceptable.maxRatio) return ranges.acceptable.score;
          if (ratio <= ranges.risky.maxRatio) return ranges.risky.score;
          if (ratio <= ranges.veryRisky.maxRatio) return ranges.veryRisky.score;
          return ranges.default;
        },
      },
      // Remaining income (calculated)
      {
        fieldId: "remainingIncome",
        weight: params.scoring.weights.remainingIncome,
        scoreFn: (_, formData) => {
          const data = formData as unknown as Record<string, unknown>;
          // Total income
          const mainIncome = (data.monthlyIncome as number) || 0;
          const spouseIncome = (data.spouseIncome as number) || 0;
          const otherIncome = (data.otherIncome as number) || 0;
          const coBorrowerIncome = data.hasCoBorrower === "yes" ? ((data.coBorrowerIncome as number) || 0) : 0;
          const totalIncome = mainIncome + spouseIncome + otherIncome + coBorrowerIncome;

          // Total charges
          const expenses = (data.monthlyExpenses as number) || 0;
          const rentAmount = data.housingStatus === "tenant" ? ((data.rentAmount as number) || 0) : 0;
          const existingLoans = (data.existingLoans as number) || 0;
          const amount = formData.amount || 1000;
          const duration = formData.duration || 12;
          const monthlyPayment = amount / duration;

          const totalCharges = expenses + rentAmount + existingLoans + monthlyPayment;
          const remainingIncome = totalIncome - totalCharges;

          // Household size
          const dependents = (data.dependents as number) || 0;
          const householdSize = 1 + dependents + (data.hasCoBorrower === "yes" ? 1 : 0);
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
      // Savings ratio (calculated)
      {
        fieldId: "savingsRatio",
        weight: params.scoring.weights.savingsRatio,
        scoreFn: (_, formData) => {
          const data = formData as unknown as Record<string, unknown>;
          const savings = (data.savingsAmount as number) || 0;
          const amount = formData.amount || 1000;

          if (amount <= 0) return params.scoring.savingsRatioRanges.default;

          const ratio = savings / amount;
          const ranges = params.scoring.savingsRatioRanges;

          if (ratio >= ranges.excellent.minRatio) return ranges.excellent.score;
          if (ratio >= ranges.good.minRatio) return ranges.good.score;
          if (ratio >= ranges.acceptable.minRatio) return ranges.acceptable.score;
          if (ratio >= ranges.low.minRatio) return ranges.low.score;
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
          const data = formData as unknown as Record<string, unknown>;
          return (
            (riskCategory === "A" || riskCategory === "B") &&
            (formData.amount || 0) <= params.responseTime.fastTrackConditions.maxAmount &&
            data.hasCoBorrower !== "yes"
          );
        },
        time: params.responseTime.fastTrack,
      },
    ],
  },

  approvalProbability: params.approvalProbability as Record<"A" | "B" | "C" | "D", "high" | "medium" | "low">,
};

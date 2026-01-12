import { ProductFullConfig } from "../types";
import params from "../../parameters/products/professional.json";

export const PROFESSIONAL_CONFIG: ProductFullConfig = {
  id: "professional",
  icon: params.icon,
  color: params.color,
  descriptionKey: "simulator.advanced.products.professional.description",

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

    // ============================================================
    // SECTION: BUSINESS
    // ============================================================
    {
      id: "businessType",
      type: "select",
      section: "business",
      labelKey: "simulator.advanced.professional.business.type",
      subtitleKey: "simulator.advanced.professional.business.typeSubtitle",
      required: true,
      options: [
        { value: "fie", labelKey: "simulator.advanced.options.businessType.fie", score: params.questions.businessType.scores.fie },
        { value: "oue", labelKey: "simulator.advanced.options.businessType.oue", score: params.questions.businessType.scores.oue },
        { value: "as", labelKey: "simulator.advanced.options.businessType.as", score: params.questions.businessType.scores.as },
        { value: "startup", labelKey: "simulator.advanced.options.businessType.startup", score: params.questions.businessType.scores.startup },
      ],
    },
    {
      id: "sector",
      type: "select",
      section: "business",
      labelKey: "simulator.advanced.professional.business.sector",
      subtitleKey: "simulator.advanced.professional.business.sectorSubtitle",
      required: true,
      options: [
        { value: "tech", labelKey: "simulator.advanced.professional.sectors.tech", score: params.questions.sector.scores.tech },
        { value: "health", labelKey: "simulator.advanced.professional.sectors.health", score: params.questions.sector.scores.health },
        { value: "services", labelKey: "simulator.advanced.professional.sectors.services", score: params.questions.sector.scores.services },
        { value: "commerce", labelKey: "simulator.advanced.professional.sectors.commerce", score: params.questions.sector.scores.commerce },
        { value: "construction", labelKey: "simulator.advanced.professional.sectors.construction", score: params.questions.sector.scores.construction },
        { value: "industry", labelKey: "simulator.advanced.professional.sectors.industry", score: params.questions.sector.scores.industry },
        { value: "food", labelKey: "simulator.advanced.professional.sectors.food", score: params.questions.sector.scores.food },
        { value: "transport", labelKey: "simulator.advanced.professional.sectors.transport", score: params.questions.sector.scores.transport },
        { value: "other", labelKey: "simulator.advanced.professional.sectors.other", score: params.questions.sector.scores.other },
      ],
    },
    {
      id: "yearsInBusiness",
      type: "number",
      section: "business",
      labelKey: "simulator.advanced.professional.business.years",
      subtitleKey: "simulator.advanced.professional.business.yearsSubtitle",
      required: true,
      min: params.questions.yearsInBusiness.min,
      max: params.questions.yearsInBusiness.max,
      unit: "years",
    },
    {
      id: "employees",
      type: "number",
      section: "business",
      labelKey: "simulator.advanced.professional.business.employees",
      subtitleKey: "simulator.advanced.professional.business.employeesSubtitle",
      required: true,
      min: params.questions.employees.min,
      max: params.questions.employees.max,
    },

    // ============================================================
    // SECTION: INCOME (Business Financials)
    // ============================================================
    {
      id: "annualRevenue",
      type: "slider",
      section: "income",
      labelKey: "simulator.advanced.professional.financials.revenue",
      subtitleKey: "simulator.advanced.professional.financials.revenueSubtitle",
      required: true,
      min: params.questions.annualRevenue.min,
      max: params.questions.annualRevenue.max,
      step: params.questions.annualRevenue.step,
      unit: "euros",
    },
    {
      id: "monthlyProfit",
      type: "slider",
      section: "income",
      labelKey: "simulator.advanced.professional.financials.profit",
      subtitleKey: "simulator.advanced.professional.financials.profitSubtitle",
      required: true,
      min: params.questions.monthlyProfit.min,
      max: params.questions.monthlyProfit.max,
      step: params.questions.monthlyProfit.step,
      unit: "euros",
    },
    {
      id: "existingBusinessLoans",
      type: "slider",
      section: "income",
      labelKey: "simulator.advanced.professional.financials.existingLoans",
      subtitleKey: "simulator.advanced.professional.financials.existingLoansSubtitle",
      required: true,
      min: params.questions.existingBusinessLoans.min,
      max: params.questions.existingBusinessLoans.max,
      step: params.questions.existingBusinessLoans.step,
      unit: "euros",
    },

    // ============================================================
    // SECTION: BANKING
    // ============================================================
    {
      id: "creditHistory",
      type: "select",
      section: "banking",
      labelKey: "simulator.advanced.professional.banking.creditHistory",
      subtitleKey: "simulator.advanced.professional.banking.creditHistorySubtitle",
      required: true,
      options: [
        { value: "excellent", labelKey: "simulator.advanced.creditHistory.excellent", score: params.questions.creditHistory.scores.excellent },
        { value: "good", labelKey: "simulator.advanced.creditHistory.good", score: params.questions.creditHistory.scores.good },
        { value: "mixed", labelKey: "simulator.advanced.creditHistory.mixed", score: params.questions.creditHistory.scores.mixed },
        { value: "incidents", labelKey: "simulator.advanced.creditHistory.incidents", score: params.questions.creditHistory.scores.incidents },
      ],
    },
    {
      id: "hasBusinessAccount",
      type: "select",
      section: "banking",
      labelKey: "simulator.advanced.professional.banking.businessAccount",
      subtitleKey: "simulator.advanced.professional.banking.businessAccountSubtitle",
      required: true,
      options: [
        { value: "yes", labelKey: "simulator.advanced.common.yes", score: params.questions.hasBusinessAccount.scores.yes },
        { value: "no", labelKey: "simulator.advanced.common.no", score: params.questions.hasBusinessAccount.scores.no },
      ],
    },

    // ============================================================
    // SECTION: LOAN
    // ============================================================
    {
      id: "businessNeed",
      type: "select",
      section: "loan",
      labelKey: "simulator.advanced.professional.loan.purpose",
      subtitleKey: "simulator.advanced.professional.loan.purposeSubtitle",
      required: true,
      options: [
        { value: "treasury", labelKey: "simulator.advanced.professional.loan.treasury", descriptionKey: "simulator.advanced.professional.loan.treasuryDesc", score: params.questions.businessNeed.scores.treasury },
        { value: "investment", labelKey: "simulator.advanced.professional.loan.investment", descriptionKey: "simulator.advanced.professional.loan.investmentDesc", score: params.questions.businessNeed.scores.investment },
        { value: "equipment", labelKey: "simulator.advanced.professional.loan.equipment", descriptionKey: "simulator.advanced.professional.loan.equipmentDesc", score: params.questions.businessNeed.scores.equipment },
        { value: "stock", labelKey: "simulator.advanced.professional.loan.stock", descriptionKey: "simulator.advanced.professional.loan.stockDesc", score: params.questions.businessNeed.scores.stock },
        { value: "expansion", labelKey: "simulator.advanced.professional.loan.expansion", descriptionKey: "simulator.advanced.professional.loan.expansionDesc", score: params.questions.businessNeed.scores.expansion },
        { value: "other", labelKey: "simulator.advanced.professional.loan.other", score: params.questions.businessNeed.scores.other },
      ],
    },

    // ============================================================
    // SECTION: INSURANCE
    // ============================================================
    {
      id: "wantsInsurance",
      type: "select",
      section: "insurance",
      labelKey: "simulator.advanced.professional.insurance.wants",
      subtitleKey: "simulator.advanced.professional.insurance.wantsSubtitle",
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
          return ranges.default;
        },
      },
      {
        fieldId: "businessType",
        weight: params.scoring.weights.businessType,
        scoreMap: params.questions.businessType.scores,
      },
      {
        fieldId: "sector",
        weight: params.scoring.weights.sector,
        scoreMap: params.questions.sector.scores,
      },
      {
        fieldId: "yearsInBusiness",
        weight: params.scoring.weights.yearsInBusiness,
        scoreFn: (value) => {
          const years = value as number;
          const ranges = params.scoring.yearsInBusinessRanges;
          if (years >= ranges.excellent.min) return ranges.excellent.score;
          if (years >= ranges.good.min) return ranges.good.score;
          if (years >= ranges.acceptable.min) return ranges.acceptable.score;
          if (years >= ranges.new.min) return ranges.new.score;
          return ranges.default;
        },
      },
      {
        fieldId: "employees",
        weight: params.scoring.weights.employees,
        scoreFn: (value) => {
          const employees = value as number;
          const ranges = params.scoring.employeesRanges;
          if (employees >= ranges.medium.min) return ranges.medium.score;
          if (employees >= ranges.small.min) return ranges.small.score;
          if (employees >= ranges.micro.min) return ranges.micro.score;
          return ranges.solo.score;
        },
      },
      {
        fieldId: "revenueRatio",
        weight: params.scoring.weights.revenueRatio,
        scoreFn: (_, formData) => {
          const data = formData as unknown as Record<string, unknown>;
          const revenue = (data.annualRevenue as number) || 0;
          const amount = formData.amount || 1000;

          if (revenue <= 0) return params.scoring.revenueRatioRanges.default;

          const ratio = amount / revenue;
          const ranges = params.scoring.revenueRatioRanges;

          if (ratio <= ranges.excellent.maxRatio) return ranges.excellent.score;
          if (ratio <= ranges.good.maxRatio) return ranges.good.score;
          if (ratio <= ranges.acceptable.maxRatio) return ranges.acceptable.score;
          if (ratio <= ranges.risky.maxRatio) return ranges.risky.score;
          return ranges.default;
        },
      },
      {
        fieldId: "profitMargin",
        weight: params.scoring.weights.profitMargin,
        scoreFn: (_, formData) => {
          const data = formData as unknown as Record<string, unknown>;
          const revenue = (data.annualRevenue as number) || 0;
          const monthlyProfit = (data.monthlyProfit as number) || 0;
          const annualProfit = monthlyProfit * 12;

          if (revenue <= 0) return params.scoring.profitMarginRanges.default;

          const margin = annualProfit / revenue;
          const ranges = params.scoring.profitMarginRanges;

          if (margin >= ranges.excellent.minMargin) return ranges.excellent.score;
          if (margin >= ranges.good.minMargin) return ranges.good.score;
          if (margin >= ranges.acceptable.minMargin) return ranges.acceptable.score;
          if (margin >= ranges.tight.minMargin) return ranges.tight.score;
          return ranges.default;
        },
      },
      {
        fieldId: "creditHistory",
        weight: params.scoring.weights.creditHistory,
        scoreMap: params.questions.creditHistory.scores,
      },
      {
        fieldId: "hasBusinessAccount",
        weight: params.scoring.weights.hasBusinessAccount,
        scoreMap: params.questions.hasBusinessAccount.scores,
      },
      {
        fieldId: "businessNeed",
        weight: params.scoring.weights.businessNeed,
        scoreMap: params.questions.businessNeed.scores,
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
          const years = (data.yearsInBusiness as number) || 0;
          const conditions = params.responseTime.fastTrackConditions;
          const categoryOrder = ["A", "B", "C", "D"];
          const minCategoryIndex = categoryOrder.indexOf(conditions.minCategory);
          const currentCategoryIndex = categoryOrder.indexOf(riskCategory);
          return years >= conditions.minYears && currentCategoryIndex <= minCategoryIndex;
        },
        time: params.responseTime.fastTrack,
      },
    ],
  },

  approvalProbability: params.approvalProbability as Record<"A" | "B" | "C" | "D", "high" | "medium" | "low">,
};

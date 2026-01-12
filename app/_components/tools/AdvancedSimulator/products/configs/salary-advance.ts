import { ProductFullConfig } from "../types";
import params from "../../parameters/products/salary-advance.json";

export const SALARY_ADVANCE_CONFIG: ProductFullConfig = {
  id: "salary-advance",
  icon: params.icon,
  color: params.color,
  descriptionKey: "simulator.advanced.products.salaryadvance.description",

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
    // SECTION: EMPLOYMENT
    // ============================================================
    {
      id: "contractType",
      type: "select",
      section: "employment",
      labelKey: "simulator.advanced.salaryAdvance.employment.contract",
      subtitleKey: "simulator.advanced.salaryAdvance.employment.contractSubtitle",
      required: true,
      options: [
        { value: "tahtajatu", labelKey: "simulator.advanced.options.contractType.tahtajatu", score: params.questions.contractType.scores.tahtajatu },
        { value: "tahtajaline", labelKey: "simulator.advanced.options.contractType.tahtajaline", score: params.questions.contractType.scores.tahtajaline },
      ],
    },
    {
      id: "employmentDuration",
      type: "select",
      section: "employment",
      labelKey: "simulator.advanced.salaryAdvance.employment.duration",
      subtitleKey: "simulator.advanced.salaryAdvance.employment.durationSubtitle",
      required: true,
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
      id: "netSalary",
      type: "slider",
      section: "income",
      labelKey: "simulator.advanced.salaryAdvance.income.salary",
      subtitleKey: "simulator.advanced.salaryAdvance.income.salarySubtitle",
      required: true,
      min: params.questions.netSalary.min,
      max: params.questions.netSalary.max,
      step: params.questions.netSalary.step,
      unit: "euros",
    },
    {
      id: "nextPayday",
      type: "date",
      section: "income",
      labelKey: "simulator.advanced.salaryAdvance.income.nextPayday",
      subtitleKey: "simulator.advanced.salaryAdvance.income.nextPaydaySubtitle",
      required: true,
    },
    {
      id: "paydayFrequency",
      type: "select",
      section: "income",
      labelKey: "simulator.advanced.salaryAdvance.income.frequency",
      subtitleKey: "simulator.advanced.salaryAdvance.income.frequencySubtitle",
      required: true,
      options: [
        { value: "monthly", labelKey: "simulator.advanced.salaryAdvance.income.monthly", score: params.questions.paydayFrequency.scores.monthly },
        { value: "biweekly", labelKey: "simulator.advanced.salaryAdvance.income.biweekly", score: params.questions.paydayFrequency.scores.biweekly },
        { value: "weekly", labelKey: "simulator.advanced.salaryAdvance.income.weekly", score: params.questions.paydayFrequency.scores.weekly },
      ],
    },

    // ============================================================
    // SECTION: BANKING
    // ============================================================
    {
      id: "hasDirectDeposit",
      type: "select",
      section: "banking",
      labelKey: "simulator.advanced.salaryAdvance.banking.directDeposit",
      subtitleKey: "simulator.advanced.salaryAdvance.banking.directDepositSubtitle",
      required: true,
      options: [
        { value: "yes", labelKey: "simulator.advanced.common.yes", score: params.questions.hasDirectDeposit.scores.yes },
        { value: "no", labelKey: "simulator.advanced.common.no", score: params.questions.hasDirectDeposit.scores.no },
      ],
    },
    {
      id: "hasRecentOverdrafts",
      type: "select",
      section: "banking",
      labelKey: "simulator.advanced.salaryAdvance.banking.overdrafts",
      subtitleKey: "simulator.advanced.salaryAdvance.banking.overdraftsSubtitle",
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
      id: "advancePurpose",
      type: "select",
      section: "loan",
      labelKey: "simulator.advanced.salaryAdvance.loan.purpose",
      subtitleKey: "simulator.advanced.salaryAdvance.loan.purposeSubtitle",
      required: true,
      options: [
        { value: "bills", labelKey: "simulator.advanced.salaryAdvance.loan.bills", score: params.questions.advancePurpose.scores.bills },
        { value: "emergency", labelKey: "simulator.advanced.salaryAdvance.loan.emergency", score: params.questions.advancePurpose.scores.emergency },
        { value: "medical", labelKey: "simulator.advanced.salaryAdvance.loan.medical", score: params.questions.advancePurpose.scores.medical },
        { value: "other", labelKey: "simulator.advanced.salaryAdvance.loan.other", score: params.questions.advancePurpose.scores.other },
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
          if (age >= ranges.senior.min && age <= ranges.senior.max) return ranges.senior.score;
          return ranges.default;
        },
      },
      {
        fieldId: "contractType",
        weight: params.scoring.weights.contractType,
        scoreMap: params.questions.contractType.scores,
      },
      {
        fieldId: "employmentDuration",
        weight: params.scoring.weights.employmentDuration,
        scoreMap: params.questions.employmentDuration.scores,
      },
      {
        fieldId: "salaryRatio",
        weight: params.scoring.weights.salaryRatio,
        scoreFn: (_, formData) => {
          const data = formData as unknown as Record<string, unknown>;
          const salary = (data.netSalary as number) || 0;
          const amount = formData.amount || 500;

          if (salary <= 0) return params.scoring.salaryRatioRanges.default;

          const ratio = amount / salary;
          const ranges = params.scoring.salaryRatioRanges;

          if (ratio <= ranges.excellent.maxRatio) return ranges.excellent.score;
          if (ratio <= ranges.good.maxRatio) return ranges.good.score;
          if (ratio <= ranges.acceptable.maxRatio) return ranges.acceptable.score;
          if (ratio <= ranges.risky.maxRatio) return ranges.risky.score;
          return ranges.default;
        },
      },
      {
        fieldId: "paydayFrequency",
        weight: params.scoring.weights.paydayFrequency,
        scoreMap: params.questions.paydayFrequency.scores,
      },
      {
        fieldId: "hasDirectDeposit",
        weight: params.scoring.weights.hasDirectDeposit,
        scoreMap: params.questions.hasDirectDeposit.scores,
      },
      {
        fieldId: "hasRecentOverdrafts",
        weight: params.scoring.weights.hasRecentOverdrafts,
        scoreMap: params.questions.hasRecentOverdrafts.scores,
      },
      {
        fieldId: "advancePurpose",
        weight: params.scoring.weights.advancePurpose,
        scoreMap: params.questions.advancePurpose.scores,
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
    customCalculate: (amount, duration, rate) => {
      const feePercent = rate / 100;
      const totalFee = amount * feePercent;
      const totalCost = amount + totalFee;
      const monthlyPayment = totalCost / duration;
      return {
        monthlyPayment,
        totalCost,
        totalInterest: totalFee,
      };
    },
    fees: params.calculation.fees,
  },

  responseTime: {
    default: params.responseTime.default,
    conditions: [
      {
        check: (formData, riskCategory) => {
          const data = formData as unknown as Record<string, unknown>;
          const hasDirectDeposit = data.hasDirectDeposit === "yes";
          const conditions = params.responseTime.fastTrackConditions;
          const categoryOrder = ["A", "B", "C", "D"];
          const minCategoryIndex = categoryOrder.indexOf(conditions.minCategory);
          const currentCategoryIndex = categoryOrder.indexOf(riskCategory);
          return hasDirectDeposit && currentCategoryIndex <= minCategoryIndex;
        },
        time: params.responseTime.fastTrack,
      },
    ],
  },

  approvalProbability: params.approvalProbability as Record<"A" | "B" | "C" | "D", "high" | "medium" | "low">,
};

import { ProductFullConfig } from "../types";
import params from "../../parameters/products/salary-advance.json";

export const SALARY_ADVANCE_CONFIG: ProductFullConfig = {
  id: "salary-advance",
  icon: params.icon,
  color: params.color,
  descriptionKey: "simulator.advanced.products.salaryadvance.description",

  questions: [
    {
      id: "age",
      type: "number",
      labelKey: "simulator.advanced.questions.age",
      subtitleKey: "simulator.advanced.questions.ageSubtitle",
      required: true,
      min: params.questions.age.min,
      max: params.questions.age.max,
      unit: "years",
    },
    {
      id: "contractType",
      type: "select",
      labelKey: "simulator.advanced.salary.contractTitle",
      required: true,
      options: [
        { value: "cdi", labelKey: "simulator.advanced.options.contractType.cdi", score: params.questions.contractType.scores.cdi },
        { value: "cdd", labelKey: "simulator.advanced.options.contractType.cdd", score: params.questions.contractType.scores.cdd },
        { value: "permanent", labelKey: "simulator.advanced.options.contractType.permanent", score: params.questions.contractType.scores.cdi },
        { value: "temporary", labelKey: "simulator.advanced.options.contractType.temporary", score: params.questions.contractType.scores.cdd },
        { value: "indefinido", labelKey: "simulator.advanced.options.contractType.indefinido", score: params.questions.contractType.scores.cdi },
        { value: "temporal", labelKey: "simulator.advanced.options.contractType.temporal", score: params.questions.contractType.scores.cdd },
      ],
    },
    {
      id: "netSalary",
      type: "slider",
      labelKey: "simulator.advanced.salary.netTitle",
      subtitleKey: "simulator.advanced.salary.netSubtitle",
      required: true,
      min: params.questions.netSalary.min,
      max: params.questions.netSalary.max,
      step: params.questions.netSalary.step,
      unit: "euros",
    },
    {
      id: "nextPayday",
      type: "date",
      labelKey: "simulator.advanced.salary.paydayTitle",
      required: true,
    },
  ],

  scoring: {
    baseScore: params.scoring.baseScore,
    factors: [
      {
        fieldId: "contractType",
        weight: params.scoring.weights.contractType,
        scoreMap: params.questions.contractType.scores,
      },
      {
        fieldId: "netSalary",
        weight: params.scoring.weights.netSalary,
        scoreFn: (value, formData) => {
          const salary = value as number;
          const amount = formData.amount || 500;
          const ratio = amount / salary;
          const ranges = params.scoring.salaryRatioRanges;
          if (ratio < ranges.excellent.maxRatio) return ranges.excellent.score;
          if (ratio < ranges.good.maxRatio) return ranges.good.score;
          if (ratio < ranges.acceptable.maxRatio) return ranges.acceptable.score;
          if (ratio < ranges.risky.maxRatio) return ranges.risky.score;
          return ranges.default;
        },
      },
      {
        fieldId: "age",
        weight: params.scoring.weights.age,
        scoreFn: (value) => {
          const age = value as number;
          const ranges = params.scoring.ageRanges;
          if (age >= ranges.optimal.min && age <= ranges.optimal.max) return ranges.optimal.score;
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
    // Custom calculation for salary advance (flat fee model)
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
        check: (_, riskCategory) => riskCategory === "A" || riskCategory === "B",
        time: params.responseTime.fastTrack,
      },
    ],
  },

  approvalProbability: params.approvalProbability as Record<"A" | "B" | "C" | "D", "high" | "medium" | "low">,
};

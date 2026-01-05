import { ProductFullConfig } from "../types";
import params from "../../parameters/products/micro-credit.json";

export const MICRO_CREDIT_CONFIG: ProductFullConfig = {
  id: "micro-credit",
  icon: params.icon,
  color: params.color,
  descriptionKey: "simulator.advanced.products.microcredit.description",

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
      id: "employmentStatus",
      type: "select",
      labelKey: "simulator.advanced.employment.title",
      subtitleKey: "simulator.advanced.employment.subtitle",
      required: true,
      options: [
        { value: "cdi", labelKey: "simulator.advanced.employment.cdi", score: params.questions.employmentStatus.scores.cdi },
        { value: "cdd", labelKey: "simulator.advanced.employment.cdd", score: params.questions.employmentStatus.scores.cdd },
        { value: "freelance", labelKey: "simulator.advanced.employment.freelance", score: params.questions.employmentStatus.scores.freelance },
        { value: "student", labelKey: "simulator.advanced.employment.student", score: params.questions.employmentStatus.scores.student },
        { value: "retired", labelKey: "simulator.advanced.employment.retired", score: params.questions.employmentStatus.scores.retired },
        { value: "unemployed", labelKey: "simulator.advanced.employment.unemployed", score: params.questions.employmentStatus.scores.unemployed },
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
          if (age >= ranges.acceptable1.min && age <= ranges.acceptable1.max) return ranges.acceptable1.score;
          if (age >= ranges.acceptable2.min && age <= ranges.acceptable2.max) return ranges.acceptable2.score;
          return ranges.default;
        },
      },
      {
        fieldId: "employmentStatus",
        weight: params.scoring.weights.employmentStatus,
        scoreMap: params.questions.employmentStatus.scores,
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
        check: (_, riskCategory) => riskCategory === "A",
        time: params.responseTime.fastTrack,
      },
    ],
  },

  approvalProbability: params.approvalProbability as Record<"A" | "B" | "C" | "D", "high" | "medium" | "low">,
};

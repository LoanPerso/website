import { ProductFullConfig } from "../types";
import params from "../../parameters/products/consumer.json";

export const CONSUMER_CONFIG: ProductFullConfig = {
  id: "consumer",
  icon: params.icon,
  color: params.color,
  descriptionKey: "simulator.advanced.products.consumer.description",

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
        { value: "cdi", labelKey: "simulator.advanced.options.employmentStatus.cdi", score: params.questions.employmentStatus.scores.cdi },
        { value: "cdd", labelKey: "simulator.advanced.options.employmentStatus.cdd", score: params.questions.employmentStatus.scores.cdd },
        { value: "freelance", labelKey: "simulator.advanced.options.employmentStatus.freelance", score: params.questions.employmentStatus.scores.freelance },
        { value: "permanent", labelKey: "simulator.advanced.options.employmentStatus.permanent", score: params.questions.employmentStatus.scores.cdi },
        { value: "temporary", labelKey: "simulator.advanced.options.employmentStatus.temporary", score: params.questions.employmentStatus.scores.cdd },
        { value: "self-employed", labelKey: "simulator.advanced.options.employmentStatus.self-employed", score: params.questions.employmentStatus.scores.freelance },
        { value: "independant", labelKey: "simulator.advanced.options.employmentStatus.independant", score: params.questions.employmentStatus.scores.freelance },
        { value: "indefinido", labelKey: "simulator.advanced.options.employmentStatus.indefinido", score: params.questions.employmentStatus.scores.cdi },
        { value: "temporal", labelKey: "simulator.advanced.options.employmentStatus.temporal", score: params.questions.employmentStatus.scores.cdd },
        { value: "autonomo", labelKey: "simulator.advanced.options.employmentStatus.autonomo", score: params.questions.employmentStatus.scores.freelance },
        { value: "student", labelKey: "simulator.advanced.options.employmentStatus.student", score: params.questions.employmentStatus.scores.student },
        { value: "retired", labelKey: "simulator.advanced.options.employmentStatus.retired", score: params.questions.employmentStatus.scores.retired },
        { value: "unemployed", labelKey: "simulator.advanced.options.employmentStatus.unemployed", score: params.questions.employmentStatus.scores.unemployed },
      ],
    },
    {
      id: "monthlyIncome",
      type: "slider",
      labelKey: "simulator.advanced.consumer.incomeTitle",
      subtitleKey: "simulator.advanced.consumer.incomeSubtitle",
      required: true,
      min: params.questions.monthlyIncome.min,
      max: params.questions.monthlyIncome.max,
      step: params.questions.monthlyIncome.step,
      unit: "euros",
    },
    {
      id: "loanPurpose",
      type: "select",
      labelKey: "simulator.advanced.consumer.purposeTitle",
      required: true,
      options: [
        { value: "auto", labelKey: "simulator.advanced.options.loanPurpose.auto", score: params.questions.loanPurpose.scores.auto },
        { value: "homeImprovement", labelKey: "simulator.advanced.options.loanPurpose.homeImprovement", score: params.questions.loanPurpose.scores.homeImprovement },
        { value: "equipment", labelKey: "simulator.advanced.options.loanPurpose.equipment", score: params.questions.loanPurpose.scores.equipment },
        { value: "event", labelKey: "simulator.advanced.options.loanPurpose.event", score: params.questions.loanPurpose.scores.event },
        { value: "travel", labelKey: "simulator.advanced.options.loanPurpose.travel", score: params.questions.loanPurpose.scores.travel },
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
        fieldId: "employmentStatus",
        weight: params.scoring.weights.employmentStatus,
        scoreMap: params.questions.employmentStatus.scores,
      },
      {
        fieldId: "monthlyIncome",
        weight: params.scoring.weights.monthlyIncome,
        scoreFn: (value, formData) => {
          const income = value as number;
          const amount = formData.amount || 1000;
          // Calculate monthly payment ratio (assuming 12-month loan for scoring)
          const monthlyPayment = amount / (formData.duration || 12);
          const ratio = monthlyPayment / income;
          const ranges = params.scoring.incomeRatioRanges;
          if (ratio < ranges.excellent.maxRatio) return ranges.excellent.score;
          if (ratio < ranges.good.maxRatio) return ranges.good.score;
          if (ratio < ranges.acceptable.maxRatio) return ranges.acceptable.score;
          if (ratio < ranges.risky.maxRatio) return ranges.risky.score;
          return ranges.default;
        },
      },
      {
        fieldId: "loanPurpose",
        weight: params.scoring.weights.loanPurpose,
        scoreMap: params.questions.loanPurpose.scores,
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
        check: (formData, riskCategory) =>
          riskCategory === "A" && (formData.amount || 0) < params.responseTime.fastTrackMaxAmount,
        time: params.responseTime.fastTrack,
      },
    ],
  },

  approvalProbability: params.approvalProbability as Record<"A" | "B" | "C" | "D", "high" | "medium" | "low">,
};

import { ProductFullConfig } from "../types";
import params from "../../parameters/products/leasing.json";

export const LEASING_CONFIG: ProductFullConfig = {
  id: "leasing",
  icon: params.icon,
  color: params.color,
  descriptionKey: "simulator.advanced.products.leasing.description",

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
      id: "assetType",
      type: "select",
      labelKey: "simulator.advanced.leasing.assetTitle",
      subtitleKey: "simulator.advanced.leasing.assetSubtitle",
      required: true,
      options: [
        { value: "vehicle", labelKey: "simulator.advanced.options.assetType.vehicle", score: params.questions.assetType.scores.vehicle },
        { value: "professional-equipment", labelKey: "simulator.advanced.options.assetType.professional-equipment", score: params.questions.assetType.scores["professional-equipment"] },
        { value: "it-equipment", labelKey: "simulator.advanced.options.assetType.it-equipment", score: params.questions.assetType.scores["it-equipment"] },
        { value: "machinery", labelKey: "simulator.advanced.options.assetType.machinery", score: params.questions.assetType.scores.machinery },
      ],
    },
    {
      id: "clientType",
      type: "select",
      labelKey: "simulator.advanced.leasing.statusTitle",
      required: true,
      options: [
        {
          value: "individual",
          labelKey: "simulator.advanced.options.clientType.individual",
          descriptionKey: "simulator.advanced.leasing.individualDesc",
          score: params.questions.isBusinessClient.scores.individual,
        },
        {
          value: "business",
          labelKey: "simulator.advanced.options.clientType.business",
          descriptionKey: "simulator.advanced.leasing.businessDesc",
          score: params.questions.isBusinessClient.scores.business,
        },
      ],
    },
    // Business-specific questions
    {
      id: "yearsInBusiness",
      type: "number",
      labelKey: "simulator.advanced.pro.yearsTitle",
      required: true,
      min: params.questions.yearsInBusiness.min,
      max: params.questions.yearsInBusiness.max,
      unit: "years",
      showIf: (formData) => {
        if ("clientType" in formData) {
          return formData.clientType === "business";
        }
        return false;
      },
    },
    // Individual-specific questions
    {
      id: "employmentStatus",
      type: "select",
      labelKey: "simulator.advanced.employment.title",
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
        { value: "retired", labelKey: "simulator.advanced.options.employmentStatus.retired", score: params.questions.employmentStatus.scores.retired },
      ],
      showIf: (formData) => {
        if ("clientType" in formData) {
          return formData.clientType === "individual";
        }
        return true;
      },
    },
  ],

  scoring: {
    baseScore: params.scoring.baseScore,
    factors: [
      {
        fieldId: "assetType",
        weight: params.scoring.weights.assetType,
        scoreMap: params.questions.assetType.scores,
      },
      {
        fieldId: "clientType",
        weight: params.scoring.weights.isBusinessClient,
        scoreFn: (value) => {
          return value === "business" ? params.questions.isBusinessClient.scores.business : params.questions.isBusinessClient.scores.individual;
        },
      },
      {
        fieldId: "yearsInBusiness",
        weight: params.scoring.weights.yearsInBusiness,
        scoreFn: (value, formData) => {
          // Only score if business client
          if ("clientType" in formData && formData.clientType !== "business") {
            return params.scoring.individualNeutralScore;
          }
          const years = value as number;
          if (!years) return 50;
          const ranges = params.scoring.yearsInBusinessRanges;
          if (years >= ranges.excellent.min) return ranges.excellent.score;
          if (years >= ranges.good.min) return ranges.good.score;
          if (years >= ranges.acceptable.min) return ranges.acceptable.score;
          if (years >= ranges.new.min) return ranges.new.score;
          return ranges.default;
        },
      },
      {
        fieldId: "employmentStatus",
        weight: params.scoring.weights.employmentStatus,
        scoreFn: (value, formData) => {
          // Only score if individual
          if ("clientType" in formData && formData.clientType === "business") {
            return params.scoring.businessNeutralScore;
          }
          const scoreMap = params.questions.employmentStatus.scores as Record<string, number>;
          return scoreMap[value as string] || 50;
        },
      },
      {
        fieldId: "age",
        weight: params.scoring.weights.age,
        scoreFn: (value) => {
          const age = value as number;
          const ranges = params.scoring.ageRanges;
          if (age >= ranges.optimal.min && age <= ranges.optimal.max) return ranges.optimal.score;
          if (age >= ranges.good.min && age <= ranges.good.max) return ranges.good.score;
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
    // Custom calculation for leasing (includes residual value)
    customCalculate: (amount, duration, rate) => {
      const residualPercent = params.calculation.residualValuePercent;
      const residualValue = amount * residualPercent;
      const financedAmount = amount - residualValue;

      const monthlyRate = rate / 100 / 12;
      const managementFee = params.calculation.fees.managementFee;

      let monthlyPayment: number;
      if (monthlyRate === 0) {
        monthlyPayment = financedAmount / duration + managementFee;
      } else {
        monthlyPayment =
          (financedAmount * (monthlyRate * Math.pow(1 + monthlyRate, duration))) /
            (Math.pow(1 + monthlyRate, duration) - 1) +
          managementFee;
      }

      const totalCost = monthlyPayment * duration + residualValue;
      const totalInterest = totalCost - amount;

      return {
        monthlyPayment,
        totalCost,
        totalInterest,
      };
    },
  },

  responseTime: {
    default: params.responseTime.default,
    conditions: [
      {
        check: (formData, riskCategory) =>
          riskCategory === "A" &&
          "clientType" in formData &&
          formData.clientType === "business",
        time: params.responseTime.fastTrack,
      },
    ],
  },

  approvalProbability: params.approvalProbability as Record<"A" | "B" | "C" | "D", "high" | "medium" | "low">,
};

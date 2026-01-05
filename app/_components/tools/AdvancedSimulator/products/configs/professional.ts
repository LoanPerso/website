import { ProductFullConfig } from "../types";
import params from "../../parameters/products/professional.json";

export const PROFESSIONAL_CONFIG: ProductFullConfig = {
  id: "professional",
  icon: params.icon,
  color: params.color,
  descriptionKey: "simulator.advanced.products.professional.description",

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
      id: "businessType",
      type: "select",
      labelKey: "simulator.advanced.pro.typeTitle",
      subtitleKey: "simulator.advanced.pro.typeSubtitle",
      required: true,
      options: [
        { value: "freelance", labelKey: "simulator.advanced.options.businessType.freelance", score: params.questions.businessType.scores.freelance },
        { value: "auto-entrepreneur", labelKey: "simulator.advanced.options.businessType.auto-entrepreneur", score: params.questions.businessType.scores["auto-entrepreneur"] },
        { value: "tpe", labelKey: "simulator.advanced.options.businessType.tpe", score: params.questions.businessType.scores.tpe },
        { value: "startup", labelKey: "simulator.advanced.options.businessType.startup", score: params.questions.businessType.scores.startup },
        { value: "independant", labelKey: "simulator.advanced.options.businessType.independant", score: params.questions.businessType.scores.freelance },
        { value: "sprl", labelKey: "simulator.advanced.options.businessType.sprl", score: params.questions.businessType.scores.tpe },
        { value: "sa", labelKey: "simulator.advanced.options.businessType.sa", score: params.questions.businessType.scores.tpe },
        { value: "sarl", labelKey: "simulator.advanced.options.businessType.sarl", score: params.questions.businessType.scores.tpe },
        { value: "sl", labelKey: "simulator.advanced.options.businessType.sl", score: params.questions.businessType.scores.tpe },
        { value: "self-employed", labelKey: "simulator.advanced.options.businessType.self-employed", score: params.questions.businessType.scores.freelance },
        { value: "small-business", labelKey: "simulator.advanced.options.businessType.small-business", score: params.questions.businessType.scores.tpe },
        { value: "company", labelKey: "simulator.advanced.options.businessType.company", score: params.questions.businessType.scores.tpe },
        { value: "autonomo", labelKey: "simulator.advanced.options.businessType.autonomo", score: params.questions.businessType.scores.freelance },
      ],
    },
    {
      id: "sector",
      type: "select",
      labelKey: "simulator.advanced.pro.sectorTitle",
      required: true,
      options: [
        { value: "tech", labelKey: "simulator.advanced.options.sector.tech", score: params.questions.sector.scores.tech },
        { value: "commerce", labelKey: "simulator.advanced.options.sector.commerce", score: params.questions.sector.scores.commerce },
        { value: "services", labelKey: "simulator.advanced.options.sector.services", score: params.questions.sector.scores.services },
        { value: "construction", labelKey: "simulator.advanced.options.sector.construction", score: params.questions.sector.scores.construction },
        { value: "health", labelKey: "simulator.advanced.options.sector.health", score: params.questions.sector.scores.health },
        { value: "other", labelKey: "simulator.advanced.options.sector.other", score: params.questions.sector.scores.other },
      ],
    },
    {
      id: "yearsInBusiness",
      type: "number",
      labelKey: "simulator.advanced.pro.yearsTitle",
      required: true,
      min: params.questions.yearsInBusiness.min,
      max: params.questions.yearsInBusiness.max,
      unit: "years",
    },
    {
      id: "annualRevenue",
      type: "slider",
      labelKey: "simulator.advanced.pro.revenueTitle",
      subtitleKey: "simulator.advanced.pro.revenueSubtitle",
      required: true,
      min: params.questions.annualRevenue.min,
      max: params.questions.annualRevenue.max,
      step: params.questions.annualRevenue.step,
      unit: "euros",
    },
    {
      id: "businessNeed",
      type: "select",
      labelKey: "simulator.advanced.pro.needTitle",
      required: true,
      options: [
        {
          value: "treasury",
          labelKey: "simulator.advanced.options.businessNeed.treasury",
          descriptionKey: "simulator.advanced.pro.needs.treasuryDesc",
          score: params.questions.businessNeed.scores.treasury,
        },
        {
          value: "investment",
          labelKey: "simulator.advanced.options.businessNeed.investment",
          descriptionKey: "simulator.advanced.pro.needs.investmentDesc",
          score: params.questions.businessNeed.scores.investment,
        },
        {
          value: "equipment",
          labelKey: "simulator.advanced.options.businessNeed.equipment",
          descriptionKey: "simulator.advanced.pro.needs.equipmentDesc",
          score: params.questions.businessNeed.scores.equipment,
        },
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
        fieldId: "annualRevenue",
        weight: params.scoring.weights.annualRevenue,
        scoreFn: (value, formData) => {
          const revenue = value as number;
          const amount = formData.amount || 1000;
          const ratio = amount / revenue;
          const ranges = params.scoring.debtRatioRanges;
          if (ratio < ranges.excellent.maxRatio) return ranges.excellent.score;
          if (ratio < ranges.good.maxRatio) return ranges.good.score;
          if (ratio < ranges.acceptable.maxRatio) return ranges.acceptable.score;
          if (ratio < ranges.risky.maxRatio) return ranges.risky.score;
          return ranges.default;
        },
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
        check: (formData, riskCategory) =>
          riskCategory === "A" &&
          (("yearsInBusiness" in formData && (formData.yearsInBusiness || 0) >= params.responseTime.fastTrackMinYears) || false),
        time: params.responseTime.fastTrack,
      },
    ],
  },

  approvalProbability: params.approvalProbability as Record<"A" | "B" | "C" | "D", "high" | "medium" | "low">,
};

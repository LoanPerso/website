import { ProductFullConfig } from "../types";
import params from "../../parameters/products/leasing.json";

export const LEASING_CONFIG: ProductFullConfig = {
  id: "leasing",
  icon: params.icon,
  color: params.color,
  descriptionKey: "simulator.advanced.products.leasing.description",

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
    // SECTION: ASSET
    // ============================================================
    {
      id: "assetType",
      type: "select",
      section: "asset",
      labelKey: "simulator.advanced.leasing.asset.type",
      subtitleKey: "simulator.advanced.leasing.asset.typeSubtitle",
      required: true,
      options: [
        { value: "vehicle", labelKey: "simulator.advanced.leasing.asset.vehicle", score: params.questions.assetType.scores.vehicle },
        { value: "professional-equipment", labelKey: "simulator.advanced.leasing.asset.proEquipment", score: params.questions.assetType.scores["professional-equipment"] },
        { value: "it-equipment", labelKey: "simulator.advanced.leasing.asset.itEquipment", score: params.questions.assetType.scores["it-equipment"] },
        { value: "machinery", labelKey: "simulator.advanced.leasing.asset.machinery", score: params.questions.assetType.scores.machinery },
        { value: "medical-equipment", labelKey: "simulator.advanced.leasing.asset.medicalEquipment", score: params.questions.assetType.scores["medical-equipment"] },
        { value: "industrial", labelKey: "simulator.advanced.leasing.asset.industrial", score: params.questions.assetType.scores.industrial },
        { value: "other", labelKey: "simulator.advanced.leasing.asset.other", score: params.questions.assetType.scores.other },
      ],
    },
    {
      id: "assetCondition",
      type: "select",
      section: "asset",
      labelKey: "simulator.advanced.leasing.asset.condition",
      subtitleKey: "simulator.advanced.leasing.asset.conditionSubtitle",
      required: true,
      options: [
        { value: "new", labelKey: "simulator.advanced.leasing.asset.new", score: params.questions.assetCondition.scores.new },
        { value: "recent", labelKey: "simulator.advanced.leasing.asset.recent", score: params.questions.assetCondition.scores.recent },
        { value: "used", labelKey: "simulator.advanced.leasing.asset.used", score: params.questions.assetCondition.scores.used },
      ],
    },

    // ============================================================
    // SECTION: CLIENT TYPE
    // ============================================================
    {
      id: "clientType",
      type: "select",
      section: "identity",
      labelKey: "simulator.advanced.leasing.client.type",
      subtitleKey: "simulator.advanced.leasing.client.typeSubtitle",
      required: true,
      options: [
        { value: "individual", labelKey: "simulator.advanced.leasing.client.individual", descriptionKey: "simulator.advanced.leasing.client.individualDesc", score: params.questions.clientType.scores.individual },
        { value: "business", labelKey: "simulator.advanced.leasing.client.business", descriptionKey: "simulator.advanced.leasing.client.businessDesc", score: params.questions.clientType.scores.business },
      ],
    },

    // ============================================================
    // SECTION: EMPLOYMENT (Individual only)
    // ============================================================
    {
      id: "employmentStatus",
      type: "select",
      section: "employment",
      labelKey: "simulator.advanced.leasing.individual.employment",
      subtitleKey: "simulator.advanced.leasing.individual.employmentSubtitle",
      required: true,
      showIf: (formData) => {
        const data = formData as unknown as Record<string, unknown>;
        return data.clientType === "individual";
      },
      options: [
        { value: "tahtajatu", labelKey: "simulator.advanced.options.employmentStatus.tahtajatu", score: params.questions.employmentStatus.scores.tahtajatu },
        { value: "tahtajaline", labelKey: "simulator.advanced.options.employmentStatus.tahtajaline", score: params.questions.employmentStatus.scores.tahtajaline },
        { value: "fie", labelKey: "simulator.advanced.options.employmentStatus.fie", score: params.questions.employmentStatus.scores.fie },
        { value: "retired", labelKey: "simulator.advanced.options.employmentStatus.retired", score: params.questions.employmentStatus.scores.retired },
      ],
    },
    {
      id: "employmentDuration",
      type: "select",
      section: "employment",
      labelKey: "simulator.advanced.leasing.individual.duration",
      subtitleKey: "simulator.advanced.leasing.individual.durationSubtitle",
      required: true,
      showIf: (formData) => {
        const data = formData as unknown as Record<string, unknown>;
        return data.clientType === "individual" && data.employmentStatus !== "retired";
      },
      options: [
        { value: "more-than-2-years", labelKey: "simulator.advanced.employmentDuration.moreThan2Years", score: params.questions.employmentDuration.scores["more-than-2-years"] },
        { value: "1-to-2-years", labelKey: "simulator.advanced.employmentDuration.1to2Years", score: params.questions.employmentDuration.scores["1-to-2-years"] },
        { value: "6-months-to-1-year", labelKey: "simulator.advanced.employmentDuration.6monthsTo1Year", score: params.questions.employmentDuration.scores["6-months-to-1-year"] },
        { value: "less-than-6-months", labelKey: "simulator.advanced.employmentDuration.lessThan6Months", score: params.questions.employmentDuration.scores["less-than-6-months"] },
      ],
    },
    {
      id: "monthlyIncome",
      type: "slider",
      section: "income",
      labelKey: "simulator.advanced.leasing.individual.income",
      subtitleKey: "simulator.advanced.leasing.individual.incomeSubtitle",
      required: true,
      min: params.questions.monthlyIncome.min,
      max: params.questions.monthlyIncome.max,
      step: params.questions.monthlyIncome.step,
      unit: "euros",
      showIf: (formData) => {
        const data = formData as unknown as Record<string, unknown>;
        return data.clientType === "individual";
      },
    },

    // ============================================================
    // SECTION: BUSINESS (Business only)
    // ============================================================
    {
      id: "yearsInBusiness",
      type: "number",
      section: "business",
      labelKey: "simulator.advanced.leasing.business.years",
      subtitleKey: "simulator.advanced.leasing.business.yearsSubtitle",
      required: true,
      min: params.questions.yearsInBusiness.min,
      max: params.questions.yearsInBusiness.max,
      unit: "years",
      showIf: (formData) => {
        const data = formData as unknown as Record<string, unknown>;
        return data.clientType === "business";
      },
    },
    {
      id: "annualRevenue",
      type: "slider",
      section: "business",
      labelKey: "simulator.advanced.leasing.business.revenue",
      subtitleKey: "simulator.advanced.leasing.business.revenueSubtitle",
      required: true,
      min: params.questions.annualRevenue.min,
      max: params.questions.annualRevenue.max,
      step: params.questions.annualRevenue.step,
      unit: "euros",
      showIf: (formData) => {
        const data = formData as unknown as Record<string, unknown>;
        return data.clientType === "business";
      },
    },

    // ============================================================
    // SECTION: BANKING
    // ============================================================
    {
      id: "creditHistory",
      type: "select",
      section: "banking",
      labelKey: "simulator.advanced.leasing.banking.creditHistory",
      subtitleKey: "simulator.advanced.leasing.banking.creditHistorySubtitle",
      required: true,
      options: [
        { value: "excellent", labelKey: "simulator.advanced.creditHistory.excellent", score: params.questions.creditHistory.scores.excellent },
        { value: "good", labelKey: "simulator.advanced.creditHistory.good", score: params.questions.creditHistory.scores.good },
        { value: "mixed", labelKey: "simulator.advanced.creditHistory.mixed", score: params.questions.creditHistory.scores.mixed },
        { value: "incidents", labelKey: "simulator.advanced.creditHistory.incidents", score: params.questions.creditHistory.scores.incidents },
      ],
    },

    // ============================================================
    // SECTION: LOAN OPTIONS
    // ============================================================
    {
      id: "buyOption",
      type: "select",
      section: "loan",
      labelKey: "simulator.advanced.leasing.options.buyOption",
      subtitleKey: "simulator.advanced.leasing.options.buyOptionSubtitle",
      required: true,
      options: [
        { value: "yes", labelKey: "simulator.advanced.leasing.options.buyYes", score: params.questions.buyOption.scores.yes },
        { value: "no", labelKey: "simulator.advanced.leasing.options.buyNo", score: params.questions.buyOption.scores.no },
      ],
    },

    // ============================================================
    // SECTION: INSURANCE
    // ============================================================
    {
      id: "wantsInsurance",
      type: "select",
      section: "insurance",
      labelKey: "simulator.advanced.leasing.insurance.wants",
      subtitleKey: "simulator.advanced.leasing.insurance.wantsSubtitle",
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
        fieldId: "assetType",
        weight: params.scoring.weights.assetType,
        scoreMap: params.questions.assetType.scores,
      },
      {
        fieldId: "assetCondition",
        weight: params.scoring.weights.assetCondition,
        scoreMap: params.questions.assetCondition.scores,
      },
      {
        fieldId: "clientType",
        weight: params.scoring.weights.clientType,
        scoreMap: params.questions.clientType.scores,
      },
      {
        fieldId: "employmentOrBusiness",
        weight: params.scoring.weights.employmentOrBusiness,
        scoreFn: (_, formData) => {
          const data = formData as unknown as Record<string, unknown>;
          if (data.clientType === "business") {
            const years = (data.yearsInBusiness as number) || 0;
            const ranges = params.scoring.yearsInBusinessRanges;
            if (years >= ranges.excellent.min) return ranges.excellent.score;
            if (years >= ranges.good.min) return ranges.good.score;
            if (years >= ranges.acceptable.min) return ranges.acceptable.score;
            if (years >= ranges.new.min) return ranges.new.score;
            return ranges.default;
          } else {
            const status = data.employmentStatus as string;
            const duration = data.employmentDuration as string;
            const statusScore = params.questions.employmentStatus.scores[status as keyof typeof params.questions.employmentStatus.scores] || 50;
            const durationScore = params.questions.employmentDuration.scores[duration as keyof typeof params.questions.employmentDuration.scores] || 50;
            return (statusScore + durationScore) / 2;
          }
        },
      },
      {
        fieldId: "incomeOrRevenue",
        weight: params.scoring.weights.incomeOrRevenue,
        scoreFn: (_, formData) => {
          const data = formData as unknown as Record<string, unknown>;
          const amount = formData.amount || 10000;

          if (data.clientType === "business") {
            const revenue = (data.annualRevenue as number) || 0;
            if (revenue <= 0) return params.scoring.revenueRatioRanges.default;
            const ratio = amount / revenue;
            const ranges = params.scoring.revenueRatioRanges;
            if (ratio <= ranges.excellent.maxRatio) return ranges.excellent.score;
            if (ratio <= ranges.good.maxRatio) return ranges.good.score;
            if (ratio <= ranges.acceptable.maxRatio) return ranges.acceptable.score;
            if (ratio <= ranges.risky.maxRatio) return ranges.risky.score;
            return ranges.default;
          } else {
            const income = (data.monthlyIncome as number) || 0;
            if (income <= 0) return params.scoring.incomeRatioRanges.default;
            const annualIncome = income * 12;
            const ratio = amount / annualIncome;
            const ranges = params.scoring.incomeRatioRanges;
            if (ratio <= ranges.excellent.maxRatio) return ranges.excellent.score;
            if (ratio <= ranges.good.maxRatio) return ranges.good.score;
            if (ratio <= ranges.acceptable.maxRatio) return ranges.acceptable.score;
            if (ratio <= ranges.risky.maxRatio) return ranges.risky.score;
            return ranges.default;
          }
        },
      },
      {
        fieldId: "creditHistory",
        weight: params.scoring.weights.creditHistory,
        scoreMap: params.questions.creditHistory.scores,
      },
      {
        fieldId: "buyOption",
        weight: params.scoring.weights.buyOption,
        scoreMap: params.questions.buyOption.scores,
      },
      {
        fieldId: "wantsInsurance",
        weight: params.scoring.weights.wantsInsurance,
        scoreMap: params.questions.wantsInsurance.scores,
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
        check: (formData, riskCategory) => {
          const data = formData as unknown as Record<string, unknown>;
          const isBusiness = data.clientType === "business";
          const conditions = params.responseTime.fastTrackConditions;
          const categoryOrder = ["A", "B", "C", "D"];
          const minCategoryIndex = categoryOrder.indexOf(conditions.minCategory);
          const currentCategoryIndex = categoryOrder.indexOf(riskCategory);
          return isBusiness && currentCategoryIndex <= minCategoryIndex;
        },
        time: params.responseTime.fastTrack,
      },
    ],
  },

  approvalProbability: params.approvalProbability as Record<"A" | "B" | "C" | "D", "high" | "medium" | "low">,
};

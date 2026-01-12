import { ProductFullConfig } from "../types";
import params from "../../parameters/products/student.json";

export const STUDENT_CONFIG: ProductFullConfig = {
  id: "student",
  icon: params.icon,
  color: params.color,
  descriptionKey: "simulator.advanced.products.student.description",

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
      countryOverrides: params.questions.age.countryOverrides,
    },

    // ============================================================
    // SECTION: STUDIES
    // ============================================================
    {
      id: "institutionType",
      type: "select",
      section: "studies",
      labelKey: "simulator.advanced.student.institution.title",
      subtitleKey: "simulator.advanced.student.institution.subtitle",
      required: true,
      options: [
        { value: "university", labelKey: "simulator.advanced.options.institutionType.university", score: params.questions.institutionType.scores.university },
        { value: "applied-university", labelKey: "simulator.advanced.options.institutionType.applied-university", score: params.questions.institutionType.scores["applied-university"] },
        { value: "vocational-school", labelKey: "simulator.advanced.options.institutionType.vocational-school", score: params.questions.institutionType.scores["vocational-school"] },
        { value: "other", labelKey: "simulator.advanced.options.institutionType.other", score: params.questions.institutionType.scores.other },
      ],
    },
    {
      id: "studyLevel",
      type: "select",
      section: "studies",
      labelKey: "simulator.advanced.student.level.title",
      subtitleKey: "simulator.advanced.student.level.subtitle",
      required: true,
      options: [
        { value: "bachelor-1", labelKey: "simulator.advanced.options.studyLevel.bachelor-1", score: params.questions.studyLevel.scores["bachelor-1"] },
        { value: "bachelor-2", labelKey: "simulator.advanced.options.studyLevel.bachelor-2", score: params.questions.studyLevel.scores["bachelor-2"] },
        { value: "bachelor-3", labelKey: "simulator.advanced.options.studyLevel.bachelor-3", score: params.questions.studyLevel.scores["bachelor-3"] },
        { value: "master-1", labelKey: "simulator.advanced.options.studyLevel.master-1", score: params.questions.studyLevel.scores["master-1"] },
        { value: "master-2", labelKey: "simulator.advanced.options.studyLevel.master-2", score: params.questions.studyLevel.scores["master-2"] },
        { value: "doctorate", labelKey: "simulator.advanced.options.studyLevel.doctorate", score: params.questions.studyLevel.scores.doctorate },
      ],
    },
    {
      id: "remainingYears",
      type: "number",
      section: "studies",
      labelKey: "simulator.advanced.student.remainingYears.title",
      subtitleKey: "simulator.advanced.student.remainingYears.subtitle",
      required: true,
      min: params.questions.remainingYears.min,
      max: params.questions.remainingYears.max,
      unit: "years",
    },

    // ============================================================
    // SECTION: INCOME
    // ============================================================
    {
      id: "hasPartTimeJob",
      type: "select",
      section: "income",
      labelKey: "simulator.advanced.student.job.title",
      subtitleKey: "simulator.advanced.student.job.subtitle",
      required: true,
      options: [
        { value: "yes", labelKey: "simulator.advanced.common.yes", score: params.questions.hasPartTimeJob.scores.yes },
        { value: "no", labelKey: "simulator.advanced.common.no", score: params.questions.hasPartTimeJob.scores.no },
      ],
    },
    {
      id: "partTimeIncome",
      type: "slider",
      section: "income",
      labelKey: "simulator.advanced.student.job.income",
      subtitleKey: "simulator.advanced.student.job.incomeSubtitle",
      required: true,
      min: params.questions.partTimeIncome.min,
      max: params.questions.partTimeIncome.max,
      step: params.questions.partTimeIncome.step,
      unit: "euros",
      showIf: (formData) => {
        const data = formData as unknown as Record<string, unknown>;
        return data.hasPartTimeJob === "yes";
      },
    },
    {
      id: "hasScholarship",
      type: "select",
      section: "income",
      labelKey: "simulator.advanced.student.scholarship.title",
      subtitleKey: "simulator.advanced.student.scholarship.subtitle",
      required: true,
      options: [
        { value: "yes", labelKey: "simulator.advanced.common.yes", score: params.questions.hasScholarship.scores.yes },
        { value: "no", labelKey: "simulator.advanced.common.no", score: params.questions.hasScholarship.scores.no },
      ],
    },
    {
      id: "scholarshipAmount",
      type: "slider",
      section: "income",
      labelKey: "simulator.advanced.student.scholarship.amount",
      subtitleKey: "simulator.advanced.student.scholarship.amountSubtitle",
      required: true,
      min: params.questions.scholarshipAmount.min,
      max: params.questions.scholarshipAmount.max,
      step: params.questions.scholarshipAmount.step,
      unit: "euros",
      showIf: (formData) => {
        const data = formData as unknown as Record<string, unknown>;
        return data.hasScholarship === "yes";
      },
    },

    // ============================================================
    // SECTION: HOUSING
    // ============================================================
    {
      id: "housingStatus",
      type: "select",
      section: "housing",
      labelKey: "simulator.advanced.student.housing.title",
      subtitleKey: "simulator.advanced.student.housing.subtitle",
      required: true,
      options: [
        { value: "withParents", labelKey: "simulator.advanced.student.housing.withParents", score: params.questions.housingStatus.scores.withParents },
        { value: "studentResidence", labelKey: "simulator.advanced.student.housing.studentResidence", score: params.questions.housingStatus.scores.studentResidence },
        { value: "rental", labelKey: "simulator.advanced.student.housing.rental", score: params.questions.housingStatus.scores.rental },
        { value: "other", labelKey: "simulator.advanced.student.housing.other", score: params.questions.housingStatus.scores.other },
      ],
    },

    // ============================================================
    // SECTION: GUARANTOR
    // ============================================================
    {
      id: "hasGuarantor",
      type: "select",
      section: "guarantor",
      labelKey: "simulator.advanced.student.guarantor.title",
      subtitleKey: "simulator.advanced.student.guarantor.subtitle",
      required: true,
      options: [
        { value: "yes", labelKey: "simulator.advanced.student.guarantor.yes", score: params.questions.hasGuarantor.scores.yes },
        { value: "no", labelKey: "simulator.advanced.student.guarantor.no", score: params.questions.hasGuarantor.scores.no },
      ],
    },
    {
      id: "guarantorRelationship",
      type: "select",
      section: "guarantor",
      labelKey: "simulator.advanced.student.guarantor.relationship",
      subtitleKey: "simulator.advanced.student.guarantor.relationshipSubtitle",
      required: true,
      showIf: (formData) => {
        const data = formData as unknown as Record<string, unknown>;
        return data.hasGuarantor === "yes";
      },
      options: [
        { value: "parent", labelKey: "simulator.advanced.student.guarantor.parent", score: params.questions.guarantorRelationship.scores.parent },
        { value: "grandparent", labelKey: "simulator.advanced.student.guarantor.grandparent", score: params.questions.guarantorRelationship.scores.grandparent },
        { value: "sibling", labelKey: "simulator.advanced.student.guarantor.sibling", score: params.questions.guarantorRelationship.scores.sibling },
        { value: "other", labelKey: "simulator.advanced.student.guarantor.otherRelation", score: params.questions.guarantorRelationship.scores.other },
      ],
    },
    {
      id: "guarantorIncome",
      type: "slider",
      section: "guarantor",
      labelKey: "simulator.advanced.student.guarantor.income",
      subtitleKey: "simulator.advanced.student.guarantor.incomeSubtitle",
      required: true,
      min: params.questions.guarantorIncome.min,
      max: params.questions.guarantorIncome.max,
      step: params.questions.guarantorIncome.step,
      unit: "euros",
      showIf: (formData) => {
        const data = formData as unknown as Record<string, unknown>;
        return data.hasGuarantor === "yes";
      },
    },

    // ============================================================
    // SECTION: LOAN
    // ============================================================
    {
      id: "loanPurpose",
      type: "select",
      section: "loan",
      labelKey: "simulator.advanced.student.loan.purpose",
      subtitleKey: "simulator.advanced.student.loan.purposeSubtitle",
      required: true,
      options: [
        { value: "tuition", labelKey: "simulator.advanced.student.loan.tuition", score: params.questions.loanPurpose.scores.tuition },
        { value: "living", labelKey: "simulator.advanced.student.loan.living", score: params.questions.loanPurpose.scores.living },
        { value: "equipment", labelKey: "simulator.advanced.student.loan.equipment", score: params.questions.loanPurpose.scores.equipment },
        { value: "internship", labelKey: "simulator.advanced.student.loan.internship", score: params.questions.loanPurpose.scores.internship },
        { value: "other", labelKey: "simulator.advanced.student.loan.other", score: params.questions.loanPurpose.scores.other },
      ],
    },

    // ============================================================
    // SECTION: INSURANCE
    // ============================================================
    {
      id: "wantsInsurance",
      type: "select",
      section: "insurance",
      labelKey: "simulator.advanced.student.insurance.wants",
      subtitleKey: "simulator.advanced.student.insurance.wantsSubtitle",
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
          if (age <= ranges.optimal.max) return ranges.optimal.score;
          if (age <= ranges.good.max) return ranges.good.score;
          if (age <= ranges.acceptable.max) return ranges.acceptable.score;
          return ranges.default;
        },
      },
      {
        fieldId: "institutionType",
        weight: params.scoring.weights.institutionType,
        scoreMap: params.questions.institutionType.scores,
      },
      {
        fieldId: "studyLevel",
        weight: params.scoring.weights.studyLevel,
        scoreMap: params.questions.studyLevel.scores,
      },
      {
        fieldId: "remainingYears",
        weight: params.scoring.weights.remainingYears,
        scoreFn: (value) => {
          const years = value as number;
          const ranges = params.scoring.remainingYearsRanges;
          if (years <= ranges.short.max) return ranges.short.score;
          if (years <= ranges.medium.max) return ranges.medium.score;
          if (years <= ranges.long.max) return ranges.long.score;
          return ranges.default;
        },
      },
      {
        fieldId: "hasPartTimeJob",
        weight: params.scoring.weights.hasPartTimeJob,
        scoreFn: (value, formData) => {
          if (value === "yes") {
            const data = formData as unknown as Record<string, unknown>;
            const income = (data.partTimeIncome as number) || 0;
            const ranges = params.scoring.incomeRanges;
            if (income >= ranges.high.min) return ranges.high.score;
            if (income >= ranges.medium.min) return ranges.medium.score;
            if (income >= ranges.low.min) return ranges.low.score;
            return ranges.default;
          }
          return params.questions.hasPartTimeJob.scores.no;
        },
      },
      {
        fieldId: "hasScholarship",
        weight: params.scoring.weights.hasScholarship,
        scoreMap: params.questions.hasScholarship.scores,
      },
      {
        fieldId: "housingStatus",
        weight: params.scoring.weights.housingStatus,
        scoreMap: params.questions.housingStatus.scores,
      },
      {
        fieldId: "hasGuarantor",
        weight: params.scoring.weights.hasGuarantor,
        scoreMap: params.questions.hasGuarantor.scores,
      },
      {
        fieldId: "guarantorIncome",
        weight: params.scoring.weights.guarantorIncome,
        scoreFn: (_, formData) => {
          const data = formData as unknown as Record<string, unknown>;
          if (data.hasGuarantor !== "yes") return 50;

          const income = (data.guarantorIncome as number) || 0;
          const ranges = params.scoring.guarantorIncomeRanges;
          if (income >= ranges.high.min) return ranges.high.score;
          if (income >= ranges.medium.min) return ranges.medium.score;
          if (income >= ranges.acceptable.min) return ranges.acceptable.score;
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
        check: (formData, riskCategory) => {
          const data = formData as unknown as Record<string, unknown>;
          const hasGuarantor = data.hasGuarantor === "yes";
          const conditions = params.responseTime.fastTrackConditions;
          const categoryOrder = ["A", "B", "C", "D"];
          const minCategoryIndex = categoryOrder.indexOf(conditions.minCategory);
          const currentCategoryIndex = categoryOrder.indexOf(riskCategory);
          return hasGuarantor && currentCategoryIndex <= minCategoryIndex;
        },
        time: params.responseTime.fastTrack,
      },
    ],
  },

  approvalProbability: params.approvalProbability as Record<"A" | "B" | "C" | "D", "high" | "medium" | "low">,
};

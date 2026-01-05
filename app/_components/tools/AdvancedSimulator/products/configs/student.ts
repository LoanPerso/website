import { ProductFullConfig } from "../types";
import params from "../../parameters/products/student.json";

export const STUDENT_CONFIG: ProductFullConfig = {
  id: "student",
  icon: params.icon,
  color: params.color,
  descriptionKey: "simulator.advanced.products.student.description",

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
      countryOverrides: params.questions.age.countryOverrides,
    },
    {
      id: "institutionType",
      type: "select",
      labelKey: "simulator.advanced.student.institutionTitle",
      subtitleKey: "simulator.advanced.student.institutionSubtitle",
      required: true,
      options: [
        { value: "university", labelKey: "simulator.advanced.options.institutionType.university", score: params.questions.institutionType.scores.university },
        { value: "business-school", labelKey: "simulator.advanced.options.institutionType.business-school", score: params.questions.institutionType.scores["business-school"] },
        { value: "engineering-school", labelKey: "simulator.advanced.options.institutionType.engineering-school", score: params.questions.institutionType.scores["engineering-school"] },
        { value: "art-school", labelKey: "simulator.advanced.options.institutionType.art-school", score: params.questions.institutionType.scores["art-school"] },
        { value: "haute-ecole", labelKey: "simulator.advanced.options.institutionType.haute-ecole", score: params.questions.institutionType.scores.university },
        { value: "epfl-ethz", labelKey: "simulator.advanced.options.institutionType.epfl-ethz", score: params.questions.institutionType.scores["engineering-school"] },
        { value: "hes", labelKey: "simulator.advanced.options.institutionType.hes", score: params.questions.institutionType.scores.university },
        { value: "fp-superior", labelKey: "simulator.advanced.options.institutionType.fp-superior", score: params.questions.institutionType.scores.university },
        { value: "college", labelKey: "simulator.advanced.options.institutionType.college", score: params.questions.institutionType.scores.university },
        { value: "other", labelKey: "simulator.advanced.options.institutionType.other", score: params.questions.institutionType.scores.other },
      ],
    },
    {
      id: "studyLevel",
      type: "select",
      labelKey: "simulator.advanced.student.levelTitle",
      required: true,
      options: [
        { value: "l1", labelKey: "simulator.advanced.options.studyLevel.l1", score: params.questions.studyLevel.scores.l1 },
        { value: "l2", labelKey: "simulator.advanced.options.studyLevel.l2", score: params.questions.studyLevel.scores.l2 },
        { value: "l3", labelKey: "simulator.advanced.options.studyLevel.l3", score: params.questions.studyLevel.scores.l3 },
        { value: "m1", labelKey: "simulator.advanced.options.studyLevel.m1", score: params.questions.studyLevel.scores.m1 },
        { value: "m2", labelKey: "simulator.advanced.options.studyLevel.m2", score: params.questions.studyLevel.scores.m2 },
        { value: "bac1", labelKey: "simulator.advanced.options.studyLevel.bac1", score: params.questions.studyLevel.scores.l1 },
        { value: "bac2", labelKey: "simulator.advanced.options.studyLevel.bac2", score: params.questions.studyLevel.scores.l2 },
        { value: "bac3", labelKey: "simulator.advanced.options.studyLevel.bac3", score: params.questions.studyLevel.scores.l3 },
        { value: "master1", labelKey: "simulator.advanced.options.studyLevel.master1", score: params.questions.studyLevel.scores.m1 },
        { value: "master2", labelKey: "simulator.advanced.options.studyLevel.master2", score: params.questions.studyLevel.scores.m2 },
        { value: "bachelor1", labelKey: "simulator.advanced.options.studyLevel.bachelor1", score: params.questions.studyLevel.scores.l1 },
        { value: "bachelor2", labelKey: "simulator.advanced.options.studyLevel.bachelor2", score: params.questions.studyLevel.scores.l2 },
        { value: "bachelor3", labelKey: "simulator.advanced.options.studyLevel.bachelor3", score: params.questions.studyLevel.scores.l3 },
        { value: "grado1", labelKey: "simulator.advanced.options.studyLevel.grado1", score: params.questions.studyLevel.scores.l1 },
        { value: "grado2", labelKey: "simulator.advanced.options.studyLevel.grado2", score: params.questions.studyLevel.scores.l2 },
        { value: "grado3", labelKey: "simulator.advanced.options.studyLevel.grado3", score: params.questions.studyLevel.scores.l3 },
        { value: "grado4", labelKey: "simulator.advanced.options.studyLevel.grado4", score: params.questions.studyLevel.scores.m1 },
        { value: "year1", labelKey: "simulator.advanced.options.studyLevel.year1", score: params.questions.studyLevel.scores.l1 },
        { value: "year2", labelKey: "simulator.advanced.options.studyLevel.year2", score: params.questions.studyLevel.scores.l2 },
        { value: "year3", labelKey: "simulator.advanced.options.studyLevel.year3", score: params.questions.studyLevel.scores.l3 },
        { value: "year4", labelKey: "simulator.advanced.options.studyLevel.year4", score: params.questions.studyLevel.scores.m1 },
        { value: "master", labelKey: "simulator.advanced.options.studyLevel.master", score: params.questions.studyLevel.scores.m2 },
        { value: "doctorate", labelKey: "simulator.advanced.options.studyLevel.doctorate", score: params.questions.studyLevel.scores.doctorate },
      ],
    },
    {
      id: "hasPartTimeJob",
      type: "boolean",
      labelKey: "simulator.advanced.student.jobTitle",
      subtitleKey: "simulator.advanced.student.jobSubtitle",
      required: true,
    },
    {
      id: "partTimeIncome",
      type: "slider",
      labelKey: "simulator.advanced.student.monthlyIncome",
      required: false,
      min: params.questions.partTimeIncome.min,
      max: params.questions.partTimeIncome.max,
      step: params.questions.partTimeIncome.step,
      unit: "euros",
      showIf: (formData) => {
        if ("hasPartTimeJob" in formData) {
          return formData.hasPartTimeJob === true;
        }
        return false;
      },
    },
    {
      id: "hasGuarantor",
      type: "select",
      labelKey: "simulator.advanced.student.guarantorTitle",
      subtitleKey: "simulator.advanced.student.guarantorSubtitle",
      required: true,
      options: [
        {
          value: "yes",
          labelKey: "simulator.advanced.student.guarantorYes",
          score: params.questions.hasGuarantor.scores.yes,
        },
        {
          value: "no",
          labelKey: "simulator.advanced.student.guarantorNo",
          score: params.questions.hasGuarantor.scores.no,
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
        fieldId: "hasPartTimeJob",
        weight: params.scoring.weights.hasPartTimeJob,
        scoreFn: (value, formData) => {
          if (value === true) {
            if ("partTimeIncome" in formData) {
              const income = formData.partTimeIncome || 0;
              const ranges = params.scoring.incomeRanges;
              if (income >= ranges.high.min) return ranges.high.score;
              if (income >= ranges.medium.min) return ranges.medium.score;
              return ranges.default;
            }
            return 80;
          }
          return params.scoring.noJobScore;
        },
      },
      {
        fieldId: "hasGuarantor",
        weight: params.scoring.weights.hasGuarantor,
        scoreFn: (value) => {
          return value === "yes"
            ? params.scoring.guarantorYesScore
            : params.scoring.guarantorNoScore;
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
        check: (formData) => {
          if ("hasGuarantor" in formData) {
            return formData.hasGuarantor === "yes";
          }
          return false;
        },
        time: params.responseTime.fastTrack,
      },
    ],
  },

  approvalProbability: params.approvalProbability as Record<"A" | "B" | "C" | "D", "high" | "medium" | "low">,
};

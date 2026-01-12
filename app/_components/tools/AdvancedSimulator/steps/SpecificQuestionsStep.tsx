"use client";

import { useRef, useEffect, useMemo } from "react";
import { gsap } from "gsap";
import { SimulatorFormData, CountryCode } from "../types";
import {
  getVisibleQuestions,
  areRequiredFieldsFilled,
  QuestionConfig,
} from "../products";

interface SpecificQuestionsStepProps {
  formData: SimulatorFormData;
  onUpdate: (updates: Partial<SimulatorFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  t: (key: string) => string;
  locale: string;
}

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

function QuestionSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10 p-6 bg-foreground/[0.02] rounded-2xl border border-foreground/5">
      <h3 className="font-serif text-xl mb-1">{title}</h3>
      {subtitle && (
        <p className="text-sm text-muted-foreground mb-5">{subtitle}</p>
      )}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
  fullWidth = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`${fullWidth ? "w-full" : ""} p-5 text-left rounded-2xl border-2 transition-all duration-300 ${
        selected
          ? "border-accent bg-accent/10 text-foreground shadow-lg shadow-accent/10"
          : "border-foreground/10 hover:border-accent/40 hover:bg-foreground/[0.03] bg-background"
      }`}
    >
      {children}
    </button>
  );
}

// ============================================================
// QUESTION RENDERERS
// ============================================================

interface QuestionRendererProps {
  question: QuestionConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  t: (key: string) => string;
  formData: SimulatorFormData;
}

function NumberQuestion({ question, value, onChange, t }: QuestionRendererProps) {
  return (
    <QuestionSection
      title={t(question.labelKey)}
      subtitle={question.subtitleKey ? t(question.subtitleKey) : undefined}
    >
      <div className="flex items-center gap-4">
        <input
          type="number"
          min={question.min}
          max={question.max}
          step={question.step || 1}
          value={(value as number) || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={String(question.min || 0)}
          className="w-36 px-5 py-4 text-3xl font-serif text-center bg-background border-2 border-foreground/10 rounded-2xl focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 tabular-nums transition-all duration-300"
        />
        {question.unit && (
          <span className="text-lg text-muted-foreground font-serif">
            {question.unit === "years"
              ? t("simulator.advanced.questions.yearsOld")
              : question.unit === "euros"
              ? "€"
              : question.unit}
          </span>
        )}
      </div>
    </QuestionSection>
  );
}

function SliderQuestion({ question, value, onChange, t }: QuestionRendererProps) {
  const numValue = (value as number) || question.min || 0;
  const min = question.min || 0;
  const max = question.max || 100;
  const step = question.step || 1;

  const formatValue = (val: number) => {
    if (question.unit === "euros") {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
      }).format(val);
    }
    return String(val);
  };

  return (
    <QuestionSection
      title={t(question.labelKey)}
      subtitle={question.subtitleKey ? t(question.subtitleKey) : undefined}
    >
      <div className="space-y-6">
        <div className="flex justify-center">
          <span className="text-4xl font-serif tabular-nums text-accent">{formatValue(numValue)}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 bg-foreground/10 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-7
            [&::-webkit-slider-thumb]:h-7
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-accent
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-accent/30
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110"
        />
        <div className="flex justify-between text-sm text-muted-foreground font-serif">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      </div>
    </QuestionSection>
  );
}

function SelectQuestion({ question, value, onChange, t }: QuestionRendererProps) {
  const options = question.options || [];
  const gridCols = options.length <= 2 ? "grid-cols-2" : options.length <= 4 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3";

  return (
    <QuestionSection
      title={t(question.labelKey)}
      subtitle={question.subtitleKey ? t(question.subtitleKey) : undefined}
    >
      <div className={`grid ${gridCols} gap-4`}>
        {options.map((option) => (
          <OptionButton
            key={option.value}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
          >
            <div>
              <span className="font-serif text-base">{t(option.labelKey)}</span>
              {option.descriptionKey && (
                <span className="text-sm text-muted-foreground block mt-2">
                  {t(option.descriptionKey)}
                </span>
              )}
            </div>
          </OptionButton>
        ))}
      </div>
    </QuestionSection>
  );
}

function BooleanQuestion({ question, value, onChange, t }: QuestionRendererProps) {
  return (
    <QuestionSection
      title={t(question.labelKey)}
      subtitle={question.subtitleKey ? t(question.subtitleKey) : undefined}
    >
      <div className="flex gap-3">
        <OptionButton
          selected={value === true}
          onClick={() => onChange(true)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium">{t("simulator.advanced.yes")}</span>
          </div>
        </OptionButton>
        <OptionButton
          selected={value === false}
          onClick={() => onChange(false)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="font-medium">{t("simulator.advanced.no")}</span>
          </div>
        </OptionButton>
      </div>
    </QuestionSection>
  );
}

function DateQuestion({ question, value, onChange, t }: QuestionRendererProps) {
  const dateValue = value instanceof Date ? value.toISOString().split("T")[0] : "";

  return (
    <QuestionSection
      title={t(question.labelKey)}
      subtitle={question.subtitleKey ? t(question.subtitleKey) : undefined}
    >
      <input
        type="date"
        value={dateValue}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
        className="px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-accent"
      />
    </QuestionSection>
  );
}

// Main question renderer
function DynamicQuestion(props: QuestionRendererProps) {
  const { question } = props;

  switch (question.type) {
    case "number":
      return <NumberQuestion {...props} />;
    case "slider":
      return <SliderQuestion {...props} />;
    case "select":
    case "multiselect":
      return <SelectQuestion {...props} />;
    case "boolean":
      return <BooleanQuestion {...props} />;
    case "date":
      return <DateQuestion {...props} />;
    default:
      return null;
  }
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SpecificQuestionsStep({
  formData,
  onUpdate,
  onNext,
  onBack,
  t,
}: SpecificQuestionsStepProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Get visible questions for the current product and country
  const questions = useMemo(() => {
    if (!formData.creditType || !formData.country) return [];
    return getVisibleQuestions(
      formData.creditType,
      formData.country as CountryCode,
      formData
    );
  }, [formData]);

  // Check if form is valid
  const isValid = useMemo(() => {
    if (!formData.creditType || !formData.country) return false;
    return areRequiredFieldsFilled(
      formData.creditType,
      formData.country as CountryCode,
      formData
    );
  }, [formData]);

  // Get missing required fields
  const missingFields = useMemo(() => {
    return questions
      .filter((q) => q.required)
      .filter((q) => {
        const value = (formData as unknown as Record<string, unknown>)[q.id];
        return value === undefined || value === null || value === "";
      })
      .map((q) => ({
        id: q.id,
        label: t(q.labelKey),
      }));
  }, [questions, formData, t]);

  // Scroll to first missing field
  const scrollToMissingField = () => {
    if (missingFields.length > 0) {
      const firstMissing = missingFields[0];
      const element = document.getElementById(`question-${firstMissing.id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add highlight effect
        element.classList.add("ring-2", "ring-accent", "ring-offset-2");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-accent", "ring-offset-2");
        }, 2000);
      }
    }
  };

  // Animate on mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, []);

  // Handle value change
  const handleChange = (questionId: string, value: unknown) => {
    onUpdate({ [questionId]: value } as Partial<SimulatorFormData>);
  };

  // Get current value for a question
  const getValue = (questionId: string): unknown => {
    return (formData as unknown as Record<string, unknown>)[questionId];
  };

  return (
    <div ref={containerRef} className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">
          {formData.creditType && t(`simulator.products.${formData.creditType.replace("-", "")}`)}
        </p>
        <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">
          {t("simulator.advanced.step3Title")}
        </h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          {t("simulator.advanced.step3Subtitle")}
        </p>
      </div>

      {/* Dynamic Questions */}
      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} id={`question-${question.id}`} className="transition-all duration-300 rounded-2xl">
            <DynamicQuestion
              question={question}
              value={getValue(question.id)}
              onChange={(value) => handleChange(question.id, value)}
              t={t}
              formData={formData}
            />
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-12">
        <button
          onClick={onBack}
          className="flex-1 py-5 border-2 border-foreground/20 text-foreground font-serif text-lg rounded-2xl hover:border-foreground/40 hover:bg-foreground/[0.02] transition-all duration-300"
        >
          ← {t("simulator.advanced.back")}
        </button>
        <button
          onClick={isValid ? onNext : scrollToMissingField}
          className={`flex-1 py-5 font-serif text-lg rounded-2xl transition-all duration-300 ${
            isValid
              ? "bg-accent text-white hover:bg-dark-gold shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30"
              : "bg-foreground/10 text-muted-foreground hover:bg-foreground/15 cursor-pointer"
          }`}
        >
          {t("simulator.advanced.seeResults")} →
        </button>
      </div>

      {/* Validation hint - clickable to scroll to missing fields */}
      {!isValid && missingFields.length > 0 && (
        <button
          onClick={scrollToMissingField}
          className="w-full mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30 rounded-xl text-left hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors group"
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                {missingFields.length === 1
                  ? t("simulator.advanced.missingFieldsOne")
                  : t("simulator.advanced.missingFieldsMany").replace("{count}", String(missingFields.length))}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                {missingFields.slice(0, 3).map(f => f.label).join(", ")}
                {missingFields.length > 3 && ` (+${missingFields.length - 3})`}
              </p>
              <p className="text-xs text-orange-500 dark:text-orange-500 mt-2 group-hover:underline">
                {t("simulator.advanced.clickToSee")} →
              </p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

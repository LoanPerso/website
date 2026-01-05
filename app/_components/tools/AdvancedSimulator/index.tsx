"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useTranslations, useLocale } from "next-intl";
import { CountrySelectStep } from "./steps/CountrySelectStep";
import { CreditTypeCarousel } from "./steps/CreditTypeCarousel";
import { AmountDurationStep } from "./steps/AmountDurationStep";
import { SpecificQuestionsStep } from "./steps/SpecificQuestionsStep";
import { ResultsStep } from "./steps/ResultsStep";
import { useSimulatorState } from "./hooks/useSimulatorState";
import { SimulatorStep, CountryCode } from "./types";
import { getAvailableProducts } from "./countries";

interface AdvancedSimulatorProps {
  className?: string;
}

// Progress indicator component
function ProgressIndicator({
  currentStep,
  t,
}: {
  currentStep: SimulatorStep;
  t: (key: string) => string;
}) {
  const steps: { id: SimulatorStep; label: string }[] = [
    { id: "country", label: t("simulator.advanced.progress.country") },
    { id: "credit-type", label: t("simulator.advanced.progress.type") },
    { id: "amount-duration", label: t("simulator.advanced.progress.amount") },
    { id: "specific-questions", label: t("simulator.advanced.progress.profile") },
    { id: "results", label: t("simulator.advanced.progress.result") },
  ];

  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="mb-10">
      {/* Step labels */}
      <div className="hidden md:flex justify-between mb-3">
        {steps.map((step, i) => (
          <span
            key={step.id}
            className={`text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${
              i <= currentIndex ? "text-accent" : "text-muted-foreground/50"
            }`}
          >
            {step.label}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-foreground/10 relative rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-accent transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Mobile: current step indicator */}
      <div className="md:hidden text-center mt-3">
        <span className="text-xs text-muted-foreground">
          {t("simulator.advanced.step")} {currentIndex + 1} / {steps.length}
        </span>
      </div>
    </div>
  );
}

export function AdvancedSimulator({ className = "" }: AdvancedSimulatorProps) {
  const t = useTranslations("tools");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    currentStep,
    formData,
    productConfig,
    countryConfig,
    isTransitioning,
    updateFormData,
    selectCountry,
    selectCreditType,
    nextStep,
    prevStep,
    reset,
    calculateResult,
    setCustomRate,
  } = useSimulatorState();

  // Animate step transitions - faster
  useEffect(() => {
    if (contentRef.current && isTransitioning) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.15,
        ease: "power2.in",
      });
    } else if (contentRef.current && !isTransitioning) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.2, ease: "power3.out" }
      );
    }
  }, [isTransitioning, currentStep]);

  // Initial animation - faster
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power3.out" }
      );
    }
  }, []);

  const handleCountrySelect = (country: CountryCode) => {
    selectCountry(country);
    setTimeout(nextStep, 100);
  };

  const handleCreditTypeSelect = (type: Parameters<typeof selectCreditType>[0]) => {
    selectCreditType(type);
    setTimeout(nextStep, 100);
  };

  // Get available products for the selected country
  const availableProducts = formData.country
    ? getAvailableProducts(formData.country)
    : [];

  const renderStep = () => {
    switch (currentStep) {
      case "country":
        return (
          <CountrySelectStep
            onSelect={handleCountrySelect}
            t={t}
          />
        );

      case "credit-type":
        return (
          <CreditTypeCarousel
            onSelect={handleCreditTypeSelect}
            availableProducts={availableProducts}
            countryConfig={countryConfig}
            t={t}
          />
        );

      case "amount-duration":
        if (!productConfig || !formData.creditType) return null;
        return (
          <AmountDurationStep
            creditType={formData.creditType}
            config={productConfig}
            amount={formData.amount}
            duration={formData.duration}
            onAmountChange={(amount) => updateFormData({ amount })}
            onDurationChange={(duration) => updateFormData({ duration })}
            onNext={nextStep}
            onBack={prevStep}
            t={t}
            locale={locale}
          />
        );

      case "specific-questions":
        return (
          <SpecificQuestionsStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
            t={t}
            locale={locale}
          />
        );

      case "results":
        return (
          <ResultsStep
            formData={formData}
            result={calculateResult()}
            onRestart={reset}
            onRecalculate={setCustomRate}
            t={t}
            locale={locale}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Progress indicator */}
        <ProgressIndicator currentStep={currentStep} t={t} />

        {/* Step content */}
        <div ref={contentRef} className="min-h-[500px]">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

// Also export a simpler version toggle component
export function SimulatorModeToggle({
  mode,
  onModeChange,
  t,
}: {
  mode: "simple" | "advanced";
  onModeChange: (mode: "simple" | "advanced") => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex bg-foreground/5 rounded-full p-1">
        <button
          onClick={() => onModeChange("simple")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            mode === "simple"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("simulator.modeSimple")}
        </button>
        <button
          onClick={() => onModeChange("advanced")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            mode === "advanced"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("simulator.modeAdvanced")}
        </button>
      </div>
    </div>
  );
}

// Re-export types
export * from "./types";

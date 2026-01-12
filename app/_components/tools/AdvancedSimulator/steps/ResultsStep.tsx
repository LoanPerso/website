"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { SimulatorFormData, SimulationResult, CreditType, ScoreFactor, FinancialAnalysis, CountryCode } from "../types";
import { PRODUCTS } from "../config";
import { getProductConfig } from "../products";
import { getCountryConfig } from "../countries";

interface ResultsStepProps {
  formData: SimulatorFormData;
  result: SimulationResult | null;
  onRestart: () => void;
  onRecalculate?: (customRate: number | null) => void;
  onUpdateFormData?: (updates: Partial<SimulatorFormData>) => void;
  t: (key: string) => string;
  locale: string;
}

// Animated counter component
function AnimatedNumber({
  value,
  duration = 1.5,
  prefix = "",
  suffix = "",
  decimals = 0,
  animateOnChange = false,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  animateOnChange?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const hasAnimatedRef = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // If animateOnChange is false and we've already animated, just update the value directly
    if (!animateOnChange && hasAnimatedRef.current) {
      // Smooth transition for value changes (not from 0)
      const obj = { value: prevValueRef.current };
      gsap.to(obj, {
        value,
        duration: 0.3,
        ease: "power2.out",
        onUpdate: () => setDisplayValue(obj.value),
      });
      prevValueRef.current = value;
      return;
    }

    // Initial animation from 0
    const obj = { value: 0 };
    gsap.to(obj, {
      value,
      duration,
      ease: "power3.out",
      onUpdate: () => setDisplayValue(obj.value),
      onComplete: () => {
        hasAnimatedRef.current = true;
        prevValueRef.current = value;
      },
    });
  }, [value, duration, animateOnChange]);

  return (
    <span ref={ref}>
      {prefix}
      {displayValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
      {suffix}
    </span>
  );
}

// Risk indicator component - compact
function RiskIndicator({
  category,
  t,
}: {
  category: "A" | "B" | "C" | "D";
  t: (key: string) => string;
}) {
  const categories = ["A", "B", "C", "D"];
  const colors = {
    A: "bg-green-500",
    B: "bg-green-400",
    C: "bg-accent",
    D: "bg-accent/70",
  };
  const labels = {
    A: t("simulator.advanced.results.riskLow"),
    B: t("simulator.advanced.results.riskModerate"),
    C: t("simulator.advanced.results.riskMedium"),
    D: t("simulator.advanced.results.riskHigh"),
  };

  return (
    <div className="flex items-center gap-1.5">
      {categories.map((cat) => (
        <div
          key={cat}
          className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
            cat === category
              ? `${colors[cat as keyof typeof colors]} text-white scale-110`
              : "bg-foreground/10 text-muted-foreground"
          }`}
        >
          {cat}
        </div>
      ))}
      <span className="text-xs ml-1.5">{labels[category]}</span>
    </div>
  );
}

// Rate Info Modal component
function RateInfoModal({
  isOpen,
  onClose,
  minRate,
  maxRate,
  currentRate,
  customRate,
  onCustomRateChange,
  onApplyRate,
  onResetRate,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  minRate: number;
  maxRate: number;
  currentRate: number;
  customRate: number;
  onCustomRateChange: (rate: number) => void;
  onApplyRate: () => void;
  onResetRate: () => void;
  t: (key: string) => string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background border border-foreground/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h3 className="font-serif text-xl font-medium mb-2">
          {t("simulator.advanced.rateInfo.title")}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6">
          {t("simulator.advanced.rateInfo.description")}
        </p>

        {/* Rate range info */}
        <div className="bg-foreground/[0.02] border border-foreground/10 rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            {t("simulator.advanced.rateInfo.rateRange")}
          </p>
          <div className="flex items-center gap-2 font-serif text-2xl">
            <span className="text-green-600">{minRate}%</span>
            <span className="text-muted-foreground text-base">{t("simulator.advanced.rateInfo.and")}</span>
            <span className="text-orange-500">{maxRate}%</span>
          </div>
          <p className="text-sm mt-2">
            <span className="text-muted-foreground">{t("simulator.advanced.rateInfo.yourRate")}: </span>
            <span className="font-medium">{currentRate.toFixed(1)}%</span>
          </p>
        </div>

        {/* Custom rate slider */}
        <div className="mb-6">
          <label className="text-sm font-medium block mb-3">
            {t("simulator.advanced.rateInfo.customRate")}
          </label>
          <div className="space-y-3">
            <input
              type="range"
              min={minRate}
              max={maxRate}
              step={0.1}
              value={customRate}
              onChange={(e) => onCustomRateChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{minRate}%</span>
              <span className="font-medium text-foreground text-base tabular-nums">{customRate.toFixed(1)}%</span>
              <span>{maxRate}%</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onResetRate}
            className="flex-1 py-3 border border-foreground/20 rounded-xl text-sm hover:bg-foreground/5 transition-colors"
          >
            {t("simulator.advanced.rateInfo.resetRate")}
          </button>
          <button
            onClick={onApplyRate}
            className="flex-1 py-3 bg-accent text-white rounded-xl text-sm font-medium hover:bg-dark-gold transition-colors"
          >
            {t("simulator.advanced.rateInfo.applyCustom")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Approval probability indicator - compact
function ApprovalIndicator({
  probability,
  t,
}: {
  probability: "high" | "medium" | "low";
  t: (key: string) => string;
}) {
  const config = {
    high: {
      color: "text-green-600",
      bgColor: "bg-green-600",
      label: t("simulator.advanced.results.approvalHigh"),
      width: "95%",
    },
    medium: {
      color: "text-green-500",
      bgColor: "bg-green-500",
      label: t("simulator.advanced.results.approvalMedium"),
      width: "85%",
    },
    low: {
      color: "text-accent",
      bgColor: "bg-accent",
      label: t("simulator.advanced.results.approvalLow"),
      width: "75%",
    },
  };

  const c = config[probability];

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-muted-foreground">
          {t("simulator.advanced.results.approvalChance")}
        </span>
        <span className={`text-xs font-medium ${c.color}`}>{c.label}</span>
      </div>
      <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${c.bgColor} rounded-full transition-all duration-500`}
          style={{ width: c.width }}
        />
      </div>
    </div>
  );
}

// Score factor explanation component
function ScoreFactorBar({
  factor,
  t,
}: {
  factor: ScoreFactor;
  t: (key: string) => string;
}) {
  const impactColors = {
    positive: "bg-green-500",
    neutral: "bg-yellow-500",
    negative: "bg-orange-500",
  };

  // Translate the factor ID to a label
  const label = t(`simulator.advanced.scoreFactors.${factor.id}`) || factor.id;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 truncate text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${impactColors[factor.impact]} rounded-full transition-all duration-500`}
          style={{ width: `${factor.score}%` }}
        />
      </div>
      <span className="w-8 text-right tabular-nums">{factor.score}</span>
    </div>
  );
}

// Financial analysis component
function FinancialAnalysisCard({
  analysis,
  t,
  locale,
}: {
  analysis: FinancialAnalysis;
  t: (key: string) => string;
  locale: string;
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{t("simulator.advanced.financial.remainingIncome")}</span>
        <span className={`font-medium ${analysis.isRemainingIncomeTooLow ? "text-orange-500" : "text-green-600"}`}>
          {formatCurrency(analysis.remainingIncome)}
        </span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{t("simulator.advanced.financial.debtRatio")}</span>
        <span className={`font-medium ${analysis.debtRatio > 0.4 ? "text-orange-500" : "text-green-600"}`}>
          {formatPercent(analysis.debtRatio)}
        </span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{t("simulator.advanced.financial.maxRecommended")}</span>
        <span className="font-medium">{formatCurrency(analysis.maxRecommendedAmount)}</span>
      </div>
    </div>
  );
}

// Fallback translations for warnings and recommendations
const FALLBACK_TRANSLATIONS: Record<string, Record<string, string>> = {
  warnings: {
    amountTooHigh: "Le montant demandé dépasse le maximum recommandé ({max} €).",
    remainingIncomeLow: "Reste à vivre inférieur au minimum ({min} €/mois).",
    debtRatioHigh: "Taux d'endettement ({ratio}%) supérieur au seuil de {max}%.",
  },
  recommendations: {
    title: "Nos recommandations",
    reduceAmount: "Envisagez un montant inférieur à {amount} €",
    longerDuration: "Allongez la durée pour réduire les mensualités",
    improveCreditHistory: "Régularisez les éventuels incidents bancaires",
    reduceExpenses: "Réduisez vos charges fixes si possible",
  },
};

// Helper to parse and translate warnings/recommendations
function translateWarningOrRec(code: string, t: (key: string) => string, prefix: string): string {
  const parts = code.split(":");
  const key = parts[0];
  const translationKey = `simulator.advanced.${prefix}.${key}`;
  let text = t(translationKey);

  // If translation not found, use fallback
  if (text === translationKey || text.startsWith("tools.") || text.includes("simulator.advanced")) {
    text = FALLBACK_TRANSLATIONS[prefix]?.[key] || key;
  }

  // Replace placeholders based on warning type
  switch (key) {
    case "amountTooHigh":
    case "reduceAmount":
      if (parts[1]) text = text.replace("{max}", parts[1]).replace("{amount}", parts[1]);
      break;
    case "remainingIncomeLow":
      if (parts[1]) text = text.replace("{min}", parts[1]);
      break;
    case "debtRatioHigh":
      if (parts[1]) text = text.replace("{ratio}", parts[1]);
      if (parts[2]) text = text.replace("{max}", parts[2]);
      break;
  }

  return text;
}

// Warnings component
function WarningsCard({
  warnings,
  recommendations,
  t,
}: {
  warnings: string[];
  recommendations: string[];
  t: (key: string) => string;
}) {
  if (warnings.length === 0 && recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      {warnings.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-1">
              {warnings.map((warning, i) => (
                <p key={i} className="text-xs text-orange-700 dark:text-orange-300">
                  {translateWarningOrRec(warning, t, "warnings")}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
      {recommendations.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1.5">
            {t("simulator.advanced.recommendations.title")}
          </p>
          <ul className="space-y-1">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-1.5">
                <span className="text-blue-500">•</span>
                {translateWarningOrRec(rec, t, "recommendations")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Quick adjuster component for amount and duration
function QuickAdjuster({
  formData,
  onUpdate,
  t,
  locale,
}: {
  formData: SimulatorFormData;
  onUpdate: (updates: Partial<SimulatorFormData>) => void;
  t: (key: string) => string;
  locale: string;
}) {
  if (!formData.creditType || !formData.country) return null;

  const countryConfig = getCountryConfig(formData.country as CountryCode);
  const productLimits = countryConfig.products[formData.creditType];

  if (!productLimits) return null;

  const { minAmount, maxAmount, minDuration, maxDuration } = productLimits;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-foreground/[0.02] border border-foreground/10 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          {t("simulator.advanced.results.adjustSimulation")}
        </h3>
      </div>

      <div className="space-y-4">
        {/* Amount slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-muted-foreground">
              {t("simulator.amountLabel")}
            </label>
            <span className="text-sm font-medium tabular-nums">
              {formatCurrency(formData.amount)}
            </span>
          </div>
          <input
            type="range"
            min={minAmount}
            max={maxAmount}
            step={minAmount < 1000 ? 50 : 500}
            value={formData.amount}
            onChange={(e) => onUpdate({ amount: Number(e.target.value) })}
            className="w-full h-2 bg-foreground/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-accent
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-accent
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>{formatCurrency(minAmount)}</span>
            <span>{formatCurrency(maxAmount)}</span>
          </div>
        </div>

        {/* Duration slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-muted-foreground">
              {t("simulator.durationLabel")}
            </label>
            <span className="text-sm font-medium tabular-nums">
              {formData.duration} {t("simulator.months")}
            </span>
          </div>
          <input
            type="range"
            min={minDuration}
            max={maxDuration}
            step={1}
            value={formData.duration}
            onChange={(e) => onUpdate({ duration: Number(e.target.value) })}
            className="w-full h-2 bg-foreground/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-accent
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-accent
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>{minDuration} {t("simulator.months")}</span>
            <span>{maxDuration} {t("simulator.months")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResultsStep({
  formData,
  result,
  onRestart,
  onRecalculate,
  onUpdateFormData,
  t,
  locale,
}: ResultsStepProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [customRate, setCustomRate] = useState(result?.effectiveRate || 0);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Get product rate info
  const productConfig = formData.creditType ? getProductConfig(formData.creditType) : null;
  const minRate = productConfig?.calculation.minRate || 0;
  const maxRate = productConfig?.calculation.maxRate || 20;

  // Update customRate when result changes (but don't trigger re-animation)
  useEffect(() => {
    if (result?.effectiveRate) {
      setCustomRate(result.effectiveRate);
    }
  }, [result?.effectiveRate]);

  // Handle applying custom rate
  const handleApplyCustomRate = () => {
    if (onRecalculate) {
      onRecalculate(customRate);
    }
    setShowRateModal(false);
  };

  // Handle resetting to original rate
  const handleResetRate = () => {
    if (onRecalculate) {
      onRecalculate(null);
    }
    setShowRateModal(false);
  };

  // Smooth scroll to results on mount
  useEffect(() => {
    if (containerRef.current) {
      // Small delay to ensure the component is rendered
      const scrollTimeout = setTimeout(() => {
        containerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);

      return () => clearTimeout(scrollTimeout);
    }
  }, []);

  // Initial animation - only run once on mount
  useEffect(() => {
    if (hasAnimated) return;

    const tl = gsap.timeline({
      onComplete: () => setHasAnimated(true),
    });

    if (containerRef.current) {
      tl.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }

    if (cardRef.current) {
      tl.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power3.out" },
        "-=0.3"
      );
    }

    // Show details after main animation
    tl.call(() => setShowDetails(true));

    if (detailsRef.current) {
      tl.fromTo(
        detailsRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power3.out" },
        "-=0.2"
      );
    }
  }, [hasAnimated]);

  if (!result || !formData.creditType) {
    return null;
  }

  const config = PRODUCTS[formData.creditType];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Generate profile summary
  const getProfileSummary = () => {
    const items: string[] = [];

    if (formData.age) {
      items.push(`${formData.age} ${t("simulator.advanced.questions.yearsOld")}`);
    }

    if (formData.creditType === "student" && "institutionType" in formData) {
      if (formData.hasGuarantor) {
        items.push(t("simulator.advanced.results.withGuarantor"));
      }
      if (formData.hasPartTimeJob) {
        items.push(t("simulator.advanced.results.withJob"));
      }
    }

    if (
      (formData.creditType === "micro-credit" || formData.creditType === "consumer") &&
      "employmentStatus" in formData
    ) {
      items.push(t(`simulator.advanced.employment.${formData.employmentStatus}`));
    }

    if (formData.creditType === "professional" && "businessType" in formData) {
      items.push(t(`simulator.advanced.pro.${formData.businessType}`));
      if (formData.yearsInBusiness && formData.yearsInBusiness >= 2) {
        items.push(t("simulator.advanced.results.established"));
      }
    }

    return items;
  };

  const profileItems = getProfileSummary();

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto scroll-mt-24">
      {/* Success header - compact */}
      <div className="text-center mb-4 md:mb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent/10 border border-accent/30 mb-2">
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="font-serif text-2xl md:text-3xl font-light mb-1">
          {t("simulator.advanced.results.title")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("simulator.advanced.results.subtitle")}
        </p>
      </div>

      {/* Main result card - compact */}
      <div
        ref={cardRef}
        className="bg-foreground text-background rounded-xl md:rounded-2xl p-5 md:p-6 mb-4 md:mb-6 relative overflow-hidden"
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at top right, ${config.color}40 0%, transparent 60%)`,
          }}
        />

        <div className="relative">
          {/* Monthly payment - Hero number */}
          <div className="text-center mb-4 md:mb-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-background/60 mb-1">
              {t("simulator.monthlyPayment")}
            </p>
            <p className="font-serif text-4xl md:text-5xl font-light tabular-nums">
              <AnimatedNumber
                value={result.monthlyPayment}
                suffix=" €"
                decimals={0}
                duration={1}
              />
            </p>
            <p className="text-background/60 text-sm mt-1">
              {t("simulator.advanced.results.perMonth")}
            </p>
          </div>

          {/* Key metrics grid */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-background/20">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-background/50 mb-0.5">
                {t("simulator.totalCost")}
              </p>
              <p className="font-serif text-lg md:text-xl tabular-nums">
                <AnimatedNumber
                  value={result.totalCost}
                  suffix=" €"
                  decimals={0}
                  duration={1}
                />
              </p>
            </div>
            <div className="text-center border-x border-background/10">
              <p className="text-[10px] uppercase tracking-wider text-background/50 mb-0.5">
                {t("simulator.interestCost")}
              </p>
              <p className="font-serif text-lg md:text-xl tabular-nums">
                <AnimatedNumber
                  value={result.totalInterest}
                  suffix=" €"
                  decimals={0}
                  duration={1}
                />
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-background/50 mb-0.5 flex items-center justify-center gap-1">
                TAEG
                <button
                  onClick={() => setShowRateModal(true)}
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-background/20 hover:bg-background/30 transition-colors"
                  title={t("simulator.advanced.rateInfo.title")}
                >
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                </button>
              </p>
              <p className="font-serif text-lg md:text-xl tabular-nums">
                {result.effectiveRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Adjuster for amount and duration */}
      {onUpdateFormData && (
        <QuickAdjuster
          formData={formData}
          onUpdate={onUpdateFormData}
          t={t}
          locale={locale}
        />
      )}

      {/* Details section - 2 columns on desktop */}
      <div ref={detailsRef} className="grid md:grid-cols-2 gap-3 md:gap-4">
        {/* Left column */}
        <div className="space-y-3 md:space-y-4">
          {/* Loan summary */}
          <div className="bg-foreground/[0.02] border border-foreground/10 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">{t("simulator.advanced.results.summary")}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("simulator.advanced.results.amount")}</span>
                <span className="font-medium">{formatCurrency(formData.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("simulator.advanced.results.duration")}</span>
                <span className="font-medium">
                  {formData.duration} {t("simulator.months")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("simulator.advanced.results.type")}</span>
                <span className="font-medium">
                  {t(`simulator.products.${formData.creditType.replace("-", "")}`)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("simulator.advanced.results.response")}</span>
                <span className="font-medium text-accent">{result.estimatedResponseTime}</span>
              </div>
            </div>
          </div>

          {/* Risk assessment */}
          <div className="bg-foreground/[0.02] border border-foreground/10 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">{t("simulator.advanced.results.assessment")}</h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground block mb-1.5">
                  {t("simulator.advanced.results.riskCategory")}
                </span>
                <RiskIndicator category={result.riskCategory} t={t} />
              </div>
              <ApprovalIndicator probability={result.approvalProbability} t={t} />
            </div>
          </div>

          {/* Financial Analysis */}
          {result.financialAnalysis && result.financialAnalysis.monthlyIncome > 0 && (
            <div className="bg-foreground/[0.02] border border-foreground/10 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">{t("simulator.advanced.financial.title")}</h3>
              <FinancialAnalysisCard analysis={result.financialAnalysis} t={t} locale={locale} />
            </div>
          )}

          {/* Profile summary */}
          {profileItems.length > 0 && (
            <div className="bg-foreground/[0.02] border border-foreground/10 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">{t("simulator.advanced.results.yourProfile")}</h3>
              <div className="flex flex-wrap gap-1.5">
                {profileItems.map((item, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-foreground/5 rounded-full text-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-3 md:space-y-4">
          {/* Score Breakdown */}
          {result.scoreFactors && result.scoreFactors.length > 0 && (
            <div className="bg-foreground/[0.02] border border-foreground/10 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium">{t("simulator.advanced.scoreFactors.title")}</h3>
                <span className="text-xs text-muted-foreground">
                  Score: <span className="font-medium text-foreground">{result.rawScore}/100</span>
                </span>
              </div>
              <div className="space-y-2">
                {result.scoreFactors.map((factor) => (
                  <ScoreFactorBar key={factor.id} factor={factor} t={t} />
                ))}
              </div>
            </div>
          )}

          {/* Warnings and Recommendations */}
          {(result.warnings?.length > 0 || result.recommendations?.length > 0) && (
            <WarningsCard warnings={result.warnings || []} recommendations={result.recommendations || []} t={t} />
          )}

          {/* Next steps */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {t("simulator.advanced.results.nextSteps")}
            </h3>
            <ol className="space-y-1.5 text-xs">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] flex items-center justify-center flex-shrink-0">1</span>
                <span>{t("simulator.advanced.results.step1")}</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] flex items-center justify-center flex-shrink-0">2</span>
                <span>{t("simulator.advanced.results.step2")}</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] flex items-center justify-center flex-shrink-0">3</span>
                <span>{t("simulator.advanced.results.step3").replace("{time}", result.estimatedResponseTime)}</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* CTA buttons - compact */}
      <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-2">
        <Link
          href={`/${locale}/application`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-lg text-sm font-medium hover:bg-dark-gold transition-colors duration-200"
        >
          {t("simulator.advanced.results.applyNow")}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>

        <button
          onClick={onRestart}
          className="px-4 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("simulator.advanced.results.newSimulation")}
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[10px] text-muted-foreground mt-4">
        {t("simulator.disclaimer")}
      </p>

      {/* Rate Info Modal */}
      <RateInfoModal
        isOpen={showRateModal}
        onClose={() => setShowRateModal(false)}
        minRate={minRate}
        maxRate={maxRate}
        currentRate={result.effectiveRate}
        customRate={customRate}
        onCustomRateChange={setCustomRate}
        onApplyRate={handleApplyCustomRate}
        onResetRate={handleResetRate}
        t={t}
      />
    </div>
  );
}

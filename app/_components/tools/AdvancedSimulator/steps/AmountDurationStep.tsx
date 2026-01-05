"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { CreditType, ProductConfig } from "../types";

interface AmountDurationStepProps {
  creditType: CreditType;
  config: ProductConfig;
  amount: number;
  duration: number;
  onAmountChange: (value: number) => void;
  onDurationChange: (value: number) => void;
  onNext: () => void;
  onBack: () => void;
  t: (key: string) => string;
  locale: string;
}

export function AmountDurationStep({
  creditType,
  config,
  amount,
  duration,
  onAmountChange,
  onDurationChange,
  onNext,
  onBack,
  t,
  locale,
}: AmountDurationStepProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const amountDisplayRef = useRef<HTMLSpanElement>(null);
  const durationDisplayRef = useRef<HTMLSpanElement>(null);

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

  // Animate amount change
  const handleAmountChange = (value: number) => {
    if (amountDisplayRef.current) {
      gsap.fromTo(
        amountDisplayRef.current,
        { scale: 1.1, color: "#C8A96A" },
        { scale: 1, color: "inherit", duration: 0.3, ease: "power2.out" }
      );
    }
    onAmountChange(value);
  };

  // Animate duration change
  const handleDurationChange = (value: number) => {
    if (durationDisplayRef.current) {
      gsap.fromTo(
        durationDisplayRef.current,
        { scale: 1.1, color: "#C8A96A" },
        { scale: 1, color: "inherit", duration: 0.3, ease: "power2.out" }
      );
    }
    onDurationChange(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Generate duration presets based on product
  const getDurationPresets = () => {
    const { minDuration, maxDuration } = config;
    const range = maxDuration - minDuration;

    if (range <= 3) {
      // Short range: show all values
      return Array.from(
        { length: range + 1 },
        (_, i) => minDuration + i
      );
    }

    // Longer range: show 5 evenly spaced values
    const presets: number[] = [];
    const step = Math.floor(range / 4);
    for (let i = 0; i <= 4; i++) {
      const value = minDuration + i * step;
      if (value <= maxDuration) {
        presets.push(value);
      }
    }
    // Ensure max is included
    if (!presets.includes(maxDuration)) {
      presets[presets.length - 1] = maxDuration;
    }
    return presets;
  };

  const durationPresets = getDurationPresets();

  // Quick amount buttons
  const getQuickAmounts = () => {
    const { minAmount, maxAmount, step } = config;
    const range = maxAmount - minAmount;

    // Generate 4 quick amounts: min, 1/3, 2/3, max
    return [
      minAmount,
      Math.round((minAmount + range / 3) / step) * step,
      Math.round((minAmount + (range * 2) / 3) / step) * step,
      maxAmount,
    ];
  };

  const quickAmounts = getQuickAmounts();

  // Calculate estimated monthly payment for preview
  const avgRate = (config.minRate + config.maxRate) / 2 / 100;
  const monthlyRate = avgRate / 12;
  const estimatedPayment =
    monthlyRate === 0
      ? amount / duration
      : (amount * (monthlyRate * Math.pow(1 + monthlyRate, duration))) /
        (Math.pow(1 + monthlyRate, duration) - 1);

  return (
    <div ref={containerRef} className="max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-accent mb-4">
          {t(`simulator.products.${creditType.replace("-", "")}`)}
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-light mb-4">
          {t("simulator.advanced.step2Title")}
        </h2>
        <p className="text-muted-foreground">
          {t("simulator.advanced.step2Subtitle")}
        </p>
      </div>

      {/* Amount section */}
      <div className="mb-10">
        <div className="flex justify-between items-baseline mb-4">
          <label className="text-sm uppercase tracking-wider text-muted-foreground">
            {t("simulator.amountLabel")}
          </label>
          <span
            ref={amountDisplayRef}
            className="font-serif text-4xl md:text-5xl text-accent tabular-nums"
          >
            {formatCurrency(amount)}
          </span>
        </div>

        {/* Quick amount buttons */}
        <div className="flex gap-2 mb-4">
          {quickAmounts.map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => handleAmountChange(quickAmount)}
              className={`flex-1 py-2 px-3 text-xs md:text-sm rounded-lg transition-all duration-200 tabular-nums ${
                amount === quickAmount
                  ? "bg-accent text-white"
                  : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
              }`}
            >
              {formatCurrency(quickAmount)}
            </button>
          ))}
        </div>

        {/* Amount slider */}
        <div className="relative">
          <input
            type="range"
            min={config.minAmount}
            max={config.maxAmount}
            step={config.step}
            value={amount}
            onChange={(e) => handleAmountChange(Number(e.target.value))}
            className="w-full h-2 bg-foreground/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-accent
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-accent/20"
          />
          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 h-2 bg-accent/30 rounded-full pointer-events-none"
            style={{
              width: `${((amount - config.minAmount) / (config.maxAmount - config.minAmount)) * 100}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{formatCurrency(config.minAmount)}</span>
          <span>{formatCurrency(config.maxAmount)}</span>
        </div>
      </div>

      {/* Duration section */}
      <div className="mb-10">
        <div className="flex justify-between items-baseline mb-4">
          <label className="text-sm uppercase tracking-wider text-muted-foreground">
            {t("simulator.durationLabel")}
          </label>
          <span
            ref={durationDisplayRef}
            className="font-serif text-4xl md:text-5xl tabular-nums"
          >
            {duration}{" "}
            <span className="text-xl text-muted-foreground">
              {duration === 1 ? t("simulator.month") : t("simulator.months")}
            </span>
          </span>
        </div>

        {/* Duration preset buttons */}
        <div className="flex gap-2 mb-4">
          {durationPresets.map((preset) => (
            <button
              key={preset}
              onClick={() => handleDurationChange(preset)}
              className={`flex-1 py-3 px-2 text-sm md:text-base font-medium rounded-lg transition-all duration-200 ${
                duration === preset
                  ? "bg-foreground text-background"
                  : "bg-foreground/5 text-foreground hover:bg-foreground/10"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Duration slider */}
        <div className="relative">
          <input
            type="range"
            min={config.minDuration}
            max={config.maxDuration}
            step={1}
            value={duration}
            onChange={(e) => handleDurationChange(Number(e.target.value))}
            className="w-full h-2 bg-foreground/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-foreground
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110"
          />
          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 h-2 bg-foreground/30 rounded-full pointer-events-none"
            style={{
              width: `${((duration - config.minDuration) / (config.maxDuration - config.minDuration)) * 100}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{config.minDuration} {t("simulator.months")}</span>
          <span>{config.maxDuration} {t("simulator.months")}</span>
        </div>
      </div>

      {/* Preview card */}
      <div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              {t("simulator.advanced.estimatedMonthly")}
            </p>
            <p className="font-serif text-3xl text-accent tabular-nums">
              ~{formatCurrency(estimatedPayment)}
            </p>
            <p className="text-xs text-muted-foreground mt-1 tabular-nums">
              {t("simulator.advanced.rateIndicative")} {config.minRate}% – {config.maxRate}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              {t("simulator.totalCost")}
            </p>
            <p className="font-serif text-xl tabular-nums">
              ~{formatCurrency(estimatedPayment * duration)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 border border-foreground/20 text-foreground font-medium rounded-lg hover:border-foreground/40 transition-colors"
        >
          ← {t("simulator.advanced.back")}
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-4 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors"
        >
          {t("simulator.advanced.continue")} →
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";

// Product configurations based on business docs
const PRODUCTS = {
  "micro-credit": {
    minAmount: 20,
    maxAmount: 500,
    minDuration: 1,
    maxDuration: 3,
    minRate: 12,
    maxRate: 25,
    step: 10,
  },
  "consumer": {
    minAmount: 500,
    maxAmount: 5000,
    minDuration: 3,
    maxDuration: 36,
    minRate: 6,
    maxRate: 22,
    step: 100,
  },
  "professional": {
    minAmount: 1000,
    maxAmount: 10000,
    minDuration: 3,
    maxDuration: 24,
    minRate: 6,
    maxRate: 20,
    step: 500,
  },
  "student": {
    minAmount: 500,
    maxAmount: 5000,
    minDuration: 6,
    maxDuration: 36,
    minRate: 6,
    maxRate: 15,
    step: 100,
  },
  "salary-advance": {
    minAmount: 50,
    maxAmount: 1500,
    minDuration: 1,
    maxDuration: 2,
    minRate: 8,
    maxRate: 20,
    step: 50,
  },
  "leasing": {
    minAmount: 1000,
    maxAmount: 20000,
    minDuration: 12,
    maxDuration: 60,
    minRate: 5,
    maxRate: 14,
    step: 500,
  },
} as const;

type ProductType = keyof typeof PRODUCTS;

interface SimulatorWidgetProps {
  defaultProduct?: ProductType;
  compact?: boolean;
}

export function SimulatorWidget({
  defaultProduct = "consumer",
  compact = false
}: SimulatorWidgetProps) {
  const t = useTranslations("tools");
  const locale = useLocale();

  const [product, setProduct] = useState<ProductType>(defaultProduct);
  const [amount, setAmount] = useState(1000);
  const [duration, setDuration] = useState(12);
  const [isAnimating, setIsAnimating] = useState(false);

  const config = PRODUCTS[product];

  // Adjust amount and duration when product changes
  useEffect(() => {
    const cfg = PRODUCTS[product];
    setAmount(Math.max(cfg.minAmount, Math.min(amount, cfg.maxAmount)));
    setDuration(Math.max(cfg.minDuration, Math.min(duration, cfg.maxDuration)));
  }, [product]);

  // Calculate monthly payment (simplified formula)
  const calculateMonthlyPayment = useCallback(() => {
    const avgRate = (config.minRate + config.maxRate) / 2 / 100;
    const monthlyRate = avgRate / 12;
    const n = duration;

    if (monthlyRate === 0) return amount / n;

    const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, n)) /
                    (Math.pow(1 + monthlyRate, n) - 1);

    return payment;
  }, [amount, duration, config]);

  const monthlyPayment = calculateMonthlyPayment();
  const totalCost = monthlyPayment * duration;
  const totalInterest = totalCost - amount;

  // Trigger animation on value change
  const handleValueChange = (setter: (v: number) => void, value: number) => {
    setIsAnimating(true);
    setter(value);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const productOptions = [
    { value: "micro-credit", label: t("simulator.products.microCredit") },
    { value: "consumer", label: t("simulator.products.consumer") },
    { value: "professional", label: t("simulator.products.professional") },
    { value: "student", label: t("simulator.products.student") },
    { value: "salary-advance", label: t("simulator.products.salaryAdvance") },
    { value: "leasing", label: t("simulator.products.leasing") },
  ];

  return (
    <div className={`bg-background rounded-3xl border border-border ${compact ? "p-6" : "p-8 lg:p-12"}`}>
      {/* Product Selection */}
      <div className="mb-8">
        <label className="block text-sm uppercase tracking-wider text-muted-foreground mb-3">
          {t("simulator.productLabel")}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {productOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setProduct(opt.value as ProductType)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                product === opt.value
                  ? "bg-accent text-white"
                  : "bg-secondary/50 text-foreground hover:bg-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amount Slider */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm uppercase tracking-wider text-muted-foreground">
            {t("simulator.amountLabel")}
          </label>
          <span className="text-2xl font-serif text-accent">
            {formatCurrency(amount)}
          </span>
        </div>
        <input
          type="range"
          min={config.minAmount}
          max={config.maxAmount}
          step={config.step}
          value={amount}
          onChange={(e) => handleValueChange(setAmount, Number(e.target.value))}
          className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-accent"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{formatCurrency(config.minAmount)}</span>
          <span>{formatCurrency(config.maxAmount)}</span>
        </div>
      </div>

      {/* Duration Slider */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm uppercase tracking-wider text-muted-foreground">
            {t("simulator.durationLabel")}
          </label>
          <span className="text-2xl font-serif text-accent">
            {duration} {duration === 1 ? t("simulator.month") : t("simulator.months")}
          </span>
        </div>
        <input
          type="range"
          min={config.minDuration}
          max={config.maxDuration}
          step={1}
          value={duration}
          onChange={(e) => handleValueChange(setDuration, Number(e.target.value))}
          className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-accent"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{config.minDuration} {t("simulator.months")}</span>
          <span>{config.maxDuration} {t("simulator.months")}</span>
        </div>
      </div>

      {/* Results */}
      <div className={`rounded-2xl bg-foreground text-background p-6 lg:p-8 mb-8 transition-transform duration-300 ${isAnimating ? "scale-[1.02]" : ""}`}>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm uppercase tracking-wider text-background/60 mb-1">
              {t("simulator.monthlyPayment")}
            </p>
            <p className="text-3xl lg:text-4xl font-serif">
              {formatCurrency(monthlyPayment)}
            </p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wider text-background/60 mb-1">
              {t("simulator.totalCost")}
            </p>
            <p className="text-3xl lg:text-4xl font-serif">
              {formatCurrency(totalCost)}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-background/20 grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm uppercase tracking-wider text-background/60 mb-1">
              {t("simulator.interestCost")}
            </p>
            <p className="text-xl font-serif">
              {formatCurrency(totalInterest)}
            </p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wider text-background/60 mb-1">
              {t("simulator.rateRange")}
            </p>
            <p className="text-xl font-serif">
              {config.minRate}% - {config.maxRate}% TAEG
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center mb-6">
        {t("simulator.disclaimer")}
      </p>

      {/* CTA */}
      <Link
        href={`/${locale}/products/${product}`}
        className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-accent text-white rounded-full text-base font-medium hover:bg-dark-gold transition-colors duration-300"
      >
        {t("simulator.cta")}
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}

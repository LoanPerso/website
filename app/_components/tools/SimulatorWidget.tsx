"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import { gsap } from "gsap";
import { cn } from "@/_lib/utils";
import { Check, ChevronRight, Info } from "lucide-react";

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
  const [isHovering, setIsHovering] = useState(false);

  // Refs for animation
  const containerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLSpanElement>(null);

  const config = PRODUCTS[product];

  // Adjust amount and duration when product changes
  useEffect(() => {
    const cfg = PRODUCTS[product];
    const newAmount = Math.max(cfg.minAmount, Math.min(amount, cfg.maxAmount));
    const newDuration = Math.max(cfg.minDuration, Math.min(duration, cfg.maxDuration));
    
    setAmount(newAmount);
    setDuration(newDuration);
    
    // Animate transition
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { y: 5, opacity: 0.9 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [product]);

  // Calculate monthly payment
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  // Custom Slider Component
  const Slider = ({ 
    min, 
    max, 
    value, 
    step, 
    onChange, 
    label, 
    displayValue,
    subtext 
  }: { 
    min: number; 
    max: number; 
    value: number; 
    step: number; 
    onChange: (val: number) => void;
    label: string;
    displayValue: string;
    subtext: string;
  }) => {
    const percentage = ((value - min) / (max - min)) * 100;
    
    return (
      <div className="group relative py-4">
        <div className="flex justify-between items-end mb-6">
          <label className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {label}
          </label>
          <div className="text-right">
            <span className="block text-3xl md:text-4xl font-serif text-foreground leading-none tracking-tight">
              {displayValue}
            </span>
          </div>
        </div>
        
        <div className="relative h-12 flex items-center">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
          
          {/* Track */}
          <div className="w-full h-[2px] bg-secondary rounded-full overflow-hidden relative z-10">
            <div 
              className="h-full bg-accent transition-all duration-100 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          {/* Thumb */}
          <div 
            className="absolute h-6 w-6 rounded-full bg-white border-2 border-accent shadow-lg flex items-center justify-center transition-all duration-100 ease-out z-10 pointer-events-none group-hover:scale-110"
            style={{ left: `calc(${percentage}% - 12px)` }}
          >
            <div className="w-1.5 h-1.5 bg-accent rounded-full" />
          </div>
        </div>

        <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
          <span>{subtext.split('|')[0]}</span>
          <span>{subtext.split('|')[1]}</span>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-white rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden border border-border/40",
        compact ? "p-6" : "p-8 lg:p-12"
      )}
    >
      {/* Product Selection - Horizontal Scroll / Pills */}
      <div className="mb-12">
        <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4 pl-1">
          {t("simulator.productLabel")}
        </label>
        <div className="flex flex-wrap gap-2">
          {productOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setProduct(opt.value as ProductType)}
              className={cn(
                "relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ease-out",
                product === opt.value
                  ? "bg-foreground text-background shadow-lg shadow-black/10 scale-105"
                  : "bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-10">
          <Slider
            min={config.minAmount}
            max={config.maxAmount}
            step={config.step}
            value={amount}
            onChange={setAmount}
            label={t("simulator.amountLabel")}
            displayValue={formatCurrency(amount)}
            subtext={`${formatCurrency(config.minAmount)}|${formatCurrency(config.maxAmount)}`}
          />

          <Slider
            min={config.minDuration}
            max={config.maxDuration}
            step={1}
            value={duration}
            onChange={setDuration}
            label={t("simulator.durationLabel")}
            displayValue={`${duration} ${duration === 1 ? t("simulator.month") : t("simulator.months")}`}
            subtext={`${config.minDuration} ${t("simulator.months")}|${config.maxDuration} ${t("simulator.months")}`}
          />
          
          <div className="pt-4 flex items-start gap-3 text-sm text-muted-foreground">
            <Info className="w-5 h-5 flex-shrink-0 text-accent" />
            <p className="leading-relaxed">
              {t("simulator.disclaimer")}
            </p>
          </div>
        </div>

        {/* Result Section */}
        <div className="lg:col-span-5">
          <div 
            ref={resultRef}
            className="relative h-full min-h-[400px] flex flex-col justify-between rounded-3xl bg-[#1a1a1a] text-[#f4f1ea] p-8 lg:p-10 shadow-2xl overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8 text-accent/80">
                <div className="h-px w-8 bg-accent/40" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">Estimation</span>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-2">
                    {t("simulator.monthlyPayment")}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl lg:text-6xl font-serif text-white tracking-tight">
                      {new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(monthlyPayment)}
                    </span>
                    <span className="text-xl font-serif text-accent">€</span>
                  </div>
                  <p className="text-sm text-white/40 mt-1">
                    / {t("simulator.month")}
                  </p>
                </div>

                <div className="h-px w-full bg-white/10" />

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
                      {t("simulator.totalCost")}
                    </p>
                    <p className="text-xl font-serif text-white/90">
                      {formatCurrency(totalCost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
                      {t("simulator.rateRange")}
                    </p>
                    <p className="text-xl font-serif text-white/90">
                      {config.minRate}% - {config.maxRate}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12">
              <Link
                href={`/${locale}/application`}
                className="group relative w-full flex items-center justify-between p-1 pl-6 bg-accent rounded-full text-deep-black transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="font-semibold tracking-wide text-sm">
                  {t("simulator.cta")}
                </span>
                <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                  <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

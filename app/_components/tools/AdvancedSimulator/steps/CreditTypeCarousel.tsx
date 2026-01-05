"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { CreditType } from "../types";
import { PRODUCTS } from "../config";
import { CountryConfig, ProductLimits } from "../countries/types";

interface CreditTypeCarouselProps {
  onSelect: (type: CreditType) => void;
  availableProducts: CreditType[];
  countryConfig: CountryConfig | null;
  t: (key: string) => string;
}

const CreditTypeIcon = ({ type, className, style }: { type: CreditType; className?: string; style?: React.CSSProperties }) => {
  const icons: Record<CreditType, JSX.Element> = {
    "micro-credit": (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    consumer: (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    professional: (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    student: (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
      </svg>
    ),
    "salary-advance": (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    leasing: (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
  };
  return icons[type];
};

export function CreditTypeCarousel({
  onSelect,
  availableProducts,
  countryConfig,
  t
}: CreditTypeCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Helper to get product limits from country config or fallback to default
  const getProductLimits = (type: CreditType): ProductLimits | null => {
    if (countryConfig) {
      return countryConfig.products[type];
    }
    // Fallback to default PRODUCTS config
    const defaultConfig = PRODUCTS[type];
    return {
      minAmount: defaultConfig.minAmount,
      maxAmount: defaultConfig.maxAmount,
      minDuration: defaultConfig.minDuration,
      maxDuration: defaultConfig.maxDuration,
      minRate: defaultConfig.minRate,
      maxRate: defaultConfig.maxRate,
      available: true,
    };
  };

  // Animate cards on mount - faster
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }
      );
    }

    cardsRef.current.forEach((card, index) => {
      if (card) {
        gsap.fromTo(
          card,
          { opacity: 0, y: 20, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.25,
            delay: 0.05 + index * 0.04,
            ease: "power3.out",
          }
        );
      }
    });
  }, []);

  // Handle card hover animation - faster
  const handleCardHover = (index: number, isEnter: boolean) => {
    const card = cardsRef.current[index];
    if (card) {
      gsap.to(card, {
        scale: isEnter ? 1.02 : 1,
        y: isEnter ? -6 : 0,
        duration: 0.15,
        ease: "power2.out",
      });
    }
  };

  // Handle card selection with animation
  const handleSelect = (type: CreditType, index: number) => {
    setActiveIndex(index);

    const card = cardsRef.current[index];
    if (card) {
      gsap.to(card, {
        scale: 0.97,
        duration: 0.08,
        ease: "power2.in",
        onComplete: () => {
          gsap.to(card, {
            scale: 1.02,
            duration: 0.12,
            ease: "power2.out",
            onComplete: () => {
              // Fade out all cards quickly
              cardsRef.current.forEach((c, i) => {
                if (c) {
                  gsap.to(c, {
                    opacity: i === index ? 1 : 0.3,
                    scale: i === index ? 1.02 : 0.95,
                    duration: 0.15,
                    ease: "power2.out",
                  });
                }
              });

              // Trigger selection faster
              setTimeout(() => onSelect(type), 150);
            },
          });
        },
      });
    }
  };

  // Touch/drag handlers for carousel
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const pageX = "touches" in e ? e.touches[0].pageX : e.pageX;
    setStartX(pageX);
    if (containerRef.current) {
      setScrollLeft(containerRef.current.scrollLeft);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const pageX = "touches" in e ? e.touches[0].pageX : e.pageX;
    const walk = (startX - pageX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft + walk;
  };

  // Navigate carousel
  const navigate = useCallback((direction: "prev" | "next") => {
    const newIndex =
      direction === "next"
        ? Math.min(activeIndex + 1, availableProducts.length - 1)
        : Math.max(activeIndex - 1, 0);

    setActiveIndex(newIndex);

    const card = cardsRef.current[newIndex];
    if (card) {
      card.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeIndex, availableProducts.length]);

  const formatAmount = (amount: number) => {
    const locale = countryConfig?.locale || "fr-FR";
    const currency = countryConfig?.formatting.currencyCode || "EUR";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-accent mb-4">
          {t("simulator.advanced.step1Eyebrow")}
        </p>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light mb-4">
          {t("simulator.advanced.step1Title")}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t("simulator.advanced.step1Subtitle")}
        </p>
      </div>

      {/* Carousel container */}
      <div
        className="overflow-x-auto scrollbar-hide pt-3 pb-6 -mx-4 px-4 md:-mx-8 md:px-8 cursor-grab active:cursor-grabbing overflow-y-visible"
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onMouseMove={handleDragMove}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onTouchMove={handleDragMove}
      >
        <div className="flex gap-4 md:gap-6 min-w-max md:min-w-0 md:grid md:grid-cols-2 lg:grid-cols-3">
          {availableProducts.map((type, index) => {
            const styleConfig = PRODUCTS[type];
            const limits = getProductLimits(type);
            if (!limits || !limits.available) return null;
            return (
              <button
                key={type}
                ref={(el) => { cardsRef.current[index] = el; }}
                onClick={() => handleSelect(type, index)}
                onMouseEnter={() => handleCardHover(index, true)}
                onMouseLeave={() => handleCardHover(index, false)}
                className={`group relative flex-shrink-0 w-[280px] md:w-full p-6 md:p-8 rounded-2xl border text-left transition-all duration-300 ${
                  activeIndex === index
                    ? "border-accent bg-accent/5"
                    : "border-foreground/10 bg-foreground/[0.02] hover:border-foreground/20"
                }`}
              >
                {/* Gradient overlay on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${styleConfig.color}10 0%, transparent 60%)`,
                  }}
                />

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300"
                  style={{
                    backgroundColor: `${styleConfig.color}15`,
                  }}
                >
                  <CreditTypeIcon
                    type={type}
                    className="w-7 h-7 transition-colors duration-300"
                    style={{ color: styleConfig.color }}
                  />
                </div>

                {/* Content */}
                <h3 className="font-serif text-xl md:text-2xl font-medium mb-2">
                  {t(`simulator.products.${type.replace("-", "")}`)}
                </h3>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {t(`simulator.advanced.products.${type.replace("-", "")}.description`)}
                </p>

                {/* Amount range */}
                <div className="flex items-center justify-between pt-4 border-t border-foreground/5">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("simulator.advanced.amountRange")}
                  </span>
                  <span
                    className="text-sm font-medium tabular-nums"
                    style={{ color: styleConfig.color }}
                  >
                    {formatAmount(limits.minAmount)} – {formatAmount(limits.maxAmount)}
                  </span>
                </div>

                {/* Duration */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("simulator.advanced.durationRange")}
                  </span>
                  <span className="text-sm text-foreground/70 tabular-nums">
                    {limits.minDuration} – {limits.maxDuration} {t("simulator.months")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dots indicator (mobile) */}
      <div className="flex justify-center gap-2 mt-4 md:hidden">
        {availableProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveIndex(index);
              cardsRef.current[index]?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
              });
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeIndex === index
                ? "bg-accent w-6"
                : "bg-foreground/20"
            }`}
          />
        ))}
      </div>

      {/* Hint text */}
      <p className="text-center text-xs text-muted-foreground/60 mt-6">
        {t("simulator.advanced.selectHint")}
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { cn } from "@/_lib/utils";

interface ProductCardProps {
  slug: string;
  title: string;
  tagline: string;
  range: string;
  duration: string;
  rate: string;
  features: string[];
  icon: React.ReactNode;
  variant?: "default" | "dark" | "accent";
  ctaLabel: string;
  labels: {
    amount: string;
    duration: string;
    rate: string;
  };
}

export function ProductCard({
  slug,
  title,
  tagline,
  range,
  duration,
  rate,
  features,
  icon,
  variant = "default",
  ctaLabel,
  labels,
}: ProductCardProps) {
  const locale = useLocale();

  const variants = {
    default: {
      card: "bg-white border-border",
      icon: "bg-accent/10 text-accent",
      title: "text-foreground",
      tagline: "text-muted-foreground",
      meta: "text-muted-foreground",
      metaValue: "text-foreground",
      feature: "text-muted-foreground",
      featureDot: "bg-accent",
      cta: "border-foreground text-foreground hover:bg-foreground hover:text-background",
    },
    dark: {
      card: "bg-deep-black border-white/10",
      icon: "bg-accent/20 text-accent",
      title: "text-white",
      tagline: "text-white/60",
      meta: "text-white/40",
      metaValue: "text-white",
      feature: "text-white/70",
      featureDot: "bg-accent",
      cta: "border-white/20 text-white hover:bg-white hover:text-deep-black",
    },
    accent: {
      card: "bg-accent/5 border-accent/20",
      icon: "bg-accent/20 text-dark-gold",
      title: "text-foreground",
      tagline: "text-muted-foreground",
      meta: "text-muted-foreground",
      metaValue: "text-foreground",
      feature: "text-muted-foreground",
      featureDot: "bg-dark-gold",
      cta: "border-dark-gold text-dark-gold hover:bg-dark-gold hover:text-white",
    },
  };

  const styles = variants[variant];

  return (
    <article
      className={cn(
        "flex flex-col h-full rounded-lg border p-6 lg:p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg",
        styles.card
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center mb-6",
          styles.icon
        )}
      >
        {icon}
      </div>

      {/* Header */}
      <div className="mb-6">
        <h3 className={cn("font-serif text-2xl lg:text-3xl mb-2", styles.title)}>
          {title}
        </h3>
        <p className={cn("text-sm lg:text-base", styles.tagline)}>{tagline}</p>
      </div>

      {/* Meta info */}
      <div className="flex flex-col gap-3 mb-6 py-4 border-y border-current/10">
        <div className="flex items-center justify-between">
          <span className={cn("text-xs uppercase tracking-wider", styles.meta)}>
            {labels.amount}
          </span>
          <span className={cn("text-sm font-medium", styles.metaValue)}>{range}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={cn("text-xs uppercase tracking-wider", styles.meta)}>
            {labels.duration}
          </span>
          <span className={cn("text-sm font-medium", styles.metaValue)}>{duration}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={cn("text-xs uppercase tracking-wider", styles.meta)}>
            {labels.rate}
          </span>
          <span className={cn("text-sm font-medium", styles.metaValue)}>{rate}</span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {features.slice(0, 4).map((feature, i) => (
          <li key={i} className={cn("flex items-start gap-3 text-sm", styles.feature)}>
            <span
              className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", styles.featureDot)}
            />
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={`/${locale}/products/${slug}`}
        className={cn(
          "inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full border text-sm font-medium transition-colors duration-200",
          styles.cta
        )}
      >
        {ctaLabel}
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </Link>
    </article>
  );
}

// Compact version - kept for potential future use
interface ProductCardCompactProps {
  slug: string;
  title: string;
  tagline: string;
  icon: React.ReactNode;
}

export function ProductCardCompact({ slug, title, tagline, icon }: ProductCardCompactProps) {
  const locale = useLocale();

  return (
    <Link
      href={`/${locale}/products/${slug}`}
      className="flex items-center gap-4 p-4 lg:p-5 border border-border rounded-lg"
    >
      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-foreground text-base lg:text-lg">
          {title}
        </h4>
        <p className="text-sm text-muted-foreground truncate">{tagline}</p>
      </div>
      <svg
        className="w-5 h-5 text-muted-foreground/50 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

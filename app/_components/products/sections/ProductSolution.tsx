"use client";

import { useTranslations } from "next-intl";
import { SolutionVariant } from "../types";

interface ProductSolutionProps {
  translationKey: string;
  variant?: SolutionVariant;
  stickyHeader?: boolean;
}

export function ProductSolution({
  translationKey,
  variant = "bento",
  stickyHeader = true,
}: ProductSolutionProps) {
  const t = useTranslations(translationKey);

  const rawFeatures = t.raw("solution.features");
  const features = Array.isArray(rawFeatures) ? rawFeatures as Array<{ title: string; description: string }> : [];

  const renderBentoGrid = () => {
    const bentoConfig: Record<number, { col: string; style: string }> = {
      0: { col: "sm:col-span-2", style: "bg-accent/10 border-accent/20" },
      1: { col: "", style: "bg-background border-border hover:border-accent/30" },
      2: { col: "", style: "bg-foreground text-background border-foreground" },
      3: { col: "sm:col-span-2", style: "bg-background border-border hover:border-accent/30" },
      4: { col: "sm:col-span-2", style: "bg-deep-black text-white border-deep-black" },
      5: { col: "", style: "bg-accent text-white border-accent" },
      6: { col: "", style: "bg-background border-border hover:border-accent/30" },
      7: { col: "sm:col-span-2", style: "bg-secondary/50 border-border hover:border-accent/30" },
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature, i) => {
          const config = bentoConfig[i] || { col: "", style: "bg-background border-border" };
          const isDark = i === 2 || i === 4;
          const isAccent = i === 5;
          const isWide = i === 0 || i === 3 || i === 4 || i === 7;

          return (
            <div
              key={i}
              className={`${config.col} p-5 lg:p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${config.style}`}
            >
              <h3 className={`font-serif mb-2 ${
                isWide ? "text-xl lg:text-2xl" : "text-lg lg:text-xl"
              } ${
                isDark ? "text-background" :
                isAccent ? "text-white" : ""
              }`}>
                {feature.title}
              </h3>
              <p className={`text-sm lg:text-base leading-relaxed ${
                isDark ? "text-background/70" :
                isAccent ? "text-white/70" :
                "text-muted-foreground"
              }`}>
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl border border-border bg-background hover:border-accent/30 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <span className="text-accent font-serif">{i + 1}</span>
          </div>
          <h3 className="font-serif text-xl mb-2">{feature.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </div>
  );

  const renderList = () => (
    <div className="space-y-6">
      {features.map((feature, i) => (
        <div
          key={i}
          className="flex gap-6 p-6 rounded-2xl border border-border bg-background hover:border-accent/30 transition-colors"
        >
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-accent font-serif text-lg">{i + 1}</span>
            </div>
          </div>
          <div>
            <h3 className="font-serif text-xl mb-2">{feature.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case "grid":
        return renderGrid();
      case "list":
        return renderList();
      case "bento":
      default:
        return renderBentoGrid();
    }
  };

  return (
    <section className="py-32">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div className={stickyHeader ? "lg:sticky lg:top-32 lg:self-start space-y-6" : "space-y-6"}>
            <p className="text-sm uppercase tracking-[0.3em] text-accent">
              {t("solution.eyebrow")}
            </p>
            <h2 className="font-serif text-5xl md:text-6xl leading-[1.1]">
              {t("solution.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-md">
              {t("solution.description")}
            </p>
          </div>

          {renderContent()}
        </div>
      </div>
    </section>
  );
}

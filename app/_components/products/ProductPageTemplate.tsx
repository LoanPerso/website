"use client";

import { Fragment, ReactNode } from "react";
import {
  ProductPageConfig,
  HeroSectionConfig,
  ProblemSectionConfig,
  SolutionSectionConfig,
  AudienceSectionConfig,
  ProcessSectionConfig,
  CTASectionConfig,
  normalizeSectionConfig,
  CustomSection,
} from "./types";
import { ProductHero } from "./sections/ProductHero";
import { ProductProblem } from "./sections/ProductProblem";
import { ProductSolution } from "./sections/ProductSolution";
import { ProductAudience } from "./sections/ProductAudience";
import { ProductProcess } from "./sections/ProductProcess";
import { ProductCTA } from "./sections/ProductCTA";

interface ProductPageTemplateProps extends ProductPageConfig {
  children?: ReactNode;
}

const defaultHeroConfig: HeroSectionConfig = {
  enabled: true,
  variant: "default",
  showStats: true,
};

const defaultProblemConfig: ProblemSectionConfig = {
  enabled: true,
  darkBackground: true,
};

const defaultSolutionConfig: SolutionSectionConfig = {
  enabled: true,
  variant: "bento",
  stickyHeader: true,
};

const defaultAudienceConfig: AudienceSectionConfig = {
  enabled: true,
  variant: "offset",
};

const defaultProcessConfig: ProcessSectionConfig = {
  enabled: true,
  variant: "stepped",
};

const defaultCTAConfig: CTASectionConfig = {
  enabled: true,
  darkBackground: true,
};

export function ProductPageTemplate({
  translationKey,
  hero,
  problem,
  solution,
  audience,
  process,
  cta,
  customSections = [],
  children,
}: ProductPageTemplateProps) {
  const heroConfig = normalizeSectionConfig(hero, defaultHeroConfig);
  const problemConfig = normalizeSectionConfig(problem, defaultProblemConfig);
  const solutionConfig = normalizeSectionConfig(solution, defaultSolutionConfig);
  const audienceConfig = normalizeSectionConfig(audience, defaultAudienceConfig);
  const processConfig = normalizeSectionConfig(process, defaultProcessConfig);
  const ctaConfig = normalizeSectionConfig(cta, defaultCTAConfig);

  const getCustomSections = (position: "before" | "after", relativeTo: string) => {
    return customSections
      .filter((s) => s.position === position && s.relativeTo === relativeTo)
      .map((s) => <Fragment key={s.id}>{s.component}</Fragment>);
  };

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      {getCustomSections("before", "hero")}
      {heroConfig.enabled && (
        <ProductHero
          translationKey={translationKey}
          variant={heroConfig.variant}
          showStats={heroConfig.showStats}
        />
      )}
      {getCustomSections("after", "hero")}

      {/* Problem Section */}
      {getCustomSections("before", "problem")}
      {problemConfig.enabled && (
        <ProductProblem
          translationKey={translationKey}
          darkBackground={problemConfig.darkBackground}
        />
      )}
      {getCustomSections("after", "problem")}

      {/* Solution Section */}
      {getCustomSections("before", "solution")}
      {solutionConfig.enabled && (
        <ProductSolution
          translationKey={translationKey}
          variant={solutionConfig.variant}
          stickyHeader={solutionConfig.stickyHeader}
        />
      )}
      {getCustomSections("after", "solution")}

      {/* Audience Section */}
      {getCustomSections("before", "audience")}
      {audienceConfig.enabled && (
        <ProductAudience
          translationKey={translationKey}
          variant={audienceConfig.variant}
        />
      )}
      {getCustomSections("after", "audience")}

      {/* Process Section */}
      {getCustomSections("before", "process")}
      {processConfig.enabled && (
        <ProductProcess
          translationKey={translationKey}
          variant={processConfig.variant}
        />
      )}
      {getCustomSections("after", "process")}

      {/* Additional children */}
      {children}

      {/* CTA Section */}
      {getCustomSections("before", "cta")}
      {ctaConfig.enabled && (
        <ProductCTA
          translationKey={translationKey}
          darkBackground={ctaConfig.darkBackground}
        />
      )}
      {getCustomSections("after", "cta")}
    </div>
  );
}

// Main template
export { ProductPageTemplate } from "./ProductPageTemplate";

// Section components (for custom usage)
export { ProductHero } from "./sections/ProductHero";
export { ProductProblem } from "./sections/ProductProblem";
export { ProductSolution } from "./sections/ProductSolution";
export { ProductAudience } from "./sections/ProductAudience";
export { ProductProcess } from "./sections/ProductProcess";
export { ProductCTA } from "./sections/ProductCTA";

// Types
export type {
  ProductPageConfig,
  ProductStat,
  ProductFeature,
  ProductAudienceProfile,
  ProductProcessStep,
  ProductProblemItem,
  CustomSection,
  HeroSectionConfig,
  ProblemSectionConfig,
  SolutionSectionConfig,
  AudienceSectionConfig,
  ProcessSectionConfig,
  CTASectionConfig,
  SolutionVariant,
  AudienceVariant,
  ProcessVariant,
  HeroVariant,
} from "./types";

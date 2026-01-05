import { ReactNode } from "react";

// Stats item for hero section
export interface ProductStat {
  valueKey: string;
  labelKey: string;
}

// Problem item
export interface ProductProblemItem {
  number: string;
  text: string;
}

// Solution/Feature item
export interface ProductFeature {
  title: string;
  description: string;
}

// Audience profile
export interface ProductAudienceProfile {
  title: string;
  description: string;
}

// Process step
export interface ProductProcessStep {
  number: string;
  title: string;
  description: string;
}

// Section variants
export type SolutionVariant = "bento" | "grid" | "list";
export type AudienceVariant = "offset" | "grid" | "centered";
export type ProcessVariant = "stepped" | "timeline" | "cards";
export type HeroVariant = "default" | "centered" | "split";

// Section configurations
export interface HeroSectionConfig {
  enabled: boolean;
  variant?: HeroVariant;
  showStats?: boolean;
}

export interface ProblemSectionConfig {
  enabled: boolean;
  darkBackground?: boolean;
}

export interface SolutionSectionConfig {
  enabled: boolean;
  variant?: SolutionVariant;
  stickyHeader?: boolean;
}

export interface AudienceSectionConfig {
  enabled: boolean;
  variant?: AudienceVariant;
}

export interface ProcessSectionConfig {
  enabled: boolean;
  variant?: ProcessVariant;
}

export interface CTASectionConfig {
  enabled: boolean;
  darkBackground?: boolean;
}

// Custom section injection
export interface CustomSection {
  id: string;
  position: "before" | "after";
  relativeTo: "hero" | "problem" | "solution" | "audience" | "process" | "cta";
  component: ReactNode;
}

// Main template config
export interface ProductPageConfig {
  translationKey: string;
  hero?: HeroSectionConfig | boolean;
  problem?: ProblemSectionConfig | boolean;
  solution?: SolutionSectionConfig | boolean;
  audience?: AudienceSectionConfig | boolean;
  process?: ProcessSectionConfig | boolean;
  cta?: CTASectionConfig | boolean;
  customSections?: CustomSection[];
}

// Helper to normalize section config
export function normalizeSectionConfig<T extends { enabled: boolean }>(
  config: T | boolean | undefined,
  defaults: T
): T {
  if (config === undefined) return { ...defaults, enabled: true };
  if (typeof config === "boolean") return { ...defaults, enabled: config };
  return { ...defaults, ...config };
}

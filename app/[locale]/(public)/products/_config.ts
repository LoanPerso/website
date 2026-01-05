import { ProductPageConfig } from "@/_components/products";

type ProductsConfigMap = Record<string, Omit<ProductPageConfig, "customSections">>;

export const productsConfig: ProductsConfigMap = {
  "micro-credit": {
    translationKey: "product-micro-credit",
    hero: { enabled: true, variant: "default", showStats: true },
    problem: { enabled: true, darkBackground: true },
    solution: { enabled: true, variant: "bento", stickyHeader: true },
    audience: { enabled: true, variant: "offset" },
    process: { enabled: true, variant: "stepped" },
    cta: { enabled: true, darkBackground: true },
  },

  "consumer": {
    translationKey: "product-consumer",
    hero: { enabled: true, variant: "centered", showStats: true },
    problem: { enabled: true, darkBackground: true },
    solution: { enabled: true, variant: "bento", stickyHeader: true },
    audience: { enabled: true, variant: "grid" },
    process: { enabled: true, variant: "cards" },
    cta: { enabled: true, darkBackground: true },
  },

  "professional": {
    translationKey: "product-professional",
    hero: { enabled: true, variant: "default", showStats: true },
    problem: { enabled: true, darkBackground: true },
    solution: { enabled: true, variant: "bento", stickyHeader: true },
    audience: { enabled: true, variant: "centered" },
    process: { enabled: true, variant: "timeline" },
    cta: { enabled: true, darkBackground: true },
  },

  "student": {
    translationKey: "product-student",
    hero: { enabled: true, variant: "centered", showStats: true },
    problem: { enabled: true, darkBackground: false },
    solution: { enabled: true, variant: "bento", stickyHeader: true },
    audience: { enabled: true, variant: "grid" },
    process: { enabled: true, variant: "cards" },
    cta: { enabled: true, darkBackground: false },
  },

  "salary-advance": {
    translationKey: "product-salary-advance",
    hero: { enabled: true, variant: "default", showStats: true },
    problem: { enabled: true, darkBackground: true },
    solution: { enabled: true, variant: "bento", stickyHeader: true },
    audience: { enabled: true, variant: "offset" },
    process: { enabled: true, variant: "stepped" },
    cta: { enabled: true, darkBackground: true },
  },

  "leasing": {
    translationKey: "product-leasing",
    hero: { enabled: true, variant: "default", showStats: true },
    problem: { enabled: true, darkBackground: true },
    solution: { enabled: true, variant: "bento", stickyHeader: true },
    audience: { enabled: true, variant: "grid" },
    process: { enabled: true, variant: "timeline" },
    cta: { enabled: true, darkBackground: true },
  },

  "loan-consolidation": {
    translationKey: "product-loan-consolidation",
    hero: { enabled: true, variant: "centered", showStats: false },
    problem: { enabled: true, darkBackground: true },
    solution: { enabled: true, variant: "bento", stickyHeader: true },
    audience: { enabled: true, variant: "centered" },
    process: { enabled: true, variant: "stepped" },
    cta: { enabled: true, darkBackground: true },
  },

  "financial-coaching": {
    translationKey: "product-financial-coaching",
    hero: { enabled: true, variant: "centered", showStats: false },
    problem: { enabled: false },
    solution: { enabled: true, variant: "bento", stickyHeader: true },
    audience: { enabled: true, variant: "grid" },
    process: { enabled: true, variant: "cards" },
    cta: { enabled: true, darkBackground: false },
  },
};

// Helper to get all product slugs (for generateStaticParams)
export const getProductSlugs = () => Object.keys(productsConfig);

// Helper to check if a product exists
export const productExists = (slug: string) => slug in productsConfig;

// Helper to get product config
export const getProductConfig = (slug: string) => productsConfig[slug];

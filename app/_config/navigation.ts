// Navigation configuration with translation keys
// Labels are translation keys, not actual text

export const marketingNav = [
  { href: "/", labelKey: "nav.home" },
  { href: "/products", labelKey: "nav.products" },
  { href: "/features", labelKey: "nav.features" },
  { href: "/pricing", labelKey: "nav.pricing" },
];

export const productLinks = [
  { href: "/products/micro-credit", labelKey: "products.microCredit" },
  { href: "/products/consumer", labelKey: "products.consumerCredit" },
  { href: "/products/professional", labelKey: "products.proCredit" },
  { href: "/products/student", labelKey: "products.studentLoan" },
  { href: "/products/salary-advance", labelKey: "products.salaryAdvance" },
  { href: "/products/leasing", labelKey: "products.leasing" },
  { href: "/products/loan-consolidation", labelKey: "products.loanConsolidation" },
  { href: "/products/financial-coaching", labelKey: "products.financialCoaching" },
];

export const featureLinks = [
  { href: "/features/transparency", labelKey: "features.transparency" },
  { href: "/features/atypical-profiles", labelKey: "features.atypicalProfiles" },
  { href: "/features/coaching", labelKey: "features.coaching" },
  { href: "/features/flexibility", labelKey: "features.flexibility" },
];

export const toolLinks = [
  { href: "/tools/simulator", labelKey: "tools.simulator" },
  { href: "/tools/eligibility", labelKey: "tools.eligibility" },
];

export const legalLinks = [
  { href: "/legal", labelKey: "legal.legalNotice" },
  { href: "/legal/privacy", labelKey: "legal.privacy" },
  { href: "/legal/terms", labelKey: "legal.terms" },
];

// App navigation uses labels directly (not translated for now)
export const appNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
  { href: "/settings/profile", label: "Profile" },
];

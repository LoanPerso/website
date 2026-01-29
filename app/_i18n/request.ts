import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  // Load product-specific translations
  const loadProductMessages = async (slug: string) => {
    try {
      return (await import(`../../messages/${locale}/products/${slug}.json`)).default;
    } catch {
      return {};
    }
  };

  // Load optional translation files
  const loadOptionalMessages = async (name: string) => {
    try {
      return (await import(`../../messages/${locale}/${name}.json`)).default;
    } catch {
      return {};
    }
  };

  return {
    locale,
    messages: {
      common: (await import(`../../messages/${locale}/common.json`)).default,
      home: (await import(`../../messages/${locale}/home.json`)).default,
      products: (await import(`../../messages/${locale}/products.json`)).default,
      "why-us": await loadOptionalMessages("why-us"),
      login: await loadOptionalMessages("login"),
      tools: await loadOptionalMessages("tools"),
      legal: await loadOptionalMessages("legal"),
      // Product pages
      "product-micro-credit": await loadProductMessages("micro-credit"),
      "product-consumer": await loadProductMessages("consumer"),
      "product-professional": await loadProductMessages("professional"),
      "product-student": await loadProductMessages("student"),
      "product-salary-advance": await loadProductMessages("salary-advance"),
      "product-leasing": await loadProductMessages("leasing"),
      "product-loan-consolidation": await loadProductMessages("loan-consolidation"),
      "product-financial-coaching": await loadProductMessages("financial-coaching"),
    },
  };
});

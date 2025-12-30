export const locales = ['et', 'fr', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'et';

export const localeNames: Record<Locale, string> = {
  et: 'Eesti',
  fr: 'Français',
  en: 'English',
  es: 'Español',
};

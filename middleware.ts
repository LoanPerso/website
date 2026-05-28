import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './app/_i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

export const config = {
  // Exclude /admin (non-localized back office) and /api from i18n routing.
  matcher: ['/', '/(et|fr|en|es)/:path*', '/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};

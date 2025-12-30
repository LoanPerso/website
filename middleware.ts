import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './app/_i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

export const config = {
  matcher: ['/', '/(et|fr|en|es)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};

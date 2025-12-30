import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { locales, type Locale } from '@/_i18n/config';
import { SiteReadyProvider } from '@/_components/site-ready-provider';

const RegulatoryDisclaimer = dynamic(
  () => import('@/_components/regulatory-disclaimer').then(mod => mod.RegulatoryDisclaimer),
  { ssr: false }
);

const CookieConsent = dynamic(
  () => import('@/_components/cookie-consent').then(mod => mod.CookieConsent),
  { ssr: false }
);

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <SiteReadyProvider>
        {children}
        <RegulatoryDisclaimer />
        <CookieConsent />
      </SiteReadyProvider>
    </NextIntlClientProvider>
  );
}

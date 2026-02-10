import { SiteFooter } from "@/_components/site-footer";
import { SiteHeader } from "@/_components/site-header";
import SmoothScroll from "@/_components/smooth-scroll";

type MarketingLayoutProps = {
  children: React.ReactNode;
  params: { locale: string };
};

function getBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://quickfund.fr";
  return raw.replace(/\/+$/, "");
}

export default function MarketingLayout({ children, params }: MarketingLayoutProps) {
  const baseUrl = getBaseUrl();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Quickfund",
      url: baseUrl,
      logo: `${baseUrl}/icon-512.png`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Quickfund",
      url: baseUrl,
      inLanguage: params.locale,
      potentialAction: {
        "@type": "SearchAction",
        target: `${baseUrl}/${params.locale}/products?query={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <SmoothScroll>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </SmoothScroll>
  );
}

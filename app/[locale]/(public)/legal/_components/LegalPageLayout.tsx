"use client";

import { useRef, useEffect, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import Link from "next/link";
import { useLocale } from "next-intl";
import { FileText, Shield, Scale, Cookie } from "lucide-react";

interface LegalPageLayoutProps {
  children: ReactNode;
  titleKey: string;
  lastUpdated: string;
}

const LEGAL_PAGES = [
  { key: "terms", href: "/legal/terms", icon: FileText },
  { key: "privacy", href: "/legal/privacy", icon: Shield },
  { key: "legalNotices", href: "/legal/notices", icon: Scale },
  { key: "cookies", href: "/legal/cookies", icon: Cookie },
];

export function LegalPageLayout({ children, titleKey, lastUpdated }: LegalPageLayoutProps) {
  const t = useTranslations("legal");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <main className="bg-background min-h-screen">
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="container">
          <div ref={containerRef} className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-12">
              <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
                {t("eyebrow")}
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4">
                {t(`${titleKey}.title`)}
              </h1>
              <p className="text-muted-foreground">
                {t("lastUpdated")}: {lastUpdated}
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-wrap gap-2 mb-12 pb-8 border-b border-foreground/10">
              {LEGAL_PAGES.map((page) => {
                const Icon = page.icon;
                const isActive = titleKey === page.key;
                return (
                  <Link
                    key={page.key}
                    href={`/${locale}${page.href}`}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? "bg-foreground text-background"
                        : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t(`nav.${page.key}`)}
                  </Link>
                );
              })}
            </nav>

            {/* Content */}
            <div className="legal-content">
              {children}
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-foreground/10">
              <p className="text-sm text-muted-foreground">
                {t("questions")}{" "}
                <a href="mailto:legal@quickfund.ee" className="text-accent hover:underline">
                  legal@quickfund.ee
                </a>
                {" / "}
                <a href="mailto:legal@quickfund.fr" className="text-accent hover:underline">
                  legal@quickfund.fr
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .legal-content section {
          margin-bottom: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .legal-content section:last-child {
          border-bottom: none;
        }
        .legal-content h2 {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--foreground);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--accent);
          display: inline-block;
        }
        .legal-content h3 {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--foreground);
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .legal-content p {
          color: var(--muted-foreground);
          line-height: 1.75;
          margin-bottom: 1rem;
        }
        .legal-content ul {
          margin: 1rem 0;
          padding-left: 0;
          list-style: none;
        }
        .legal-content ul li {
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
          color: var(--muted-foreground);
          line-height: 1.6;
        }
        .legal-content ul li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.6rem;
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
        }
        .legal-content ul li strong {
          color: var(--foreground);
          font-weight: 600;
        }
        .legal-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        .legal-content th {
          text-align: left;
          padding: 0.75rem 1rem;
          background: rgba(0,0,0,0.03);
          font-weight: 600;
          color: var(--foreground);
          border-bottom: 2px solid var(--accent);
        }
        .legal-content td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          color: var(--muted-foreground);
        }
        .legal-content a {
          color: var(--accent);
          text-decoration: none;
        }
        .legal-content a:hover {
          text-decoration: underline;
        }
      `}</style>
    </main>
  );
}

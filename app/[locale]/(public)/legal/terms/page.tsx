"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { gsap } from "gsap";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Shield, Scale, Cookie, ChevronUp, List, X } from "lucide-react";

const LEGAL_PAGES = [
  { key: "terms", href: "/legal/terms", icon: FileText },
  { key: "privacy", href: "/legal/privacy", icon: Shield },
  { key: "legalNotices", href: "/legal/notices", icon: Scale },
  { key: "cookies", href: "/legal/cookies", icon: Cookie },
];

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split("\n");
  const toc: TocItem[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/\*\*/g, "").trim();
      if (level <= 2) {
        toc.push({
          id: slugify(text),
          text,
          level,
        });
      }
    }
  }

  return toc;
}

export default function TermsPage() {
  const t = useTranslations("legal");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showToc, setShowToc] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  const toc = useMemo(() => extractToc(content), [content]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(`/content/legal/${locale}/terms.md`);
        if (response.ok) {
          const text = await response.text();
          setContent(text);
        } else {
          const fallback = await fetch(`/content/legal/fr/terms.md`);
          if (fallback.ok) {
            setContent(await fallback.text());
          }
        }
      } catch (error) {
        console.error("Failed to load terms content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [locale]);

  useEffect(() => {
    if (containerRef.current && !isLoading) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [isLoading]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      const sections = document.querySelectorAll("[data-section-id]");
      let currentSection = "";

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100) {
          currentSection = section.getAttribute("data-section-id") || "";
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      setShowToc(false);
    }
  }, []);

  return (
    <main className="bg-background min-h-screen">
      {/* Mobile: Floating TOC Button */}
      <button
        onClick={() => setShowToc(!showToc)}
        className="fixed bottom-20 right-4 z-40 w-11 h-11 bg-accent text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform lg:hidden"
        aria-label="Table des matières"
      >
        {showToc ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
      </button>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 z-40 w-11 h-11 bg-foreground/10 backdrop-blur-sm text-foreground rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Retour en haut"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Mobile: TOC Drawer */}
      {showToc && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowToc(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-xs bg-background shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-foreground/10 px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">Sommaire</h3>
              <button
                onClick={() => setShowToc(false)}
                className="p-2 -mr-2 active:bg-foreground/5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-3">
              <ul className="space-y-0.5">
                {toc.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        item.level === 1
                          ? "font-semibold text-foreground bg-foreground/5 mt-2 first:mt-0"
                          : "text-muted-foreground active:bg-foreground/5 pl-5"
                      } ${activeSection === item.id ? "!bg-accent/10 !text-accent" : ""}`}
                    >
                      {item.text.length > 35 ? item.text.slice(0, 35) + "…" : item.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile: pt-24, Desktop: pt-40 */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 lg:pt-40 lg:pb-24">
        <div className="container px-4 md:px-6">
          <div className="flex gap-6 lg:gap-8">
            {/* Desktop: TOC Sidebar */}
            <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
              <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 -mr-4">
                <h3 className="font-semibold text-foreground text-sm mb-3 pb-2 border-b border-foreground/10">
                  Sommaire
                </h3>
                <nav>
                  <ul className="space-y-0.5">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => scrollToSection(item.id)}
                          className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                            item.level === 1
                              ? "font-semibold text-foreground mt-3 first:mt-0"
                              : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 pl-3"
                          } ${activeSection === item.id ? "!bg-accent/10 !text-accent" : ""}`}
                        >
                          {item.text.length > 36 ? item.text.slice(0, 36) + "…" : item.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div ref={containerRef} className="flex-1 min-w-0">
              {/* Navigation Tabs */}
              <nav className="flex flex-wrap gap-1.5 mb-6 pb-4 border-b border-foreground/10 md:gap-2 md:mb-8 md:pb-6">
                {LEGAL_PAGES.map((page) => {
                  const Icon = page.icon;
                  const isActive = page.key === "terms";
                  return (
                    <Link
                      key={page.key}
                      href={`/${locale}${page.href}`}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all md:text-sm md:px-4 md:py-2 md:gap-2 ${
                        isActive
                          ? "bg-foreground text-background"
                          : "bg-foreground/5 text-muted-foreground active:bg-foreground/10 hover:bg-foreground/10 hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">{t(`nav.${page.key}`)}</span>
                      <span className="sm:hidden">{page.key === "terms" ? "CGU" : page.key === "privacy" ? "Vie privée" : page.key === "legalNotices" ? "Mentions" : "Cookies"}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Content */}
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <article className="legal-markdown">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => {
                        const text = String(children).replace(/\*\*/g, "");
                        const id = slugify(text);
                        const isPartTitle = text.startsWith("PARTIE");
                        return (
                          <h1
                            id={id}
                            data-section-id={id}
                            className={`font-serif leading-tight text-foreground scroll-mt-24 md:scroll-mt-28 ${
                              isPartTitle
                                ? "text-xl font-bold mt-10 mb-5 pt-6 border-t-2 border-accent first:mt-0 first:pt-0 first:border-t-0 sm:text-2xl md:mt-14 md:mb-6 md:pt-8"
                                : "text-2xl mb-3 sm:text-3xl md:text-4xl md:mb-4"
                            }`}
                          >
                            {children}
                          </h1>
                        );
                      },
                      h2: ({ children }) => {
                        const text = String(children).replace(/\*\*/g, "");
                        const id = slugify(text);
                        return (
                          <h2
                            id={id}
                            data-section-id={id}
                            className="font-serif text-lg font-semibold text-foreground mt-8 mb-4 scroll-mt-24 sm:text-xl md:mt-10 md:mb-5 md:scroll-mt-28"
                          >
                            <span className="pb-1 border-b-2 border-accent">{children}</span>
                          </h2>
                        );
                      },
                      h3: ({ children }) => {
                        const text = String(children).replace(/\*\*/g, "");
                        const id = slugify(text);
                        return (
                          <h3
                            id={id}
                            className="font-semibold text-foreground mt-6 mb-3 scroll-mt-24 md:text-lg md:mt-7 md:mb-4 md:scroll-mt-28"
                          >
                            {children}
                          </h3>
                        );
                      },
                      h4: ({ children }) => (
                        <h4 className="font-semibold text-foreground mt-4 mb-2 text-sm md:mt-5 md:mb-3 md:text-base">
                          {children}
                        </h4>
                      ),
                      p: ({ children }) => (
                        <p className="text-muted-foreground leading-relaxed mb-3 text-sm md:text-base md:mb-4">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-1.5 my-3 ml-1 md:space-y-2 md:my-4">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="space-y-1.5 my-3 list-decimal pl-5 marker:text-accent marker:font-semibold md:space-y-2 md:my-4 md:pl-6">
                          {children}
                        </ol>
                      ),
                      li: ({ children, ordered }) => (
                        <li
                          className={`text-muted-foreground leading-relaxed text-sm md:text-base ${
                            ordered
                              ? "pl-1"
                              : "pl-5 relative before:content-[''] before:absolute before:left-0 before:top-[0.5rem] before:w-1.5 before:h-1.5 before:bg-accent before:rounded-full md:pl-6 md:before:top-[0.6rem]"
                          }`}
                        >
                          {children}
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="my-4 p-3 bg-accent/5 border-l-3 border-accent rounded-r-lg text-sm md:my-6 md:p-4 md:border-l-4 md:text-base">
                          {children}
                        </blockquote>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-4 -mx-4 px-4 md:my-6 md:mx-0 md:px-0">
                          <div className="inline-block min-w-full align-middle">
                            <div className="rounded-lg border border-foreground/10 overflow-hidden">
                              <table className="min-w-full divide-y divide-foreground/10">{children}</table>
                            </div>
                          </div>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-foreground/5">{children}</thead>
                      ),
                      tbody: ({ children }) => (
                        <tbody className="divide-y divide-foreground/10">{children}</tbody>
                      ),
                      tr: ({ children }) => (
                        <tr className="hover:bg-foreground/[0.02] transition-colors">{children}</tr>
                      ),
                      th: ({ children }) => (
                        <th className="text-left px-3 py-2 font-semibold text-foreground text-xs uppercase tracking-wide whitespace-nowrap md:px-4 md:py-3 md:text-sm">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-3 py-2 text-muted-foreground text-xs md:px-4 md:py-3 md:text-sm">
                          {children}
                        </td>
                      ),
                      hr: () => (
                        <hr className="my-6 border-foreground/10 md:my-8" />
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target={href?.startsWith("http") ? "_blank" : undefined}
                          rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="text-accent underline underline-offset-2 decoration-accent/30 hover:decoration-accent"
                        >
                          {children}
                        </a>
                      ),
                      code: ({ children }) => (
                        <code className="px-1 py-0.5 bg-foreground/5 rounded text-xs font-mono text-foreground md:text-sm">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </article>
              )}

              {/* Footer */}
              <div className="mt-10 pt-6 border-t border-foreground/10 md:mt-14 md:pt-8">
                <p className="text-xs text-muted-foreground md:text-sm">
                  {t("questions")}{" "}
                  <a href="mailto:legal@quickfund.ee" className="text-accent hover:underline">
                    legal@quickfund.ee
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

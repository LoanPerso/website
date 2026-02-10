"use client";

import {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
  type ComponentType,
} from "react";
import { useTranslations, useLocale } from "next-intl";
import { gsap } from "gsap";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FileText,
  Shield,
  Scale,
  Cookie,
  ShieldCheck,
  ChevronUp,
  List,
  X,
} from "lucide-react";

type LegalPageKey = "terms" | "privacy" | "legalNotices" | "cookies" | "compliance";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

type LegalMarkdownPageProps = {
  pageKey: LegalPageKey;
  fileSlug: "terms" | "privacy" | "notices" | "cookies" | "compliance";
};

const LEGAL_PAGES: Array<{
  key: LegalPageKey;
  href: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { key: "terms", href: "/legal/terms", icon: FileText },
  { key: "privacy", href: "/legal/privacy", icon: Shield },
  { key: "legalNotices", href: "/legal/notices", icon: Scale },
  { key: "cookies", href: "/legal/cookies", icon: Cookie },
  { key: "compliance", href: "/legal/compliance", icon: ShieldCheck },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(" ");
  if (node && typeof node === "object" && "props" in node) {
    return extractText((node as { props?: { children?: ReactNode } }).props?.children ?? "");
  }
  return "";
}

function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split("\n");
  const toc: TocItem[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (!match) continue;
    const level = match[1].length;
    if (level > 2) continue;

    const text = match[2].replace(/\*\*/g, "").trim();
    toc.push({ id: slugify(text), text, level });
  }

  return toc;
}

export function LegalMarkdownPage({ pageKey, fileSlug }: LegalMarkdownPageProps) {
  const t = useTranslations("legal");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const toc = useMemo(() => extractToc(content), [content]);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      setIsFallback(false);
      try {
        const localized = await fetch(`/content/legal/${locale}/${fileSlug}.md`);
        if (localized.ok) {
          setContent(await localized.text());
          return;
        }

        const fallback = await fetch(`/content/legal/fr/${fileSlug}.md`);
        if (fallback.ok) {
          setContent(await fallback.text());
          setIsFallback(locale !== "fr");
          return;
        }

        setContent("");
        setIsFallback(true);
      } catch (error) {
        console.error(`Failed to load legal content for ${fileSlug}:`, error);
        setContent("");
        setIsFallback(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [locale, fileSlug]);

  useEffect(() => {
    if (!containerRef.current || isLoading) return;
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }
    );
  }, [isLoading, locale, fileSlug]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      const sections = document.querySelectorAll("[data-section-id]");
      let current = "";
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100) {
          current = section.getAttribute("data-section-id") || "";
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
    setShowToc(false);
  }, []);

  return (
    <main className="bg-background min-h-screen">
      <button
        onClick={() => setShowToc(!showToc)}
        className="fixed bottom-20 right-4 z-40 w-11 h-11 bg-accent text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform lg:hidden"
        aria-label="Table of contents"
      >
        {showToc ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
      </button>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 z-40 w-11 h-11 bg-foreground/10 backdrop-blur-sm text-foreground rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Back to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {showToc && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowToc(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-xs bg-background shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-foreground/10 px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">{t("tableOfContents")}</h3>
              <button onClick={() => setShowToc(false)} className="p-2 -mr-2 active:bg-foreground/5 rounded-lg">
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
                        item.level === 1 ? "font-semibold text-foreground bg-foreground/5 mt-2 first:mt-0" : "text-muted-foreground active:bg-foreground/5 pl-5"
                      } ${activeSection === item.id ? "!bg-accent/10 !text-accent" : ""}`}
                    >
                      {item.text.length > 35 ? `${item.text.slice(0, 35)}...` : item.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      <section className="pt-24 pb-12 md:pt-32 md:pb-16 lg:pt-40 lg:pb-24">
        <div className="container px-4 md:px-6">
          <div className="flex gap-6 lg:gap-8">
            <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
              <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 -mr-4">
                <h3 className="font-semibold text-foreground text-sm mb-3 pb-2 border-b border-foreground/10">{t("tableOfContents")}</h3>
                <nav>
                  <ul className="space-y-0.5">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => scrollToSection(item.id)}
                          className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                            item.level === 1 ? "font-semibold text-foreground mt-3 first:mt-0" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 pl-3"
                          } ${activeSection === item.id ? "!bg-accent/10 !text-accent" : ""}`}
                        >
                          {item.text.length > 36 ? `${item.text.slice(0, 36)}...` : item.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>

            <div ref={containerRef} className="flex-1 min-w-0">
              <nav className="flex flex-wrap gap-1.5 mb-6 pb-4 border-b border-foreground/10 md:gap-2 md:mb-8 md:pb-6">
                {LEGAL_PAGES.map((page) => {
                  const Icon = page.icon;
                  const isActive = page.key === pageKey;
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
                      <span>{t(`nav.${page.key}`)}</span>
                    </Link>
                  );
                })}
              </nav>

              {isFallback && (
                <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                  <p className="font-medium">{t("contentUnavailable.title")}</p>
                  <p className="mt-1">{t("contentUnavailable.description")}</p>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : content ? (
                <article className="legal-markdown">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => {
                        const text = extractText(children).replace(/\*\*/g, "");
                        const id = slugify(text);
                        return (
                          <h1 id={id} data-section-id={id} className="font-serif text-2xl mb-3 leading-tight text-foreground scroll-mt-24 sm:text-3xl md:text-4xl md:mb-4 md:scroll-mt-28">
                            {children}
                          </h1>
                        );
                      },
                      h2: ({ children }) => {
                        const text = extractText(children).replace(/\*\*/g, "");
                        const id = slugify(text);
                        return (
                          <h2 id={id} data-section-id={id} className="font-serif text-lg font-semibold text-foreground mt-8 mb-4 scroll-mt-24 sm:text-xl md:mt-10 md:mb-5 md:scroll-mt-28">
                            <span className="pb-1 border-b-2 border-accent">{children}</span>
                          </h2>
                        );
                      },
                      h3: ({ children }) => {
                        const text = extractText(children).replace(/\*\*/g, "");
                        const id = slugify(text);
                        return (
                          <h3 id={id} className="font-semibold text-foreground mt-6 mb-3 scroll-mt-24 md:text-lg md:mt-7 md:mb-4 md:scroll-mt-28">
                            {children}
                          </h3>
                        );
                      },
                      p: ({ children }) => <p className="text-muted-foreground leading-relaxed mb-3 text-sm md:text-base md:mb-4">{children}</p>,
                      ul: ({ children }) => <ul className="space-y-1.5 my-3 ml-1 md:space-y-2 md:my-4">{children}</ul>,
                      ol: ({ children }) => <ol className="space-y-1.5 my-3 list-decimal pl-5 marker:text-accent marker:font-semibold md:space-y-2 md:my-4 md:pl-6">{children}</ol>,
                      li: ({ children }) => <li className="text-muted-foreground leading-relaxed text-sm md:text-base">{children}</li>,
                      table: ({ children }) => <div className="overflow-x-auto my-6"><table className="w-full border-collapse min-w-[520px]">{children}</table></div>,
                      th: ({ children }) => <th className="text-left p-3 bg-foreground/[0.03] font-semibold text-foreground border-b-2 border-accent text-sm">{children}</th>,
                      td: ({ children }) => <td className="p-3 border-b border-foreground/10 text-muted-foreground text-sm align-top">{children}</td>,
                      a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4">{children}</a>,
                      hr: () => <hr className="my-8 border-foreground/10" />,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-accent pl-4 italic text-foreground/80 my-5">{children}</blockquote>,
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </article>
              ) : (
                <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] px-5 py-6 text-sm text-muted-foreground">
                  {t("contentUnavailable.empty")}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LegalMarkdownPage;

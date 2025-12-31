"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { Link } from "@/_i18n/navigation";
import Magnetic from "@/_components/ui/magnetic-button";

gsap.registerPlugin(ScrollTrigger);

const socialLinks = [
  { name: "LinkedIn", href: "#" },
  { name: "Twitter", href: "#" },
];

export function SiteFooter() {
  const t = useTranslations("common");
  const footerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 80%",
          },
        }
      );

      const linkGroups = linksRef.current?.querySelectorAll(".link-group");
      if (linkGroups) {
        gsap.fromTo(
          linkGroups,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 70%",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const productLinksData = [
    { name: t("products.microCredit"), href: "/products/micro-credit" },
    { name: t("products.consumerCredit"), href: "/products/consumer" },
    { name: t("products.proCredit"), href: "/products/professional" },
    { name: t("products.studentLoan"), href: "/products/student" },
    { name: t("products.salaryAdvance"), href: "/products/salary-advance" },
  ];

  const legalLinksData = [
    { name: t("legal.legalNotice"), href: "/legal" },
    { name: t("legal.privacy"), href: "/legal/privacy" },
    { name: t("legal.terms"), href: "/legal/terms" },
  ];

  return (
    <footer
      ref={footerRef}
      className="relative bg-deep-black !text-white pt-24 pb-12 overflow-hidden"
    >
      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-20 gap-16">
          <div className="space-y-8 max-w-xl">
            <h2
              ref={titleRef}
              className="text-5xl md:text-7xl lg:text-8xl font-serif leading-[0.9]"
            >
              {t("footer.title")}
              <br />
              <span className="text-accent italic">{t("footer.titleAccent")}</span>
            </h2>
            <p className="text-white/50 text-lg max-w-md">
              {t("footer.description")}
            </p>
            <Magnetic>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 rounded-full text-sm uppercase tracking-wider hover:bg-white hover:text-deep-black transition-all duration-300"
              >
                {t("footer.contact")}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </Magnetic>
          </div>

          <div
            ref={linksRef}
            className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm"
          >
            <div className="link-group space-y-4">
              <h3 className="text-white uppercase tracking-wider text-xs font-medium">
                {t("nav.products")}
              </h3>
              <ul className="space-y-3 text-white/50">
                {productLinksData.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-accent transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-group space-y-4">
              <h3 className="text-white uppercase tracking-wider text-xs font-medium">
                {t("footer.sections.legal")}
              </h3>
              <ul className="space-y-3 text-white/50">
                {legalLinksData.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-accent transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-group space-y-4">
              <h3 className="text-white uppercase tracking-wider text-xs font-medium">
                {t("footer.sections.social")}
              </h3>
              <ul className="space-y-3 text-white/50">
                {socialLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="text-accent font-serif text-base not-italic normal-case">
              Quickfund
            </span>
            <span>© 2025</span>
          </div>

          <div className="flex items-center gap-6">
            <span>{t("footer.locations.estonia")}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{t("footer.locations.france")}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{t("footer.locations.europe")}</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-accent/5 to-transparent pointer-events-none" />

      <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[1px] h-32 bg-gradient-to-b from-accent/50 to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-[1px] bg-gradient-to-l from-accent/50 to-transparent" />
      </div>
    </footer>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/_i18n/navigation";
import { locales, type Locale } from "@/_i18n/config";
import { Globe, ChevronDown, Check, MapPin } from "lucide-react";

const localeNames: Record<Locale, string> = {
  et: "Eesti",
  fr: "Français",
  en: "English",
  es: "Español",
};

interface LanguageSwitcherProps {
  variant?: "desktop" | "mobile";
}

export function LanguageSwitcher({ variant = "desktop" }: LanguageSwitcherProps) {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowNotice(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "mobile") {
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <span className="text-background/50 text-xs uppercase tracking-widest mb-2">
          Language
        </span>
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleChange(loc)}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                locale === loc
                  ? "bg-accent text-deep-black font-medium"
                  : "bg-background/10 text-background hover:bg-background/20"
              }`}
            >
              <span className="text-sm">{localeNames[loc]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-3 py-2 text-white/70 hover:text-white transition-colors duration-200"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">
          {locale.toUpperCase()}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 bg-deep-black border border-white/10 rounded-lg shadow-2xl min-w-[200px] z-50 overflow-hidden"
          role="listbox"
        >
          {/* Notice */}
          {showNotice && (
            <div className="px-3 py-2.5 bg-accent/10 border-b border-white/5">
              <div className="flex items-start gap-2">
                <MapPin className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-white/60 leading-tight">
                  {t("languageNotice.terms")}
                </p>
              </div>
            </div>
          )}

          {/* Language options */}
          <div className="py-1">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleChange(loc)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-left transition-colors duration-150 ${
                  locale === loc
                    ? "bg-white/10 text-accent"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
                role="option"
                aria-selected={locale === loc}
              >
                <span className="text-sm">{localeNames[loc]}</span>
                {locale === loc && (
                  <Check className="w-3.5 h-3.5 text-accent" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;

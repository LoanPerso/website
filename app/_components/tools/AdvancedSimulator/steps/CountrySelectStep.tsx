"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { gsap } from "gsap";
import { Globe, Search, ChevronDown, Check, Star } from "lucide-react";
import { CountryCode } from "../types";
import { ALL_COUNTRIES, CONFIGURED_COUNTRIES } from "../countries";

interface CountrySelectStepProps {
  onSelect: (country: CountryCode) => void;
  t: (key: string) => string;
  locale?: string;
}

export function CountrySelectStep({ onSelect, t, locale = "fr" }: CountrySelectStepProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      // Show configured countries first, then others
      const configured = ALL_COUNTRIES.filter((c) =>
        CONFIGURED_COUNTRIES.includes(c.code)
      );
      const others = ALL_COUNTRIES.filter(
        (c) => !CONFIGURED_COUNTRIES.includes(c.code)
      );
      return [...configured, ...others];
    }

    return ALL_COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.nameEn.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Get country name based on locale
  const getCountryDisplayName = (code: string): string => {
    const country = ALL_COUNTRIES.find((c) => c.code === code);
    if (!country) return code;
    return locale === "fr" ? country.name : country.nameEn;
  };

  // Animate on mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCountries.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCountries[highlightedIndex]) {
          handleSelect(filteredCountries[highlightedIndex].code);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Handle selection
  const handleSelect = (code: string) => {
    setSelectedCountry(code);
    setIsOpen(false);
    setSearchQuery("");

    // Animate and trigger callback
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        scale: 0.98,
        duration: 0.1,
        ease: "power2.in",
        onComplete: () => {
          gsap.to(containerRef.current, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
            onComplete: () => {
              setTimeout(() => onSelect(code), 200);
            },
          });
        },
      });
    }
  };

  // Check if country is configured (has personalized experience)
  const isConfigured = (code: string): boolean => {
    return CONFIGURED_COUNTRIES.includes(code);
  };

  return (
    <div ref={containerRef} className="relative max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
          <Globe className="w-6 h-6 text-accent" />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-accent mb-4">
          {t("simulator.advanced.step0Eyebrow")}
        </p>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light mb-4">
          {t("simulator.advanced.step0Title")}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t("simulator.advanced.step0Subtitle")}
        </p>
      </div>

      {/* Dropdown */}
      <div ref={dropdownRef} className="relative" onKeyDown={handleKeyDown}>
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 100);
            }
          }}
          className={`w-full px-5 py-4 text-left bg-foreground/[0.02] border rounded-xl transition-all duration-200 flex items-center justify-between ${
            isOpen
              ? "border-accent ring-2 ring-accent/20"
              : "border-foreground/10 hover:border-foreground/20"
          }`}
        >
          <span className={selectedCountry ? "text-foreground" : "text-muted-foreground"}>
            {selectedCountry
              ? getCountryDisplayName(selectedCountry)
              : t("simulator.advanced.selectCountry")}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-background border border-foreground/10 rounded-xl shadow-xl overflow-hidden">
            {/* Search input */}
            <div className="p-3 border-b border-foreground/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  placeholder={t("simulator.advanced.searchCountry")}
                  className="w-full pl-10 pr-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Countries list */}
            <div className="max-h-64 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  {t("simulator.advanced.noCountryFound")}
                </div>
              ) : (
                <div className="py-1">
                  {filteredCountries.map((country, index) => {
                    const configured = isConfigured(country.code);
                    const isHighlighted = index === highlightedIndex;
                    const isSelected = selectedCountry === country.code;

                    return (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleSelect(country.code)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                          isHighlighted
                            ? "bg-accent/10"
                            : "hover:bg-foreground/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-foreground">
                            {locale === "fr" ? country.name : country.nameEn}
                          </span>
                          {configured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-accent/10 text-accent rounded-full">
                              <Star className="w-3 h-3" />
                              {t("simulator.advanced.optimized")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-mono">
                            {country.code}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-accent" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info text */}
      <p className="text-center text-xs text-muted-foreground/60 mt-6">
        {t("simulator.advanced.countryHint")}
      </p>
    </div>
  );
}

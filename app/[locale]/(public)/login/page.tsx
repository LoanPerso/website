"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useTranslations } from "next-intl";
import { Link } from "@/_i18n/navigation";

export default function LoginPage() {
  const t = useTranslations("login");
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background pattern animation
      gsap.fromTo(
        ".login-bg-pattern",
        { opacity: 0 },
        { opacity: 0.02, duration: 1.5, ease: "power2.out" }
      );

      // Logo animation
      gsap.fromTo(
        ".login-logo",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" }
      );

      // Title animation
      gsap.fromTo(
        ".login-title",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power3.out" }
      );

      // Subtitle animation
      gsap.fromTo(
        ".login-subtitle",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.4, ease: "power3.out" }
      );

      // Form elements stagger animation
      const formElements = formRef.current?.querySelectorAll(".form-element");
      if (formElements) {
        gsap.fromTo(
          formElements,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.5,
            ease: "power3.out",
          }
        );
      }

      // Decorative lines
      gsap.fromTo(
        ".login-line",
        { scaleX: 0 },
        { scaleX: 1, duration: 1, delay: 0.6, ease: "power3.inOut" }
      );

      // Corner decorations
      gsap.fromTo(
        ".corner-decoration",
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Button animation
    gsap.to(".login-button", {
      scale: 0.98,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0B0B0C] flex items-center justify-center relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="login-bg-pattern absolute inset-0 opacity-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(200, 169, 106, 0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-champagne/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-champagne/3 rounded-full blur-[120px] pointer-events-none" />

      {/* Corner decorations */}
      <div className="corner-decoration absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-champagne/20" />
      <div className="corner-decoration absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-champagne/20" />
      <div className="corner-decoration absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-champagne/20" />
      <div className="corner-decoration absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-champagne/20" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="login-logo text-center mb-10">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-serif text-white">
              <span className="font-medium">Quick</span>fund
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-sm p-8 md:p-10">
          {/* Top decorative line */}
          <div className="login-line absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-champagne/50 to-transparent origin-center" />

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="login-title font-serif text-3xl md:text-4xl text-white mb-3">
              {t("title")}
            </h1>
            <p className="login-subtitle text-white/50 text-sm">
              {t("subtitle")}
            </p>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div className="form-element">
              <label
                htmlFor="email"
                className="block text-sm text-white/70 mb-2 uppercase tracking-wider"
              >
                {t("email.label")}
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("email.placeholder")}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-champagne/50 focus:bg-white/[0.05] transition-all duration-300"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg
                    className="w-5 h-5 text-white/30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password field */}
            <div className="form-element">
              <label
                htmlFor="password"
                className="block text-sm text-white/70 mb-2 uppercase tracking-wider"
              >
                {t("password.label")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("password.placeholder")}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-3 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-champagne/50 focus:bg-white/[0.05] transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="form-element flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-champagne/70 hover:text-champagne transition-colors"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            {/* Submit button */}
            <div className="form-element">
              <button
                type="submit"
                disabled={isLoading}
                className="login-button w-full relative bg-champagne text-deep-black font-medium py-4 px-6 rounded-sm uppercase tracking-widest text-sm hover:bg-champagne/90 focus:outline-none focus:ring-2 focus:ring-champagne/50 focus:ring-offset-2 focus:ring-offset-[#0B0B0C] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
              >
                <span
                  className={`inline-flex items-center gap-2 transition-all duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
                >
                  {t("submit")}
                </span>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                )}
                {/* Hover shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </button>
            </div>

            {/* Security note */}
            <div className="form-element flex items-center justify-center gap-2 text-white/30 text-xs">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{t("securityNote")}</span>
            </div>
          </form>

          {/* Bottom decorative line */}
          <div className="login-line absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-champagne/50 to-transparent origin-center" />
        </div>

        {/* Create account link */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm">
            {t("noAccount")}{" "}
            <Link
              href="/register"
              className="text-champagne hover:text-champagne/80 transition-colors"
            >
              {t("createAccount")}
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors group"
          >
            <svg
              className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M19 12H5m0 0l7 7m-7-7l7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Quickfund</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

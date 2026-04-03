"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/_i18n/navigation";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactClient() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  const canSend = useMemo(() => message.trim().length > 0 && status !== "sending", [message, status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!message.trim()) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact/telegram", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          website,
          locale,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.code || "SEND_FAILED");
      }

      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
      setWebsite("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "SEND_FAILED");
    }
  }

  return (
    <div className="bg-background text-foreground">
      <section className="container mx-auto px-6 md:px-8 pt-28 pb-20">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
            {t("eyebrow")}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl leading-[0.95] mb-6">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-10">
            {t("subtitle")}
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-sm text-muted-foreground">{t("form.name")}</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-accent/40"
                  autoComplete="name"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-muted-foreground">{t("form.email")}</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-accent/40"
                  autoComplete="email"
                  inputMode="email"
                />
              </label>
            </div>

            {/* Honeypot */}
            <label className="hidden">
              Website
              <input value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>

            <label className="space-y-2 block">
              <span className="text-sm text-muted-foreground">{t("form.message")}</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full min-h-[160px] rounded-xl border border-foreground/10 bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-accent/40 resize-y"
                placeholder={t("form.placeholder")}
              />
            </label>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-foreground text-background text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-deep-black transition-colors"
              >
                {status === "sending" ? t("form.sending") : t("form.send")}
              </button>

              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                {t("backHome")}
              </Link>
            </div>

            {status === "sent" && (
              <p className="text-sm text-accent">{t("form.success")}</p>
            )}
            {status === "error" && (
              <p className="text-sm text-red-600">
                {t("form.error")} ({errorMsg})
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}

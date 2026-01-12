"use client";

import { useTranslations } from "next-intl";
import { LegalPageLayout } from "../_components/LegalPageLayout";

export default function CookiesPage() {
  const t = useTranslations("legal.cookies");

  return (
    <LegalPageLayout titleKey="cookies" lastUpdated="2025-01-12">
      {/* Introduction */}
      <section>
        <h2>{t("sections.intro.title")}</h2>
        <p>{t("sections.intro.content")}</p>
      </section>

      {/* What are cookies */}
      <section>
        <h2>{t("sections.what.title")}</h2>
        <p>{t("sections.what.content")}</p>
      </section>

      {/* Types of cookies */}
      <section>
        <h2>{t("sections.types.title")}</h2>

        <h3>{t("sections.types.essential.title")}</h3>
        <p>{t("sections.types.essential.desc")}</p>
        <ul>
          <li>{t("sections.types.essential.session")}</li>
          <li>{t("sections.types.essential.security")}</li>
          <li>{t("sections.types.essential.preferences")}</li>
        </ul>

        <h3>{t("sections.types.functional.title")}</h3>
        <p>{t("sections.types.functional.desc")}</p>
        <ul>
          <li>{t("sections.types.functional.language")}</li>
          <li>{t("sections.types.functional.settings")}</li>
        </ul>

        <h3>{t("sections.types.analytics.title")}</h3>
        <p>{t("sections.types.analytics.desc")}</p>
        <ul>
          <li>{t("sections.types.analytics.usage")}</li>
          <li>{t("sections.types.analytics.performance")}</li>
        </ul>
      </section>

      {/* Cookie list */}
      <section>
        <h2>{t("sections.list.title")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-foreground/10">
                <th className="text-left py-3 pr-4">{t("sections.list.name")}</th>
                <th className="text-left py-3 pr-4">{t("sections.list.purpose")}</th>
                <th className="text-left py-3 pr-4">{t("sections.list.duration")}</th>
                <th className="text-left py-3">{t("sections.list.type")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-foreground/5">
                <td className="py-3 pr-4">session_id</td>
                <td className="py-3 pr-4">{t("sections.list.sessionPurpose")}</td>
                <td className="py-3 pr-4">{t("sections.list.sessionDuration")}</td>
                <td className="py-3">{t("sections.types.essential.title")}</td>
              </tr>
              <tr className="border-b border-foreground/5">
                <td className="py-3 pr-4">locale</td>
                <td className="py-3 pr-4">{t("sections.list.localePurpose")}</td>
                <td className="py-3 pr-4">1 {t("sections.list.year")}</td>
                <td className="py-3">{t("sections.types.functional.title")}</td>
              </tr>
              <tr className="border-b border-foreground/5">
                <td className="py-3 pr-4">cookie_consent</td>
                <td className="py-3 pr-4">{t("sections.list.consentPurpose")}</td>
                <td className="py-3 pr-4">1 {t("sections.list.year")}</td>
                <td className="py-3">{t("sections.types.essential.title")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Third-party */}
      <section>
        <h2>{t("sections.thirdParty.title")}</h2>
        <p>{t("sections.thirdParty.content")}</p>
        <ul>
          <li><strong>Stripe:</strong> {t("sections.thirdParty.stripe")}</li>
        </ul>
      </section>

      {/* Managing cookies */}
      <section>
        <h2>{t("sections.manage.title")}</h2>
        <p>{t("sections.manage.content")}</p>
        <ul>
          <li><strong>Chrome:</strong> {t("sections.manage.chrome")}</li>
          <li><strong>Firefox:</strong> {t("sections.manage.firefox")}</li>
          <li><strong>Safari:</strong> {t("sections.manage.safari")}</li>
          <li><strong>Edge:</strong> {t("sections.manage.edge")}</li>
        </ul>
        <p>{t("sections.manage.warning")}</p>
      </section>

      {/* Consent */}
      <section>
        <h2>{t("sections.consent.title")}</h2>
        <p>{t("sections.consent.content")}</p>
      </section>

      {/* Changes */}
      <section>
        <h2>{t("sections.changes.title")}</h2>
        <p>{t("sections.changes.content")}</p>
      </section>

      {/* Contact */}
      <section>
        <h2>{t("sections.contact.title")}</h2>
        <p>{t("sections.contact.content")}</p>
        <ul>
          <li><strong>Email:</strong> legal@quickfund.ee / legal@quickfund.fr</li>
        </ul>
      </section>
    </LegalPageLayout>
  );
}

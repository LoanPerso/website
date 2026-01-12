"use client";

import { useTranslations } from "next-intl";
import { LegalPageLayout } from "../_components/LegalPageLayout";

export default function LegalNoticesPage() {
  const t = useTranslations("legal.legalNotices");

  return (
    <LegalPageLayout titleKey="legalNotices" lastUpdated="2025-01-12">
      {/* Publisher */}
      <section>
        <h2>{t("sections.publisher.title")}</h2>
        <ul>
          <li><strong>{t("sections.publisher.company")}:</strong> Quickfund OU</li>
          <li><strong>{t("sections.publisher.legalForm")}:</strong> Osauhing (OU) - Estonia</li>
          <li><strong>{t("sections.publisher.regNumber")}:</strong> 31303066</li>
          <li><strong>{t("sections.publisher.address")}:</strong> Tallinn, Estonia</li>
          <li><strong>{t("sections.publisher.email")}:</strong> contact@quickfund.ee</li>
          <li><strong>{t("sections.publisher.director")}:</strong> Gaylor LOCHE</li>
        </ul>
      </section>

      {/* Parent Company */}
      <section>
        <h2>{t("sections.parent.title")}</h2>
        <ul>
          <li><strong>{t("sections.parent.company")}:</strong> DVPHolding OU</li>
          <li><strong>{t("sections.parent.regNumber")}:</strong> 31007721</li>
          <li><strong>{t("sections.parent.address")}:</strong> Tallinn, Estonia</li>
        </ul>
      </section>

      {/* Regulatory */}
      <section>
        <h2>{t("sections.regulatory.title")}</h2>
        <ul>
          <li><strong>{t("sections.regulatory.authority")}:</strong> Finantsinspektsioon (FSA Estonia)</li>
          <li><strong>{t("sections.regulatory.license")}:</strong> {t("sections.regulatory.licenseType")}</li>
          <li><strong>{t("sections.regulatory.euPassport")}:</strong> {t("sections.regulatory.euPassportDesc")}</li>
        </ul>
        <p>{t("sections.regulatory.content")}</p>
      </section>

      {/* Hosting */}
      <section>
        <h2>{t("sections.hosting.title")}</h2>
        <ul>
          <li><strong>{t("sections.hosting.provider")}:</strong> Google Cloud Platform (GCP)</li>
          <li><strong>{t("sections.hosting.location")}:</strong> European Union</li>
          <li><strong>{t("sections.hosting.address")}:</strong> Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland</li>
        </ul>
      </section>

      {/* Intellectual Property */}
      <section>
        <h2>{t("sections.ip.title")}</h2>
        <p>{t("sections.ip.content")}</p>
        <ul>
          <li>{t("sections.ip.trademark")}</li>
          <li>{t("sections.ip.content2")}</li>
          <li>{t("sections.ip.design")}</li>
          <li>{t("sections.ip.software")}</li>
        </ul>
      </section>

      {/* Links */}
      <section>
        <h2>{t("sections.links.title")}</h2>
        <p>{t("sections.links.content")}</p>
      </section>

      {/* Liability */}
      <section>
        <h2>{t("sections.liability.title")}</h2>
        <p>{t("sections.liability.content")}</p>
      </section>

      {/* Accessibility */}
      <section>
        <h2>{t("sections.accessibility.title")}</h2>
        <p>{t("sections.accessibility.content")}</p>
      </section>

      {/* Credits */}
      <section>
        <h2>{t("sections.credits.title")}</h2>
        <ul>
          <li><strong>{t("sections.credits.design")}:</strong> Quickfund OU</li>
          <li><strong>{t("sections.credits.dev")}:</strong> Quickfund OU</li>
        </ul>
      </section>

      {/* Applicable Law */}
      <section>
        <h2>{t("sections.applicableLaw.title")}</h2>
        <p>{t("sections.applicableLaw.content")}</p>
      </section>
    </LegalPageLayout>
  );
}

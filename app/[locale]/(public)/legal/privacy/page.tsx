"use client";

import { useTranslations } from "next-intl";
import { LegalPageLayout } from "../_components/LegalPageLayout";

export default function PrivacyPage() {
  const t = useTranslations("legal.privacy");

  return (
    <LegalPageLayout titleKey="privacy" lastUpdated="2025-01-12">
      {/* Introduction */}
      <section>
        <h2>{t("sections.intro.title")}</h2>
        <p>{t("sections.intro.content")}</p>
      </section>

      {/* Controller */}
      <section>
        <h2>{t("sections.controller.title")}</h2>
        <p>{t("sections.controller.content")}</p>
        <ul>
          <li><strong>{t("sections.controller.company")}:</strong> Quickfund OU</li>
          <li><strong>{t("sections.controller.regNumber")}:</strong> 31303066</li>
          <li><strong>{t("sections.controller.address")}:</strong> Tallinn, Estonia</li>
          <li><strong>{t("sections.controller.email")}:</strong> legal@quickfund.ee</li>
          <li><strong>{t("sections.controller.parent")}:</strong> DVPHolding OU (31007721)</li>
        </ul>
      </section>

      {/* Data Collected */}
      <section>
        <h2>{t("sections.dataCollected.title")}</h2>
        <p>{t("sections.dataCollected.intro")}</p>

        <h3>{t("sections.dataCollected.identity.title")}</h3>
        <ul>
          <li>{t("sections.dataCollected.identity.name")}</li>
          <li>{t("sections.dataCollected.identity.dob")}</li>
          <li>{t("sections.dataCollected.identity.nationality")}</li>
          <li>{t("sections.dataCollected.identity.idDoc")}</li>
        </ul>

        <h3>{t("sections.dataCollected.contact.title")}</h3>
        <ul>
          <li>{t("sections.dataCollected.contact.email")}</li>
          <li>{t("sections.dataCollected.contact.phone")}</li>
          <li>{t("sections.dataCollected.contact.address")}</li>
        </ul>

        <h3>{t("sections.dataCollected.financial.title")}</h3>
        <ul>
          <li>{t("sections.dataCollected.financial.income")}</li>
          <li>{t("sections.dataCollected.financial.employment")}</li>
          <li>{t("sections.dataCollected.financial.bank")}</li>
        </ul>

        <h3>{t("sections.dataCollected.technical.title")}</h3>
        <ul>
          <li>{t("sections.dataCollected.technical.ip")}</li>
          <li>{t("sections.dataCollected.technical.device")}</li>
          <li>{t("sections.dataCollected.technical.cookies")}</li>
        </ul>
      </section>

      {/* Legal Basis */}
      <section>
        <h2>{t("sections.legalBasis.title")}</h2>
        <p>{t("sections.legalBasis.intro")}</p>
        <ul>
          <li><strong>{t("sections.legalBasis.contract")}:</strong> {t("sections.legalBasis.contractDesc")}</li>
          <li><strong>{t("sections.legalBasis.legal")}:</strong> {t("sections.legalBasis.legalDesc")}</li>
          <li><strong>{t("sections.legalBasis.consent")}:</strong> {t("sections.legalBasis.consentDesc")}</li>
          <li><strong>{t("sections.legalBasis.legitimate")}:</strong> {t("sections.legalBasis.legitimateDesc")}</li>
        </ul>
      </section>

      {/* Purposes */}
      <section>
        <h2>{t("sections.purposes.title")}</h2>
        <ul>
          <li>{t("sections.purposes.creditAssessment")}</li>
          <li>{t("sections.purposes.contractExecution")}</li>
          <li>{t("sections.purposes.kyc")}</li>
          <li>{t("sections.purposes.fraud")}</li>
          <li>{t("sections.purposes.communication")}</li>
          <li>{t("sections.purposes.improvement")}</li>
          <li>{t("sections.purposes.legal")}</li>
        </ul>
      </section>

      {/* Data Sharing */}
      <section>
        <h2>{t("sections.sharing.title")}</h2>
        <p>{t("sections.sharing.intro")}</p>
        <ul>
          <li><strong>{t("sections.sharing.stripe")}:</strong> {t("sections.sharing.stripeDesc")}</li>
          <li><strong>{t("sections.sharing.cloud")}:</strong> {t("sections.sharing.cloudDesc")}</li>
          <li><strong>{t("sections.sharing.authorities")}:</strong> {t("sections.sharing.authoritiesDesc")}</li>
        </ul>
      </section>

      {/* Retention */}
      <section>
        <h2>{t("sections.retention.title")}</h2>
        <p>{t("sections.retention.intro")}</p>
        <ul>
          <li>{t("sections.retention.contract")}</li>
          <li>{t("sections.retention.kyc")}</li>
          <li>{t("sections.retention.legal")}</li>
        </ul>
      </section>

      {/* Security */}
      <section>
        <h2>{t("sections.security.title")}</h2>
        <p>{t("sections.security.content")}</p>
        <ul>
          <li>{t("sections.security.encryption")}</li>
          <li>{t("sections.security.access")}</li>
          <li>{t("sections.security.monitoring")}</li>
          <li>{t("sections.security.storage")}</li>
        </ul>
      </section>

      {/* Rights */}
      <section>
        <h2>{t("sections.rights.title")}</h2>
        <p>{t("sections.rights.intro")}</p>
        <ul>
          <li><strong>{t("sections.rights.access")}:</strong> {t("sections.rights.accessDesc")}</li>
          <li><strong>{t("sections.rights.rectification")}:</strong> {t("sections.rights.rectificationDesc")}</li>
          <li><strong>{t("sections.rights.erasure")}:</strong> {t("sections.rights.erasureDesc")}</li>
          <li><strong>{t("sections.rights.restriction")}:</strong> {t("sections.rights.restrictionDesc")}</li>
          <li><strong>{t("sections.rights.portability")}:</strong> {t("sections.rights.portabilityDesc")}</li>
          <li><strong>{t("sections.rights.objection")}:</strong> {t("sections.rights.objectionDesc")}</li>
        </ul>
        <p>{t("sections.rights.exercise")}</p>
      </section>

      {/* International Transfers */}
      <section>
        <h2>{t("sections.transfers.title")}</h2>
        <p>{t("sections.transfers.content")}</p>
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
          <li><strong>Email:</strong> legal@quickfund.ee</li>
          <li><strong>{t("sections.contact.address")}:</strong> Quickfund OU, Tallinn, Estonia</li>
        </ul>
        <p>{t("sections.contact.authority")}</p>
      </section>
    </LegalPageLayout>
  );
}

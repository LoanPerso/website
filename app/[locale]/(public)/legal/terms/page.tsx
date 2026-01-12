"use client";

import { useTranslations } from "next-intl";
import { LegalPageLayout } from "../_components/LegalPageLayout";

export default function TermsPage() {
  const t = useTranslations("legal.terms");

  return (
    <LegalPageLayout titleKey="terms" lastUpdated="2025-01-12">
      {/* Introduction */}
      <section>
        <h2>{t("sections.intro.title")}</h2>
        <p>{t("sections.intro.content")}</p>
      </section>

      {/* Definitions */}
      <section>
        <h2>{t("sections.definitions.title")}</h2>
        <ul>
          <li><strong>{t("sections.definitions.platform")}</strong>: {t("sections.definitions.platformDef")}</li>
          <li><strong>{t("sections.definitions.user")}</strong>: {t("sections.definitions.userDef")}</li>
          <li><strong>{t("sections.definitions.borrower")}</strong>: {t("sections.definitions.borrowerDef")}</li>
          <li><strong>{t("sections.definitions.credit")}</strong>: {t("sections.definitions.creditDef")}</li>
          <li><strong>{t("sections.definitions.services")}</strong>: {t("sections.definitions.servicesDef")}</li>
        </ul>
      </section>

      {/* Acceptance */}
      <section>
        <h2>{t("sections.acceptance.title")}</h2>
        <p>{t("sections.acceptance.content")}</p>
      </section>

      {/* Services */}
      <section>
        <h2>{t("sections.services.title")}</h2>
        <p>{t("sections.services.intro")}</p>
        <ul>
          <li>{t("sections.services.microCredit")}</li>
          <li>{t("sections.services.consumerCredit")}</li>
          <li>{t("sections.services.proCredit")}</li>
          <li>{t("sections.services.studentLoan")}</li>
          <li>{t("sections.services.salaryAdvance")}</li>
          <li>{t("sections.services.leasing")}</li>
          <li>{t("sections.services.coaching")}</li>
        </ul>
      </section>

      {/* Eligibility */}
      <section>
        <h2>{t("sections.eligibility.title")}</h2>
        <p>{t("sections.eligibility.intro")}</p>
        <ul>
          <li>{t("sections.eligibility.age")}</li>
          <li>{t("sections.eligibility.residence")}</li>
          <li>{t("sections.eligibility.capacity")}</li>
          <li>{t("sections.eligibility.identity")}</li>
        </ul>
      </section>

      {/* Application Process */}
      <section>
        <h2>{t("sections.application.title")}</h2>
        <p>{t("sections.application.content")}</p>
      </section>

      {/* Credit Terms */}
      <section>
        <h2>{t("sections.creditTerms.title")}</h2>
        <p>{t("sections.creditTerms.content")}</p>
        <ul>
          <li>{t("sections.creditTerms.amount")}</li>
          <li>{t("sections.creditTerms.duration")}</li>
          <li>{t("sections.creditTerms.rate")}</li>
          <li>{t("sections.creditTerms.repayment")}</li>
        </ul>
      </section>

      {/* User Obligations */}
      <section>
        <h2>{t("sections.obligations.title")}</h2>
        <p>{t("sections.obligations.intro")}</p>
        <ul>
          <li>{t("sections.obligations.accurate")}</li>
          <li>{t("sections.obligations.update")}</li>
          <li>{t("sections.obligations.repay")}</li>
          <li>{t("sections.obligations.notify")}</li>
        </ul>
      </section>

      {/* Right of Withdrawal */}
      <section>
        <h2>{t("sections.withdrawal.title")}</h2>
        <p>{t("sections.withdrawal.content")}</p>
      </section>

      {/* Early Repayment */}
      <section>
        <h2>{t("sections.earlyRepayment.title")}</h2>
        <p>{t("sections.earlyRepayment.content")}</p>
      </section>

      {/* Late Payment */}
      <section>
        <h2>{t("sections.latePayment.title")}</h2>
        <p>{t("sections.latePayment.content")}</p>
      </section>

      {/* Liability */}
      <section>
        <h2>{t("sections.liability.title")}</h2>
        <p>{t("sections.liability.content")}</p>
      </section>

      {/* Modifications */}
      <section>
        <h2>{t("sections.modifications.title")}</h2>
        <p>{t("sections.modifications.content")}</p>
      </section>

      {/* Governing Law */}
      <section>
        <h2>{t("sections.governingLaw.title")}</h2>
        <p>{t("sections.governingLaw.content")}</p>
      </section>

      {/* Contact */}
      <section>
        <h2>{t("sections.contact.title")}</h2>
        <p>{t("sections.contact.content")}</p>
        <ul>
          <li><strong>Email:</strong> legal@quickfund.ee</li>
          <li><strong>{t("sections.contact.address")}:</strong> Quickfund OU, Tallinn, Estonia</li>
          <li><strong>{t("sections.contact.regNumber")}:</strong> 31303066</li>
        </ul>
      </section>
    </LegalPageLayout>
  );
}

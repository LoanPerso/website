import type { Metadata } from "next";
import { NEW_CREDIT_CLOSED } from "@/_config/site-mode";
import { ServiceClosedNotice } from "@/_components/service-closed-notice";
import WhyUs2PageClient from "./page.client";

export function generateMetadata(): Metadata {
  return NEW_CREDIT_CLOSED ? { robots: { index: false, follow: false } } : {};
}

export default function WhyUs2Page() {
  if (NEW_CREDIT_CLOSED) return <ServiceClosedNotice />;
  return <WhyUs2PageClient />;
}

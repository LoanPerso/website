import { redirect } from "next/navigation";

export default function LegalPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/legal/terms`);
}

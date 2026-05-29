"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2 } from "lucide-react";
import { Select } from "@/_components/admin/form";
import { StatusBadge } from "@/_components/admin/status-badge";
import { useToast } from "@/_components/admin/toast";
import { setMessageCrmLinks } from "@/_lib/admin/mail";
import { transitionApplication } from "@/_lib/admin/applications";
import { applicationStatusLabels, fullName } from "@/_lib/admin/format";
import type { ApplicationStatus, Client, LoanApplication, MailMessageFull } from "@/_lib/admin/types";

// CRM linking editor shown inside the reader: associate the message to a client
// and/or an application, and advance the application's status — straight from the
// inbox. (No modal — inline panel, Golden Rule 9.)
export function MessageCrm({
  message,
  clients,
  applications,
  onChanged,
}: {
  message: MailMessageFull;
  clients: Client[];
  applications: LoanApplication[];
  onChanged: () => void;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const senderEmail = (message.from_address ?? "").toLowerCase();
  const clientMatch = senderEmail ? clients.find((c) => (c.email ?? "").toLowerCase() === senderEmail) : undefined;
  const appMatch = senderEmail ? applications.find((a) => (a.email ?? "").toLowerCase() === senderEmail) : undefined;
  const showClientHint = clientMatch && message.client_id !== clientMatch.id;
  const showAppHint = appMatch && message.application_id !== appMatch.id;

  async function link(patch: { client_id?: string | null; application_id?: string | null }) {
    setBusy(true);
    const res = await setMessageCrmLinks(message.id, patch);
    setBusy(false);
    if (res.error) return toast(res.error, "error");
    toast("Lien CRM mis à jour.");
    onChanged();
  }

  async function changeStatus(status: ApplicationStatus) {
    if (!message.application_id) return;
    setBusy(true);
    const res = await transitionApplication(message.application_id, status);
    setBusy(false);
    if (res.error) return toast(res.error, "error");
    toast("Statut de la demande mis à jour.");
    onChanged();
  }

  const chip =
    "inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground transition-colors hover:bg-secondary disabled:opacity-60";

  return (
    <div className="mb-4 space-y-2.5 rounded-md border border-border bg-secondary/30 p-3">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Link2 className="h-3.5 w-3.5" /> Lien CRM
      </div>

      {showClientHint || showAppHint ? (
        <div className="flex flex-wrap gap-1.5">
          {showClientHint ? (
            <button type="button" disabled={busy} onClick={() => link({ client_id: clientMatch!.id })} className={chip}>
              Lier au client {fullName(clientMatch!.first_name, clientMatch!.last_name)} · même e-mail
            </button>
          ) : null}
          {showAppHint ? (
            <button type="button" disabled={busy} onClick={() => link({ application_id: appMatch!.id })} className={chip}>
              Lier à la demande de {fullName(appMatch!.first_name, appMatch!.last_name)} · même e-mail
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-2.5 sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-[11px] text-muted-foreground">Client</span>
          <div className="flex items-center gap-1.5">
            <Select
              aria-label="Client"
              value={message.client_id ?? ""}
              onChange={(e) => link({ client_id: e.target.value || null })}
              disabled={busy}
              className="h-8 text-xs"
            >
              <option value="">— Aucun —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {fullName(c.first_name, c.last_name)}
                  {c.reference ? ` · ${c.reference}` : ""}
                </option>
              ))}
            </Select>
            {message.client ? (
              <Link href={`/admin/clients/${message.client.id}`} className="shrink-0 text-xs text-foreground hover:underline">
                Ouvrir
              </Link>
            ) : null}
          </div>
        </div>

        <div>
          <span className="mb-1 block text-[11px] text-muted-foreground">Demande</span>
          <div className="flex items-center gap-1.5">
            <Select
              aria-label="Demande"
              value={message.application_id ?? ""}
              onChange={(e) => link({ application_id: e.target.value || null })}
              disabled={busy}
              className="h-8 text-xs"
            >
              <option value="">— Aucune —</option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {fullName(a.first_name, a.last_name)} · {a.id.slice(0, 8).toUpperCase()}
                </option>
              ))}
            </Select>
            {message.application ? (
              <Link
                href={`/admin/applications/${message.application.id}`}
                className="shrink-0 text-xs text-foreground hover:underline"
              >
                Ouvrir
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {message.application ? (
        <div>
          <span className="mb-1 block text-[11px] text-muted-foreground">Statut de la demande</span>
          <div className="flex items-center gap-2">
            <Select
              aria-label="Statut de la demande"
              value={message.application.status}
              onChange={(e) => changeStatus(e.target.value as ApplicationStatus)}
              disabled={busy}
              className="h-8 w-44 text-xs"
            >
              {Object.entries(applicationStatusLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
            <StatusBadge kind="application" status={message.application.status} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

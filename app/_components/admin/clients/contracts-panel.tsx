"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { Panel } from "@/_components/admin/panel";
import { Modal } from "@/_components/admin/dialog";
import { Field, FieldGrid, Select, TextInput } from "@/_components/admin/form";
import { StatusBadge } from "@/_components/admin/status-badge";
import { useToast } from "@/_components/admin/toast";
import { createContract, listClientContracts, setContractStatus } from "@/_lib/admin/contracts";
import { contractStatusLabels, formatCurrency, formatDate } from "@/_lib/admin/format";
import type { ContractStatus, ContractWithRefs, LoanWithClient } from "@/_lib/admin/types";

export function ContractsPanel({ clientId, loans }: { clientId: string; loans: LoanWithClient[] }) {
  const toast = useToast();
  const [rows, setRows] = useState<ContractWithRefs[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loanId, setLoanId] = useState("");
  const [offerExpires, setOfferExpires] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listClientContracts(clientId);
    setRows(res.data ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(id: string, status: ContractStatus) {
    const res = await setContractStatus(id, status);
    if (res.error) toast(res.error, "error");
    else load();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const loan = loans.find((l) => l.id === loanId) ?? null;
    setSaving(true);
    const res = await createContract({
      client_id: clientId,
      loan_id: loan?.id ?? null,
      product_id: loan?.product_id ?? null,
      status: "draft",
      principal_amount: loan?.principal_amount ?? null,
      annual_rate: loan?.annual_rate ?? null,
      duration_months: loan?.duration_months ?? null,
      monthly_payment: loan?.monthly_payment ?? null,
      start_date: loan?.start_date ?? null,
      offer_expires_on: offerExpires || null,
    });
    setSaving(false);
    if (res.error) return toast(res.error, "error");
    toast("Contrat créé.");
    setOpen(false);
    setLoanId("");
    setOfferExpires("");
    load();
  }

  return (
    <Panel
      title="Contrats"
      actions={
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Contrat
        </Button>
      }
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun contrat.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  <span className="font-mono text-xs">{c.reference}</span>
                  {c.loan?.reference ? <span className="text-muted-foreground"> · crédit {c.loan.reference}</span> : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.principal_amount ? formatCurrency(c.principal_amount) : "—"}
                  {c.signed_at ? ` · signé le ${formatDate(c.signed_at)}` : c.offer_expires_on ? ` · offre jusqu'au ${formatDate(c.offer_expires_on)}` : ""}
                  {c.withdrawal_deadline ? ` · rétractation jusqu'au ${formatDate(c.withdrawal_deadline)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge kind="contract" status={c.status} />
                <Select
                  value={c.status}
                  onChange={(e) => changeStatus(c.id, e.target.value as ContractStatus)}
                  className="h-8 w-36 text-xs"
                >
                  {Object.entries(contractStatusLabels).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Nouveau contrat"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" form="contract-form" disabled={saving}>
              Créer
            </Button>
          </>
        }
      >
        <form id="contract-form" onSubmit={submit} className="space-y-4">
          <FieldGrid>
            <Field label="Crédit lié" hint="Reprend les conditions du crédit.">
              <Select value={loanId} onChange={(e) => setLoanId(e.target.value)}>
                <option value="">Aucun (brouillon)</option>
                {loans.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.reference} · {formatCurrency(l.principal_amount)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Offre valable jusqu'au">
              <TextInput type="date" value={offerExpires} onChange={(e) => setOfferExpires(e.target.value)} />
            </Field>
          </FieldGrid>
        </form>
      </Modal>
    </Panel>
  );
}

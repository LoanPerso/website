"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, Phone, Send, StickyNote, Users, Zap, CalendarClock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Panel } from "@/_components/admin/panel";
import { Button } from "@/_components/ui/button";
import { Modal } from "@/_components/admin/dialog";
import { Field, FieldGrid, Select, TextInput, Textarea } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import {
  CALL_OUTCOME_LABELS,
  DELIVERY_LABELS,
  MESSAGE_TEMPLATES,
  computeCommsState,
  findDuplicates,
  mockDelivery,
  readConsent,
  renderTemplate,
  type CallOutcome,
  type Channel,
} from "@/_lib/admin/application";
import {
  createApplicationInteraction,
  createApplicationTask,
  listApplicationInteractions,
  markContacted,
  saveConsent,
} from "@/_lib/admin/applications";
import { interactionTypeLabels } from "@/_lib/admin/format";
import type { Interaction, InteractionType, LoanApplicationFull } from "@/_lib/admin/types";
import { SoftBadge, VerdictBanner, type Tone } from "./parts";

const ICONS: Record<InteractionType, LucideIcon> = { note: StickyNote, call: Phone, email: Mail, sms: MessageSquare, meeting: Users, system: Zap };

function when(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function CommsPanel({
  app,
  peers,
  onUpdated,
}: {
  app: LoanApplicationFull;
  peers: LoanApplicationFull[];
  onUpdated: () => void;
}) {
  const toast = useToast();
  const [rows, setRows] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [composer, setComposer] = useState<Channel | null>(null);
  const [callOpen, setCallOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const missingDocs = useMemo(
    () => [app.document_id_url, app.document_income_url, app.document_address_url, app.document_bank_url].filter((u) => !u).length,
    [app]
  );
  const comms = useMemo(() => computeCommsState(app, missingDocs), [app, missingDocs]);
  const duplicates = useMemo(() => findDuplicates(app, peers), [app, peers]);
  const consent = comms.consent;

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listApplicationInteractions(app.id);
    setRows(res.data ?? []);
    setLoading(false);
  }, [app.id]);

  useEffect(() => { load(); }, [load]);

  async function toggleConsent(patch: Partial<ReturnType<typeof readConsent>>) {
    const next = { ...consent, ...patch };
    const res = await saveConsent(app.id, next);
    if (res.error) toast(res.error, "error");
    else { toast("Préférences de contact mises à jour."); onUpdated(); }
  }

  return (
    <div className="space-y-6">
      {comms.nextBestAction ? (
        <VerdictBanner
          tone={comms.nextBestAction.code === "dnc" ? "error" : "info"}
          title={`Prochaine action : ${comms.nextBestAction.label}`}
          detail={`Dernier contact il y a ${comms.ageHours} h${comms.quietHours ? " · heures calmes en cours" : ""}`}
          right={comms.nextBestAction.channel ? <SoftBadge tone="info">{comms.nextBestAction.channel}</SoftBadge> : null}
        />
      ) : null}

      {duplicates.length ? (
        <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm">
          <span className="font-medium text-alert">Doublon possible :</span>{" "}
          {duplicates.map((d, i) => (
            <span key={d.id}>
              <Link href={`/admin/applications/${d.id}`} className="text-dark-gold hover:underline">{d.name}</Link>
              <span className="text-muted-foreground"> ({d.reason})</span>
              {i < duplicates.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
      ) : null}

      <Panel title="Recontacter le demandeur">
        {!comms.contactable ? (
          <p className="mb-3 text-xs text-error">
            {consent.do_not_contact ? "Le demandeur s'oppose à tout contact." : "Heures calmes : éviter les appels/SMS maintenant."}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setCallOpen(true)}><Phone className="h-4 w-4" /> Appeler</Button>
          <Button variant="outline" size="sm" onClick={() => setComposer("email")}><Mail className="h-4 w-4" /> Email</Button>
          <Button variant="outline" size="sm" onClick={() => setComposer("sms")}><MessageSquare className="h-4 w-4" /> SMS</Button>
          <Button variant="outline" size="sm" onClick={() => setComposer("whatsapp")}><Send className="h-4 w-4" /> WhatsApp</Button>
          <Button variant="outline" size="sm" onClick={() => setScheduleOpen(true)}><CalendarClock className="h-4 w-4" /> Programmer un rappel</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {app.phone ? <a href={`tel:${app.phone}`} className="hover:text-foreground">{app.phone}</a> : null}
          {app.email ? <a href={`mailto:${app.email}`} className="hover:text-foreground">{app.email}</a> : null}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Consentement & contactabilité" className="lg:col-span-1">
          <div className="space-y-2.5 text-sm">
            <ConsentToggle label="Ne pas contacter" checked={consent.do_not_contact} onChange={(v) => toggleConsent({ do_not_contact: v })} danger />
            <ConsentToggle label="Opt-in marketing" checked={consent.marketing_opt_in} onChange={(v) => toggleConsent({ marketing_opt_in: v })} />
            <ConsentToggle label="Appels autorisés" checked={consent.channels.call} onChange={(v) => toggleConsent({ channels: { ...consent.channels, call: v } })} />
            <ConsentToggle label="Email autorisé" checked={consent.channels.email} onChange={(v) => toggleConsent({ channels: { ...consent.channels, email: v } })} />
            <ConsentToggle label="SMS autorisé" checked={consent.channels.sms} onChange={(v) => toggleConsent({ channels: { ...consent.channels, sms: v } })} />
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-muted-foreground">Canal préféré</span>
              <Select
                value={consent.preferred_channel}
                onChange={(e) => toggleConsent({ preferred_channel: e.target.value as Channel })}
                className="h-8 w-32 text-xs"
              >
                <option value="email">Email</option>
                <option value="call">Téléphone</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
              </Select>
            </div>
            <p className="pt-1 text-xs text-muted-foreground">Heures calmes : {consent.quiet_start} – {consent.quiet_end}</p>
          </div>
        </Panel>

        <Panel title="Chronologie des échanges" className="lg:col-span-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun échange enregistré.</p>
          ) : (
            <ol className="relative space-y-4 border-l border-border pl-6">
              {rows.map((it) => {
                const Icon = ICONS[it.type] ?? StickyNote;
                const delivery = mockDelivery(it.id, it.type);
                const dTone: Tone = delivery === "bounced" || delivery === "failed" ? "error" : delivery === "read" ? "success" : "default";
                return (
                  <li key={it.id} className="relative">
                    <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                      <Icon className="h-3 w-3" />
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {interactionTypeLabels[it.type] ?? it.type}
                        {it.direction ? (it.direction === "in" ? " · entrant" : " · sortant") : ""}
                      </span>
                      {it.type !== "note" && it.type !== "system" && it.type !== "meeting" ? <SoftBadge tone={dTone}>{DELIVERY_LABELS[delivery]}</SoftBadge> : null}
                      <span className="text-xs text-muted-foreground/70">{when(it.occurred_at)}</span>
                    </div>
                    {it.subject ? <p className="mt-0.5 text-sm font-medium text-foreground">{it.subject}</p> : null}
                    {it.body ? <p className="mt-0.5 whitespace-pre-line text-sm text-muted-foreground">{it.body}</p> : null}
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
      </div>

      <ComposerModal app={app} channel={composer} onClose={() => setComposer(null)} onSent={() => { setComposer(null); load(); onUpdated(); }} />
      <CallModal app={app} open={callOpen} onClose={() => setCallOpen(false)} onLogged={() => { setCallOpen(false); load(); onUpdated(); }} />
      <ScheduleModal app={app} open={scheduleOpen} onClose={() => setScheduleOpen(false)} onScheduled={() => { setScheduleOpen(false); load(); onUpdated(); }} busy={busy} setBusy={setBusy} />
    </div>
  );
}

function ConsentToggle({ label, checked, onChange, danger }: { label: string; checked: boolean; onChange: (v: boolean) => void; danger?: boolean }) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className={danger && checked ? "font-medium text-error" : "text-foreground"}>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-dark-gold" />
    </label>
  );
}

function ComposerModal({ app, channel, onClose, onSent }: { app: LoanApplicationFull; channel: Channel | null; onClose: () => void; onSent: () => void }) {
  const toast = useToast();
  const [templateId, setTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const available = MESSAGE_TEMPLATES.filter((t) => (channel === "email" ? t.channel === "email" : t.channel === "sms"));

  function applyTemplate(id: string) {
    setTemplateId(id);
    const tpl = MESSAGE_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    const missing = [
      !app.document_id_url ? "pièce d'identité" : null,
      !app.document_income_url ? "justificatif de revenus" : null,
      !app.document_address_url ? "justificatif de domicile" : null,
      !app.document_bank_url ? "relevé bancaire" : null,
    ].filter(Boolean).join(", ");
    const r = renderTemplate(tpl, app, { missingDocs: missing || "vos justificatifs" });
    setSubject(r.subject ?? "");
    setBody(r.body);
  }

  async function send() {
    if (!body.trim()) return toast("Message vide.", "error");
    setBusy(true);
    const type: InteractionType = channel === "email" ? "email" : channel === "sms" || channel === "whatsapp" ? "sms" : "note";
    await createApplicationInteraction({ application_id: app.id, type, direction: "out", subject: subject || `${channel} sortant`, body });
    await markContacted(app.id);
    setBusy(false);
    toast("Message envoyé (simulé) et journalisé.");
    setTemplateId(""); setSubject(""); setBody("");
    onSent();
  }

  return (
    <Modal
      open={channel !== null}
      onOpenChange={(o) => !o && onClose()}
      title={`Composer — ${channel ?? ""}`}
      wide
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>Annuler</Button>
          <Button onClick={send} disabled={busy}><Send className="h-4 w-4" /> Envoyer</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Modèle">
          <Select value={templateId} onChange={(e) => applyTemplate(e.target.value)}>
            <option value="">— Sans modèle —</option>
            {available.map((t) => (<option key={t.id} value={t.id}>{t.label}</option>))}
          </Select>
        </Field>
        {channel === "email" ? (
          <Field label="Objet"><TextInput value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
        ) : null}
        <Field label="Message"><Textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[160px]" /></Field>
        <p className="text-xs text-muted-foreground">Destinataire : {channel === "email" ? app.email : app.phone} (envoi simulé).</p>
      </div>
    </Modal>
  );
}

function CallModal({ app, open, onClose, onLogged }: { app: LoanApplicationFull; open: boolean; onClose: () => void; onLogged: () => void }) {
  const toast = useToast();
  const [outcome, setOutcome] = useState<CallOutcome>("reached");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function log() {
    setBusy(true);
    await createApplicationInteraction({
      application_id: app.id,
      type: "call",
      direction: "out",
      subject: `Appel — ${CALL_OUTCOME_LABELS[outcome]}`,
      body: note || null,
    });
    await markContacted(app.id);
    if (outcome === "callback" || outcome === "no_answer") {
      await createApplicationTask({ application_id: app.id, title: "Rappeler le demandeur", category: "follow_up", priority: "normal" });
    }
    setBusy(false);
    toast("Appel journalisé.");
    setNote("");
    onLogged();
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Journaliser un appel"
      footer={<><Button variant="outline" onClick={onClose} disabled={busy}>Annuler</Button><Button onClick={log} disabled={busy}>Enregistrer</Button></>}
    >
      <div className="space-y-4">
        <Field label="Issue de l'appel">
          <Select value={outcome} onChange={(e) => setOutcome(e.target.value as CallOutcome)}>
            {Object.entries(CALL_OUTCOME_LABELS).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
          </Select>
        </Field>
        <Field label="Note"><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        {app.phone ? <a href={`tel:${app.phone}`} className="text-xs text-dark-gold hover:underline">Composer {app.phone}</a> : null}
      </div>
    </Modal>
  );
}

function ScheduleModal({ app, open, onClose, onScheduled, busy, setBusy }: { app: LoanApplicationFull; open: boolean; onClose: () => void; onScheduled: () => void; busy: boolean; setBusy: (b: boolean) => void }) {
  const toast = useToast();
  const [title, setTitle] = useState("Rappel demandeur");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState("normal");

  async function schedule() {
    setBusy(true);
    await createApplicationTask({ application_id: app.id, title: title.trim() || "Rappel demandeur", category: "follow_up", priority: priority as never, due_date: due || null });
    await createApplicationInteraction({ application_id: app.id, type: "system", subject: "Rappel programmé", body: `${title}${due ? ` — ${due}` : ""}` });
    setBusy(false);
    toast("Rappel programmé.");
    onScheduled();
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Programmer un rappel"
      footer={<><Button variant="outline" onClick={onClose} disabled={busy}>Annuler</Button><Button onClick={schedule} disabled={busy}>Programmer</Button></>}
    >
      <div className="space-y-4">
        <Field label="Intitulé"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <FieldGrid>
          <Field label="Échéance"><TextInput type="date" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
          <Field label="Priorité">
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Basse</option>
              <option value="normal">Normale</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </Select>
          </Field>
        </FieldGrid>
      </div>
    </Modal>
  );
}

// ============================================================================
// Quickfund — Smoke dataset generator
// Wipes the PREPROD business data and regenerates a realistic book calibrated on
// the consolidated 2024-2025 brief:
//   • ~1367 active clients (one active loan each)
//   • outstanding principal ≈ 591 529 €
//   • bad debts (write-offs) ≈ 40 328 €
//   • status mix ≈ 80% à jour / 13% retard léger / 7% douteux
//   • historical paid-off loans (2024) → 2024-2025 monthly history + interest
//   • ledger: coaching (2025) + expenses (server fees / management / rebranding)
//
// Targets PREPROD only. Refuses to run against the prod project ref.
// Reads secrets from the environment (source .env first):
//   set -a; source .env; set +a
//   node scripts/generate-smoke.mjs --wipe       # wipe + regenerate
//   node scripts/generate-smoke.mjs --wipe --dry # build + measure, no DB write
// Never hardcode secrets.
// ============================================================================

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

// ---------------------------------------------------------------------------
// Environment & guards
// ---------------------------------------------------------------------------
const ARGS = new Set(process.argv.slice(2));
const DO_WIPE = ARGS.has("--wipe");
const DRY = ARGS.has("--dry");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MGMT_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const PROD_REF = process.env.SUPABASE_PROD_PROJECT_REF;

function die(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (!SUPABASE_URL || !SERVICE_KEY) die("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (source .env first).");
if (!PROJECT_REF) die("Missing SUPABASE_PROJECT_REF (source .env first).");
if (PROD_REF && PROJECT_REF === PROD_REF) die("SUPABASE_PROJECT_REF points at PROD — refusing. This script targets preprod only.");
if (PROD_REF && SUPABASE_URL.includes(PROD_REF)) die("NEXT_PUBLIC_SUPABASE_URL points at the PROD project — refusing.");
if (DO_WIPE && !MGMT_TOKEN) die("--wipe needs SUPABASE_ACCESS_TOKEN (Management API) to truncate. Source .env first.");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// ---------------------------------------------------------------------------
// Tunables (calibrated on the brief — measured aggregates printed at the end)
// ---------------------------------------------------------------------------
const N_CLIENTS = 1367;
const TARGET_OUTSTANDING = 591529;      // total encours (active + defaulted)
const TARGET_BAD_DEBTS = 40328;          // sum of write_off_amount
const RATE = 12.5;                       // effective annual rate
const TERM = 24;                         // months
const PAID_OFF_LOANS = 620;              // historical fully-repaid loans (2024) — drives interest_earned/history
const APP_FEE_PCT = 1.0;                 // application fee % of principal
const SEED = 20260530;

// Status mix on the active book
const SHARE_LIGHT = 0.13;                // light arrears (1-2 recent unpaid)
const SHARE_DOUBTFUL = 0.07;             // doubtful — split into deep arrears + written-off
const WRITEOFF_SHARE_OF_DOUBTFUL = 0.5;  // half of doubtful become written-off defaults

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32) — reproducible runs
// ---------------------------------------------------------------------------
let _s = SEED >>> 0;
function rnd() {
  _s |= 0; _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const randint = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------
const TODAY = new Date("2026-05-30T00:00:00Z");
function isoOf(d) { return d.toISOString().slice(0, 10); }
function addMonths(iso, m) {
  const d = new Date(iso + "T00:00:00Z");
  const day = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + m);
  if (d.getUTCDate() < day) d.setUTCDate(0);
  return isoOf(d);
}
function monthsAgo(n) {
  const d = new Date(TODAY);
  d.setUTCMonth(d.getUTCMonth() - n);
  return isoOf(d);
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------
const FIRST = ["Marie","Thomas","Alex","Lucas","Emma","Lea","Hugo","Chloe","Nathan","Sarah","Julien","Camille","Maxime","Manon","Antoine","Laura","Romain","Pauline","Kevin","Sophie","Mehdi","Ines","Yann","Clara","Dimitri","Anna","Marko","Liis","Kristjan","Mart","Kadri","Jaan","Tonu","Eva","Rasmus","Karl","Maria","Piret","Andres","Tiina"];
const LAST = ["Martin","Bernard","Dubois","Petit","Robert","Tamm","Saar","Magi","Kask","Kukk","Rebane","Ivanov","Smirnov","Laine","Nguyen","Garcia","Muller","Lemoine","Faure","Roussel","Vidal","Carre","Lopez","Sokk","Parn","Vaher","Raud","Lille","Kallas","Oja","Lepik","Sepp","Mets","Koppel","Aas","Org","Vaino","Kangro","Susi","Toom"];
const CITY = ["Tallinn","Tartu","Narva","Parnu","Paris","Lyon","Bruxelles","Madrid","Geneve","Helsinki"];
const EMP = ["cdi","cdi","cdi","cdd","freelance","student","retired","unemployed"];
const HOUSE = ["owner","tenant","tenant","hosted"];
const HIST = ["excellent","good","good","mixed","incidents"];
const PURPOSE = ["auto","homeImprovement","equipment","emergency","medical","travel","consolidation","event"];
const METHOD = ["sepa","sepa","sepa","transfer","card"];

// Principal distribution tranches [lo, hi, weight]
const TRANCHES = [[50,200,0.20],[201,400,0.35],[401,700,0.30],[701,1000,0.10],[1001,1500,0.04],[1500,2000,0.01]];
function drawPrincipal() {
  let r = rnd(), acc = 0;
  for (const [lo, hi, w] of TRANCHES) { acc += w; if (r <= acc) return round2(lo + rnd() * (hi - lo)); }
  return 350;
}
function catFromHist(h) {
  if (h === "excellent") return "A";
  if (h === "good") return rnd() < 0.6 ? "A" : "B";
  if (h === "mixed") return rnd() < 0.5 ? "B" : "C";
  return rnd() < 0.5 ? "C" : "D";
}
function scoreFor(cat) {
  if (cat === "A") return randint(80, 99);
  if (cat === "B") return randint(65, 79);
  if (cat === "C") return randint(45, 64);
  return randint(20, 44);
}
function scoreCategory(score) {
  return score >= 80 ? "A" : score >= 65 ? "B" : score >= 45 ? "C" : "D";
}

// Credit products (kept by the wipe) — assigned to loans so product analytics populate.
const { data: _prods, error: _perr } = await supabase.from("products").select("id,slug,category");
if (_perr) die(`Cannot read products (run after migrations are applied): ${_perr.message}`);
const CREDIT_PRODUCTS = (_prods || []).filter((p) => p.category === "credit");
if (!CREDIT_PRODUCTS.length) die("No credit products found — seed the product catalogue first.");
const PROD_BY_SLUG = Object.fromEntries(CREDIT_PRODUCTS.map((p) => [p.slug, p.id]));
function productFor(principal) {
  let slugs;
  if (principal <= 500) slugs = ["micro-credit", "salary-advance"];
  else if (principal <= 1500) slugs = ["consumer", "salary-advance", "student", "micro-credit"];
  else if (principal <= 5000) slugs = ["consumer", "student"];
  else slugs = ["professional", "loan-consolidation", "leasing"];
  const avail = slugs.map((s) => PROD_BY_SLUG[s]).filter(Boolean);
  const pool = avail.length ? avail : CREDIT_PRODUCTS.map((p) => p.id);
  return pool[Math.floor(rnd() * pool.length)] ?? null;
}

// ---------------------------------------------------------------------------
// Amortization (mirrors app/_lib/admin/finance.ts buildSchedule)
// ---------------------------------------------------------------------------
function monthlyPayment(P, annualPct, n) {
  const r = annualPct / 100 / 12;
  if (n <= 0) return 0;
  if (r === 0) return round2(P / n);
  return round2((P * r) / (1 - Math.pow(1 + r, -n)));
}
function buildSchedule(P, annualPct, n, startIso) {
  const r = annualPct / 100 / 12;
  const pay = monthlyPayment(P, annualPct, n);
  const rows = [];
  let bal = P, totInt = 0;
  for (let k = 1; k <= n; k++) {
    const interest = round2(bal * r);
    let prin = round2(pay - interest);
    if (k === n) prin = round2(bal);
    bal = round2(bal - prin);
    totInt = round2(totInt + interest);
    rows.push({ seq: k, due: addMonths(startIso, k), amount_due: round2(prin + interest), principal: prin, interest });
  }
  return { pay, totalInterest: totInt, totalRepayable: round2(P + totInt), rows };
}

// Fraction of principal still outstanding after `paidCount` installments paid.
function remainingFraction(annualPct, n, paidCount) {
  const s = buildSchedule(1000, annualPct, n, "2025-01-01");
  let paidPrincipal = 0;
  for (let i = 0; i < Math.min(paidCount, n); i++) paidPrincipal += s.rows[i].principal;
  return (1000 - paidPrincipal) / 1000;
}

// ---------------------------------------------------------------------------
// Build the dataset in memory
// ---------------------------------------------------------------------------
const clients = [];
const loans = [];
const installments = [];
const payments = [];

function makeClient(i) {
  const f = pick(FIRST), l = pick(LAST), hist = pick(HIST);
  const income = randint(1100, 5200);
  const id = randomUUID();
  const cat = catFromHist(hist);
  clients.push({
    id,
    first_name: f,
    last_name: l,
    email: `${f.toLowerCase()}.${l.toLowerCase()}${i}@example.com`,
    phone: `+372 5${String(1000000 + i * 37).slice(0, 7)}`,
    birth_date: isoOf(new Date(Date.UTC(randint(1965, 2004), randint(0, 11), randint(1, 28)))),
    city: pick(CITY),
    country: rnd() < 0.35 ? "FR" : "EE",
    marital_status: rnd() < 0.5 ? "married" : "single",
    dependents: randint(0, 3),
    employment_status: pick(EMP),
    employer_name: `Employer ${randint(1, 40)}`,
    monthly_net_income: income,
    monthly_expenses: round2(income * (0.35 + rnd() * 0.25)),
    housing_status: pick(HOUSE),
    credit_history: hist,
    risk_category: cat,
    credit_score: scoreFor(cat),
    status: "active",
  });
  return { id, cat };
}

// Creates a loan + its schedule + payments for the paid installments.
// kind: 'active' | 'paid_off'. arrears: 'current'|'light'|'deep'|'writeoff'
function makeLoan(client, principal, startIso, kind, arrears) {
  const loanId = randomUUID();
  const s = buildSchedule(principal, RATE, TERM, startIso);

  // how many installments are already due (past)
  const duePast = s.rows.filter((r) => r.due < isoOf(TODAY)).length;
  let paidCount;
  if (kind === "paid_off") {
    paidCount = TERM; // fully repaid
  } else if (arrears === "current") {
    paidCount = duePast;
  } else if (arrears === "light") {
    paidCount = Math.max(0, duePast - randint(1, 2));
  } else if (arrears === "deep") {
    paidCount = Math.max(0, duePast - randint(3, 6));
  } else { // writeoff
    paidCount = Math.max(0, duePast - randint(4, 8));
  }
  paidCount = Math.min(paidCount, TERM);

  let status = "active";
  let closure_reason = null, closed_at = null, write_off_amount = 0, dunning_level = 0, next_action_date = null;
  if (kind === "paid_off") status = "paid_off";
  else if (arrears === "writeoff") {
    status = "defaulted";
    closure_reason = "written_off";
    closed_at = monthsAgo(randint(1, 10));
    dunning_level = 4;
  } else if (arrears === "deep") {
    dunning_level = randint(2, 3);
    next_action_date = monthsAgo(-1);
  } else if (arrears === "light") {
    dunning_level = 1;
    next_action_date = monthsAgo(-1);
  }

  let paidPrincipal = 0;
  for (let k = 0; k < TERM; k++) {
    const row = s.rows[k];
    const instId = randomUUID();
    const isPaid = k < paidCount;
    if (isPaid) paidPrincipal += row.principal;
    const payDate = isPaid ? addMonths(row.due, 0) : null;
    installments.push({
      id: instId,
      loan_id: loanId,
      sequence: row.seq,
      due_date: row.due,
      amount_due: row.amount_due,
      principal_component: row.principal,
      interest_component: row.interest,
      amount_paid: isPaid ? row.amount_due : 0,
      status: isPaid ? "paid" : (row.due < isoOf(TODAY) ? "late" : "pending"),
      paid_at: payDate,
      late_fee: 0,
    });
    if (isPaid) {
      payments.push({
        id: randomUUID(),
        loan_id: loanId,
        client_id: client.id,
        installment_id: instId,
        amount: row.amount_due,
        payment_date: payDate,
        method: pick(METHOD),
        status: "completed",
      });
    }
  }

  const remaining = round2(principal - paidPrincipal);
  if (status === "defaulted" && closure_reason === "written_off") write_off_amount = remaining;

  loans.push({
    id: loanId,
    client_id: client.id,
    product_id: productFor(principal),
    principal_amount: principal,
    annual_rate: RATE,
    duration_months: TERM,
    monthly_payment: s.pay,
    total_interest: s.totalInterest,
    total_repayable: s.totalRepayable,
    application_fee: round2((principal * APP_FEE_PCT) / 100),
    purpose: pick(PURPOSE),
    risk_category: client.cat,
    status,
    start_date: startIso,
    end_date: addMonths(startIso, TERM),
    disbursed_at: startIso,
    closed_at,
    closure_reason,
    write_off_amount,
    dunning_level,
    next_action_date,
    _remaining: remaining,        // helper for scaling (stripped before insert)
    _group: kind === "paid_off" ? "paidoff" : arrears,
  });
  return loans[loans.length - 1];
}

// --- Generate the active book ----------------------------------------------
const nLight = Math.round(N_CLIENTS * SHARE_LIGHT);
const nDoubtful = Math.round(N_CLIENTS * SHARE_DOUBTFUL);
const nWriteoff = Math.round(nDoubtful * WRITEOFF_SHARE_OF_DOUBTFUL);
const nDeep = nDoubtful - nWriteoff;

const clientRefs = [];
for (let i = 0; i < N_CLIENTS; i++) clientRefs.push(makeClient(i));

// assign arrears buckets
const buckets = [];
for (let i = 0; i < nWriteoff; i++) buckets.push("writeoff");
for (let i = 0; i < nDeep; i++) buckets.push("deep");
for (let i = 0; i < nLight; i++) buckets.push("light");
while (buckets.length < N_CLIENTS) buckets.push("current");
// shuffle buckets (Fisher-Yates with PRNG)
for (let i = buckets.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [buckets[i], buckets[j]] = [buckets[j], buckets[i]]; }

for (let i = 0; i < N_CLIENTS; i++) {
  const arrears = buckets[i];
  // younger loans → higher outstanding; spread starts over the last ~14 months
  const age = arrears === "current" ? randint(1, 14) : randint(3, 16);
  const start = monthsAgo(age);
  makeLoan(clientRefs[i], drawPrincipal(), start, "active", arrears);
}

// --- Historical paid-off loans (2024) — build P&L history + interest --------
for (let i = 0; i < PAID_OFF_LOANS; i++) {
  const client = pick(clientRefs);
  const start = isoOf(new Date(Date.UTC(2024, randint(0, 11), randint(1, 28))));
  makeLoan(client, drawPrincipal(), start, "paid_off", "current");
}

// --- Inbound applications (origination funnel) -----------------------------
const APP_STATUSES = ["submitted", "submitted", "under_review", "qualified", "approved", "approved", "rejected", "cancelled"];
const SOURCES = ["website", "simulator", "referral", "ads", "direct"];
const APP_PRODUCTS = ["micro-credit", "consumer", "student", "salary-advance", "professional"];
const applications = [];
for (let i = 0; i < 220; i++) {
  const status = pick(APP_STATUSES);
  const f = pick(FIRST), l = pick(LAST);
  const amount = drawPrincipal();
  const dur = pick([6, 12, 18, 24, 24, 36]);
  const score = randint(20, 99);
  applications.push({
    status,
    credit_type: pick(APP_PRODUCTS),
    amount,
    duration: dur,
    monthly_payment: monthlyPayment(amount, RATE, dur),
    effective_rate: RATE,
    country: rnd() < 0.35 ? "FR" : "EE",
    first_name: f,
    last_name: l,
    email: `${f.toLowerCase()}.${l.toLowerCase()}.app${i}@example.com`,
    phone: `+372 56${String(100000 + i).slice(0, 6)}`,
    city: pick(CITY),
    monthly_net_income: randint(1100, 4800),
    source: pick(SOURCES),
    score,
    score_category: scoreCategory(score),
    converted_client_id: status === "approved" && rnd() < 0.7 ? pick(clientRefs).id : null,
  });
}

// ---------------------------------------------------------------------------
// Calibrate principals so the encours / bad-debts targets are hit.
// remaining scales ~linearly with principal for fixed (rate, term, paidCount).
// ---------------------------------------------------------------------------
function rescaleGroup(filterFn, target) {
  const grp = loans.filter(filterFn);
  const base = grp.reduce((s, l) => s + l._remaining, 0);
  if (base <= 0) return;
  const f = target / base;
  for (const l of grp) {
    const newPrincipal = round2(l.principal_amount * f);
    rebuildLoan(l, newPrincipal);
  }
}

// Rebuild a loan's schedule/payments/installments after a principal change.
function rebuildLoan(loan, newPrincipal) {
  // drop old installments/payments for this loan
  for (let i = installments.length - 1; i >= 0; i--) if (installments[i].loan_id === loan.id) installments.splice(i, 1);
  for (let i = payments.length - 1; i >= 0; i--) if (payments[i].loan_id === loan.id) payments.splice(i, 1);

  const s = buildSchedule(newPrincipal, RATE, TERM, loan.start_date);
  // recover paidCount from prior remaining fraction intent: recompute from status
  const duePast = s.rows.filter((r) => r.due < isoOf(TODAY)).length;
  let paidCount;
  if (loan.status === "paid_off") paidCount = TERM;
  else if (loan._group === "light") paidCount = Math.max(0, duePast - 1);
  else if (loan._group === "deep") paidCount = Math.max(0, duePast - 4);
  else if (loan._group === "writeoff") paidCount = Math.max(0, duePast - 6);
  else paidCount = duePast;
  paidCount = Math.min(paidCount, TERM);

  let paidPrincipal = 0;
  for (let k = 0; k < TERM; k++) {
    const row = s.rows[k];
    const instId = randomUUID();
    const isPaid = k < paidCount;
    if (isPaid) paidPrincipal += row.principal;
    installments.push({
      id: instId, loan_id: loan.id, sequence: row.seq, due_date: row.due,
      amount_due: row.amount_due, principal_component: row.principal, interest_component: row.interest,
      amount_paid: isPaid ? row.amount_due : 0,
      status: isPaid ? "paid" : (row.due < isoOf(TODAY) ? "late" : "pending"),
      paid_at: isPaid ? row.due : null, late_fee: 0,
    });
    if (isPaid) payments.push({ id: randomUUID(), loan_id: loan.id, client_id: loan.client_id, installment_id: instId, amount: row.amount_due, payment_date: row.due, method: pick(METHOD), status: "completed" });
  }
  loan.principal_amount = newPrincipal;
  loan.monthly_payment = s.pay;
  loan.total_interest = s.totalInterest;
  loan.total_repayable = s.totalRepayable;
  loan.application_fee = round2((newPrincipal * APP_FEE_PCT) / 100);
  loan._remaining = round2(newPrincipal - paidPrincipal);
  if (loan.status === "defaulted" && loan.closure_reason === "written_off") loan.write_off_amount = loan._remaining;
}

// writeoff group → bad debts; the rest of the active book → encours minus bad debts
rescaleGroup((l) => l._group === "writeoff", TARGET_BAD_DEBTS);
rescaleGroup((l) => l.status !== "paid_off" && l._group !== "writeoff", TARGET_OUTSTANDING - TARGET_BAD_DEBTS);
// one corrective pass for rounding drift
rescaleGroup((l) => l.status !== "paid_off" && l._group !== "writeoff",
  TARGET_OUTSTANDING - TARGET_BAD_DEBTS);

// ---------------------------------------------------------------------------
// Ledger entries (coaching + operating expenses) from the brief
// ---------------------------------------------------------------------------
const ledger = [];
function addLedger(kind, category, label, amount, month) {
  ledger.push({ kind, category, label, amount, currency: "EUR", period_month: `${month}-01` });
}
// Server fees 7 200 €/an (2024 + 2025), monthly 600 €
for (const y of [2024, 2025]) for (let m = 1; m <= 12; m++) addLedger("expense", "server_fees", "Hébergement / infra", 600, `${y}-${String(m).padStart(2, "0")}`);
// Management loans 15 517,70 € (2025) + Rebranding 8 695,98 € (2025)
addLedger("expense", "management_loans", "Management loans", 15517.70, "2025-06");
addLedger("expense", "rebranding", "Rebranding 2025", 8695.98, "2025-09");
// Coaching revenue 16 055 € (2025), spread over the year
for (let m = 1; m <= 12; m++) addLedger("revenue", "coaching", "Coaching financier", round2(16055 / 12), `2025-${String(m).padStart(2, "0")}`);

// ---------------------------------------------------------------------------
// Measure achieved aggregates (local, before insert)
// ---------------------------------------------------------------------------
const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
const outstanding = round2(sum(loans.filter((l) => l.status === "active" || l.status === "defaulted"), (l) => l._remaining));
const badDebts = round2(sum(loans.filter((l) => l.closure_reason === "written_off"), (l) => l.write_off_amount));
const totalDisbursed = round2(sum(loans.filter((l) => ["active", "paid_off", "defaulted"].includes(l.status)), (l) => l.principal_amount));
const interestEarned = round2(sum(installments.filter((i) => i.status === "paid"), (i) => i.interest_component));
const totalCollected = round2(sum(payments, (p) => p.amount));

console.log("\n──────── Smoke dataset (local build) ────────");
console.log(`clients:            ${clients.length}`);
console.log(`loans:              ${loans.length}  (active book ${loans.filter(l=>l._group!=="paidoff").length} + paid_off ${loans.filter(l=>l._group==="paidoff").length})`);
console.log(`  written-off:      ${loans.filter(l=>l.closure_reason==="written_off").length}`);
console.log(`installments:       ${installments.length}`);
console.log(`payments:           ${payments.length}`);
console.log(`ledger entries:     ${ledger.length}`);
console.log(`applications:       ${applications.length}`);
console.log("──────── Calibration vs brief ────────");
console.log(`outstanding princ.: ${outstanding.toLocaleString("fr-FR")} €   (target 591 529)`);
console.log(`bad debts:          ${badDebts.toLocaleString("fr-FR")} €   (target 40 328)`);
console.log(`total disbursed:    ${totalDisbursed.toLocaleString("fr-FR")} €   (brief ~1 061 794)`);
console.log(`interest earned:    ${interestEarned.toLocaleString("fr-FR")} €   (brief ~81 355)`);
console.log(`total collected:    ${totalCollected.toLocaleString("fr-FR")} €   (brief ~539 752)`);
console.log("──────────────────────────────────────\n");

if (DRY) { console.log("--dry: no database writes. Done."); process.exit(0); }

// ---------------------------------------------------------------------------
// Wipe (Management API) — preprod business data only; keep admin_users + products
// ---------------------------------------------------------------------------
async function mgmtQuery(sql, label) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${MGMT_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) die(`${label} failed: HTTP ${res.status}\n${text}`);
  console.log(`OK  ${label}`);
}

if (DO_WIPE) {
  console.log(`Wiping preprod business data (project ${PROJECT_REF})…`);
  await mgmtQuery(
    `truncate table
       public.mail_diagnostics, public.mail_attachments, public.mail_messages,
       public.mail_folders, public.mail_accounts,
       public.interactions, public.tasks, public.client_documents, public.contracts,
       public.client_scores, public.loan_applications, public.payments,
       public.installments, public.loans, public.clients, public.ledger_entries,
       public.kpis_cache, public.activity_log, public.import_batches
     restart identity cascade;`,
    "truncate business tables"
  );
  await mgmtQuery(
    `alter sequence if exists public.client_ref_seq restart with 1;
     alter sequence if exists public.loan_ref_seq restart with 1;
     alter sequence if exists public.payment_ref_seq restart with 1;
     alter sequence if exists public.contract_ref_seq restart with 1;`,
    "reset reference sequences"
  );
}

// ---------------------------------------------------------------------------
// Insert (service role bypasses RLS). Strip helper fields. Chunked.
// ---------------------------------------------------------------------------
async function insertChunked(table, rows, size = 1000) {
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) die(`insert ${table} [${i}..${i + chunk.length}] failed: ${error.message}`);
    process.stdout.write(`\r  ${table}: ${Math.min(i + size, rows.length)}/${rows.length}   `);
  }
  process.stdout.write("\n");
}

const loanRows = loans.map(({ _remaining, _group, ...l }) => l);

console.log("Inserting…");
await insertChunked("clients", clients, 500);
await insertChunked("loan_applications", applications, 500);
await insertChunked("loans", loanRows, 500);
await insertChunked("installments", installments, 1000);
await insertChunked("payments", payments, 1000);
await insertChunked("ledger_entries", ledger, 500);

// Refresh the KPI cache snapshot.
const { error: kpiErr } = await supabase.rpc("refresh_portfolio_kpis");
if (kpiErr) console.warn(`(warn) refresh_portfolio_kpis: ${kpiErr.message}`);

// ---------------------------------------------------------------------------
// Verify from the live views
// ---------------------------------------------------------------------------
const { data: kpis } = await supabase.from("v_portfolio_kpis").select("*").single();
const { data: pnl } = await supabase.from("v_pnl_summary").select("*").single();

console.log("\n──────── Live verification (DB views) ────────");
if (kpis) {
  console.log(`total_clients:        ${kpis.total_clients} (active ${kpis.active_clients})`);
  console.log(`active_loans:         ${kpis.active_loans} / total ${kpis.total_loans} · defaulted ${kpis.defaulted_loans}`);
  console.log(`outstanding_principal:${Number(kpis.outstanding_principal).toLocaleString("fr-FR")} €  (target 591 529)`);
  console.log(`total_disbursed:      ${Number(kpis.total_disbursed).toLocaleString("fr-FR")} €`);
  console.log(`total_collected:      ${Number(kpis.total_collected).toLocaleString("fr-FR")} €`);
  console.log(`interest_earned:      ${Number(kpis.interest_earned).toLocaleString("fr-FR")} €`);
  console.log(`default_rate_pct:     ${kpis.default_rate_pct} %`);
  console.log(`overdue_amount:       ${Number(kpis.overdue_amount).toLocaleString("fr-FR")} € · ${kpis.overdue_loans} loans`);
}
if (pnl) {
  console.log(`P&L revenue:          ${Number(pnl.total_revenue).toLocaleString("fr-FR")} €  (interest ${Number(pnl.interest).toLocaleString("fr-FR")} · coaching ${Number(pnl.coaching).toLocaleString("fr-FR")})`);
  console.log(`P&L expenses:         ${Number(pnl.expenses).toLocaleString("fr-FR")} €`);
  console.log(`P&L displayed profit: ${Number(pnl.displayed_profit).toLocaleString("fr-FR")} €  (margin ${pnl.displayed_margin_pct} %)`);
  console.log(`P&L bad debts:        ${Number(pnl.bad_debts).toLocaleString("fr-FR")} €  (target 40 328)`);
  console.log(`P&L economic profit:  ${Number(pnl.economic_profit).toLocaleString("fr-FR")} €  (margin ${pnl.economic_margin_pct} %)`);
}
console.log("──────────────────────────────────────────────\n✓ Done.");

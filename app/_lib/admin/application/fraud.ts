// Fraud / KYC / AML engine (derived, deterministic).
//
// Runs identity, document, fraud-signal, AML-screening and source-of-funds checks
// on an application. Cross-application checks (velocity, duplicate documents,
// identity clusters) use the sibling applications passed in as `peers`.

import type { LoanApplicationFull } from "../types";
import { DISPOSABLE_EMAIL_DOMAINS, SCREENING_NAMES } from "./constants";
import { ageFromBirth, clamp, hashSeed, rngFrom, toIsoDate } from "./seed";

export type CheckStatus = "pass" | "warn" | "fail" | "unknown";
export type Severity = "info" | "low" | "medium" | "high" | "critical";
export type Disposition = "clear" | "review" | "escalate" | "block";
export type CheckGroup = "kyc" | "document" | "fraud" | "aml" | "sof";

const SEVERITY_POINTS: Record<Severity, number> = { info: 0, low: 5, medium: 12, high: 25, critical: 40 };

export interface FraudCheck {
  code: string;
  group: CheckGroup;
  label: string;
  status: CheckStatus;
  severity: Severity;
  detail: string;
}

export interface ScreeningHit {
  list: "PEP" | "EU" | "OFAC" | "UN" | "adverse_media" | "internal_blacklist";
  name: string;
  matchScore: number;
  disposition: "true_positive" | "false_positive" | "pending";
  note: string;
}

export interface FraudAmlResult {
  checks: FraudCheck[];
  screeningHits: ScreeningHit[];
  velocity: { email: number; phone: number; iban: number; device: number; cluster: string[] };
  fraudScore: number; // 0-100, higher = riskier
  amlRating: "low" | "medium" | "high";
  composite: number; // 0-100
  recommended: Disposition;
  reasonCodes: { code: string; label: string; points: number }[];
  fatcaCrsIndicia: string[];
  deviceFingerprint: string;
  ipAddress: string;
  geo: string;
  modelVersion: string;
}

export const GROUP_LABELS: Record<CheckGroup, string> = {
  kyc: "Vérification d'identité (KYC)",
  document: "Authenticité des documents",
  fraud: "Signaux de fraude",
  aml: "Screening LCB-FT",
  sof: "Origine des fonds & conformité",
};

export const DISPOSITION_LABELS: Record<Disposition, string> = {
  clear: "À valider",
  review: "À examiner",
  escalate: "À escalader",
  block: "À bloquer",
};

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function nameMatch(full: string, listName: string): number {
  const a = full.toLowerCase().trim();
  const b = listName.toLowerCase().trim();
  if (!a || !b) return 0;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length);
}

// Estonian isikukood: 11 digits, embeds century/DOB + control digit.
function checkEstonianId(idNumber: string, birthDate: string | null): { valid: boolean; embeddedDob: string | null } {
  const id = idNumber.replace(/\s/g, "");
  if (!/^\d{11}$/.test(id)) return { valid: false, embeddedDob: null };
  const century = { "1": 1800, "2": 1800, "3": 1900, "4": 1900, "5": 2000, "6": 2000 }[id[0]];
  if (!century) return { valid: false, embeddedDob: null };
  const yy = id.slice(1, 3);
  const mm = id.slice(3, 5);
  const dd = id.slice(5, 7);
  const embeddedDob = `${century + Number(yy)}-${mm}-${dd}`;
  const w1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1];
  const w2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3];
  const digits = id.split("").map(Number);
  let sum = digits.slice(0, 10).reduce((s, d, i) => s + d * w1[i], 0);
  let control = sum % 11;
  if (control === 10) {
    sum = digits.slice(0, 10).reduce((s, d, i) => s + d * w2[i], 0);
    control = sum % 11;
    if (control === 10) control = 0;
  }
  const valid = control === digits[10] && Number(mm) >= 1 && Number(mm) <= 12 && Number(dd) >= 1 && Number(dd) <= 31;
  return { valid, embeddedDob: birthDate && embeddedDob !== toIsoDate(birthDate) ? embeddedDob : null };
}

function normPhone(phone: string | null | undefined): string {
  return (phone ?? "").replace(/[^\d+]/g, "");
}

export function computeFraudAml(app: LoanApplicationFull, peers: LoanApplicationFull[] = []): FraudAmlResult {
  const rng = rngFrom(app.id + "|fraud");
  const checks: FraudCheck[] = [];
  const fullName = `${app.first_name ?? ""} ${app.last_name ?? ""}`.trim();
  const others = peers.filter((p) => p.id !== app.id);

  // --- KYC ---------------------------------------------------------------
  const age = ageFromBirth(app.birth_date);
  if (age == null) checks.push({ code: "age", group: "kyc", label: "Âge", status: "unknown", severity: "low", detail: "Date de naissance absente" });
  else if (age < 18) checks.push({ code: "age", group: "kyc", label: "Âge minimum", status: "fail", severity: "critical", detail: `${age} ans — inéligible` });
  else if (age > 75) checks.push({ code: "age", group: "kyc", label: "Âge maximum", status: "warn", severity: "medium", detail: `${age} ans au terme` });
  else checks.push({ code: "age", group: "kyc", label: "Âge éligible", status: "pass", severity: "info", detail: `${age} ans` });

  const idType = (app.id_type ?? "").toLowerCase();
  const idNumber = app.id_number ?? "";
  if (idType.includes("national") || idType === "national_id") {
    if ((app.country ?? "").toUpperCase() === "EE") {
      const ee = checkEstonianId(idNumber, app.birth_date);
      if (!ee.valid) checks.push({ code: "id_format", group: "kyc", label: "Code isikukood", status: "fail", severity: "high", detail: "Format / clé de contrôle invalide" });
      else if (ee.embeddedDob) checks.push({ code: "id_dob", group: "kyc", label: "Cohérence isikukood ↔ naissance", status: "fail", severity: "high", detail: `Code encode ${ee.embeddedDob}` });
      else checks.push({ code: "id_format", group: "kyc", label: "Code isikukood", status: "pass", severity: "info", detail: "Clé de contrôle valide" });
    } else {
      const ok = /^[A-Z]{2}[A-Z0-9]{6,}$/.test(idNumber.toUpperCase());
      checks.push({ code: "id_format", group: "kyc", label: "Format pièce d'identité", status: ok ? "pass" : "warn", severity: ok ? "info" : "low", detail: ok ? "Format conforme" : "Format inhabituel" });
    }
  } else if (idType.includes("passport")) {
    const ok = /^[A-Z0-9]{8,9}$/.test(idNumber.toUpperCase());
    checks.push({ code: "id_format", group: "kyc", label: "Numéro de passeport", status: ok ? "pass" : "warn", severity: ok ? "info" : "low", detail: ok ? "Format conforme" : "Format inhabituel" });
  } else {
    checks.push({ code: "id_format", group: "kyc", label: "Pièce d'identité", status: "unknown", severity: "low", detail: "Type non renseigné" });
  }

  const email = (app.email ?? "").toLowerCase();
  const emailDomain = email.split("@")[1] ?? "";
  if (DISPOSABLE_EMAIL_DOMAINS.includes(emailDomain)) checks.push({ code: "email", group: "kyc", label: "E-mail jetable", status: "fail", severity: "medium", detail: emailDomain });
  else if (!email.includes("@")) checks.push({ code: "email", group: "kyc", label: "E-mail", status: "warn", severity: "low", detail: "Absent ou invalide" });
  else checks.push({ code: "email", group: "kyc", label: "E-mail valide", status: "pass", severity: "info", detail: emailDomain });

  const phone = normPhone(app.phone);
  const voip = rng.chance(0.12);
  checks.push({ code: "phone", group: "kyc", label: voip ? "Téléphone VOIP suspecté" : "Téléphone", status: voip ? "warn" : phone ? "pass" : "warn", severity: voip ? "medium" : "info", detail: phone || "Absent" });

  const liveness = rng.chance(0.85);
  checks.push({ code: "liveness", group: "kyc", label: "Selfie / vivacité", status: liveness ? "pass" : "warn", severity: liveness ? "info" : "medium", detail: liveness ? "Concordance faciale OK (simulé)" : "Concordance faible (simulé)" });

  // --- Documents ---------------------------------------------------------
  const docs = [
    { key: "id", url: app.document_id_url, label: "Pièce d'identité" },
    { key: "income", url: app.document_income_url, label: "Justificatif de revenus" },
    { key: "address", url: app.document_address_url, label: "Justificatif de domicile" },
    { key: "bank", url: app.document_bank_url, label: "Relevé bancaire" },
  ];
  for (const d of docs) {
    if (!d.url) { checks.push({ code: `doc_${d.key}`, group: "document", label: d.label, status: "warn", severity: "low", detail: "Non fourni" }); continue; }
    const tampered = rng.chance(0.06);
    checks.push({ code: `doc_${d.key}`, group: "document", label: d.label, status: tampered ? "fail" : "pass", severity: tampered ? "high" : "info", detail: tampered ? "Métadonnées / police incohérentes (simulé)" : "Aucune anomalie détectée" });
  }
  // Duplicate document hash across applications (same id_number reused).
  const dupDoc = others.some((p) => p.id_number && p.id_number === app.id_number);
  if (dupDoc) checks.push({ code: "doc_dup", group: "document", label: "Document en doublon", status: "fail", severity: "high", detail: "Pièce déjà vue sur un autre dossier" });

  // --- Fraud signals -----------------------------------------------------
  const emailVel = others.filter((p) => (p.email ?? "").toLowerCase() === email && email).length;
  const phoneVel = others.filter((p) => normPhone(p.phone) === phone && phone).length;
  const ibanVel = others.filter((p) => p.document_bank_url && p.document_bank_url === app.document_bank_url).length;
  const deviceVel = rng.chance(0.1) ? rng.int(1, 3) : 0;
  const cluster = others
    .filter((p) => p.last_name === app.last_name && toIsoDate(p.birth_date) === toIsoDate(app.birth_date) && app.last_name)
    .map((p) => p.id);

  if (emailVel + phoneVel + ibanVel >= 3) checks.push({ code: "velocity", group: "fraud", label: "Vélocité élevée", status: "fail", severity: "high", detail: `${emailVel + phoneVel + ibanVel} dossiers liés (email/tél/IBAN)` });
  else if (emailVel + phoneVel + ibanVel > 0) checks.push({ code: "velocity", group: "fraud", label: "Coordonnées partagées", status: "warn", severity: "medium", detail: `${emailVel + phoneVel + ibanVel} dossier(s) lié(s)` });
  else checks.push({ code: "velocity", group: "fraud", label: "Vélocité", status: "pass", severity: "info", detail: "Aucun dossier lié" });

  if (cluster.length) checks.push({ code: "cluster", group: "fraud", label: "Cluster d'identités", status: "warn", severity: "medium", detail: `${cluster.length} identité(s) proche(s)` });

  const impossibleTravel = app.address_country && app.country && app.address_country !== app.country;
  if (impossibleTravel) checks.push({ code: "geo", group: "fraud", label: "Incohérence géographique", status: "warn", severity: "medium", detail: `Pays demande ${app.country} ≠ résidence ${app.address_country}` });

  const createdHour = new Date(app.created_at).getUTCHours();
  if (createdHour >= 1 && createdHour <= 5) checks.push({ code: "time", group: "fraud", label: "Dépôt nocturne", status: "warn", severity: "low", detail: `Reçue à ${createdHour}h UTC` });

  const synthetic = (age != null && age < 25) && Number(app.monthly_net_income ?? 0) > 4000;
  if (synthetic) checks.push({ code: "synthetic", group: "fraud", label: "Identité synthétique possible", status: "warn", severity: "medium", detail: "Profil jeune / revenu élevé" });

  // --- AML screening -----------------------------------------------------
  const screeningHits: ScreeningHit[] = [];
  for (const [list, names] of Object.entries(SCREENING_NAMES)) {
    for (const n of names) {
      const score = nameMatch(fullName, n);
      if (score >= 0.85) {
        screeningHits.push({
          list: list as ScreeningHit["list"],
          name: n,
          matchScore: Math.round(score * 100) / 100,
          disposition: score >= 0.97 ? "pending" : "false_positive",
          note: score >= 0.97 ? "Correspondance forte — à statuer" : "Correspondance partielle — probable faux positif",
        });
      }
    }
  }
  const truePep = screeningHits.some((h) => (h.list === "PEP" || h.list === "EU" || h.list === "OFAC" || h.list === "UN") && h.disposition !== "false_positive");
  if (screeningHits.length) checks.push({ code: "screening", group: "aml", label: "Correspondance liste de surveillance", status: truePep ? "fail" : "warn", severity: truePep ? "critical" : "medium", detail: `${screeningHits.length} correspondance(s)` });
  else checks.push({ code: "screening", group: "aml", label: "Screening LCB-FT", status: "pass", severity: "info", detail: "Aucune correspondance" });

  const highRiskCountry = !["EE", "FR", "ES"].includes((app.country ?? "").toUpperCase());
  const bigAmount = Number(app.amount ?? 0) > 15000;
  const amlRating: FraudAmlResult["amlRating"] = truePep || (highRiskCountry && bigAmount) ? "high" : highRiskCountry || bigAmount ? "medium" : "low";

  // --- Source of funds & compliance -------------------------------------
  const income = Number(app.monthly_net_income ?? 0);
  const sofRatio = income > 0 ? Number(app.amount ?? 0) / income : 99;
  if (sofRatio > 40) checks.push({ code: "sof", group: "sof", label: "Plausibilité origine des fonds", status: "warn", severity: "medium", detail: `Montant = ${Math.round(sofRatio)}× le revenu mensuel` });
  else checks.push({ code: "sof", group: "sof", label: "Origine des fonds", status: "pass", severity: "info", detail: "Cohérent avec les revenus déclarés" });

  const fatcaCrsIndicia: string[] = [];
  if (app.nationality && !["EE", "FR", "ES"].includes((app.nationality ?? "").toUpperCase())) fatcaCrsIndicia.push("Nationalité hors UE base");
  if (impossibleTravel) fatcaCrsIndicia.push("Adresse à l'étranger");
  checks.push({ code: "fatca", group: "sof", label: "Indices FATCA/CRS", status: fatcaCrsIndicia.length ? "warn" : "pass", severity: fatcaCrsIndicia.length ? "low" : "info", detail: fatcaCrsIndicia.join(", ") || "Aucun indice" });

  // --- Scores ------------------------------------------------------------
  const fraudScore = clamp(
    checks.reduce((s, c) => s + (c.status === "pass" || c.status === "unknown" ? 0 : SEVERITY_POINTS[c.severity]), 0),
    0,
    100
  );
  const amlBump = amlRating === "high" ? 25 : amlRating === "medium" ? 10 : 0;
  const composite = clamp(Math.round(fraudScore * 0.8 + amlBump), 0, 100);

  const recommended: Disposition = checks.some((c) => c.severity === "critical" && c.status === "fail")
    ? "block"
    : truePep || composite >= 70
      ? "escalate"
      : composite >= 40
        ? "review"
        : "clear";

  const reasonCodes = checks
    .filter((c) => c.status !== "pass" && c.status !== "unknown")
    .map((c) => ({ code: c.code, label: c.label, points: SEVERITY_POINTS[c.severity] }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 4);

  const seed = hashSeed(app.id);
  const deviceFingerprint = `FP-${seed.toString(16).slice(0, 8).toUpperCase()}`;
  const ipAddress = `${(seed % 223) + 1}.${(seed >> 8) % 255}.${(seed >> 16) % 255}.${(seed >> 4) % 255}`;
  const geoByCountry: Record<string, string> = { EE: "Tallinn, EE", FR: "Lyon, FR", ES: "Madrid, ES" };

  return {
    checks,
    screeningHits,
    velocity: { email: emailVel, phone: phoneVel, iban: ibanVel, device: deviceVel, cluster },
    fraudScore,
    amlRating,
    composite,
    recommended,
    reasonCodes,
    fatcaCrsIndicia,
    deviceFingerprint,
    ipAddress,
    geo: geoByCountry[(app.country ?? "").toUpperCase()] ?? app.city ?? "—",
    modelVersion: "fraud-v1",
  };
}

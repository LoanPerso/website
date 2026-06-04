import type { Result } from "../types";

// On-demand translation for the mailbox reader (DB-backed mockup tool). Uses the
// free, key-less MyMemory API: it auto-detects the source language and translates
// to `target` (French by default), is CORS-open (callable from the browser) and
// works from any IP. Anonymous queries are capped at 500 chars, so long bodies
// are chunked on sentence/word boundaries. Note: the message text is sent to an
// external service when the user taps "Traduire".
export interface TranslateResult {
  text: string;
  detected: string | null; // ISO source code, when the service reports one
}

const MAX_CHARS = 480; // stay just under MyMemory's 500-char per-query ceiling

// Split into <=MAX_CHARS pieces, preferring sentence then line then word breaks
// (never mid-word).
function chunk(text: string): string[] {
  const out: string[] = [];
  let rest = text.trim();
  while (rest.length > MAX_CHARS) {
    const window = rest.slice(0, MAX_CHARS);
    let cut = window.lastIndexOf(". ");
    if (cut > 0) cut += 1;
    if (cut < MAX_CHARS * 0.5) cut = window.lastIndexOf("\n");
    if (cut < MAX_CHARS * 0.5) cut = window.lastIndexOf(" ");
    if (cut <= 0) cut = MAX_CHARS;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) out.push(rest);
  return out;
}

export async function translateText(text: string, target = "fr"): Promise<Result<TranslateResult>> {
  const clean = (text ?? "").trim();
  if (!clean) return { data: { text: "", detected: null }, error: null };
  try {
    const pieces: string[] = [];
    let detected: string | null = null;
    for (const part of chunk(clean)) {
      const url =
        "https://api.mymemory.translated.net/get?langpair=" +
        encodeURIComponent(`autodetect|${target}`) +
        `&de=contact@quickfund.ee&q=${encodeURIComponent(part)}`;
      const res = await fetch(url);
      if (!res.ok) return { data: null, error: `Service de traduction indisponible (${res.status}).` };
      const json = (await res.json()) as {
        responseStatus?: number | string;
        responseDetails?: string;
        responseData?: { translatedText?: string; detectedLanguage?: string };
      };
      const status = Number(json.responseStatus);
      const piece = json.responseData?.translatedText ?? "";
      if (status !== 200 || !piece || /MYMEMORY WARNING|QUERY LENGTH|INVALID/i.test(piece)) {
        return { data: null, error: json.responseDetails || "Traduction indisponible (quota dépassé ?)." };
      }
      pieces.push(piece);
      if (!detected && json.responseData?.detectedLanguage) {
        detected = json.responseData.detectedLanguage.slice(0, 2).toLowerCase();
      }
    }
    const out = pieces.join("\n").trim();
    if (!out) return { data: null, error: "Traduction vide." };
    return { data: { text: out, detected }, error: null };
  } catch {
    return { data: null, error: "Échec de la traduction (réseau)." };
  }
}

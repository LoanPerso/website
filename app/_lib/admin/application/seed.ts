// Deterministic pseudo-random helpers.
//
// All "smoke" (mock) analytics on the application dossier are derived, never stored.
// To make them stable — the same dossier always renders the same numbers across
// reloads — every mock value is drawn from a PRNG seeded by the application id.

export function hashSeed(input: string): number {
  // FNV-1a 32-bit
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32 — small, fast, good-enough deterministic generator.
export function makeRng(seed: number | string): () => number {
  let a = (typeof seed === "string" ? hashSeed(seed) : seed) >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Rng {
  next: () => number;
  range: (lo: number, hi: number) => number;
  int: (lo: number, hi: number) => number;
  pick: <T>(arr: readonly T[]) => T;
  chance: (p: number) => boolean;
}

export function rngFrom(seed: number | string): Rng {
  const next = makeRng(seed);
  const range = (lo: number, hi: number) => lo + (hi - lo) * next();
  return {
    next,
    range,
    int: (lo, hi) => Math.floor(range(lo, hi + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)] as never,
    chance: (p) => next() < p,
  };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function round0(n: number): number {
  return Math.round(n);
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// Loan-application date columns are stored as free text (ISO or DD/MM/YYYY).
export function toIsoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const m = value.match(/^(\d{2})[/.-](\d{2})[/.-](\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export function ageFromBirth(value: string | null | undefined): number | null {
  const iso = toIsoDate(value);
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function monthsSince(value: string | null | undefined): number | null {
  const iso = toIsoDate(value);
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  return Math.max(0, (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
}

export function hoursSince(iso: string | null | undefined): number {
  if (!iso) return 0;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0;
  return Math.max(0, (Date.now() - d.getTime()) / 3_600_000);
}

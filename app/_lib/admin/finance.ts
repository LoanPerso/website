// Loan math: annuity amortization schedule (matches supabase/seed.sql logic).

export interface ScheduleRow {
  sequence: number;
  due_date: string; // ISO date (YYYY-MM-DD)
  amount_due: number;
  principal_component: number;
  interest_component: number;
}

export interface LoanComputation {
  monthlyPayment: number;
  totalInterest: number;
  totalRepayable: number;
  schedule: ScheduleRow[];
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function addMonths(isoDate: string, months: number): string {
  const d = new Date(isoDate + "T00:00:00");
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // guard against month overflow (e.g. Jan 31 + 1 month)
  if (d.getDate() < day) d.setDate(0);
  return d.toISOString().slice(0, 10);
}

export function monthlyPaymentFor(principal: number, annualRatePct: number, months: number): number {
  if (months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return round2(principal / months);
  return round2((principal * r) / (1 - Math.pow(1 + r, -months)));
}

// Builds the full amortization schedule. The last installment absorbs rounding.
export function buildSchedule(
  principal: number,
  annualRatePct: number,
  months: number,
  startDate: string
): LoanComputation {
  const r = annualRatePct / 100 / 12;
  const basePayment = monthlyPaymentFor(principal, annualRatePct, months);
  const schedule: ScheduleRow[] = [];
  let balance = principal;
  let totalInterest = 0;

  for (let k = 1; k <= months; k++) {
    const interest = round2(balance * r);
    let principalPart = round2(basePayment - interest);
    if (k === months) principalPart = round2(balance);
    balance = round2(balance - principalPart);
    totalInterest = round2(totalInterest + interest);
    schedule.push({
      sequence: k,
      due_date: addMonths(startDate, k),
      amount_due: round2(principalPart + interest),
      principal_component: principalPart,
      interest_component: interest,
    });
  }

  return {
    monthlyPayment: basePayment,
    totalInterest,
    totalRepayable: round2(principal + totalInterest),
    schedule,
  };
}

// Suggest a rate from a product range given a risk category (mirrors seed logic).
export function suggestRate(
  minRate: number,
  maxRate: number,
  category: "A" | "B" | "C" | "D" | null
): number {
  const mid = (minRate + maxRate) / 2;
  switch (category) {
    case "A":
      return round2(minRate);
    case "B":
      return round2(mid - 1);
    case "C":
      return round2(mid + 1);
    case "D":
      return round2(maxRate);
    default:
      return round2(mid);
  }
}

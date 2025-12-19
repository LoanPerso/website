export const planTiers = ["free", "pro", "enterprise"] as const;

export type PlanTier = (typeof planTiers)[number];

export function isPaidPlan(plan: PlanTier) {
  return plan !== "free";
}

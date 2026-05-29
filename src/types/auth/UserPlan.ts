export enum UserPlan {
  Free  = 'Free',
  Plus  = 'Plus',
  Pro   = 'Pro',
  Owner = 'Owner',
}

/** Hierarquia: Free < Plus < Pro < Owner */
const PLAN_RANK: Record<UserPlan, number> = {
  [UserPlan.Free]:  0,
  [UserPlan.Plus]:  1,
  [UserPlan.Pro]:   2,
  [UserPlan.Owner]: 3,
}

export function planAtLeast(userPlan: UserPlan | string | undefined, required: UserPlan): boolean {
  const rank = PLAN_RANK[userPlan as UserPlan] ?? 0
  return rank >= PLAN_RANK[required]
}

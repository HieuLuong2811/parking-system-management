export type PlanCardKey = 'noPlate' | 'withPlate';

const planNameMap: Record<string, PlanCardKey> = {
  BASIC: 'noPlate',
  STARTUP: 'withPlate',
  ENTERPRISE: 'withPlate',
};

export const getPlanCardKey = (name: string): PlanCardKey | null => {
  return planNameMap[name] ?? null;
};

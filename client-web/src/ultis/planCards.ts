export type PlanCardKey = 'noPlate' | 'withPlate';

const planNameMap: Record<string, PlanCardKey> = {
  'Xe đạp / Xe đạp điện': 'noPlate',
  'Xe máy / Xe đạp điện': 'withPlate',
};

export const getPlanCardKey = (name: string): PlanCardKey | null => {
  return planNameMap[name] ?? null;
};

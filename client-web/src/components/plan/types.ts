export type AcademicTermOption = {
  id: string;
  termName: string;
  startDate: string;
  endDate: string;
};

export type RawTermCard = {
  id: string;
  term_name: string;
  start_date: string;
  end_date: string;
};

export type PaymentModeId = 'recurring' | 'one-time';

export type PaymentModeDefinition = {
  id: PaymentModeId;
  titleKey: string;
  priceKey: string;
  descriptionKey: string;
  badgeKey?: string;
};

export const paymentModes: PaymentModeDefinition[] = [
  {
    id: 'recurring',
    titleKey: 'plan.paymentModes.recurring.title',
    priceKey: 'plan.paymentModes.recurring.price',
    descriptionKey: 'plan.paymentModes.recurring.description',
    badgeKey: 'plan.paymentModes.recurring.badge',
  },
  {
    id: 'one-time',
    titleKey: 'plan.paymentModes.oneTime.title',
    priceKey: 'plan.paymentModes.oneTime.price',
    descriptionKey: 'plan.paymentModes.oneTime.description',
    badgeKey: 'plan.paymentModes.oneTime.badge',
  },
];

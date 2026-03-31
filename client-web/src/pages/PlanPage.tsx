import { Box, Button, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SubscriptionPlan } from '../api/clientApi';
import { useSubscriptionPlans } from '../api/subscription_plans';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

type VehiclePackageOption = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  description: string;
  features: string[];
};

export default function PlanPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: plans = [] } = useSubscriptionPlans();

  const uiPlans = useMemo<SubscriptionPlan[]>(() => {
    return plans.map((plan) => {
      const priceLabel = currencyFormatter.format(plan.price_per_day);
      return {
        id: plan.id,
        label: plan.plan_name,
        description: plan.description ?? t('plan.checkoutSubtitle'),
        duration: `${priceLabel} / ngày`,
        perk: plan.description ?? t('plan.checkoutSubtitle'),
        price: priceLabel,
        features: [
          `${t('plan.reminder')}`,
          `${t('plan.checkoutPlanNote')}`,
          `${t('plan.checkoutFields.bank')}`,
        ],
      };
    });
  }, [plans, t]);

  const vehiclePackages = useMemo<VehiclePackageOption[]>(() => {
    return [
      {
        id: 'without-plate',
        title: t('plan.vehiclePackages.withoutPlate.title'),
        subtitle: t('plan.vehiclePackages.withoutPlate.subtitle'),
        price: t('plan.vehiclePackages.withoutPlate.price'),
        description: t('plan.vehiclePackages.withoutPlate.description'),
        features: t('plan.vehiclePackages.withoutPlate.features', { returnObjects: true }) as string[],
      },
      {
        id: 'with-plate',
        title: t('plan.vehiclePackages.withPlate.title'),
        subtitle: t('plan.vehiclePackages.withPlate.subtitle'),
        price: t('plan.vehiclePackages.withPlate.price'),
        description: t('plan.vehiclePackages.withPlate.description'),
        features: t('plan.vehiclePackages.withPlate.features', { returnObjects: true }) as string[],
      },
    ];
  }, [t]);

  const handleOpenCheckout = (plan: SubscriptionPlan) => {
    navigate('/plan/checkout', { state: { plan } });
  };

  return (
    <Box sx={{ margin: '0 5rem', maxWidth: 1200, padding: 2 }}>
      {/* <Box className="plan-header">
        <Typography variant="subtitle2" className="section-label">
          {t('plan.sectionTitle')}
        </Typography>
        <Typography variant="body2" className="section-description">
          {t('plan.checkoutSubtitle')}
        </Typography>
      </Box> */}

      <Box className="vehicle-packages-section">
        <Typography variant="subtitle2" className="section-label">
          {t('plan.vehiclePackages.sectionTitle')}
        </Typography>
        <Typography variant="body2" className="section-description">
          {t('plan.vehiclePackages.description')}
        </Typography>
        <Box className="vehicle-package-grid">
          {vehiclePackages.map((vehiclePackage, index) => {
            const uiPlanForPackage = uiPlans[index] ?? uiPlans[0] ?? null;
            return (
              <Box key={vehiclePackage.id} className="vehicle-package-card">
                <Typography variant="body2" className="vehicle-package-subtitle">
                  {vehiclePackage.subtitle}
                </Typography>
                <Typography variant="h6" className="vehicle-package-title">
                  {vehiclePackage.title}
                </Typography>
                <Typography variant="body1" className="vehicle-package-price">
                  {vehiclePackage.price}
                </Typography>
                <Typography variant="caption" className="price-note">
                  {t('plan.priceNote')}
                </Typography>
                <Typography variant="body2" className="vehicle-package-description">
                  {vehiclePackage.description}
                </Typography>
                <ul className="vehicle-package-features">
                  {vehiclePackage.features.map((feature) => (
                    <li key={`${vehiclePackage.id}-${feature}`}>{feature}</li>
                  ))}
                </ul>
                <Box className="vehicle-package-actions">
                  <Button
                    variant="outlined"
                    onClick={() => uiPlanForPackage && handleOpenCheckout(uiPlanForPackage)}
                    disabled={!uiPlanForPackage}
                  >
                    {t('plan.vehiclePackages.cta')}
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

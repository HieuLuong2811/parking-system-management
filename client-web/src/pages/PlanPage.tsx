import { Box, Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSubscriptionPlans } from '../api/subscription_plans';
import PlanCheckoutPanel from '../components/plan/PlanCheckoutPanel';
import { getPlanCardKey } from '../ultis/planCards';

const priceFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export default function PlanPage() {
  const { t } = useTranslation();
  const { data: plans = [] } = useSubscriptionPlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPlanId && plans.length > 0) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;

  const dayLabel = t('plan.perDay');
  // const priceLabel = t('plan.priceLabel');

  return (
    <Box className="plan-page-shell">
      <Box className='plan-page-shell-body'>
        <Box className="plan-page-header">
          <Button
            component={Link}
            to="/vehicle"
            startIcon={<ArrowBackIcon />}
            className="plan-back-link"
          >
            {t('plan.backToVehicles')}
          </Button>
          <Typography variant="h4" gutterBottom>
            {t('plan.sectionTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('plan.sectionDescription')}
          </Typography>
        </Box>

        <Box className="plan-page-body">
          <Box className="plan-option-grid">
            {plans.length === 0 && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="body1" align="center">
                  {t('plan.noPlans')}
                </Typography>
              </Box>
            )}

            {plans.map((plan) => {
              const planKey = getPlanCardKey(plan.plan_name);
              const title =
                planKey !== null
                  ? t(`plan.cards.${planKey}.title`, { defaultValue: plan.plan_name })
                  : plan.plan_name;
              const subtitle =
                planKey !== null
                  ? t(`plan.cards.${planKey}.subtitle`, { defaultValue: plan.description ?? '' })
                  : plan.description ?? '';
              const priceValue = `${priceFormatter.format(plan.price_per_day)} VND`;

              return (
                <Box
                  key={plan.id}
                  className={`plan-option-card ${selectedPlanId === plan.id ? 'plan-option-card--active' : ''}`}
                >
                  <Box className="plan-card-meta">
                    {subtitle && (
                      <Typography variant="h6" textTransform="unset" className="plan-card-label">
                        {subtitle}
                      </Typography>
                    )}
                    <Typography variant="h5" fontWeight={600} className="plan-card-title">
                      {title}
                    </Typography>
                  </Box>
                  <Typography variant="h5" mt={1} className="plan-card-price-line">
                    {priceValue}
                    <span className="plan-card-per-day">{dayLabel}</span>
                  </Typography>
                  {plan.description && (
                    <Typography variant="body2" className="plan-card-description">
                      {plan.description}
                    </Typography>
                  )}
                  <Button
                    variant={selectedPlanId === plan.id ? 'contained' : 'outlined'}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    {t('plan.cta')}
                  </Button>
                </Box>
              );
            })}
          </Box>

          {selectedPlan ? (
            <Box className="plan-checkout-frame">
              <Box className="plan-checkout-header">
                <Typography variant="h5">{t('plan.checkoutTitle')}</Typography>
                <Typography variant="body2">{t('plan.checkoutSubtitle')}</Typography>
              </Box>
              <PlanCheckoutPanel plan={selectedPlan} />
            </Box>
          ) : (
            <Box className="plan-checkout-placeholder">
              <Typography variant="body1">{t('plan.notChosen')}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

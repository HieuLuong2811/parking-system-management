import { Box, Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { useSubscriptionPlans } from '../api/subscription_plans';
import PlanCheckoutPanel from '../components/plan/PlanCheckoutPanel';
import { getPlanCardKey } from '../ultis/planCards';

const priceFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export default function PlanPage() {
  const { t } = useTranslation();
  const { data: plans = [] } = useSubscriptionPlans();
  const [searchParams] = useSearchParams();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (plans.length === 0) {
      return;
    }

    const planIdParam = (searchParams.get('planId') || '').trim();
    if (planIdParam && plans.some((plan) => plan.id === planIdParam)) {
      if (selectedPlanId !== planIdParam) {
        setSelectedPlanId(planIdParam);
      }
      return;
    }

    const planKeyParam = (searchParams.get('planKey') || '').trim();
    if (planKeyParam) {
      const matched = plans.find((plan) => getPlanCardKey(plan.plans_type) === planKeyParam);
      if (matched && selectedPlanId !== matched.id) {
        setSelectedPlanId(matched.id);
        return;
      }
    }

    if (!selectedPlanId) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, searchParams, selectedPlanId]);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;
  const initialVehicleId = (searchParams.get('vehicleId') || '').trim() || undefined;
  const isPrefilledFlow = Boolean(initialVehicleId && (searchParams.get('planKey') || searchParams.get('planId')));

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
          {!isPrefilledFlow && (
            <Box className="plan-option-grid">
              {plans.length === 0 && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="body1" align="center">
                    {t('plan.noPlans')}
                  </Typography>
                </Box>
              )}

              {plans.map((plan) => {
                const planKey = getPlanCardKey(plan.plans_type);
                const title =
                  planKey !== null
                    ? t(`plan.cards.${planKey}.title`, { defaultValue: plan.plans_type })
                    : plan.plans_type;
                const subtitle =
                  planKey !== null
                    ? t(`plan.cards.${planKey}.subtitle`, { defaultValue: '' })
                    : '';
                const priceValue = `${priceFormatter.format(plan.price_per_day)} VND`;

                return (
                  <Box
                    key={plan.id}
                    className={`plan-option-card ${selectedPlanId === plan.id ? 'plan-option-card--active' : ''}`}
                  >
                    <Box className="plan-card-meta">
                      {subtitle ? (
                        <Typography variant="h6" textTransform="unset" className="plan-card-label">
                          {subtitle}
                        </Typography>
                      ) : null}
                      <Typography variant="h5" fontWeight={600} className="plan-card-title">
                        {title}
                      </Typography>
                    </Box>
                    <Typography variant="h5" mt={1} className="plan-card-price-line">
                      {priceValue}
                      <span className="plan-card-per-day">{dayLabel}</span>
                    </Typography>
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
          )}

          {selectedPlan ? (
            <Box className="plan-checkout-frame">
              <Box className="plan-checkout-header">
                <Typography variant="h5">{t('plan.checkoutTitle')}</Typography>
                <Typography variant="body2">{t('plan.checkoutSubtitle')}</Typography>
              </Box>
              <PlanCheckoutPanel plan={selectedPlan} initialVehicleId={initialVehicleId} />
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

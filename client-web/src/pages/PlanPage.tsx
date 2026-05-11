import { Box, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSubscriptionPlans } from '../api/subscription_plans';
import { clientHttp } from '../api/clientApi';
import { getPlanCardKey } from '../ultis/planCards';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { formatCurrency, getBooleanLabel, getPlanDisplayKey } from '../ultis/formatters';
import { getPlanIcon } from '../ultis/status';
import { useConfirmDialog } from '../hooks/useConfirmDialog';

export default function PlanPage() {
  const { t } = useTranslation();
  const { data: plans = [] } = useSubscriptionPlans();
  const [searchParams] = useSearchParams();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const confirmOverrideActivePlan = async () => {
    try {
      const res = await clientHttp.get<any[]>('/subscriptions/me', {
        params: { status: 'ACTIVE' },
      });

      const active = Array.isArray(res.data) ? res.data[0] : null;
      if (!active) return true;

      const activeLabel =
        active?.subscription_plan?.plans_type ??
        active?.plan ??
        t('plan.currentPlanFallback', { defaultValue: 'gói hiện tại' });

      return await confirm({
        title: t('plan.overrideActivePlanDialog.title', {
          defaultValue: 'Bạn đã có gói đang hoạt động',
        }),
        message: t('plan.overrideActivePlanDialog.message', {
          plan: activeLabel,
          defaultValue: `Hiện tại bạn đang sử dụng gói ${activeLabel}. Nếu đăng ký gói mới thì gói cũ sẽ bị huỷ. Bạn có muốn tiếp tục?`,
        }),
        cancelText: t('common.cancel', { defaultValue: 'Huỷ' }),
        confirmText: t('common.continue', { defaultValue: 'Tiếp tục' }),
        danger: true,
      });
    } catch {
      return true;
    }
  };

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
      const matched = plans.find(
        (plan) => getPlanCardKey(plan.plans_type) === planKeyParam,
      );

      if (matched && selectedPlanId !== matched.id) {
        setSelectedPlanId(matched.id);
        return;
      }
    }

    if (!selectedPlanId) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, searchParams, selectedPlanId]);

  const initialVehicleId =
    (searchParams.get('vehicleId') || '').trim() || undefined;

  const isPrefilledFlow = Boolean(
    initialVehicleId && (searchParams.get('planKey') || searchParams.get('planId')),
  );

  const dayLabel = t('plan.perDay');

  return (
    <Box className="plan-page-shell">
      <Box className="plan-page-shell-body">
        <Box className="plan-page-header">
          <Typography fontSize={24} fontWeight={700} mb={2} className="plan-page-title">
            {t('plan.sectionTitle')}
          </Typography>

          <Typography variant="body1" className="plan-page-description" m='0 auto' maxWidth={1000} lineHeight={1.8}>
            {t('plan.sectionDescription')}
          </Typography>
        </Box>

        <Box className="plan-pricing-panel">

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
                const isActive = selectedPlanId === plan.id;

                const planKey = getPlanDisplayKey(plan.plans_type);

                const title = t(`plan.cards.${planKey}`, {
                  defaultValue: plan.plans_type,
                });

                const dailyFee = plan.price_per_day ?? plan.price_per_day;
                const after18Fee = plan.after_18_fee;
                const waiveAfter18 = Boolean(plan.waive_after_18_fee);

                const features = [
                  getBooleanLabel(
                    plan.allow_monthly_payment,
                    t('plan.features.monthlyPayment'),
                    t('plan.features.noMonthlyPayment'),
                  ),
                  getBooleanLabel(
                    plan.allow_full_payment,
                    t('plan.features.fullPayment'),
                    t('plan.features.noFullPayment'),
                  ),
                  {
                    enabled: true,
                    label: t('plan.features.licensedVehicleLimit', {
                      count: plan.max_licensed_vehicle ?? 0,
                    }),
                  },
                  {
                    enabled: true,
                    label: t('plan.features.unlicensedVehicleLimit', {
                      count: plan.max_unlicensed_vehicle ?? 0,
                    }),
                  },
                  {
                    enabled: true,
                    label: t('plan.features.dailyFee', {
                      amount: formatCurrency(dailyFee),
                    }),
                  },
                  {
                    enabled: true,
                    label: waiveAfter18
                      ? t('plan.features.after18Waived')
                      : t('plan.features.after18Fee', {
                          amount: formatCurrency(after18Fee),
                        }),
                  },
                ];

                return (
                  <Box
                    key={plan.id}
                    className={`plan-option-card ${
                      isActive ? 'plan-option-card--active' : ''
                    }`}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    <Box className="plan-card-icon">
                     {getPlanIcon(plan.plans_type)}

                      {title ? (
                        <Typography className="plan-card-title" fontSize={20} fontWeight={700} lineHeight={1.25}>
                          {title}
                        </Typography>
                      ) : null}
                    </Box>

                    <Box className="plan-card-price-line">
                      <Typography
                        component="span"
                        fontWeight={700}
                        fontSize="2rem"
                        className="plan-card-price"
                      >
                        {formatCurrency(dailyFee)}
                      </Typography>

                      <Typography component="span" fontSize={14} className="plan-card-per-day">
                        {dayLabel}
                      </Typography>
                    </Box>

                    <Box className="plan-card-feature-list">
                      {features.map((feature, featureIndex) => (
                        <Box
                          key={`${plan.id}-feature-${featureIndex}`}
                          className="plan-card-feature-item"
                        >
                          {feature.enabled ? (
                            <CheckCircleIcon className="plan-card-feature-icon" fontSize='small' color='success' />
                          ) : (
                            <CancelIcon className="plan-card-feature-icon plan-card-feature-icon--disabled" fontSize='small' color='disabled'  />
                          )}

                          <Typography className="plan-card-feature-text" fontSize={14} lineHeight={1.9} fontWeight={600}>
                            {feature.label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      className={`${plan.is_in_use ? 'plan-card-cta-disabled' : 'plan-card-button'}`}
                      disabled={plan.is_in_use}
                      sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#FFFFFF', color: '#111827', boxShadow: 'none' }}
                      onClick={async (event) => {
                        event.stopPropagation();
                        const confirmed = await confirmOverrideActivePlan();
                        if (!confirmed) return;
                        navigate(`/plan/checkout?planId=${plan.id}&type=${plan.plans_type}`);
                      }}
                    >
                      {plan.is_in_use ? t('plan.ctaDisabled') : t('plan.cta')}
                    </Button>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
      <ConfirmDialog />
    </Box>
  );
}

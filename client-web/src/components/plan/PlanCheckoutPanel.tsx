import { Box, Button, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SubscriptionPlanRecord } from '../../api/clientApi';
import { useAcademicTerms } from '../../api/academic_terms';
import { useCreateInvoice } from '../../api/invoices';
import { useCreateMomoPaymentForInvoice } from '../../api/momo';
import { useVehicles } from '../../api/vehicles';
import { useAppAuth } from '../../contexts/useAppAuth';
import { CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type {
  StripeCardCvcElementChangeEvent,
  StripeCardExpiryElementChangeEvent,
  StripeCardNumberElementChangeEvent,
} from '@stripe/stripe-js';
import { createSetupIntent, createStripePaymentIntent } from '../../api/stripe';
import { getPlanCardKey } from '../../ultis/planCards';
import { useCheckoutState } from './hooks/useCheckoutState';
import { usePlanCheckoutPricing } from './hooks/usePlanCheckoutPricing';
import { AcademicTermOption, paymentModes, RawTermCard } from './types';
import { payment_plan } from '../../constant/config';

const priceFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const formatCurrency = (value: number) => `${priceFormatter.format(value)} VND`;

const getVehicleTypeLabel = (
  vehicleType: string | undefined,
  t: (key: string, options?: { defaultValue?: string }) => string
) => {
  switch (vehicleType) {
    case 'MOTORBIKE':
      return t('vehicle.modal.types.motorbike', { defaultValue: vehicleType });
    case 'BICYCLE':
      return t('vehicle.modal.types.bicycle', { defaultValue: vehicleType });
    case 'ELECTRIC_BICYCLE':
      return t('vehicle.modal.types.electricBicycle', { defaultValue: vehicleType });
    default:
      return vehicleType ?? '—';
  }
};

const STRIPE_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#0f172a',
      fontFamily: '"Inter", sans-serif',
      '::placeholder': {
        color: '#94a3b8',
      },
    },
    invalid: {
      color: '#b91c1c',
    },
  },
} as const;

type PlanCheckoutPanelProps = {
  plan: SubscriptionPlanRecord;
  initialVehicleId?: string;
};

export default function PlanCheckoutPanel({ plan, initialVehicleId }: PlanCheckoutPanelProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const planKey = getPlanCardKey(plan.plans_type);
  const planTitle =
    planKey !== null
      ? t(`plan.cards.${planKey}.title`, { defaultValue: plan.plans_type })
      : plan.plans_type;
  const planSubtitle =
    planKey !== null ? t(`plan.cards.${planKey}.subtitle`, { defaultValue: '' }) : '';
  const { user: currentUser } = useAppAuth();
  const { data: academicTerms = [] } = useAcademicTerms();
  const { data: vehicles = [] } = useVehicles();
  const { mutateAsync: createInvoice } = useCreateInvoice();
  const { mutateAsync: createMomoPayment } = useCreateMomoPaymentForInvoice();
  const stripe = useStripe();
  const elements = useElements();

  const checkoutSteps = useMemo(
    () => (t('plan.checkoutStepper.steps', { returnObjects: true }) as string[]),
    [t]
  );

  const translationTermCards = useMemo(() => {
    const raw = (t('plan.checkoutStepper.termCards', { returnObjects: true }) as RawTermCard[]) ?? [];
    return raw.map((card) => ({
      id: card.id,
      termName: card.term_name,
      startDate: card.start_date,
      endDate: card.end_date,
    }));
  }, [t]);

  const academicTermOptions = useMemo<AcademicTermOption[]>(() => {
    return academicTerms.map((term) => ({
      id: term.id,
      termName: term.term_name,
      startDate: term.start_date,
      endDate: term.end_date,
    }));
  }, [academicTerms]);

  const hasAcademicTerms = academicTermOptions.length > 0;
  const availableTermCards = hasAcademicTerms ? academicTermOptions : translationTermCards;

  const { state: checkoutState, actions: checkoutActions } = useCheckoutState(
    plan?.id,
    academicTermOptions,
    vehicles,
    initialVehicleId
  );

  const {
    activeStep,
    selectedTermId,
    selectedPaymentMode,
    cardComplete,
    cardError,
    selectedVehicleId,
    isProcessing,
    processingError,
  } = checkoutState;

  const {
    setActiveStep,
    selectTerm,
    selectPaymentMode,
    setCardComplete,
    setCardError,
    setProcessing,
    setProcessingError,
  } = checkoutActions;

  const selectedTermRecord = academicTerms.find((term) => term.id === selectedTermId) ?? null;

  const {
    planPricing,
    planPricingBusy,
    planPricingReady,
    recurringModePricing,
    fullModePricing,
  } = usePlanCheckoutPricing(plan?.id, selectedTermRecord?.id, activeStep >= 1);

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null;
  const selectedVehicleSummary = useMemo(() => {
    if (!selectedVehicle) {
      return t('plan.checkoutSummary.vehicleEmpty');
    }
    const typeLabel = getVehicleTypeLabel(selectedVehicle.vehicle_type, t);
    const plate = selectedVehicle.license_plate?.trim();
    if (plate) {
      return `${typeLabel} • ${plate}`;
    }
    return `${typeLabel} • ${t('plan.checkoutSummary.noPlate')}`;
  }, [selectedVehicle, t]);
  const recurringPlanId = recurringModePricing?.payment_plan_id ?? null;
  const fullPlanId = fullModePricing?.payment_plan_id ?? null;

  const momoReady =
    Boolean(currentUser) &&
    Boolean(selectedTermRecord) &&
    Boolean(fullPlanId) &&
    Boolean(selectedVehicle) &&
    planPricingReady &&
    Boolean(fullModePricing);
  const stripeReady = Boolean(stripe && elements);
  const recurringCardReady =
    selectedPaymentMode === payment_plan.RECURRING && cardComplete && stripeReady && Boolean(recurringModePricing);
  const finalStepDisabled = (() => {
    if (selectedPaymentMode === payment_plan.RECURRING) return !recurringCardReady;
    if (selectedPaymentMode === payment_plan.ONE_TIME) return !momoReady;
    return true;
  })();

  const isTermStepInvalid = activeStep === 0 && !selectedTermRecord;
  const isPaymentModeStepInvalid = activeStep === 1 && !selectedPaymentMode;
  const isPaymentDetailStepInvalid = activeStep === 2 && finalStepDisabled;

  const primaryDisabled =
    !plan ||
    isTermStepInvalid ||
    isPaymentModeStepInvalid ||
    isPaymentDetailStepInvalid ||
    isProcessing;

  const getPrimaryLabel = () => {
    if (activeStep < checkoutSteps.length - 1) {
      return t('plan.checkoutStepper.next');
    }
    if (selectedPaymentMode === payment_plan.RECURRING) {
      return t('plan.checkoutStepper.confirm');
    }
    if (selectedPaymentMode === payment_plan.ONE_TIME) {
      return t('plan.checkoutStepper.payMomo');
    }
    return t('plan.checkoutStepper.next');
  };
  const primaryLabel = getPrimaryLabel();

  const [, setStripeFieldComplete] = useState({
    number: false,
    expiry: false,
    cvc: false,
  });
  const [, setStripeFieldErrors] = useState<{
    number: string | null;
    expiry: string | null;
    cvc: string | null;
  }>({
    number: null,
    expiry: null,
    cvc: null,
  });

  const syncStripeField = (field: 'number' | 'expiry' | 'cvc', complete: boolean, errorMessage?: string) => {
    setStripeFieldComplete((prev) => {
      const next = { ...prev, [field]: complete };
      setCardComplete(next.number && next.expiry && next.cvc);
      return next;
    });
    setStripeFieldErrors((prev) => {
      const next = { ...prev, [field]: errorMessage ?? null };
      setCardError(next.number || next.expiry || next.cvc);
      return next;
    });
  };

  const handleCardNumberChange = (event: StripeCardNumberElementChangeEvent) => {
    syncStripeField('number', event.complete, event.error?.message);
  };

  const handleCardExpiryChange = (event: StripeCardExpiryElementChangeEvent) => {
    syncStripeField('expiry', event.complete, event.error?.message);
  };

  const handleCardCvcChange = (event: StripeCardCvcElementChangeEvent) => {
    syncStripeField('cvc', event.complete, event.error?.message);
  };

  const handleRecurringSetup = async () => {
    if (!stripe || !elements) {
      setProcessingError(t('plan.checkoutStepper.cardSetupError'));
      return;
    }

    setProcessing(true);
    setProcessingError(null);
    try {
      const { client_secret } = await createSetupIntent();
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        throw new Error(t('plan.checkoutStepper.cardNotLoaded'));
      }
      const result = await stripe.confirmCardSetup(client_secret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: currentUser?.full_name ?? currentUser?.user_code,
            email: currentUser?.email,
          },
        },
      });
      if (result.error) {
        throw result.error;
      }
      const paymentMethodId = result.setupIntent?.payment_method;
      if (!paymentMethodId || typeof paymentMethodId !== 'string') {
        throw new Error(t('plan.checkoutStepper.cardNotReady'));
      }
      if (!plan || !selectedTermRecord || !selectedVehicle) {
        throw new Error(t('plan.checkoutStepper.cardSetupError'));
      }
      const paymentPlanId = recurringPlanId ?? fullPlanId;
      if (!paymentPlanId) {
        throw new Error(t('plan.checkoutStepper.cardSetupError'));
      }
      if (!recurringModePricing?.amount) {
        throw new Error(t('plan.checkoutStepper.cardNotLoaded'));
      }
      const recurringAmount = recurringModePricing.amount;
      await createStripePaymentIntent({
        payment_method_id: paymentMethodId,
        amount: recurringAmount,
        sub_plan_id: plan.id,
        term_id: selectedTermRecord.id,
        vehicle_id: selectedVehicle.id,
        payment_plan_id: paymentPlanId,
        start_date: selectedTermRecord.start_date,
        end_date: selectedTermRecord.end_date,
        total_amount: recurringAmount,
      });
      navigate('/plan');
    } catch (error) {
      const message = error instanceof Error ? error.message : t('plan.checkoutStepper.cardGeneralError');
      setProcessingError(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleMomoCheckout = async () => {
    if (!currentUser || !selectedTermRecord || !selectedVehicle || !fullPlanId) {
      setProcessingError(t('plan.checkoutStepper.momoSetupError'));
      return;
    }

    if (!plan) {
      setProcessingError(t('plan.checkoutStepper.momoSetupError'));
      return;
    }

    setProcessing(true);
    setProcessingError(null);

    if (!fullModePricing?.amount) {
      setProcessingError(t('plan.checkoutStepper.momoSetupError'));
      return;
    }
    const oneTimeAmount = fullModePricing.amount;
    const metadata = {
      user_code: currentUser.user_code,
      sub_plan_id: plan?.id,
      term_id: selectedTermRecord.id,
      vehicle_id: selectedVehicle.id,
      payment_plan_id: fullPlanId,
      total_amount: oneTimeAmount,
      start_date: selectedTermRecord.start_date,
      end_date: selectedTermRecord.end_date,
    };

    try {
      const invoice = await createInvoice({
        user_code: currentUser.user_code,
        subscription_id: null,
        amount: oneTimeAmount,
        payment_method: 'MOMO',
        status: 'PENDING',
        metadata,
      });

      const momoResponse = await createMomoPayment({
        invoiceId: invoice.id,
        payload: {
          orderInfo: `Invoice ${invoice.id}`,
          redirectUrl: `${window.location.origin}/profile`,
          extraData: JSON.stringify({ invoice_id: invoice.id }),
          lang: currentUser.language_use || 'vi',
        },
      });

      const checkoutUrl =
        momoResponse.payUrl ??
        momoResponse.deeplink ??
        momoResponse.shortLink ??
        momoResponse.qrCodeUrl ??
        momoResponse.deeplinkWebInApp ??
        momoResponse.deeplinkMiniApp ??
        null;

      if (!checkoutUrl) {
        throw new Error(t('plan.checkoutStepper.momoUrlMissing'));
      }

      window.location.assign(checkoutUrl as string);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('plan.checkoutStepper.momoGeneralError');
      setProcessingError(message);
    } finally {
      setProcessing(false);
    }
  };

  const handlePrimaryAction = async () => {
    if (!plan) {
      return;
    }

    if (activeStep < checkoutSteps.length - 1) {
      setActiveStep(Math.min(activeStep + 1, checkoutSteps.length - 1));
      return;
    }

    if (selectedPaymentMode === payment_plan.RECURRING) {
      await handleRecurringSetup();
      return;
    }
    if (selectedPaymentMode === payment_plan.ONE_TIME) {
      await handleMomoCheckout();
    }
  };

  const handleBackStep = () => {
    setActiveStep(Math.max(activeStep - 1, 0));
  };

  return (
    <Box className="checkout-page-grid">
      <Box className="checkout-main-panel">
        <Box className="checkout-payment-panel">
          <Stepper activeStep={activeStep} className="checkout-stepper">
            {checkoutSteps.map((label, index) => (
              <Step
                key={label}
                completed={
                  (index === 0 && Boolean(selectedTermRecord)) ||
                  (index === 1 && Boolean(selectedPaymentMode)) ||
                  false
                }
              >
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box className="checkout-step-content">
            {activeStep === 0 && (
              <>
                <Typography variant="subtitle1" className="checkout-payment-label">
                  {t('plan.checkoutStepper.termLabel')}
                </Typography>
                <Typography variant="body2" className="checkout-step-description">
                  {t('plan.checkoutStepper.termHelper')}
                </Typography>
                {availableTermCards.length === 0 ? (
                  <Typography variant="body2">{t('plan.checkoutStepper.termEmpty')}</Typography>
                ) : (
                  <Box className="checkout-term-grid">
                    {availableTermCards.map((card) => (
                      <Box
                        key={card.id}
                        className={`checkout-term-card ${
                          selectedTermId === card.id ? 'checkout-term-card--active' : ''
                        }`}
                        onClick={() => selectTerm(card.id)}
                      >
                        <Typography className="checkout-term-title">{card.termName}</Typography>
                        <Typography className="checkout-term-meta" variant="body2">
                          {t('plan.checkoutStepper.termRange', {
                            start: card.startDate,
                            end: card.endDate,
                          })}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </>
            )}

            {activeStep === 1 && (
              <Box className="checkout-step-plan">
                <Typography variant="subtitle1" className="checkout-payment-label">
                  {t('plan.checkoutStepper.paymentPlanLabel')}
                </Typography>
                <Typography variant="body2" className="checkout-step-description">
                  {t('plan.checkoutStepper.paymentPlanDescription')}
                </Typography>
                <Box className="checkout-payment-modes">
                  {paymentModes.map((mode) => {
                    const modePricing =
                      mode.id === payment_plan.RECURRING ? recurringModePricing : fullModePricing;
                    return (
                      <Box
                        key={mode.id}
                        className={`checkout-payment-card ${
                          selectedPaymentMode === mode.id ? 'checkout-payment-card--active' : ''
                        }`}
                        onClick={() => {
                          if (!planPricing || !modePricing) {
                            return;
                          }
                          selectPaymentMode(mode.id);
                        }}
                      >
                        <Box className="checkout-payment-header">
                          <Typography variant="subtitle1">{t(mode.titleKey)}</Typography>
                          {mode.badgeKey && (
                            <span className="checkout-payment-badge">{t(mode.badgeKey)}</span>
                          )}
                        </Box>
                        {modePricing && planPricing && !planPricingBusy ? (
                          <Typography variant="h6" className="checkout-payment-price">
                            {formatCurrency(modePricing.amount)}{' '}
                            {mode.id === payment_plan.RECURRING
                              ? t('plan.paymentModes.recurring.suffix')
                              : t('plan.paymentModes.oneTime.suffix')}
                          </Typography>
                        ) : (
                          <Typography variant="body2" className="checkout-payment-calculating">
                            {t('plan.calculatingPrice')}
                          </Typography>
                        )}
                        {mode.id === payment_plan.ONE_TIME && modePricing && planPricing && !planPricingBusy && (
                          <Typography className="checkout-payment-old-price">
                            {formatCurrency(modePricing.original_amount)} {t('plan.paymentModes.oneTime.suffix')}
                          </Typography>
                        )}
                        <Typography variant="body2" className="checkout-payment-description">
                          {t(mode.descriptionKey)}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                {selectedPaymentMode === payment_plan.RECURRING ? (
                  <Box className="checkout-step-card">
                    <Typography variant="subtitle1">{t('plan.checkoutStepper.cardFormTitle')}</Typography>
                    <Box className="checkout-form checkout-form--stripe">
                      <Box className="stripe-field">
                        <Typography variant="body2" className="stripe-field-label">
                          {t('stripe.cardNumber', { defaultValue: 'Số thẻ' })}
                        </Typography>
                        <Box className="stripe-field-input">
                          <CardNumberElement options={STRIPE_ELEMENT_OPTIONS} onChange={handleCardNumberChange} />
                        </Box>
                      </Box>

                      <Box className="stripe-field-row">
                        <Box className="stripe-field">
                          <Typography variant="body2" className="stripe-field-label">
                            {t('stripe.expiry', { defaultValue: 'Ngày hết hạn' })}
                          </Typography>
                          <Box className="stripe-field-input">
                            <CardExpiryElement options={STRIPE_ELEMENT_OPTIONS} onChange={handleCardExpiryChange} />
                          </Box>
                        </Box>
                        <Box className="stripe-field">
                          <Typography variant="body2" className="stripe-field-label">
                            {t('stripe.cvc', { defaultValue: 'CVC' })}
                          </Typography>
                          <Box className="stripe-field-input">
                            <CardCvcElement options={STRIPE_ELEMENT_OPTIONS} onChange={handleCardCvcChange} />
                          </Box>
                        </Box>
                      </Box>
                      {cardError && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                          {cardError}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Box className="checkout-step-momo">
                    <Typography variant="subtitle1">{t('plan.checkoutStepper.momoTitle')}</Typography>
                    <Typography variant="body2">{t('plan.checkoutStepper.momoDescription')}</Typography>
                    <Typography variant="body2" className="checkout-momo-account">
                      {t('plan.checkoutMomoAccount')}
                    </Typography>
                    {!selectedVehicle && (
                      <Typography variant="body2" color="error">
                        {t('plan.checkoutStepper.momoMissingVehicle')}
                      </Typography>
                    )}
                    <Typography variant="body2" className="checkout-step-help">
                      {t('plan.checkoutStepper.momoRedirect')}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>

        <Box className="checkout-step-actions">
          <Box sx={{ flex: '1 1 auto' }} />
          <Button variant="contained" onClick={handleBackStep} disabled={activeStep === 0}>
            {t('plan.back')}
          </Button>
          <Button variant="contained" onClick={handlePrimaryAction} disabled={primaryDisabled}>
            {primaryLabel}
          </Button>
          {processingError && (
            <Typography variant="body2" color="error" sx={{ marginTop: 1 }}>
              {processingError}
            </Typography>
          )}
        </Box>

        <Typography variant="body2" className="checkout-rules">
          {t('plan.checkoutRules')}
        </Typography>
      </Box>

        <Box className="checkout-summary-panel">
          <Typography variant="subtitle2">{t('plan.checkoutPlanNote')}</Typography>
          <Typography variant="h5">{planTitle}</Typography>
          {planSubtitle && (
            <Typography variant="body2" className="plan-detail">
              {planSubtitle}
            </Typography>
          )}

          <Box className="checkout-summary-price-group">
            <Typography variant="h4">{formatCurrency(plan.price_per_day)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('plan.perDay')}
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('plan.checkoutSummary.vehicleLabel')}
            </Typography>
            <Typography variant="body1">{selectedVehicleSummary}</Typography>
          </Box>
        </Box>
      </Box>
  );
}

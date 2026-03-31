import { Box, Button, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SubscriptionPlan } from '../api/clientApi';

type CheckoutState = {
  plan?: SubscriptionPlan;
};

type CheckoutDetails = {
  term: string;
  paymentMode: string;
  cardNumber?: string;
  cardHolder?: string;
  cardExpiry?: string;
  cardCvc?: string;
};

type PaymentMode = {
  id: string;
  titleKey: string;
  priceKey: string;
  descriptionKey: string;
  badgeKey?: string;
};

type TermCard = {
  id: string;
  term_name: string;
  start_date: string;
  end_date: string;
};

const recurringMonthly = 1200000;
const oneTimeSemester = 4900000;
const oneTimeDiscountRate = 0.08;
const oneTimeDiscounted = Math.round(oneTimeSemester * (1 - oneTimeDiscountRate));
const momoRedirectBase = 'https://momo.vn/checkout';
const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatCurrency = (value: number) => currencyFormatter.format(value);

const initialCardInfo = {
  number: '',
  expiry: '',
  cvc: '',
  holder: '',
};

const paymentModes: PaymentMode[] = [
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

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { plan } = (location.state as CheckoutState) ?? {};

  const [activeStep, setActiveStep] = useState(0);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('');
  const [cardInfo, setCardInfo] = useState(initialCardInfo);

  const checkoutSteps = useMemo(
    () => (t('plan.checkoutStepper.steps', { returnObjects: true }) as string[]),
    [t]
  );

  const termCards = useMemo(
    () => ((t('plan.checkoutStepper.termCards', { returnObjects: true }) as TermCard[]) ?? []),
    [t]
  );

  useEffect(() => {
    setActiveStep(0);
    setSelectedTerm('');
    setSelectedPaymentMode('');
    setCardInfo(initialCardInfo);
  }, [plan?.id]);

  const cardComplete = Object.values(cardInfo).every((value) => Boolean(value));

  const primaryDisabled =
    !plan ||
    (activeStep === 0
      ? !selectedTerm
      : activeStep === 1
      ? !selectedPaymentMode
      : selectedPaymentMode === 'recurring'
      ? !cardComplete
      : false);

  const primaryLabel =
    activeStep < checkoutSteps.length - 1
      ? t('plan.checkoutStepper.next')
      : selectedPaymentMode === 'recurring'
      ? t('plan.checkoutStepper.confirm')
      : t('plan.checkoutStepper.payMomo');

  const handleCardChange = (field: keyof typeof cardInfo, value: string) => {
    setCardInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrimaryAction = () => {
    if (!plan) {
      return;
    }

    if (activeStep < checkoutSteps.length - 1) {
      setActiveStep((prev) => Math.min(prev + 1, checkoutSteps.length - 1));
      return;
    }

    // const baseDetails: CheckoutDetails & { planId: string } = {
    //   planId: plan.id,
    //   term: selectedTerm,
    //   paymentMode: selectedPaymentMode,
    // };

    if (selectedPaymentMode === 'recurring') {
      // const details = {
      //   ...baseDetails,
      //   cardNumber: cardInfo.number,
      //   cardHolder: cardInfo.holder,
      //   cardExpiry: cardInfo.expiry,
      //   cardCvc: cardInfo.cvc,
      // };
      // alert(t('plan.checkoutConfirmed', { plan: plan.label }));
      navigate('/plan');
    } else {
      window.location.assign(`${momoRedirectBase}?amount=${oneTimeDiscounted}`);
    }
  };

  if (!plan) {
    return (
      <Box className="checkout-page-shell">
        <Box className="checkout-page-container">
          <Box className="checkout-empty-state">
            <Typography variant="h5">{t('plan.checkoutSubtitle')}</Typography>
            <Typography variant="body2" className="checkout-empty-description">
              {t('plan.notChosen')}
            </Typography>
            <Button variant="contained" onClick={() => navigate('/plan')}>
              {t('plan.registerPlanButton')}
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="checkout-page-shell">
      <Box className="checkout-page-container">
        <Box className="checkout-page-header">
          <Box>
            <Typography variant="h4">{t('plan.checkoutTitle')}</Typography>
            <Typography variant="body2">{t('plan.checkoutSubtitle')}</Typography>
          </Box>
          <Button variant="text" onClick={() => navigate('/plan')}>
            {t('plan.checkoutCancel')}
          </Button>
        </Box>

        <Box className="checkout-page-grid">
          <Box className="checkout-main-panel">
            <Box className="checkout-payment-panel">
              <Stepper activeStep={activeStep} className="checkout-stepper">
                {checkoutSteps.map((label, index) => (
                  <Step
                    key={label}
                    completed={
                      (index === 0 && Boolean(selectedTerm)) ||
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
                    {termCards.length === 0 ? (
                      <Typography variant="body2">{t('plan.checkoutStepper.termEmpty')}</Typography>
                    ) : (
                      <Box className="checkout-term-grid">
                        {termCards.map((card) => (
                          <Box
                            key={card.id}
                            className={`checkout-term-card ${
                              selectedTerm === card.id ? 'checkout-term-card--active' : ''
                            }`}
                            onClick={() => setSelectedTerm(card.id)}
                          >
                            <Typography className="checkout-term-title">{card.term_name}</Typography>
                            <Typography className="checkout-term-meta" variant="body2">
                              {t('plan.checkoutStepper.termRange', {
                                start: card.start_date,
                                end: card.end_date,
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
                      {paymentModes.map((mode) => (
                        <Box
                          key={mode.id}
                          className={`checkout-payment-card ${
                            selectedPaymentMode === mode.id ? 'checkout-payment-card--active' : ''
                          }`}
                          onClick={() => setSelectedPaymentMode(mode.id)}
                        >
                          <Box className="checkout-payment-header">
                            <Typography variant="subtitle1">{t(mode.titleKey)}</Typography>
                            {mode.badgeKey && (
                              <span className="checkout-payment-badge">{t(mode.badgeKey)}</span>
                            )}
                          </Box>
                          <Typography variant="h6" className="checkout-payment-price">
                            {mode.id === 'recurring'
                              ? `${formatCurrency(recurringMonthly)} ${t(
                                  'plan.paymentModes.recurring.suffix'
                                )}`
                              : `${formatCurrency(oneTimeDiscounted)} ${t(
                                  'plan.paymentModes.oneTime.suffix'
                                )}`}
                          </Typography>
                          {mode.id === 'one-time' && (
                            <Typography className="checkout-payment-old-price">
                              {t(mode.priceKey)}
                            </Typography>
                          )}
                          <Typography variant="body2" className="checkout-payment-description">
                            {t(mode.descriptionKey)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {activeStep === 2 && (
                  <Box>
                    {selectedPaymentMode === 'recurring' ? (
                      <Box className="checkout-step-card">
                        <Typography variant="subtitle1">{t('plan.checkoutStepper.cardFormTitle')}</Typography>
                        <Box className="checkout-form checkout-form--stripe">
                          <TextField
                            label={t('plan.checkoutFields.cardNumber')}
                            placeholder="1234 5678 9012 3456"
                            variant="outlined"
                            value={cardInfo.number}
                            onChange={(event) => handleCardChange('number', event.target.value)}
                          />
                          <TextField
                            label={t('plan.checkoutStepper.cardHolder')}
                            placeholder="NGUYỄN VĂN A"
                            variant="outlined"
                            value={cardInfo.holder}
                            onChange={(event) => handleCardChange('holder', event.target.value)}
                          />
                          <Box className="checkout-card-row">
                            <TextField
                              label={t('plan.checkoutStepper.cardExpiry')}
                              placeholder="MM/YY"
                              variant="outlined"
                              value={cardInfo.expiry}
                              onChange={(event) => handleCardChange('expiry', event.target.value)}
                            />
                            <TextField
                              label={t('plan.checkoutStepper.cardCvc')}
                              placeholder="CVC"
                              variant="outlined"
                              value={cardInfo.cvc}
                              onChange={(event) => handleCardChange('cvc', event.target.value)}
                            />
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box className="checkout-step-momo">
                        <Typography variant="subtitle1">{t('plan.checkoutStepper.momoTitle')}</Typography>
                        <Typography variant="body2">{t('plan.checkoutStepper.momoDescription')}</Typography>
                        <Typography variant="body2" className="checkout-momo-account">
                          {t('plan.checkoutMomoAccount')}
                        </Typography>
                        <Typography className="checkout-step-help" variant="body2">
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
              <Button
                variant="contained"
                onClick={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
                disabled={activeStep === 0}
              >
                {t('plan.back')}
              </Button>
              <Button variant="contained" disabled={primaryDisabled} onClick={handlePrimaryAction}>
                {primaryLabel}
              </Button>
            </Box>

            <Typography variant="body2" className="checkout-rules">
              {t('plan.checkoutRules')}
            </Typography>
          </Box>

          <Box className="checkout-summary-panel">
            <Typography variant="subtitle2">{t('plan.checkoutPlanNote')}</Typography>
            <Typography variant="h5">{plan.label}</Typography>
            <Typography variant="body2" className="plan-detail">
              {plan.description}
            </Typography>

            <Box className="checkout-summary-price-group">
              <Typography variant="h4">{plan.price}</Typography>
              <Typography variant="body2">{plan.duration}</Typography>
            </Box>

            <ul className="checkout-summary-features">
              {(plan.features ?? []).map((feature) => (
                <li key={`${plan.id}-${feature}`}>{feature}</li>
              ))}
            </ul>

            <Button className="checkout-summary-action" variant="outlined" onClick={() => navigate('/plan')}>
              {t('plan.back')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

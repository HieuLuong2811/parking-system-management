import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type {
  StripeCardCvcElementChangeEvent,
  StripeCardExpiryElementChangeEvent,
  StripeCardNumberElementChangeEvent,
} from '@stripe/stripe-js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import ChangePasswordDialog from '../components/profile/ChangePasswordDialog';
import { useAppAuth } from '../contexts/useAppAuth';
import { useUpdateUser } from '../api/users';
import { useUpdateSubscription, useUserSubscriptions } from '../api/user_subscriptions';
import { createSetupIntent, useAttachPaymentMethod } from '../api/stripe';
import { useConfirmMomoPayment } from '../api/momo';
import { useVehicles } from '../api/vehicles';
import { getPlanCardKey } from '../ultis/planCards';

const priceFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });
const formatCurrency = (value: number) => `${priceFormatter.format(value)} ₫`;
const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString('vi-VN') : '—');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#0f172a',
      fontFamily: '"Inter", sans-serif',
      '::placeholder': {
        color: '#0f172a66',
      },
    },
    invalid: {
      color: '#b71c1c',
    },
  },
};

const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => {
  if (value !== index) {
    return null;
  }
  return <Box sx={{ mt: 2 }}>{children}</Box>;
};

type ProfileFormValues = {
  full_name: string;
  email: string;
  phone_number: string | null;
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, status, patchUser } = useAppAuth();
  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useUserSubscriptions();
  const { data: vehicles = [] } = useVehicles();
  const updateSubscriptionMutation = useUpdateSubscription();
  const confirmMomoMutation = useConfirmMomoPayment();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [momoHandled, setMomoHandled] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [formValues, setFormValues] = useState<ProfileFormValues>({
    full_name: '',
    email: '',
    phone_number: null,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProfileFormValues, string>>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [stripeSuccess, setStripeSuccess] = useState<string | null>(null);
  const [editingSubscriptionId, setEditingSubscriptionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'info' | 'error' } | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const { mutateAsync: updateUser, isPending } = useUpdateUser();
  const attachPaymentMethodMutation = useAttachPaymentMethod();

  useEffect(() => {
    if (momoHandled) {
      return;
    }
    const orderId = searchParams.get('orderId');
    const resultCode = searchParams.get('resultCode');
    const signature = searchParams.get('signature');
    if (!orderId || !resultCode || !signature) {
      return;
    }

    const payload: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      payload[key] = value;
    });

    setMomoHandled(true);
    setStatusMessage(t('profile.momo.confirming'));

    confirmMomoMutation
      .mutateAsync(payload)
      .then(() => {
        setStatusMessage(t('profile.momo.success'));
        setTabIndex(1);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : t('common.error');
        setStatusMessage(message);
      })
      .finally(() => {
        navigate('/profile', { replace: true });
      });
  }, [confirmMomoMutation, momoHandled, navigate, searchParams, t]);

  useEffect(() => {
    if (user) {
      setFormValues({
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number ?? null,
      });
    }
  }, [user]);

  const stripeSubscription = useMemo(
    () =>
      subscriptions.find(
        (subscription) => subscription.payment_plan?.payment_type === 'MONTHLY' && subscription.status === 'ACTIVE'
      ),
    [subscriptions]
  );

  const plateVehicles = useMemo(() => vehicles.filter((v) => Boolean(v.license_plate?.trim())), [vehicles]);

  useEffect(() => {
    if (!editingSubscriptionId) {
      setStripeSuccess(null);
    }
  }, [editingSubscriptionId]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleFieldChange = (field: keyof ProfileFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    setStatusMessage(null);
  };

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    if (!formValues.full_name.trim()) {
      errors.full_name = t('validation.requiredField', { field: t('profile.fields.fullName') });
    }
    if (!formValues.email.trim()) {
      errors.email = t('validation.requiredField', { field: t('profile.fields.email') });
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!user || !validateForm()) {
      return;
    }
    try {
      await updateUser({
        userCode: user.user_code,
        payload: {
          full_name: formValues.full_name.trim(),
          email: formValues.email.trim(),
          phone_number: formValues.phone_number || undefined,
        },
      });
      setStatusMessage(t('profile.fields.saveSuccess'));
      patchUser({
        full_name: formValues.full_name.trim(),
        email: formValues.email.trim(),
        phone_number: formValues.phone_number ?? null,
      });
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : t('common.error'));
    }
  };

  const handleChangePasswordClose = (message?: string) => {
    setPasswordDialogOpen(false);
    if (message) {
      setPasswordSuccess(message);
    }
  };

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

  const handleStripeMethodChange = async () => {
    if (!stripe || !elements || !stripeSubscription) {
      setCardError(t('profile.subscriptions.stripeNotReady'));
      return;
    }
    setIsSubmittingCard(true);
    setCardError(null);
    try {
      const { client_secret } = await createSetupIntent();
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        throw new Error(t('profile.subscriptions.stripeCardMissing'));
      }
      const result = await stripe.confirmCardSetup(client_secret, {
        payment_method: {
          card: cardNumberElement,
        },
      });
      if (result.error) {
        throw result.error;
      }
      const paymentMethodId = result.setupIntent?.payment_method;
      if (!paymentMethodId || typeof paymentMethodId !== 'string') {
        throw new Error(t('profile.subscriptions.stripeCardNotReady'));
      }
      await attachPaymentMethodMutation.mutateAsync({ payment_method_id: paymentMethodId });
      setEditingSubscriptionId(null);
      setCardComplete(false);
      setStripeFieldComplete({ number: false, expiry: false, cvc: false });
      setStripeFieldErrors({ number: null, expiry: null, cvc: null });
      setStripeSuccess(t('profile.subscriptions.stripeSuccess'));
    } catch (error) {
      setCardError(error instanceof Error ? error.message : t('profile.passwordDialog.genericError'));
    } finally {
      setIsSubmittingCard(false);
    }
  };

  if (status === 'loading') {
    return (
      <Box className="profile-page-shell">
        <Typography>{t('profile.loading')}</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box className="profile-page-shell">
        <Typography color="error">{t('profile.sectionTitle')}</Typography>
      </Box>
    );
  }

  return (
  <Box className="profile-page-shell">
        <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label={t('profile.tabs.profile')} />
        <Tab label={t('profile.tabs.subscriptions')} />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        <Box className="profile-card">
          <Typography variant="overline" className="section-label">
            {t('profile.sectionTitle')}
          </Typography>
          <Box className="profile-form-grid" mt={1}>
            <Box className="profile-field-row">
              <Stack spacing={0.4} sx={{ flex: 1, minWidth: 260 }}>
                <Typography className="profile-field-label">{t('profile.fields.userCode')}</Typography>
                <TextField
                  value={user.user_code}
                  disabled
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              </Stack>
              <Stack spacing={0.4} sx={{ flex: 1, minWidth: 260 }}>
                <Typography className="profile-field-label required">
                  {t('profile.fields.fullName')} *
                </Typography>
                <TextField
                  value={formValues.full_name}
                  onChange={(event) => handleFieldChange('full_name', event.target.value)}
                  error={Boolean(formErrors.full_name)}
                  helperText={formErrors.full_name}
                  fullWidth
                  variant="outlined"
                />
              </Stack>
            </Box>
            <Box className="profile-field-row">
              <Stack spacing={0.4} sx={{ flex: 1, minWidth: 260 }}>
                <Typography className="profile-field-label required">
                  {t('profile.fields.email')} *
                </Typography>
                <TextField
                  value={formValues.email}
                  onChange={(event) => handleFieldChange('email', event.target.value)}
                  error={Boolean(formErrors.email)}
                  helperText={formErrors.email}
                  fullWidth
                  variant="outlined"
                />
              </Stack>
              <Stack spacing={0.4} sx={{ flex: 1, minWidth: 260 }}>
                <Typography className="profile-field-label">{t('profile.fields.phone')}</Typography>
                <TextField
                  value={formValues.phone_number ?? ''}
                  onChange={(event) => handleFieldChange('phone_number', event.target.value)}
                  fullWidth
                  variant="outlined"
                />
              </Stack>
            </Box>
          </Box>
          <Stack direction="row" spacing={2} mt={3} alignItems="center">
            <Button variant="contained" onClick={handleSaveChanges} disabled={isPending}>
              {t('profile.saveChanges')}
            </Button>
            <Button variant="text" onClick={() => setPasswordDialogOpen(true)}>
              {t('profile.passwordDialog.button')}
            </Button>
          </Stack>
          {statusMessage && (
            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'right' }} open autoHideDuration={3000} onClose={() => setStatusMessage(null)}>
              <Alert severity={statusMessage === t('profile.fields.saveSuccess') ? 'success' : 'error'} onClose={() => setStatusMessage(null)}>
                {statusMessage}
              </Alert>
            </Snackbar>
          )}
          {passwordSuccess && (
            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'right' }} open autoHideDuration={3000} onClose={() => setPasswordSuccess(null)}>
              <Alert severity="success" onClose={() => setPasswordSuccess(null)}>
                {passwordSuccess}
              </Alert>
            </Snackbar>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        <Box className="profile-card">
          <Typography variant="overline" className="section-label">
            {t('profile.subscriptions.heading')}
          </Typography>
          {subscriptionsLoading ? (
            <Typography>{t('common.loading')}</Typography>
          ) : subscriptions.length === 0 ? (
            <Typography>{t('profile.subscriptions.empty')}</Typography>
          ) : (
            subscriptions.map((subscription) => {
              const isStripePlan = subscription.payment_plan?.payment_type === 'MONTHLY';
              const showStripeButton =
                isStripePlan && subscription.status === 'ACTIVE' && editingSubscriptionId !== subscription.id;
              const showStripeForm = editingSubscriptionId === subscription.id;
              const subscriptionPlanKey = subscription.subscription_plan?.plans_type
                ? getPlanCardKey(subscription.subscription_plan.plans_type)
                : null;
              const subscriptionPlanTitle =
                subscriptionPlanKey !== null
                  ? t(`plan.cards.${subscriptionPlanKey}.title`, {
                      defaultValue: subscription.subscription_plan?.plans_type ?? t('profile.subscriptions.unnamedPlan'),
                    })
                  : subscription.subscription_plan?.plans_type ?? t('profile.subscriptions.unnamedPlan');
              const canChangeVehicle = subscription.status === 'ACTIVE' && subscriptionPlanKey === 'withPlate';
              return (
                <Box key={subscription.id} className="profile-subscription-card">
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1">
                        {subscriptionPlanTitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {subscription.payment_plan?.payment_type ?? t('profile.subscriptions.noPaymentPlan')}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={t(`profile.subscriptions.status.${subscription.status.toLowerCase()}`, {
                        defaultValue: subscription.status,
                      })}
                    />
                  </Stack>
                  <Box className="profile-subscription-grid" mt={2}>
                    <Box>
                      <Typography className="profile-subscription-label">
                        {t('profile.subscriptions.vehicle')}
                      </Typography>
                      {canChangeVehicle ? (
                        <TextField
                          select
                          size="small"
                          value={subscription.vehicle?.id ?? ''}
                          onChange={(event) => {
                            const nextVehicleId = String(event.target.value || '').trim();
                            if (!nextVehicleId || nextVehicleId === subscription.vehicle?.id) {
                              return;
                            }
                            updateSubscriptionMutation
                              .mutateAsync({ subscriptionId: subscription.id, payload: { vehicle_id: nextVehicleId } })
                              .then(() => {
                                setToast({ message: t('profile.subscriptions.vehicleUpdated'), severity: 'success' });
                              })
                              .catch((error) => {
                                const message = error instanceof Error ? error.message : t('common.error');
                                setToast({ message, severity: 'error' });
                              });
                          }}
                          disabled={updateSubscriptionMutation.isPending || plateVehicles.length === 0}
                        >
                          {plateVehicles.map((vehicle) => (
                            <MenuItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.license_plate}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <Typography>{subscription.vehicle?.license_plate ?? '—'}</Typography>
                      )}
                    </Box>
                    <Box>
                      <Typography className="profile-subscription-label">
                        {t('profile.subscriptions.term')}
                      </Typography>
                      <Typography>{subscription.term?.term_name ?? '—'}</Typography>
                    </Box>
                    <Box>
                      <Typography className="profile-subscription-label">
                        {t('profile.subscriptions.paymentPlan')}
                      </Typography>
                      <Typography>{subscription.payment_plan?.payment_type ?? '—'}</Typography>
                    </Box>
                    <Box>
                      <Typography className="profile-subscription-label">
                        {t('profile.subscriptions.amount')}
                      </Typography>
                      <Typography>{formatCurrency(subscription.total_amount)}</Typography>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={2} mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      {t('profile.subscriptions.period')} {formatDate(subscription.start_date)} –{' '}
                      {formatDate(subscription.end_date)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('profile.subscriptions.paidAmount')} {formatCurrency(subscription.paid_amount)}
                    </Typography>
                  </Stack>
                  {showStripeButton && (
                    <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setEditingSubscriptionId(subscription.id)}>
                      {t('profile.subscriptions.changePaymentMethod')}
                    </Button>
                  )}
                  {showStripeForm && (
                    <Box sx={{ mt: 2, p: 2, borderRadius: 2, border: '1px solid rgba(15,23,52,0.08)' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('profile.subscriptions.stripeHeader')}
                      </Typography>
                      <Box className="stripe-field">
                        <Typography variant="body2" className="stripe-field-label">
                          {t('stripe.cardNumber', { defaultValue: 'Số thẻ' })}
                        </Typography>
                        <Box className="stripe-field-input">
                          <CardNumberElement options={CARD_ELEMENT_OPTIONS} onChange={handleCardNumberChange} />
                        </Box>
                      </Box>

                      <Box className="stripe-field-row">
                        <Box className="stripe-field">
                          <Typography variant="body2" className="stripe-field-label">
                            {t('stripe.expiry', { defaultValue: 'Ngày hết hạn' })}
                          </Typography>
                          <Box className="stripe-field-input">
                            <CardExpiryElement options={CARD_ELEMENT_OPTIONS} onChange={handleCardExpiryChange} />
                          </Box>
                        </Box>
                        <Box className="stripe-field">
                          <Typography variant="body2" className="stripe-field-label">
                            {t('stripe.cvc', { defaultValue: 'CVC' })}
                          </Typography>
                          <Box className="stripe-field-input">
                            <CardCvcElement options={CARD_ELEMENT_OPTIONS} onChange={handleCardCvcChange} />
                          </Box>
                        </Box>
                      </Box>
                      {cardError && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                          {cardError}
                        </Typography>
                      )}
                      {stripeSuccess && (
                        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                          {stripeSuccess}
                        </Typography>
                      )}
                      <Stack direction="row" spacing={1} mt={2}>
                        <Button
                          variant="contained"
                          disabled={!cardComplete || isSubmittingCard}
                          onClick={handleStripeMethodChange}
                        >
                          {t('profile.subscriptions.savePaymentMethod')}
                        </Button>
                        <Button variant="outlined" onClick={() => setEditingSubscriptionId(null)}>
                          {t('profile.subscriptions.cancelChange')}
                        </Button>
                      </Stack>
                    </Box>
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </TabPanel>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
      >
        <Alert severity={toast?.severity ?? 'info'} onClose={() => setToast(null)} sx={{ width: '100%' }}>
          {toast?.message ?? ''}
        </Alert>
      </Snackbar>

      <ChangePasswordDialog open={passwordDialogOpen} onClose={handleChangePasswordClose} />
    </Box>
  );
}

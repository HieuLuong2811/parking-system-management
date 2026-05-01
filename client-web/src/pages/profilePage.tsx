import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type {
  StripeCardCvcElementChangeEvent,
  StripeCardExpiryElementChangeEvent,
  StripeCardNumberElementChangeEvent,
} from '@stripe/stripe-js';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import CreditCardIcon from '@mui/icons-material/CreditCard';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { FormInput } from '../components/common/FormInput';
import ChangePasswordDialog from '../components/profile/ChangePasswordDialog';
import { useAppAuth } from '../contexts/useAppAuth';
import { useUpdateUser } from '../api/users';
import { useUserSubscriptionsPaginated } from '../api/user_subscriptions';
import { createSetupIntent, useAttachPaymentMethod } from '../api/stripe';
import { useConfirmMomoPayment } from '../api/momo';
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
  const [subscriptionPage, setSubscriptionPage] = useState(0);
  const [subscriptionRowsPerPage, setSubscriptionRowsPerPage] = useState(10);
  const { data: subscriptionsPaginated, isLoading: subscriptionsLoading } = useUserSubscriptionsPaginated({
    page: subscriptionPage + 1,
    limit: subscriptionRowsPerPage,
  });
  const subscriptions = useMemo(() => subscriptionsPaginated?.data ?? [], [subscriptionsPaginated]);
  const subscriptionsTotal = subscriptionsPaginated?.total ?? 0;
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
  const [stripeDialogOpen, setStripeDialogOpen] = useState(false);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    if (newValue === 1) {
      setSubscriptionPage(0);
      setExpandedSubscriptionId(null);
    }
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
    if (!stripe || !elements) {
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
      setStripeDialogOpen(false);
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
                <FormInput
                  id="profile-user-code"
                  label={t('profile.fields.userCode')}
                  value={user.user_code}
                  onChange={() => {}}
                  readOnly
                  inputClassName="plain-input"
                  labelClassName="profile-field-label"
                />
              </Stack>
              <Stack spacing={0.4} sx={{ flex: 1, minWidth: 260 }}>
                <FormInput
                  id="profile-full-name"
                  label={t('profile.fields.fullName')}
                  required
                  requiredMarkerClassName="required-marker"
                  value={formValues.full_name}
                  onChange={(value) => handleFieldChange('full_name', value)}
                  error={formErrors.full_name}
                  inputClassName="plain-input"
                  labelClassName="profile-field-label required"
                  requiredFirst={t('profile.fields.fullName')}
                />
              </Stack>
            </Box>
            <Box className="profile-field-row">
              <Stack spacing={0.4} sx={{ flex: 1, minWidth: 260 }}>
                <FormInput
                  id="profile-email"
                  label={t('profile.fields.email')}
                  required
                  requiredMarkerClassName="required-marker"
                  value={formValues.email}
                  onChange={(value) => handleFieldChange('email', value)}
                  error={formErrors.email}
                  inputClassName="plain-input"
                  labelClassName="profile-field-label required"
                  requiredFirst={t('profile.fields.email')}
                />
              </Stack>
              <Stack spacing={0.4} sx={{ flex: 1, minWidth: 260 }}>
                <FormInput
                  id="profile-phone"
                  label={t('profile.fields.phone')}
                  value={formValues.phone_number ?? ''}
                  onChange={(value) => handleFieldChange('phone_number', value)}
                  inputClassName="plain-input"
                  labelClassName="profile-field-label"
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
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Typography variant="overline" className="section-label">
              {t('profile.subscriptions.heading')}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CreditCardIcon />}
              onClick={() => {
                setCardError(null);
                setStripeSuccess(null);
                setStripeDialogOpen(true);
              }}
            >
              {t('profile.subscriptions.changePaymentMethod')}
            </Button>
          </Stack>

          {subscriptionsLoading ? (
            <Typography sx={{ mt: 2 }}>{t('common.loading')}</Typography>
          ) : (
            <Paper elevation={0} sx={{ mt: 2, boxShadow: 'none' }}>
              <TableContainer component={Box}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 48 }} />
                      <TableCell>{t('profile.subscriptions.plan', { defaultValue: 'Plan' })}</TableCell>
                      <TableCell>{t('profile.subscriptions.vehicle')}</TableCell>
                      <TableCell>{t('profile.subscriptions.term')}</TableCell>
                      <TableCell>{t('profile.subscriptions.paymentPlan')}</TableCell>
                      <TableCell align="right">{t('profile.subscriptions.amount')}</TableCell>
                      <TableCell align="right">{t('profile.subscriptions.status.label', { defaultValue: 'Status' })}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">{t('profile.subscriptions.empty')}</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscriptions.map((subscription) => {
                        const subscriptionPlanKey = subscription.subscription_plan?.plans_type
                          ? getPlanCardKey(subscription.subscription_plan.plans_type)
                          : null;
                        const subscriptionPlanTitle =
                          subscriptionPlanKey !== null
                            ? t(`plan.cards.${subscriptionPlanKey}.title`, {
                                defaultValue:
                                  subscription.subscription_plan?.plans_type ?? t('profile.subscriptions.unnamedPlan'),
                              })
                            : subscription.subscription_plan?.plans_type ?? t('profile.subscriptions.unnamedPlan');
                        const isExpanded = expandedSubscriptionId === subscription.id;
                        return (
                          <Fragment key={subscription.id}>
                            <TableRow
                              hover
                              sx={{ cursor: 'pointer' }}
                              onClick={() => setExpandedSubscriptionId((prev) => (prev === subscription.id ? null : subscription.id))}
                            >
                              <TableCell>
                                <IconButton size="small" aria-label="expand row">
                                  {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                </IconButton>
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{subscriptionPlanTitle}</TableCell>
                              <TableCell>{subscription.vehicle?.license_plate ?? '—'}</TableCell>
                              <TableCell>{subscription.term?.term_name ?? '—'}</TableCell>
                              <TableCell>{subscription.payment_plan?.payment_type ?? '—'}</TableCell>
                              <TableCell align="right">{formatCurrency(subscription.total_amount)}</TableCell>
                              <TableCell align="right">
                                <Chip
                                  size="small"
                                  label={t(`profile.subscriptions.status.${subscription.status.toLowerCase()}`, {
                                    defaultValue: subscription.status,
                                  })}
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={7} sx={{ py: 0, borderBottom: 0 }}>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                  <Box sx={{ py: 2, px: 1 }}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                                      <Typography variant="body2" color="text.secondary">
                                        {t('profile.subscriptions.period')} {formatDate(subscription.start_date)} –{' '}
                                        {formatDate(subscription.end_date)}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {t('profile.subscriptions.paidAmount')} {formatCurrency(subscription.paid_amount)}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {t('profile.subscriptions.createdAt', { defaultValue: 'Created' })}:{' '}
                                        {formatDate(String(subscription.created_at))}
                                      </Typography>
                                    </Stack>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </Fragment>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={subscriptionsTotal}
                page={subscriptionPage}
                onPageChange={(_event, newPage) => {
                  setExpandedSubscriptionId(null);
                  setSubscriptionPage(newPage);
                }}
                rowsPerPage={subscriptionRowsPerPage}
                onRowsPerPageChange={(event) => {
                  setSubscriptionRowsPerPage(parseInt(event.target.value, 10));
                  setExpandedSubscriptionId(null);
                  setSubscriptionPage(0);
                }}
                rowsPerPageOptions={[5, 10, 20, 50, 100]}
              />
            </Paper>
          )}

          <Dialog
            open={stripeDialogOpen}
            onClose={() => {
              if (isSubmittingCard) return;
              setStripeDialogOpen(false);
            }}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>{t('profile.subscriptions.changePaymentMethod')}</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                onClick={() => {
                  if (isSubmittingCard) return;
                  setStripeDialogOpen(false);
                }}
              >
                {t('profile.subscriptions.cancelChange')}
              </Button>
              <Button variant="contained" disabled={!cardComplete || isSubmittingCard} onClick={handleStripeMethodChange}>
                {t('profile.subscriptions.savePaymentMethod')}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </TabPanel>

      <ChangePasswordDialog open={passwordDialogOpen} onClose={handleChangePasswordClose} />
    </Box>
  );
}

import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import ScreenShell from '../component/ScreenShell';
import type { AppStackParamList } from '../navigation/AppStack';
import { useAcademicTerms } from '../api/academic_terms';
import { usePaymentPlanPricing } from '../api/payment_plan_pricing';
import { useAuth } from '../auth/AuthContext';
import { useCheckoutMomo, useCheckoutRecurring, useCheckoutWalletFull } from '../api/checkout';
import { useMyWallet } from '../api/wallets';
import { getPlanMeta, getPlanNameKey } from '../ultis/status';
import { formatCurrency, formatNumber } from '../ultis/format';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type ScreenRoute = RouteProp<AppStackParamList, 'PlanCheckout'>;

type PaymentMode = 'FULL' | 'MONTHLY';
type PayMethod = 'WALLET' | 'MOMO';

export default function PlanCheckoutScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ScreenRoute>();
  const { t } = useTranslation();

  const selectedPlan = route.params?.plan ?? null;
  const { user } = useAuth();

  const { data: academicTerms = [], isLoading: termsLoading } = useAcademicTerms();
  const { mutateAsync: checkoutMomo } = useCheckoutMomo();
  const { mutateAsync: checkoutRecurring } = useCheckoutRecurring();
  const { mutateAsync: checkoutWalletFull } = useCheckoutWalletFull();
  const { data: wallet } = useMyWallet();

  const [activeStep, setActiveStep] = useState(0);
  
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentMode | null>(null);
  const [selectedPayMethod, setSelectedPayMethod] = useState<PayMethod>('MOMO');
  const [processing, setProcessing] = useState(false);

  const selectedTerm = useMemo(
    () => academicTerms.find((term) => term.id === selectedTermId) ?? null,
    [academicTerms, selectedTermId]
  );

  const { data: planPricing, isLoading: pricingLoading } = usePaymentPlanPricing(
    selectedPlan?.id,
    selectedTermId ?? undefined,
    Boolean(selectedPlan?.id && selectedTermId)
  );
  
  const paymentPlanDetails = planPricing?.payment_plan_details ?? [];
  
  const fullModePricing = useMemo(() => {
    return (
      paymentPlanDetails.find(
        (item: any) => item.payment_type === 'FULL' && item.is_active
      ) ?? null
    );
  }, [paymentPlanDetails]);
  
  const monthlyModePricing = useMemo(() => {
    return (
      paymentPlanDetails.find(
        (item: any) => item.payment_type === 'MONTHLY' && item.is_active
      ) ?? null
    );
  }, [paymentPlanDetails]);

  const allowMonthlyPayment = Boolean((selectedPlan as any)?.allow_monthly_payment);
  const allowFullPayment = Boolean((selectedPlan as any)?.allow_full_payment);
  const planIcon = getPlanMeta(selectedPlan?.plans_type ?? '')?.icon;  

  const availablePaymentModes = useMemo<PaymentMode[]>(() => {
    const modes: PaymentMode[] = [];

    if (allowMonthlyPayment) {
      modes.push('MONTHLY');
    }

    if (allowFullPayment) {
      modes.push('FULL');
    }

    return modes;
  }, [allowMonthlyPayment, allowFullPayment]);

  const selectedPricing = useMemo(() => {
    if (selectedPaymentMode === 'MONTHLY') return monthlyModePricing;
    if (selectedPaymentMode === 'FULL') return fullModePricing;
    return null;
  }, [selectedPaymentMode, monthlyModePricing, fullModePricing]);

  const planNameKey = getPlanNameKey(selectedPlan?.plans_type);
  const planName = planNameKey ? t(planNameKey) : selectedPlan?.plans_type ?? '';

  const steps = [
    t('checkout.stepTerm'),
    t('checkout.stepPaymentMethod'),
    t('checkout.stepConfirm'),
  ];

  const canGoNext = useMemo(() => {
    if (!selectedPlan) return false;

    if (activeStep === 0) {
      return Boolean(selectedTermId);
    }

    if (activeStep === 1) {
      return Boolean(selectedPaymentMode && availablePaymentModes.includes(selectedPaymentMode));
    }

    if (activeStep === 2) {
      if (!selectedPricing?.amount || !selectedPricing?.payment_plan_id) return false;
      if (selectedPaymentMode === 'MONTHLY') {
        return true;
      }
      return Boolean(selectedPayMethod);
    }

    return false;
  }, [
    selectedPlan,
    activeStep,
    selectedTermId,
    selectedPaymentMode,
    selectedPricing,
  ]);

  const primaryLabel =
    activeStep < 2
      ? t('common.next')
      : selectedPaymentMode === 'MONTHLY'
        ? t('checkout.setupRecurring')
        : t('checkout.pay');

  const handleBack = () => {
    if (processing) return;

    if (activeStep === 0) {
      navigation.goBack();
      return;
    }

    setActiveStep((current) => Math.max(0, current - 1));
  };

  const handleNext = async () => {
    if (!canGoNext) return;

    if (activeStep < 2) {
      setActiveStep((current) => Math.min(3, current + 1));
      return;
    }

    if (selectedPaymentMode === 'MONTHLY') {
      await handleRecurringCheckout();
      return;
    }

    if (selectedPayMethod === 'WALLET') {
      await handleWalletFullCheckout();
      return;
    }

    await handleMomoCheckout();
  };

  const handleWalletFullCheckout = async () => {
    if (
      !user ||
      !selectedPlan ||
      !selectedTerm ||
      !selectedPaymentMode ||
      !selectedPricing?.amount ||
      !selectedPricing.payment_plan_id
    ) {
      Alert.alert(t('common.error'), t('checkout.missingData'));
      return;
    }

    setProcessing(true);

    try {
      const amount = Number(selectedPricing.amount);
      const walletBalance = Number((wallet as any)?.balance ?? 0);

      if (walletBalance < amount) {
        Alert.alert(t('common.error'), t('checkout.insufficientWallet'));
        return;
      }

      await checkoutWalletFull({
        sub_plan_id: selectedPlan.id,
        term_id: selectedTerm.id,
        payment_plan_id: selectedPricing.payment_plan_id,
        start_date: selectedTerm.start_date,
        end_date: selectedTerm.end_date,
        amount,
      });

      Alert.alert(t('common.success'), t('checkout.walletPaymentSuccess'));
      navigation.popToTop();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('checkout.paymentFailed');
      Alert.alert(t('common.error'), message);
    } finally {
      setProcessing(false);
    }
  };

  const handleMomoCheckout = async () => {
    if (
      !user ||
      !selectedPlan ||
      !selectedTerm ||
      !selectedPaymentMode ||
      !selectedPricing?.amount ||
      !selectedPricing.payment_plan_id
    ) {
      Alert.alert(t('common.error'), t('checkout.missingData'));
      return;
    }

    setProcessing(true);

    try {
      const amount = Number(selectedPricing.amount);

      const redirectUrl = Linking.createURL('payment-return', {
        queryParams: {
          // Server creates invoice internally; keep this key for backward compatibility.
          invoice_id: 'pending',
        },
      });

      const momoResponse = await checkoutMomo({
        sub_plan_id: selectedPlan.id,
        term_id: selectedTerm.id,
        payment_plan_id: selectedPricing.payment_plan_id,
        start_date: selectedTerm.start_date,
        end_date: selectedTerm.end_date,
        amount,
        redirect_url: redirectUrl,
        lang: user.language_use || 'vi',
      });

      const checkoutUrl =
        momoResponse.payUrl ??
        momoResponse.deeplink ??
        (momoResponse as any).shortLink ??
        (momoResponse as any).qrCodeUrl ??
        (momoResponse as any).redirectUrl ??
        null;

      if (!checkoutUrl) {
        throw new Error(t('checkout.noPaymentUrl'));
      }

      const canOpen = await Linking.canOpenURL(checkoutUrl);

      if (!canOpen) {
        throw new Error(t('checkout.cannotOpenPaymentUrl'));
      }

      await Linking.openURL(checkoutUrl);

      Alert.alert(
        t('checkout.redirectingMomoTitle'),
        Platform.OS === 'android'
          ? t('checkout.redirectingMomoAndroid')
          : t('checkout.redirectingMomoIos')
      );

      navigation.navigate('PaymentReturn', {
        result: 'pending',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('checkout.paymentFailed');

      Alert.alert(t('common.error'), message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRecurringCheckout = async () => {
    if (
      !user ||
      !selectedPlan ||
      !selectedTerm ||
      !selectedPaymentMode ||
      !selectedPricing?.amount ||
      !selectedPricing.payment_plan_id
    ) {
      Alert.alert(t('common.error'), t('checkout.missingData'));
      return;
    }

    setProcessing(true);

    try {
      const amount = Number(selectedPricing.amount);

      await checkoutRecurring({
        sub_plan_id: selectedPlan.id,
        term_id: selectedTerm.id,
        payment_plan_id: selectedPricing.payment_plan_id,
        start_date: selectedTerm.start_date,
        end_date: selectedTerm.end_date,
        amount,
      });

      Alert.alert(t('common.success'), t('checkout.recurringSetupSuccess'));
      navigation.popToTop();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('checkout.paymentFailed');
      Alert.alert(t('common.error'), message);
    } finally {
      setProcessing(false);
    }
  };

  if (!selectedPlan) {
    return (
      <ScreenShell>
        <View style={styles.stateBox}>
          <Ionicons name="alert-circle-outline" size={36} color="#ef4444" />
          <Text style={styles.stateTitle}>{t('checkout.noSelectedPlan')}</Text>

          <TouchableOpacity
            style={styles.primaryBtnSingle}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View style={styles.headerCard}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backIconBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={22} color="#0f172a" />
        </TouchableOpacity>

        <View style={styles.headerTextBox}>
          <Text style={styles.pageTitle}>{t('checkout.title')}</Text>
          <Text style={styles.pageSubtitle}>
            {t('checkout.subtitle', {
              plan: planName,
            })}
          </Text>
        </View>
      </View>

      <View style={styles.planMiniCard}>
        <View style={styles.planIconBox}>
          <MaterialCommunityIcons
            name={planIcon}
            size={24}
            color="#0f172a"
          />
        </View>

        <View style={styles.planMiniContent}>
          <Text style={styles.planMiniName}>{planName}</Text>
          <Text style={styles.planMiniPrice}>
            {formatNumber(selectedPlan.price_per_day)} đ {t('plans.perDay')}
          </Text>
        </View>
      </View>

      <View style={styles.stepRow}>
        {steps.map((label, index) => {
          const active = index === activeStep;
          const done = index < activeStep;

          return (
            <View
              key={label}
              style={[
                styles.stepPill,
                active && styles.stepPillActive,
                done && styles.stepPillDone,
              ]}
            >
              {done ? (
                <Ionicons name="checkmark" size={14} color="#ffffff" />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    active && styles.stepNumberActive,
                  ]}
                >
                  {index + 1}
                </Text>
              )}

              <Text
                numberOfLines={1}
                style={[
                  styles.stepText,
                  active && styles.stepTextActive,
                  done && styles.stepTextDone,
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {activeStep === 0 && (
          <Section title={t('checkout.selectTerm')}>
            {termsLoading ? (
              <ActivityIndicator color="#2563eb" />
            ) : academicTerms.length === 0 ? (
              <EmptyText text={t('checkout.noTerm')} />
            ) : (
              <View style={styles.optionGrid}>
                {academicTerms.map((term) => {
                  const selected = term.id === selectedTermId;

                  return (
                    <OptionCard
                      key={term.id}
                      title={term.term_name}
                      subtitle={`${term.start_date} - ${term.end_date}`}
                      selected={selected}
                      onPress={() => {
                        setSelectedTermId(term.id);
                        setSelectedPaymentMode(null);
                      }}
                    />
                  );
                })}
              </View>
            )}
          </Section>
        )}

        {activeStep === 1 && (
          <Section title={t('checkout.selectPaymentMethod')}>
            {!selectedTermId ? (
              <EmptyText text={t('checkout.selectTermFirst')} />
            ) : pricingLoading ? (
              <ActivityIndicator color="#2563eb" />
            ) : !planPricing ? (
              <EmptyText text={t('checkout.pricingLoadError')} />
            ) : availablePaymentModes.length === 0 ? (
              <EmptyText text={t('checkout.noAvailablePaymentMethod')} />
            ) : (
              <View style={styles.paymentList}>
                {availablePaymentModes.includes('MONTHLY') && (
                  (() => {
                    const amount = Number(monthlyModePricing?.amount ?? 0);
                    const walletBalance = Number((wallet as any)?.balance ?? 0);
                    const insufficient = Boolean(amount > 0 && walletBalance < amount);
                    return (
                  <PaymentMethodCard
                    title={t('checkout.monthlyPayment')}
                    subtitle={t('checkout.monthlyPaymentDesc')}
                    amount={monthlyModePricing?.amount ?? null}
                    badge={t('checkout.recommended')}
                    selected={selectedPaymentMode === 'MONTHLY'}
                    disabled={!monthlyModePricing?.amount || insufficient}
                    onPress={() => {
                      setSelectedPaymentMode('MONTHLY');
                      setSelectedPayMethod('WALLET');
                    }}
                  />
                    );
                  })()
                )}

                {availablePaymentModes.includes('FULL') && (
                  <PaymentMethodCard
                    title={t('checkout.fullPayment')}
                    subtitle={t('checkout.fullPaymentDesc')}
                    amount={fullModePricing?.amount ?? null}
                    selected={selectedPaymentMode === 'FULL'}
                    disabled={!fullModePricing?.amount}
                    onPress={() => {
                      setSelectedPaymentMode('FULL');
                      setSelectedPayMethod('MOMO');
                    }}
                  />
                )}
              </View>
            )}
          </Section>
        )}
        {activeStep === 2 && (
          <>
            <Section title={t('checkout.summary')}>
              <SummaryRow label={t('checkout.plan')} value={planName} />

              <SummaryRow
                label={t('checkout.term')}
                value={selectedTerm?.term_name ?? '-'}
              />

              <SummaryRow
                label={t('checkout.paymentMethod')}
                value={
                  selectedPaymentMode === 'MONTHLY'
                    ? t('checkout.monthlyPayment')
                    : t('checkout.fullPayment')
                }
              />

              <SummaryRow
                label={t('checkout.amount')}
                value={
                  selectedPricing?.amount
                    ? formatCurrency(selectedPricing.amount)
                    : '-'
                }
                strong
              />
            </Section>

            <Section title={t('checkout.paymentNoteTitle')}>
              {selectedPaymentMode === 'FULL' ? (
                <View style={styles.payMethodBox}>
                  <Text style={styles.payMethodTitle}>{t('checkout.choosePayMethod')}</Text>

                  <TouchableOpacity
                    style={[
                      styles.payMethodCard,
                      selectedPayMethod === 'WALLET' && styles.payMethodCardSelected,
                      Number((wallet as any)?.balance ?? 0) < Number(selectedPricing?.amount ?? 0) &&
                        styles.payMethodCardDisabled,
                    ]}
                    activeOpacity={0.85}
                    disabled={Number((wallet as any)?.balance ?? 0) < Number(selectedPricing?.amount ?? 0)}
                    onPress={() => setSelectedPayMethod('WALLET')}
                  >
                    <View style={styles.payMethodRow}>
                      <Ionicons name="wallet-outline" size={18} color="#0f172a" />
                      <Text style={styles.payMethodLabel}>{t('checkout.payWithWallet')}</Text>
                    </View>
                    <Text style={styles.payMethodHint}>
                      {t('checkout.walletBalance', {
                        balance: formatCurrency(Number((wallet as any)?.balance ?? 0)),
                      })}
                    </Text>
                    {Number((wallet as any)?.balance ?? 0) < Number(selectedPricing?.amount ?? 0) ? (
                      <Text style={styles.payMethodWarn}>{t('checkout.insufficientWallet')}</Text>
                    ) : null}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.payMethodCard,
                      selectedPayMethod === 'MOMO' && styles.payMethodCardSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setSelectedPayMethod('MOMO')}
                  >
                    <View style={styles.payMethodRow}>
                      <Ionicons name="card-outline" size={18} color="#0f172a" />
                      <Text style={styles.payMethodLabel}>{t('checkout.payWithMomo')}</Text>
                    </View>
                    <Text style={styles.payMethodHint}>{t('checkout.momoNote')}</Text>
                  </TouchableOpacity>

                  <Text style={styles.noteText}>{t('checkout.fullPaymentNote')}</Text>
                </View>
              ) : (
                <Text style={styles.noteText}>{t('checkout.monthlyWalletRequired')}</Text>
              )}
            </Section>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          disabled={processing}
          onPress={handleBack}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>{t('common.back')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            (!canGoNext || processing) && styles.primaryBtnDisabled,
          ]}
          disabled={!canGoNext || processing}
          onPress={() => void handleNext()}
          activeOpacity={0.85}
        >
          {processing ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenShell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function EmptyText({ text }: { text: string }) {
  return <Text style={styles.emptyText}>{text}</Text>;
}

function OptionCard({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle?: string | null;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[styles.optionCard, selected && styles.optionCardActive]}
    >
      <Text
        numberOfLines={1}
        style={[styles.optionTitle, selected && styles.optionTitleActive]}
      >
        {title}
      </Text>

      {!!subtitle && (
        <Text
          numberOfLines={1}
          style={[
            styles.optionSubtitle,
            selected && styles.optionSubtitleActive,
          ]}
        >
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function PaymentMethodCard({
  title,
  subtitle,
  amount,
  badge,
  selected,
  disabled,
  onPress,
}: {
  title: string;
  subtitle: string;
  amount: number | null;
  badge?: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.paymentCard,
        selected && styles.paymentCardActive,
        disabled && styles.paymentCardDisabled,
      ]}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentIconBox}>
          <Ionicons
            name={selected ? 'checkmark-circle' : 'wallet-outline'}
            size={22}
            color={selected ? '#2563eb' : '#64748b'}
          />
        </View>

        <View style={styles.paymentTextBox}>
          <View style={styles.paymentTitleRow}>
            <Text
              style={[
                styles.paymentTitle,
                selected && styles.paymentTitleActive,
              ]}
            >
              {title}
            </Text>

            {!!badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>

          <Text style={styles.paymentSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <Text style={styles.paymentAmount}>
        {amount ? formatCurrency(amount) : '-'}
      </Text>
    </TouchableOpacity>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, strong && styles.summaryValueStrong]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  backIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBox: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#020617',
  },
  pageSubtitle: {
    marginTop: 3,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748b',
  },

  planMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dbeafe',
    marginBottom: 12,
  },
  planIconBox: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planMiniContent: {
    flex: 1,
  },
  planMiniName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  planMiniPrice: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '800',
    color: '#2563eb',
  },

  stepRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 12,
  },
  stepPill: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    gap: 3,
  },
  stepPillActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  stepPillDone: {
    borderColor: '#16a34a',
    backgroundColor: '#16a34a',
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
  },
  stepNumberActive: {
    color: '#2563eb',
  },
  stepText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748b',
  },
  stepTextActive: {
    color: '#1d4ed8',
  },
  stepTextDone: {
    color: '#ffffff',
  },

  content: {
    paddingBottom: 18,
  },
  section: {
    padding: 14,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  sectionBody: {
    marginTop: 12,
  },

  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionCard: {
    width: '48%',
    minHeight: 78,
    borderRadius: 17,
    padding: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
  },
  optionCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  optionTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0f172a',
  },
  optionTitleActive: {
    color: '#1d4ed8',
  },
  optionSubtitle: {
    marginTop: 6,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748b',
  },
  optionSubtitleActive: {
    color: '#2563eb',
  },

  paymentList: {
    gap: 12,
  },
  paymentCard: {
    padding: 14,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  paymentCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  paymentCardDisabled: {
    opacity: 0.5,
  },
  paymentHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentTextBox: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  paymentTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0f172a',
  },
  paymentTitleActive: {
    color: '#1d4ed8',
  },
  paymentSubtitle: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: '#64748b',
  },
  paymentAmount: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#dbeafe',
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#1d4ed8',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
  },
  summaryValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  summaryValueStrong: {
    color: '#2563eb',
    fontSize: 15,
  },

  noteText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    color: '#475569',
  },
  payMethodBox: {
    gap: 10,
  },
  payMethodTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  payMethodCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  payMethodCardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  payMethodCardDisabled: {
    opacity: 0.55,
  },
  payMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payMethodLabel: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0f172a',
  },
  payMethodHint: {
    marginTop: 6,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748b',
  },
  payMethodWarn: {
    marginTop: 6,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#dc2626',
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    color: '#64748b',
  },

  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 8,
    backgroundColor: '#f8fafc',
  },
  secondaryBtn: {
    flex: 1,
    height: 50,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  primaryBtn: {
    flex: 1.7,
    height: 50,
    borderRadius: 17,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 3,
  },
  primaryBtnDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
  },
  primaryBtnSingle: {
    marginTop: 12,
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },

  stateBox: {
    minHeight: 260,
    padding: 24,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },
});

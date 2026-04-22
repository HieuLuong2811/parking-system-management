import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { CardField, confirmSetupIntent } from '@stripe/stripe-react-native';

import ScreenShell from '../component/ScreenShell';
import type { AppStackParamList } from '../navigation/AppStack';
import { useAcademicTerms } from '../api/academic_terms';
import { useVehicles } from '../api/vehicles';
import { useSubscriptionPlans } from '../api/subscription_plans';
import { usePaymentPlanPricing } from '../api/payment_plan_pricing';
import { useAuth } from '../auth/AuthContext';
import { useCreateInvoice } from '../api/invoices';
import { useCreateMomoPayment } from '../api/momo';
import { createSetupIntent, createStripePaymentIntent } from '../api/stripe';
import { EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY } from '../constant/config';

const priceFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const formatCurrency = (value: number) => `${priceFormatter.format(value)} VND`;

const getPlanTypeLabel = (plansType?: string | null) => {
  switch (plansType) {
    case 'UNLICENSED_VEHICLE':
      return 'Xe không biển số';
    case 'LICENSED_VEHICLE':
      return 'Xe có biển số';
    default:
      return plansType ?? '';
  }
};

type Nav = NativeStackNavigationProp<AppStackParamList>;
type ScreenRoute = RouteProp<AppStackParamList, 'PlanCheckout'>;

type PaymentMode = 'ONE_TIME' | 'RECURRING';

export default function PlanCheckoutScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ScreenRoute>();
  const initialPlan = route.params?.plan ?? null;
  const { user } = useAuth();

  const { data: subscriptionPlans = [], isLoading: plansLoading } = useSubscriptionPlans();
  const { data: academicTerms = [], isLoading: termsLoading } = useAcademicTerms();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const { mutateAsync: createInvoice } = useCreateInvoice();
  const { mutateAsync: createMomoPayment } = useCreateMomoPayment();

  const [activeStep, setActiveStep] = useState(initialPlan ? 1 : 0);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(initialPlan?.id ?? null);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentMode | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);

  const availablePlans = useMemo(
    () => (subscriptionPlans ?? []).filter((p) => !p.deleted_at),
    [subscriptionPlans]
  );

  const selectedPlan = useMemo(() => {
    if (!selectedPlanId) return initialPlan;
    return availablePlans.find((p) => p.id === selectedPlanId) ?? initialPlan;
  }, [availablePlans, initialPlan, selectedPlanId]);

  const selectedTerm = useMemo(
    () => academicTerms.find((t) => t.id === selectedTermId) ?? null,
    [academicTerms, selectedTermId]
  );
  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) ?? null,
    [vehicles, selectedVehicleId]
  );

  const { data: planPricing, isLoading: pricingLoading } = usePaymentPlanPricing(
    selectedPlan?.id,
    selectedTermId ?? undefined,
    Boolean(selectedPlan?.id && selectedTermId)
  );

  const recurringModePricing = useMemo(
    () => planPricing?.payment_modes.find((m) => m.payment_type === 'MONTHLY') ?? null,
    [planPricing]
  );
  const fullModePricing = useMemo(
    () => planPricing?.payment_modes.find((m) => m.payment_type === 'FULL') ?? null,
    [planPricing]
  );

  const steps = ['Gói gửi xe', 'Học kì & xe', 'Hình thức', 'Thanh toán'] as const;

  const stepInvalid = (() => {
    if (activeStep === 0) return !selectedPlan;
    if (activeStep === 1) return !selectedTerm || !selectedVehicle;
    if (activeStep === 2) return !selectedPaymentMode;
    if (activeStep === 3) {
      if (selectedPaymentMode === 'RECURRING') return !cardComplete || !recurringModePricing?.amount;
      if (selectedPaymentMode === 'ONE_TIME') return !fullModePricing?.amount;
      return true;
    }
    return true;
  })();

  const primaryLabel = (() => {
    if (activeStep < 3) return 'Tiếp tục';
    if (selectedPaymentMode === 'RECURRING') return 'Thanh toán Stripe';
    if (selectedPaymentMode === 'ONE_TIME') return 'Thanh toán MoMo';
    return 'Tiếp tục';
  })();

  const handleNext = async () => {
    if (activeStep < 3) {
      setActiveStep((s) => Math.min(3, s + 1));
      return;
    }

    if (selectedPaymentMode === 'ONE_TIME') {
      await handleMomoCheckout();
      return;
    }

    if (selectedPaymentMode === 'RECURRING') {
      await handleStripeCheckout();
    }
  };

  const handleStripeCheckout = async () => {
    if (!EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()) {
      Alert.alert('Stripe chưa cấu hình', 'Thiếu EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY.');
      return;
    }
    if (!user || !selectedPlan || !selectedTerm || !selectedVehicle || !recurringModePricing?.amount || !recurringModePricing.payment_plan_id) {
      Alert.alert('Thiếu dữ liệu', 'Vui lòng chọn đầy đủ gói, học kì, xe và hình thức thanh toán.');
      return;
    }

    setProcessing(true);
    try {
      const setup = await createSetupIntent();
      const { setupIntent, error } = await confirmSetupIntent(setup.client_secret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        throw new Error(error.message ?? 'Không thể xác nhận thẻ.');
      }

      const paymentMethodId =
        (setupIntent as any)?.paymentMethodId ??
        (setupIntent as any)?.paymentMethod ??
        (setupIntent as any)?.paymentMethod?.id ??
        null;

      if (!paymentMethodId || typeof paymentMethodId !== 'string') {
        throw new Error('Không lấy được payment_method_id.');
      }

      const recurringAmount = recurringModePricing.amount;

      await createStripePaymentIntent({
        payment_method_id: paymentMethodId,
        amount: recurringAmount,
        sub_plan_id: selectedPlan.id,
        term_id: selectedTerm.id,
        vehicle_id: selectedVehicle.id,
        payment_plan_id: recurringModePricing.payment_plan_id,
        start_date: selectedTerm.start_date,
        end_date: selectedTerm.end_date,
        total_amount: recurringAmount,
      });

      Alert.alert('Thành công', 'Đã tạo thanh toán Stripe. Gói của bạn sẽ được kích hoạt sau khi thanh toán thành công.');
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Thanh toán Stripe thất bại.';
      Alert.alert('Lỗi', message);
    } finally {
      setProcessing(false);
    }
  };

  const handleMomoCheckout = async () => {
    if (!user || !selectedPlan || !selectedTerm || !selectedVehicle || !fullModePricing?.amount || !fullModePricing.payment_plan_id) {
      Alert.alert('Thiếu dữ liệu', 'Vui lòng chọn đầy đủ gói, học kì, xe và hình thức thanh toán.');
      return;
    }

    setProcessing(true);
    try {
      const oneTimeAmount = fullModePricing.amount;
      const metadata = {
        user_code: user.user_code,
        sub_plan_id: selectedPlan.id,
        term_id: selectedTerm.id,
        vehicle_id: selectedVehicle.id,
        payment_plan_id: fullModePricing.payment_plan_id,
        total_amount: oneTimeAmount,
        start_date: selectedTerm.start_date,
        end_date: selectedTerm.end_date,
      };

      const invoice = await createInvoice({
        user_code: user.user_code,
        subscription_id: null,
        amount: oneTimeAmount,
        payment_method: 'MOMO',
        status: 'PENDING',
        metadata,
      });

      const redirectUrl = Linking.createURL('payment-return', {
        queryParams: { invoice_id: invoice.id },
      });

      const momoResponse = await createMomoPayment({
        amount: invoice.amount,
        orderId: invoice.id,
        orderInfo: `Invoice ${invoice.id}`,
        redirectUrl,
        extraData: JSON.stringify({ invoice_id: invoice.id }),
        lang: user.language_use || 'vi',
      });

      const checkoutUrl =
        momoResponse.payUrl ??
        momoResponse.deeplink ??
        momoResponse.qrCodeUrl ??
        momoResponse.redirectUrl ??
        null;

      if (!checkoutUrl) {
        throw new Error('Không nhận được URL thanh toán MoMo.');
      }

      const canOpen = await Linking.canOpenURL(checkoutUrl);
      if (!canOpen) {
        throw new Error('Thiết bị không thể mở URL thanh toán MoMo.');
      }

      await Linking.openURL(checkoutUrl);

      Alert.alert(
        'Đang chuyển sang MoMo',
        Platform.OS === 'android'
          ? 'Nếu không tự quay lại app, bạn có thể quay lại thủ công sau khi thanh toán.'
          : 'Bạn có thể quay lại app sau khi thanh toán.'
      );
      navigation.navigate('PaymentReturn', { invoice_id: invoice.id, result: 'pending' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Thanh toán MoMo thất bại.';
      Alert.alert('Lỗi', message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ScreenShell>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.85}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Thanh toán gói</Text>
          <Text style={styles.pageSubtitle}>
            {getPlanTypeLabel(selectedPlan?.plans_type) || 'Chọn gói gửi xe'}
          </Text>
        </View>
      </View>

      <View style={styles.stepRow}>
        {steps.map((label, idx) => {
          const active = idx === activeStep;
          const done = idx < activeStep;
          return (
            <View key={label} style={[styles.stepPill, active && styles.stepPillActive, done && styles.stepPillDone]}>
              <Text style={[styles.stepText, (active || done) && styles.stepTextActive]}>{label}</Text>
            </View>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {activeStep === 0 && (
          <>
            <Section title="Chọn gói gửi xe">
              {plansLoading ? (
                <ActivityIndicator />
              ) : availablePlans.length === 0 ? (
                <Text style={styles.muted}>Chưa có gói gửi xe.</Text>
              ) : (
                <View style={styles.grid}>
                  {availablePlans.map((p) => {
                    const selected = p.id === selectedPlanId;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.optionCard, selected && styles.optionCardActive]}
                        activeOpacity={0.85}
                        onPress={() => setSelectedPlanId(p.id)}
                      >
                        <Text style={[styles.optionTitle, selected && styles.optionTitleActive]}>
                          {getPlanTypeLabel(p.plans_type)}
                        </Text>
                        <Text style={[styles.optionSubtitle, selected && styles.optionSubtitleActive]}>
                          Giá/ngày: {formatCurrency(p.price_per_day)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </Section>
          </>
        )}

        {activeStep === 1 && (
          <>
            <Section title="Chọn học kì">
              {termsLoading ? (
                <ActivityIndicator />
              ) : academicTerms.length === 0 ? (
                <Text style={styles.muted}>Chưa có học kì.</Text>
              ) : (
                <View style={styles.grid}>
                  {academicTerms.map((term) => {
                    const selected = term.id === selectedTermId;
                    return (
                      <TouchableOpacity
                        key={term.id}
                        style={[styles.optionCard, selected && styles.optionCardActive]}
                        activeOpacity={0.85}
                        onPress={() => setSelectedTermId(term.id)}
                      >
                        <Text style={[styles.optionTitle, selected && styles.optionTitleActive]}>{term.term_name}</Text>
                        <Text style={[styles.optionSubtitle, selected && styles.optionSubtitleActive]}>
                          {term.start_date} → {term.end_date}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </Section>

            <Section title="Chọn xe">
              {vehiclesLoading ? (
                <ActivityIndicator />
              ) : vehicles.length === 0 ? (
                <Text style={styles.muted}>Bạn chưa có xe. Vui lòng thêm xe ở tab Vehicles trước.</Text>
              ) : (
                <View style={styles.grid}>
                  {vehicles.map((vehicle) => {
                    const selected = vehicle.id === selectedVehicleId;
                    return (
                      <TouchableOpacity
                        key={vehicle.id}
                        style={[styles.optionCard, selected && styles.optionCardActive]}
                        activeOpacity={0.85}
                        onPress={() => setSelectedVehicleId(vehicle.id)}
                      >
                        <Text style={[styles.optionTitle, selected && styles.optionTitleActive]}>
                          {vehicle.license_plate || 'Chưa có biển số'}
                        </Text>
                        <Text style={[styles.optionSubtitle, selected && styles.optionSubtitleActive]}>{vehicle.vehicle_type}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </Section>
          </>
        )}

        {activeStep === 2 && (
          <>
            <Section title="Chọn hình thức thanh toán">
              {!selectedPlanId ? (
                <Text style={styles.muted}>Hãy chọn gói ở bước trước.</Text>
              ) : !selectedTermId ? (
                <Text style={styles.muted}>Hãy chọn học kì ở bước trước.</Text>
              ) : pricingLoading ? (
                <ActivityIndicator />
              ) : !planPricing ? (
                <Text style={styles.muted}>Không tải được bảng giá. Vui lòng thử lại.</Text>
              ) : (
                <View style={{ gap: 12 }}>
                  <PayModeCard
                    title="Theo tháng (Stripe)"
                    subtitle="Thanh toán định kì (MONTHLY)"
                    amount={recurringModePricing?.amount ?? null}
                    selected={selectedPaymentMode === 'RECURRING'}
                    disabled={!recurringModePricing?.amount}
                    onPress={() => setSelectedPaymentMode('RECURRING')}
                  />
                  <PayModeCard
                    title="Trọn học kì (MoMo)"
                    subtitle="Thanh toán 1 lần (FULL)"
                    amount={fullModePricing?.amount ?? null}
                    selected={selectedPaymentMode === 'ONE_TIME'}
                    disabled={!fullModePricing?.amount}
                    onPress={() => setSelectedPaymentMode('ONE_TIME')}
                  />
                </View>
              )}
            </Section>
          </>
        )}

        {activeStep === 3 && (
          <>
            <Section title="Tóm tắt">
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gói</Text>
                <Text style={styles.summaryValue}>{getPlanTypeLabel(selectedPlan?.plans_type) || '—'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Học kì</Text>
                <Text style={styles.summaryValue}>{selectedTerm?.term_name ?? '—'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Xe</Text>
                <Text style={styles.summaryValue}>{selectedVehicle?.license_plate ?? '—'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Số tiền</Text>
                <Text style={styles.summaryValue}>
                  {selectedPaymentMode === 'RECURRING' && recurringModePricing?.amount
                    ? formatCurrency(recurringModePricing.amount)
                    : selectedPaymentMode === 'ONE_TIME' && fullModePricing?.amount
                      ? formatCurrency(fullModePricing.amount)
                      : '—'}
                </Text>
              </View>
            </Section>

            {selectedPaymentMode === 'RECURRING' ? (
              <Section title="Thanh toán Stripe">
                <Text style={styles.muted}>
                  Nhập thông tin thẻ để thanh toán theo tháng. (Cần cấu hình `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`.)
                </Text>
                <View style={{ marginTop: 12 }}>
                  <CardField
                    postalCodeEnabled={false}
                    placeholders={{ number: '4242 4242 4242 4242' }}
                    cardStyle={{
                      backgroundColor: '#ffffff',
                      textColor: '#0f172a',
                      placeholderColor: '#94a3b8',
                      borderWidth: 1,
                      borderColor: '#e2e8f0',
                      borderRadius: 14,
                    }}
                    style={{ width: '100%', height: 48 }}
                    onCardChange={(cardDetails) => {
                      setCardComplete(Boolean(cardDetails.complete));
                    }}
                  />
                </View>
              </Section>
            ) : selectedPaymentMode === 'ONE_TIME' ? (
              <Section title="Thanh toán MoMo">
                <Text style={styles.muted}>Bấm “Thanh toán MoMo” để chuyển sang MoMo / trình duyệt.</Text>
              </Section>
            ) : (
              <Section title="Thanh toán">
                <Text style={styles.muted}>Vui lòng chọn hình thức thanh toán.</Text>
              </Section>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.secondaryBtn, activeStep === 0 && { opacity: 0.5 }]}
          disabled={activeStep === 0 || processing}
          onPress={() => setActiveStep((s) => Math.max(0, s - 1))}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>Quay lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryBtn, (stepInvalid || processing) && { opacity: 0.5 }]}
          disabled={stepInvalid || processing}
          onPress={() => void handleNext()}
          activeOpacity={0.85}
        >
          {processing ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryBtnText}>{primaryLabel}</Text>}
        </TouchableOpacity>
      </View>
    </ScreenShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function PayModeCard({
  title,
  subtitle,
  amount,
  selected,
  disabled,
  onPress,
}: {
  title: string;
  subtitle: string;
  amount: number | null;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      disabled={disabled}
      style={[styles.payMode, selected && styles.payModeActive, disabled && { opacity: 0.5 }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.payModeTitle, selected && styles.payModeTitleActive]}>{title}</Text>
        <Text style={[styles.payModeSubtitle, selected && styles.payModeSubtitleActive]}>{subtitle}</Text>
      </View>
      <Text style={[styles.payModeAmount, selected && styles.payModeAmountActive]}>
        {amount ? formatCurrency(amount) : '—'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  backBtnText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: -2,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  pageSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#64748b',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  stepPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  stepPillActive: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  stepPillDone: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#475569',
  },
  stepTextActive: {
    color: '#0f172a',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  sectionBody: {
    marginTop: 12,
  },
  muted: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  optionTitleActive: {
    color: '#1d4ed8',
  },
  optionSubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  optionSubtitleActive: {
    color: '#1d4ed8',
  },
  payMode: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  payModeActive: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  payModeTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  payModeTitleActive: {
    color: '#92400e',
  },
  payModeSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
  },
  payModeSubtitleActive: {
    color: '#92400e',
  },
  payModeAmount: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '900',
    color: '#0ea5e9',
  },
  payModeAmountActive: {
    color: '#b45309',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
    maxWidth: '65%',
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 6,
  },
  secondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  primaryBtn: {
    flex: 2,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
});

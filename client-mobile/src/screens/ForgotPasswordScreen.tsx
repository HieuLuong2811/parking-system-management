import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import { useMutation } from '@tanstack/react-query';

import type { AuthStackParamList } from '../navigation/AuthStack';
import { emailRegex, isPasswordComplex } from '../ultis/passwordRegex';
import FormInput from '../component/FormInput';
import {
  requestForgotPassword,
  resetForgotPassword,
  verifyForgotPasswordCode,
} from '../api/forgotpassword';
import { showAppToast } from '../ultis/toast';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [hasRequestedCode, setHasRequestedCode] = useState(false);

  const toI18nErrorMessage = (detail: unknown) => {
    const raw = typeof detail === 'string' ? detail : '';
    const normalized = raw.trim().toLowerCase();
    if (!normalized) return '';
    if (
      normalized === 'user code or email is incorrect' ||
      normalized === 'user code not found' ||
      normalized === 'users not found' ||
      normalized === 'user not found' ||
      normalized === 'email does not match this user code'
    ) {
      return t('auth.userOrEmailInvalid', { defaultValue: 'User code or email is incorrect' });
    }
    return raw;
  };

  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const canResend = cooldownSeconds <= 0;

  const requestMutation = useMutation({
    mutationFn: requestForgotPassword,
    onSuccess: (data) => {
      setSubmitError('');
      setHasRequestedCode(true);
      const seconds = Math.max(0, Math.min(59, Math.floor((data.throttle_seconds || 60) - 1)));
      setCooldownSeconds(seconds > 0 ? seconds : 59);
      Alert.alert(
        t('common.success', { defaultValue: 'Success' }),
        t('auth.codeSent', { defaultValue: 'Verification code sent to your email.' })
      );
    },
    onError: (err: any) => {
      const message =
        toI18nErrorMessage(err?.response?.data?.detail) || t('auth.requestFailed', { defaultValue: 'Request failed' });
      setSubmitError(message);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        message
      );
    },
  });

  const verifyMutation = useMutation({
    mutationFn: verifyForgotPasswordCode,
    onSuccess: () => setSubmitError(''),
    onError: (err: any) => {
      const message =
        toI18nErrorMessage(err?.response?.data?.detail) || t('auth.verifyFailed', { defaultValue: 'Verification failed' });
      setSubmitError(message);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        message
      );
    },
  });

  const resetMutation = useMutation({
    mutationFn: resetForgotPassword,
    onSuccess: () => {
      setSubmitError('');
      showAppToast(t('auth.passwordUpdated', { defaultValue: 'Password updated.' }), 'success');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    },
    onError: (err: any) => {
      const message =
        toI18nErrorMessage(err?.response?.data?.detail) || t('auth.resetFailed', { defaultValue: 'Reset failed' });
      setSubmitError(message);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        message
      );
    },
  });

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
        cooldownTimer.current = null;
      }
      return;
    }

    if (!cooldownTimer.current) {
      cooldownTimer.current = setInterval(() => {
        setCooldownSeconds((s) => Math.max(0, s - 1));
      }, 1000);
    }

    return () => {
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
        cooldownTimer.current = null;
      }
    };
  }, [cooldownSeconds]);

  const isEmailValid = useMemo(() => emailRegex.test((email || '').trim()), [email]);
  const isOtpValid = useMemo(() => /^\d{6}$/.test((otp || '').trim()), [otp]);
  const isPasswordValid = useMemo(() => isPasswordComplex(newPassword), [newPassword]);
  const isConfirmValid = useMemo(() => newPassword.length > 0 && newPassword === confirmPassword, [newPassword, confirmPassword]);

  const doRequest = async () => {
    const cleanedUserCode = (userCode || '').trim();
    const cleanedEmail = (email || '').trim();
    if (!cleanedUserCode) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('auth.userCodeRequired', { defaultValue: 'User code is required' }));
      return;
    }
    if (!isEmailValid) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('auth.invalidEmail', { defaultValue: 'Invalid email' }));
      return;
    }
    await requestMutation.mutateAsync({ user_code: cleanedUserCode, email: cleanedEmail });
  };

  const doVerify = async () => {
    const cleanedUserCode = (userCode || '').trim();
    const cleanedOtp = (otp || '').trim();
    if (!cleanedUserCode) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('auth.userCodeRequired', { defaultValue: 'User code is required' }));
      return false;
    }
    if (!isOtpValid) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('auth.invalidCode', { defaultValue: 'Invalid code' }));
      return false;
    }
    const res = await verifyMutation.mutateAsync({ user_code: cleanedUserCode, code: cleanedOtp });
    if (!res.valid) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('auth.invalidCode', { defaultValue: 'Invalid code' }));
      throw new Error('invalid_code');
    }
    return true;
  };

  const doReset = async () => {
    if (!isPasswordValid) {
      const message = t('auth.passwordRules', { defaultValue: 'Password does not meet requirements' });
      setSubmitError(message);
      Alert.alert(t('common.error', { defaultValue: 'Error' }), message);
      return;
    }
    if (!isConfirmValid) {
      const message = t('auth.passwordMismatch', { defaultValue: 'Passwords do not match' });
      setSubmitError(message);
      Alert.alert(t('common.error', { defaultValue: 'Error' }), message);
      return;
    }
    await resetMutation.mutateAsync({ user_code: (userCode || '').trim(), code: (otp || '').trim(), new_password: newPassword });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>{t('auth.forgotTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.forgotSubtitle')}</Text>
          {!!submitError && <Text style={styles.submitError}>{submitError}</Text>}

          <ProgressSteps
            activeStep={stepIndex}
            activeStepIconBorderColor="#f59e0b"
            completedStepIconColor="#f59e0b"
            completedProgressBarColor="#f59e0b"
            activeLabelColor="#0f172a"
            completedLabelColor="#0f172a"
            labelColor="#64748b"
            topOffset={24}
          >
            <ProgressStep
              removeBtnRow
              scrollable={false}
              label={t('auth.stepRequest', { defaultValue: 'Request' })}
            >
              <View style={styles.stepBody}>
                <View style={styles.formGroup}>
                  <FormInput
                    label={t('auth.userCode')}
                    required
                    value={userCode}
                    onChangeText={setUserCode}
                    placeholder={t('auth.userCodePlaceholder')}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <FormInput
                    label={t('auth.email', { defaultValue: 'Email' })}
                    required
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('auth.emailPlaceholder', { defaultValue: 'Enter your email' })}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                {hasRequestedCode && (
                  <TouchableOpacity
                    style={[styles.secondaryButton, !canResend && styles.secondaryButtonDisabled]}
                    onPress={doRequest}
                    activeOpacity={0.85}
                    disabled={!canResend || requestMutation.isPending}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {canResend
                        ? t('auth.resend', { defaultValue: 'Resend code' })
                        : `${t('auth.resendIn', { defaultValue: 'Resend in' })} ${cooldownSeconds}s`}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.primaryButton, requestMutation.isPending && styles.primaryButtonDisabled]}
                  onPress={async () => {
                    await doRequest();
                    setStepIndex(1);
                  }}
                  activeOpacity={0.85}
                  disabled={requestMutation.isPending}
                >
                  <Text style={styles.primaryButtonText}>
                    {requestMutation.isPending
                      ? t('common.loading', { defaultValue: 'Loading...' })
                      : t('auth.sendRequest', { defaultValue: 'Send request' })}
                  </Text>
                </TouchableOpacity>
              </View>
            </ProgressStep>

            <ProgressStep
              removeBtnRow
              scrollable={false}
              label={t('auth.stepVerify', { defaultValue: 'Verify' })}
            >
              <View style={styles.stepBody}>
                <View style={styles.formGroup}>
                  <FormInput
                    label={t('auth.verificationCode', { defaultValue: 'Verification code' })}
                    required
                    value={otp}
                    onChangeText={(v) => setOtp(v.replace(/[^\d]/g, '').slice(0, 6))}
                    placeholder={t('auth.codePlaceholder', { defaultValue: '6 digits' })}
                    keyboardType="number-pad"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.secondaryButton, !canResend && styles.secondaryButtonDisabled]}
                  onPress={doRequest}
                  activeOpacity={0.85}
                  disabled={!canResend || requestMutation.isPending}
                >
                  <Text style={styles.secondaryButtonText}>
                    {canResend
                      ? t('auth.resend', { defaultValue: 'Resend code' })
                      : `${t('auth.resendIn', { defaultValue: 'Resend in' })} ${cooldownSeconds}s`}
                  </Text>
                </TouchableOpacity>

                <View style={styles.footerRow}>
                  <TouchableOpacity
                    style={styles.ghostButton}
                    onPress={() => setStepIndex(0)}
                    activeOpacity={0.85}
                    disabled={verifyMutation.isPending}
                  >
                    <Text style={styles.ghostButtonText}>{t('common.back', { defaultValue: 'Back' })}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryButton, styles.primaryButtonInline, verifyMutation.isPending && styles.primaryButtonDisabled]}
                    onPress={async () => {
                      const ok = await doVerify();
                      if (ok) setStepIndex(2);
                    }}
                    activeOpacity={0.85}
                    disabled={verifyMutation.isPending || !isOtpValid}
                  >
                    <Text style={styles.primaryButtonText}>
                      {verifyMutation.isPending
                        ? t('common.loading', { defaultValue: 'Loading...' })
                        : t('common.next', { defaultValue: 'Next' })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ProgressStep>

            <ProgressStep
              removeBtnRow
              scrollable={false}
              label={t('auth.stepReset', { defaultValue: 'Reset' })}
            >
              <View style={styles.stepBody}>
                <View style={styles.formGroup}>
                  <FormInput
                    label={t('auth.newPassword', { defaultValue: 'New password' })}
                    required
                    type="password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={t('auth.newPasswordPlaceholder', { defaultValue: 'Enter new password' })}
                    autoCapitalize="none"
                  />
                  <Text style={styles.helpText}>
                    {t('auth.passwordRuleText', {
                      defaultValue:
                        '8-20 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special (!@#$%^&*()_-+=[]{}?/|)',
                    })}
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <FormInput
                    label={t('auth.confirmPassword', { defaultValue: 'Confirm password' })}
                    required
                    type="password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t('auth.confirmPasswordPlaceholder', { defaultValue: 'Re-enter new password' })}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.footerRow}>
                  <TouchableOpacity
                    style={styles.ghostButton}
                    onPress={() => setStepIndex(1)}
                    activeOpacity={0.85}
                    disabled={resetMutation.isPending}
                  >
                    <Text style={styles.ghostButtonText}>{t('common.back', { defaultValue: 'Back' })}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryButton, styles.primaryButtonInline, resetMutation.isPending && styles.primaryButtonDisabled]}
                    onPress={doReset}
                    activeOpacity={0.85}
                    disabled={resetMutation.isPending || !isPasswordValid || !isConfirmValid}
                  >
                    <Text style={styles.primaryButtonText}>
                      {resetMutation.isPending
                        ? t('common.loading', { defaultValue: 'Loading...' })
                        : t('auth.updatePassword', { defaultValue: 'Update password' })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ProgressStep>
          </ProgressSteps>

          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.backText}>{t('auth.backToLogin')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  submitError: {
    marginTop: 12,
    marginBottom: 6,
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    textAlign: 'center',
  },
  primaryButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonInline: {
    flex: 1,
    height: 46,
    marginTop: 0,
    borderRadius: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  stepBody: {
    marginTop: 10,
  },
  secondaryButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  helpText: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  ghostButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 14,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  backText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    textAlign: 'center',
  },
});

import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '../navigation/AuthStack';
import { languageOptions } from '../constant/languageOptions';
import FormInput from '../component/FormInput';
import { useAuth } from '../auth/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const PRIMARY_COLOR = '#43B14B';
const PRIMARY_DARK = '#248A31';
const ACCENT_COLOR = '#F6C343';

export default function LoginScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const { signIn } = useAuth();

  const [userCode, setUserCode] = useState('');
  const [password, setPassword] = useState('');
  const [userCodeError, setUserCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const toI18nLoginErrorMessage = (detail: unknown) => {
    const raw = typeof detail === 'string' ? detail : '';
    const normalized = raw.trim().toLowerCase();
    if (!normalized) return '';
    if (normalized.includes('user code') && normalized.includes('password') && normalized.includes('incorrect')) {
      return t('auth.userOrPasswordInvalid', { defaultValue: 'User code or password is incorrect' });
    }
    if (normalized === 'invalid username or password' || normalized === 'invalid credentials') {
      return t('auth.userOrPasswordInvalid', { defaultValue: 'User code or password is incorrect' });
    }
    if (normalized.includes('network')) {
      return t('auth.networkError', {
        defaultValue:
          "Network error: can't reach API. If running on phone/Android emulator, don't use localhost; use your PC IP or 10.0.2.2.",
      });
    }
    return raw;
  };

  const currentLanguage = useMemo(
    () => languageOptions.find((item) => item.code === i18n.language) ?? languageOptions[0],
    [i18n.language]
  );

  const handleChangeLanguage = async (code: string) => {
    setLanguageOpen(false);
    await i18n.changeLanguage(code);
  };

  const handleLogin = async () => {
    let hasError = false;
    setSubmitError('');

    if (!userCode.trim()) {
      setUserCodeError(t('auth.fieldRequired'));
      hasError = true;
    } else {
      setUserCodeError('');
    }

    if (!password.trim()) {
      setPasswordError(t('auth.fieldRequired'));
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) {
      return;
    }

    setSubmitting(true);

    try {
      await signIn({ user_code: userCode.trim(), password });
    } catch (err: any) {
      const rawMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Login failed';

      if (String(rawMessage).toLowerCase().includes('network')) {
        setSubmitError(toI18nLoginErrorMessage(rawMessage));
        return;
      }

      setSubmitError(toI18nLoginErrorMessage(rawMessage) || t('auth.loginFailed', { defaultValue: 'Login failed' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserCodeChange = (value: string) => {
    setUserCode(value);

    if (userCodeError) {
      setUserCodeError('');
    }

    if (submitError) {
      setSubmitError('');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (passwordError) {
      setPasswordError('');
    }

    if (submitError) {
      setSubmitError('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.backgroundTop} />
      <View style={styles.circleLarge} />
      <View style={styles.circleSmall} />

      <View style={styles.languageArea}>
        <Pressable
          style={styles.languageTrigger}
          onPress={() => setLanguageOpen((prev) => !prev)}
        >
          <Image source={{ uri: currentLanguage.flag }} style={styles.flag} />
          <Text style={styles.languageTriggerText}>
            {currentLanguage.code.toUpperCase()}
          </Text>
          <Text style={styles.dropdownArrow}>⌄</Text>
        </Pressable>

        {languageOpen && (
          <View style={styles.languageDropdown}>
            {languageOptions.map((item) => {
              const selected = item.code === currentLanguage.code;

              return (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.languageItem,
                    selected && styles.languageItemActive,
                  ]}
                  onPress={() => handleChangeLanguage(item.code)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: item.flag }} style={styles.flag} />
                  <Text
                    style={[
                      styles.languageItemText,
                      selected && styles.languageItemTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>

                  {selected && <Text style={styles.checkIcon}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Image
              source={require('../../assets/Logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.appName}>UTEHY STUDENT PARKING</Text>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.title}>{t('auth.loginTitle')}</Text>

          <View style={styles.formGroup}>
            <FormInput
              label={t('auth.userCode')}
              required
              value={userCode}
              onChangeText={handleUserCodeChange}
              placeholder={t('auth.userCodePlaceholder')}
              error={userCodeError}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <FormInput
              label={t('auth.password')}
              required
              type="password"
              value={password}
              onChangeText={handlePasswordChange}
              placeholder={t('auth.passwordPlaceholder')}
              error={passwordError}
            />
          </View>

          {!!submitError && <Text style={styles.submitError}>{submitError}</Text>}

          <TouchableOpacity
            style={[styles.loginButton, submitting && styles.loginButtonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.88}
            disabled={submitting}
          >
            <Text style={styles.loginButtonText}>
              {submitting ? `${t('auth.loginButton')}...` : t('auth.loginButton')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.8}
          >
            <Text style={styles.forgotPassword}>{t('auth.forgotPassword')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(227 227 227)',
  },

  backgroundTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 450,
    backgroundColor: PRIMARY_COLOR,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  circleLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: -70,
    right: -70,
  },

  circleSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(246,195,67,0.28)',
    top: 150,
    left: -36,
  },

  languageArea: {
    position: 'absolute',
    top: 14,
    right: 18,
    zIndex: 100,
  },

  languageTrigger: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },

  languageTriggerText: {
    marginLeft: 7,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },

  dropdownArrow: {
    marginLeft: 6,
    fontSize: 13,
    color: '#334155',
  },

  languageDropdown: {
    position: 'absolute',
    top: 48,
    right: 0,
    width: 190,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 10,
  },

  languageItem: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  languageItemActive: {
    backgroundColor: '#EAF7EC',
  },

  languageItemText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#0F172A',
  },

  languageItemTextActive: {
    fontWeight: '800',
    color: PRIMARY_DARK,
  },

  checkIcon: {
    fontSize: 15,
    fontWeight: '900',
    color: PRIMARY_COLOR,
  },

  flag: {
    width: 22,
    height: 16,
    borderRadius: 3,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 76,
    paddingBottom: 28,
  },

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logoBox: {
    width: 132,
    height: 132,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 10,
  },

  logo: {
    width: 112,
    height: 112,
  },

  appName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.4,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 26,
    elevation: 10,
  },

  title: {
    fontSize: 27,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 24,
  },

  formGroup: {
    marginBottom: 16,
  },

  submitError: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 19,
  },

  loginButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 16,
    shadowColor: PRIMARY_DARK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  forgotPassword: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY_DARK,
    textAlign: 'right',
  },
});

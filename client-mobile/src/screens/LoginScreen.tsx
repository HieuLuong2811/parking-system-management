import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
        err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Login failed';

      if (String(rawMessage).toLowerCase().includes('network')) {
        setSubmitError(
          'Network error: không gọi được API. Nếu chạy trên điện thoại/Android emulator, đừng dùng localhost; hãy dùng IP máy (vd 192.168.x.x) hoặc 10.0.2.2 (Android emulator).'
        );
        return;
      }

      setSubmitError(String(rawMessage));
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Image source={require('../../assets/Logo.png')} style={styles.logo} resizeMode="contain" />

          <Text style={styles.title}>{t('auth.loginTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('auth.language')}</Text>

            <View style={styles.languageWrapper}>
              <Pressable style={styles.languageTrigger} onPress={() => setLanguageOpen((prev) => !prev)}>
                <View style={styles.languageTriggerLeft}>
                  <Image source={{ uri: currentLanguage.flag }} style={styles.flag} />
                  <Text style={styles.languageTriggerText}>{currentLanguage.name}</Text>
                </View>
                <Text style={styles.dropdownArrow}>{languageOpen ? '▲' : '▼'}</Text>
              </Pressable>

              {languageOpen && (
                <View style={styles.languageDropdown}>
                  {languageOptions.map((item) => {
                    const selected = item.code === currentLanguage.code;

                    return (
                      <TouchableOpacity
                        key={item.code}
                        style={[styles.languageItem, selected && styles.languageItemActive]}
                        onPress={() => handleChangeLanguage(item.code)}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri: item.flag }} style={styles.flag} />
                        <Text style={[styles.languageItemText, selected && styles.languageItemTextActive]}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

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
            activeOpacity={0.85}
            disabled={submitting}
          >
            <Text style={styles.loginButtonText}>
              {submitting ? t('auth.loginButton') + '...' : t('auth.loginButton')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} activeOpacity={0.8}>
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
    backgroundColor: '#f5f7fb',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  
  languageWrapper: {
    position: 'relative',
    zIndex: 20,
  },

  languageTrigger: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#dbe2ea',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  languageTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  languageTriggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 10,
  },

  dropdownArrow: {
    fontSize: 12,
    color: '#475569',
  },

  languageDropdown: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbe2ea',
    overflow: 'hidden',
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },

  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  languageItemActive: {
    backgroundColor: '#eff6ff',
  },

  languageItemText: {
    fontSize: 14,
    color: '#0f172a',
    marginLeft: 10,
  },

  languageItemTextActive: {
    fontWeight: '700',
    color: '#1d4ed8',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logo: {
    width: 72,
    height: 72,
    alignSelf: 'center',
    marginBottom: 16,
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
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
  submitError: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    textAlign: 'right',
    marginBottom: 20,
  },
  loginButton: {
    height: 50,
    borderRadius: 5,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  flag: {
    width: 22,
    height: 16,
    borderRadius: 2,
  },
});

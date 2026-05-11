import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import vi from './vi';
import en from './en';
import th from './th';

const deviceLanguage = Localization.getLocales?.()[0]?.languageCode ?? 'vi';

const supportedLanguages = ['vi', 'en', 'th'];
const fallbackLng = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'vi';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: fallbackLng,
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false,
  },
  resources: {
    vi: { translation: vi },
    en: { translation: en },
    th: { translation: th },
  },
});

export default i18n;
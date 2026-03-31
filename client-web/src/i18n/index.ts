import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import vi from './locales/vi';
import ja from './locales/ja';
import th from './locales/th';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
    ja: { translation: ja },
    th: { translation: th },
  },
  lng: localStorage.getItem('language') || 'vi',
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;

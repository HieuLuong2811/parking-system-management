import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import vi from './locales/vi';
import th from './locales/th';
import lo from './locales/lo';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
    th: { translation: th },
    lo: { translation: lo },
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

export type Language = 'vi' | 'en' | 'ja';

export const supportedLanguages: Language[] = ['vi', 'en', 'ja'];

export const languageLabels: Record<Language, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
  ja: '日本語',
};

const STORAGE_KEY = 'language';
const defaultLanguage: Language = 'vi';

const isSupportedLanguage = (value: string | null): value is Language => {
  return value !== null && supportedLanguages.includes(value as Language);
};

export const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return defaultLanguage;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (isSupportedLanguage(stored)) {
    return stored;
  }

  return defaultLanguage;
};

export const setStoredLanguage = (language: Language) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, language);
};

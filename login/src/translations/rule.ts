import { supportedLanguages } from '../utils/language';

type Language = (typeof supportedLanguages)[number];
type TranslationMap = Record<string, string>;

export const RuleTranslations: Record<Language, TranslationMap> = {
  vi: {
    'login.rule.required-field': 'là bắt buộc.',
  },
  en: {
    'login.rule.required-field': 'is required.',
  },
  ja: {
    'login.rule.required-field': 'は必須です。',
  },
  th: {
    'login.rule.required-field': 'จำเป็นต้องกรอก',
  },
};

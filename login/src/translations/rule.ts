import { supportedLanguages } from '../ultis/language';

type Language = (typeof supportedLanguages)[number];
type TranslationMap = Record<string, string>;

export const RuleTranslations: Record<Language, TranslationMap> = {
  vi: {
    'login.rule.required-field': 'là bắt buộc.',
  },
  en: {
    'login.rule.required-field': 'is required.',
  },
  th: {
    'login.rule.required-field': 'จำเป็นต้องกรอก',
  },
  lo: {
    'login.rule.required-field': 'ກະລຸນາປ້ອນຂໍ້ມູນ',
  }
};

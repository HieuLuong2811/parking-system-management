import { supportedLanguages } from '../utils/language';

type Language = (typeof supportedLanguages)[number];
type TranslationMap = Record<string, string>;

export const ErrorTranslations: Record<Language, TranslationMap> = {
  vi: {
    'login.error.invalid': 'Sai tên đăng nhập hoặc mật khẩu.',
  },
  en: {
    'login.error.invalid': 'Incorrect username or password.',
  },
  ja: {
    'login.error.invalid': 'ユーザー名またはパスワードが間違っています。',
  },
  th: {
    'login.error.invalid': 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
  },
};

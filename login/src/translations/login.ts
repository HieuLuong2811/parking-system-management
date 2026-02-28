import type { Language } from '../utils/language';

type TranslationMap = Record<string, string>;

export const loginTranslations: Record<Language, TranslationMap> = {
  vi: {
    'login.title': 'Đăng nhập hệ thống (Port 8559)',
    'login.username': 'Tên đăng nhập',
    'login.password': 'Mật khẩu',
    'login.button': 'Đăng Nhập',
    'login.loading': 'Đang xác thực...',
    'login.error.empty': 'Vui lòng nhập tên đăng nhập và mật khẩu.',
    'login.error.invalid': 'Sai tên đăng nhập hoặc mật khẩu.',
    'login.credentials-hint': '(Tên đăng nhập: **admin**, Mật khẩu: **password**)',
    'login.no-account': 'Chưa có tài khoản?',
    'login.register-link': 'Đăng ký ngay',
  },
  en: {
    'login.title': 'System login (Port 8559)',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.button': 'Log In',
    'login.loading': 'Authenticating...',
    'login.error.empty': 'Please enter both username and password.',
    'login.error.invalid': 'Incorrect username or password.',
    'login.credentials-hint': '(Username: **admin**, Password: **password**)',
    'login.no-account': "Don't have an account?",
    'login.register-link': 'Register now',
  },
  ja: {
    'login.title': 'システムにログイン (ポート8559)',
    'login.username': 'ユーザー名',
    'login.password': 'パスワード',
    'login.button': 'ログイン',
    'login.loading': '認証中...',
    'login.error.empty': 'ユーザー名とパスワードを入力してください。',
    'login.error.invalid': 'ユーザー名またはパスワードが正しくありません。',
    'login.credentials-hint': '（ユーザー名：**admin**、パスワード：**password**）',
    'login.no-account': 'アカウントをお持ちでないですか？',
    'login.register-link': '今すぐ登録',
  },
};

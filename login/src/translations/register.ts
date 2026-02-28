import type { Language } from '../utils/language';

type TranslationMap = Record<string, string>;

export const registerTranslations: Record<Language, TranslationMap> = {
  vi: {
    'register.title': 'Đăng ký tài khoản mới',
    'register.username': 'Tên đăng nhập',
    'register.email': 'Email',
    'register.password': 'Mật khẩu',
    'register.confirm-password': 'Xác nhận mật khẩu',
    'register.submit': 'Đăng ký',
    'register.back-to-login': 'Đã có tài khoản? Đăng nhập',
    'register.success': 'Đăng ký thành công! Vui lòng kiểm tra email để xác minh.',
    'register.error.username-required': 'Vui lòng nhập tên đăng nhập.',
    'register.error.email-required': 'Vui lòng nhập email.',
    'register.error.password-required': 'Vui lòng nhập mật khẩu.',
    'register.error.confirm-password-required': 'Vui lòng xác nhận mật khẩu.',
    'register.error.invalid-email': 'Địa chỉ email không hợp lệ.',
    'register.error.passwords-mismatch': 'Mật khẩu và xác nhận mật khẩu không khớp.',
    'register.error.password-weak': 'Mật khẩu chưa đáp ứng yêu cầu độ phức tạp.',
    'register.loading': 'Đang xử lý...',
    'validation.password-complexity':
      '- Chỉ chứa chữ hoa, chữ thường, số và ký tự đặc biệt sau: !@#$%^&*()-_=+[]{}?/|\n' +
      '- Có ít nhất một chữ hoa\n' +
      '- Có ít nhất một chữ số\n' +
      '- Có ít nhất một ký tự đặc biệt\n' +
      '- Các ký tự đặc biệt nằm trong danh sách cho phép\n' +
      '- Có ít nhất một chữ thường',
    'validation.password-min-8': 'Mật khẩu dài tối thiểu 8 ký tự',
    'validation.password-max-40': 'Mật khẩu không quá 40 ký tự',
  },
  en: {
    'register.title': 'Create a new account',
    'register.username': 'Username',
    'register.email': 'Email',
    'register.password': 'Password',
    'register.confirm-password': 'Confirm password',
    'register.submit': 'Register',
    'register.back-to-login': 'Already have an account? Login',
    'register.success': 'Registration completed! Check your email for next steps.',
    'register.error.username-required': 'Please enter a username.',
    'register.error.email-required': 'Please enter your email address.',
    'register.error.password-required': 'Please enter a password.',
    'register.error.confirm-password-required': 'Please confirm your password.',
    'register.error.invalid-email': 'The email address is not valid.',
    'register.error.passwords-mismatch': 'Passwords do not match.',
    'register.error.password-weak': 'Password does not satisfy the complexity rules.',
    'register.loading': 'Saving your registration...',
    'validation.password-complexity':
      '- Use only uppercase, lowercase, digits and the following symbols: !@#$%^&*()-_=+[]{}?/|\n' +
      '- Include at least one uppercase letter\n' +
      '- Include at least one digit\n' +
      '- Include at least one special character\n' +
      '- Special characters must come from the allowed list\n' +
      '- Include at least one lowercase letter',
    'validation.password-min-8': 'Password must be at least 8 characters long',
    'validation.password-max-40': 'Password must not exceed 40 characters',
  },
  ja: {
    'register.title': '新しいアカウントを作成',
    'register.username': 'ユーザー名',
    'register.email': 'メール',
    'register.password': 'パスワード',
    'register.confirm-password': 'パスワードを確認',
    'register.submit': '登録',
    'register.back-to-login': 'すでにアカウントをお持ちですか？ログイン',
    'register.success': '登録が完了しました！メールをご確認ください。',
    'register.error.username-required': 'ユーザー名を入力してください。',
    'register.error.email-required': 'メールアドレスを入力してください。',
    'register.error.password-required': 'パスワードを入力してください。',
    'register.error.confirm-password-required': 'パスワード確認を入力してください。',
    'register.error.invalid-email': 'メールアドレスが無効です。',
    'register.error.passwords-mismatch': 'パスワードが一致しません。',
    'register.error.password-weak': 'パスワードが複雑さの要件を満たしていません。',
    'register.loading': '登録中...',
    'validation.password-complexity':
      '- 許可された文字（大文字・小文字・数字・記号 !@#$%^&*()-_=+[]{}?/|）のみを使用\n' +
      '- 少なくとも1つの大文字\n' +
      '- 少なくとも1つの数字\n' +
      '- 少なくとも1つの特殊記号\n' +
      '- 特殊記号は許可された一覧に含まれるもの\n' +
      '- 少なくとも1つの小文字',
    'validation.password-min-8': 'パスワードは最低8文字です',
    'validation.password-max-40': 'パスワードは最大40文字です',
  },
};

import { supportedLanguages } from '../ultis/language';

type Language = (typeof supportedLanguages)[number];
type TranslationMap = Record<string, string>;

export const loginTranslations: Record<Language, TranslationMap> = {
  vi: {
    'login.title': 'Cổng đăng nhập hệ thống bãi đỗ xe',
    'login.subtitle': 'Trường Đại học Sư phạm Kỹ thuật Hưng Yên',
    'login.description':
    'Hệ thống hỗ trợ quản lý bãi đỗ xe thông minh, cho phép người dùng truy cập để theo dõi phiên gửi xe, kiểm tra lịch sử, xử lý thanh toán và quản lý các thông tin liên quan một cách nhanh chóng, chính xác và tiện lợi.',    
    'login.usercode': 'Mã sinh viên / giảng viên',
    'login.password': 'Mật khẩu',
    'login.button': 'Đăng nhập',
    'login.loading': 'Đang xác thực...',
    'login.error.invalid': 'Sai mã sinh viên / giảng viên hoặc mật khẩu.',
    'login.required-first.usercode': 'Mã sinh viên / giảng viên',
    'login.required-first.password': 'Mật khẩu',
    'login.forgot-password': 'Quên mật khẩu?',
    'login.language-label': 'Ngôn ngữ giao diện',
    'login.logo-alt': 'Logo Trường Đại học SPKT Hưng Yên',
    'login.form-title': 'Chào mừng',
  },
  en: {
    'login.title': 'Parking system login portal',
    'login.subtitle': 'Hung Yen University of Technology and Education',
    'login.description':
    'The system provides a smart parking management platform, allowing users to access and monitor parking sessions, review history, handle payments, and manage related information efficiently and conveniently.',    
    'login.usercode': 'User code',
    'login.password': 'Password',
    'login.button': 'Log In',
    'login.loading': 'Authenticating...',
    'login.error.invalid': 'Incorrect user code or password.',
    'login.required-first.usercode': 'User code',
    'login.required-first.password': 'Password',
    'login.forgot-password': 'Forgot password?',
    'login.language-label': 'Interface language',
    'login.logo-alt': 'Hung Yen University of Technology and Education logo',
    'login.form-title': 'Welcome',
  },
  ja: {
    'login.title': '駐車場システムログインポータル',
    'login.subtitle': 'Hung Yen University of Technology and Education',
    'login.description':
    '本システムはスマートな駐車場管理を提供し、ユーザーは駐車セッションの確認、履歴の閲覧、支払い処理、および関連情報の管理を効率的に行うことができます。',    
    'login.usercode': 'ユーザーコード',
    'login.password': 'パスワード',
    'login.button': 'ログイン',
    'login.loading': '認証中...',
    'login.error.invalid': 'ユーザーコードまたはパスワードが正しくありません。',
    'login.required-first.usercode': 'ユーザーコード',
    'login.required-first.password': 'パスワード',
    'login.forgot-password': 'パスワードをお忘れですか？',
    'login.language-label': '表示言語',
    'login.logo-alt': 'ハンイェン工科教育大学のロゴ',
    'login.form-title': 'ようこそ',
  },
  th: {
    'login.title': 'พอร์ทัลเข้าสู่ระบบระบบจอดรถ',
    'login.subtitle': 'Hung Yen University of Technology and Education',
    'login.description':
    'ระบบนี้เป็นแพลตฟอร์มจัดการที่จอดรถอัจฉริยะ ซึ่งช่วยให้ผู้ใช้สามารถติดตามเซสชันการจอดรถ ตรวจสอบประวัติ ดำเนินการชำระเงิน และจัดการข้อมูลที่เกี่ยวข้องได้อย่างสะดวกและมีประสิทธิภาพ',    
    'login.usercode': 'รหัสผู้ใช้',
    'login.password': 'รหัสผ่าน',
    'login.button': 'เข้าสู่ระบบ',
    'login.loading': 'กำลังตรวจสอบ...',
    'login.error.invalid': 'รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    'login.required-first.usercode': 'รหัสผู้ใช้',
    'login.required-first.password': 'รหัสผ่าน',
    'login.forgot-password': 'ลืมรหัสผ่าน?',
    'login.language-label': 'ภาษาของอินเทอร์เฟซ',
    'login.logo-alt': 'โลโก้ของมหาวิทยาลัยเทคโนโลยีและการศึกษาเหงียน',
    'login.form-title': 'ยินดีต้อนรับ',
  },
};

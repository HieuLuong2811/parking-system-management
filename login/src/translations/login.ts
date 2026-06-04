import { supportedLanguages } from "../ultis/language";

type Language = (typeof supportedLanguages)[number];
type TranslationMap = Record<string, string>;

export const loginTranslations: Record<Language, TranslationMap> = {
  vi: {
    "login.title": "Cổng đăng nhập hệ thống bãi đỗ xe",
    "login.subtitle": "Trường Đại học Sư phạm Kỹ thuật Hưng Yên",
    "login.description":
      "Hệ thống hỗ trợ quản lý bãi đỗ xe thông minh, cho phép người dùng truy cập để theo dõi phiên gửi xe, kiểm tra lịch sử, xử lý thanh toán và quản lý các thông tin liên quan một cách nhanh chóng, chính xác và tiện lợi.",
    "login.usercode": "Mã người dùng",
    "login.password": "Mật khẩu",
    "login.button": "Đăng nhập",
    "login.loading": "Đang xác thực...",
    "login.error.invalid": "Sai mã người dùng hoặc mật khẩu.",
    "login.error.notFound": "Tài khoản không tồn tại hoặc mật khẩu không đúng.",
    "login.error.network":
      "Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng hoặc thử lại.",
    "login.error.server": "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.",
    "login.required-first.usercode": "Mã người dùng",
    "login.required-first.password": "Mật khẩu",
    "login.forgot-password": "Quên mật khẩu?",
    "login.language-label": "Ngôn ngữ giao diện",
    "login.logo-alt": "Logo Trường Đại học SPKT Hưng Yên",
    "login.form-title": "Chào mừng",
  },
  en: {
    "login.title": "Parking system login portal",
    "login.subtitle": "Hung Yen University of Technology and Education",
    "login.description":
      "The system provides a smart parking management platform, allowing users to access and monitor parking sessions, review history, handle payments, and manage related information efficiently and conveniently.",
    "login.usercode": "User code",
    "login.password": "Password",
    "login.button": "Log In",
    "login.loading": "Authenticating...",
    "login.error.invalid": "Incorrect user code or password.",
    "login.error.notFound": "Account not found or password is incorrect.",
    "login.error.network":
      "Unable to connect to server. Please check your network and try again.",
    "login.error.server": "Server error. Please try again later.",
    "login.required-first.usercode": "User code",
    "login.required-first.password": "Password",
    "login.forgot-password": "Forgot password?",
    "login.language-label": "Interface language",
    "login.logo-alt": "Hung Yen University of Technology and Education logo",
    "login.form-title": "Welcome",
  },
  th: {
    "login.title": "พอร์ทัลเข้าสู่ระบบระบบจอดรถ",
    "login.subtitle": "Hung Yen University of Technology and Education",
    "login.description":
      "ระบบนี้เป็นแพลตฟอร์มจัดการที่จอดรถอัจฉริยะ ซึ่งช่วยให้ผู้ใช้สามารถติดตามเซสชันการจอดรถ ตรวจสอบประวัติ ดำเนินการชำระเงิน และจัดการข้อมูลที่เกี่ยวข้องได้อย่างสะดวกและมีประสิทธิภาพ",
    "login.usercode": "รหัสผู้ใช้",
    "login.password": "รหัสผ่าน",
    "login.button": "เข้าสู่ระบบ",
    "login.loading": "กำลังตรวจสอบ...",
    "login.error.invalid": "รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
    "login.error.notFound": "ไม่พบบัญชีผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
    "login.error.network":
      "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ โปรดตรวจสอบเครือข่ายแล้วลองใหม่",
    "login.error.server": "เซิร์ฟเวอร์มีปัญหา โปรดลองใหม่ภายหลัง",
    "login.required-first.usercode": "รหัสผู้ใช้",
    "login.required-first.password": "รหัสผ่าน",
    "login.forgot-password": "ลืมรหัสผ่าน?",
    "login.language-label": "ภาษาของอินเทอร์เฟซ",
    "login.logo-alt": "โลโก้ของมหาวิทยาลัยเทคโนโลยีและการศึกษาเหงียน",
    "login.form-title": "ยินดีต้อนรับ",
  },
  lo: {
    "login.title": "ພອດທັນການເຂົ້າລະບົບລະບົບບ່ອນຈອດລົດ",
    "login.subtitle": "ມະຫາວິທະຍາໄລເຕັກໂນໂລຊີ ແລະ ການສຶກສາ ຮຸງເຢນ",
    "login.description":
      "ລະບົບນີ້ເປັນແພລດຟອມຈັດການບ່ອນຈອດລົດອັດສະລິຍະ ຊ່ວຍໃຫ້ຜູ້ໃຊ້ສາມາດຕິດຕາມການຈອດລົດ, ກວດເບິ່ງປະຫວັດ, ຈັດການການຊຳລະເງິນ ແລະ ຂໍ້ມູນທີ່ກ່ຽວຂ້ອງໄດ້ຢ່າງສະດວກ ແລະ ມີປະສິດທິພາບ.",
    "login.usercode": "ລະຫັດຜູ້ໃຊ້",
    "login.password": "ລະຫັດຜ່ານ",
    "login.button": "ເຂົ້າລະບົບ",
    "login.loading": "ກຳລັງກວດສອບ...",
    "login.error.invalid": "ລະຫັດຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ",
    "login.error.notFound": "ບໍ່ພົບບັນຊີ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ",
    "login.error.network":
      "ບໍ່ສາມາດເຊື່ອມຕໍ່ໄປຫາເຊີບເວີໄດ້. ກະລຸນາກວດສອບເຄືອຂ່າຍ ຫຼື ລອງໃໝ່",
    "login.error.server": "ເຊີບເວີມີບັນຫາ. ກະລຸນາລອງໃໝ່ພາຍຫຼັງ",
    "login.required-first.usercode": "ລະຫັດຜູ້ໃຊ້",
    "login.required-first.password": "ລະຫັດຜ່ານ",
    "login.forgot-password": "ລືມລະຫັດຜ່ານ?",
    "login.language-label": "ພາສາຂອງອິນເຕີເຟດ",
    "login.logo-alt": "ໂລໂກ້ມະຫາວິທະຍາໄລເຕັກໂນໂລຊີ ແລະ ການສຶກສາ ຮຸງເຢນ",
    "login.form-title": "ຍິນດີຕ້ອນຮັບ",
  },
};

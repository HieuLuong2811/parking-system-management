const th = {
  common: {
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
    next: 'Next',
    back: 'Back',
  },

  plans: {
    title: 'แพ็กเกจที่จอดรถ',
    subtitle: 'เลือกแพ็กเกจที่เหมาะสมและดำเนินการชำระเงิน',
    registerTitle: 'ลงทะเบียนที่จอดรถ',
    registerDesc:
      'เลือกแพ็กเกจตามภาคการศึกษา เลือกประเภทยานพาหนะ และชำระเงินเพื่อสำรองที่จอด',

    loading: 'กำลังโหลดรายการแพ็กเกจ...',
    loadError: 'ไม่สามารถโหลดรายการแพ็กเกจได้',
    empty: 'ยังไม่มีแพ็กเกจที่ใช้งานได้',

    current: 'กำลังใช้งาน',
    register: 'ลงทะเบียน',

    basic: 'พื้นฐาน',
    startup: 'เริ่มต้น',
    enterprise: 'องค์กร',

    perDay: '/ วัน',

    monthlyPayment: 'รองรับการชำระเงินรายเดือน',
    fullPayment: 'รองรับการชำระเงินเต็มจำนวน',
    noFullPayment: 'ไม่รองรับการชำระเงินเต็มจำนวน',

    maxLicensedVehicle: 'สูงสุด 1 คันที่มีป้ายทะเบียน',
    maxUnlicensedVehicle: 'สูงสุด 1 คันที่ไม่มีป้ายทะเบียน',

    dailyFee: 'ค่าบริการรายวัน: {{price}} VND',
    after18Free: 'ฟรีหลัง 18:00 น.',
    after18Fee: 'หลัง 18:00 น.: {{price}} VND',
  },

  checkout: {
    title: 'ชำระเงินแพ็กเกจ',
    subtitle: 'กรอกข้อมูลสำหรับแพ็กเกจ {{plan}} ให้ครบถ้วน',

    stepVehicle: 'รถ',
    stepTerm: 'ภาคเรียน',
    stepPaymentMethod: 'วิธีชำระ',
    stepConfirm: 'ยืนยัน',

    selectLicensedVehicle: 'เลือกรถที่มีป้ายทะเบียน',
    selectUnlicensedVehicle: 'เลือกรถที่ไม่มีป้ายทะเบียน',
    noLicensedVehicle: 'ยังไม่มีรถที่มีป้ายทะเบียน',
    noUnlicensedVehicle: 'ยังไม่มีรถที่ไม่มีป้ายทะเบียน',
    noLicensePlate: 'ไม่มีป้ายทะเบียน',

    selectTerm: 'เลือกภาคการศึกษา',
    noTerm: 'ยังไม่มีภาคการศึกษาที่ใช้งานได้',
    selectTermFirst: 'กรุณาเลือกภาคการศึกษาก่อน',

    selectPaymentMethod: 'เลือกวิธีการชำระเงิน',
    noAvailablePaymentMethod:
      'แพ็กเกจนี้ยังไม่มีวิธีการชำระเงินที่ใช้งานได้',
    pricingLoadError: 'ไม่สามารถโหลดราคาได้ กรุณาลองอีกครั้ง',

    monthlyPayment: 'ชำระเงินรายเดือน',
    monthlyPaymentDesc:
      'ระบบจะสร้างใบแจ้งหนี้และส่งการแจ้งเตือนการชำระเงินทุกเดือน',
    fullPayment: 'ชำระเงินเต็มจำนวน',
    fullPaymentDesc:
      'ชำระครั้งเดียวสำหรับระยะเวลาการลงทะเบียนทั้งหมด',
    recommended: 'แนะนำ',

    summary: 'สรุปการชำระเงิน',
    plan: 'แพ็กเกจ',
    term: 'ภาคการศึกษา',
    vehicle: 'ยานพาหนะ',
    paymentMethod: 'วิธีชำระเงิน',
    amount: 'จำนวนเงิน',

    paymentNoteTitle: 'ข้อมูลการชำระเงิน',
    monthlyPaymentNote:
      'หลังจากยืนยัน ระบบจะสร้างใบแจ้งหนี้รายเดือนและส่งการแจ้งเตือนการชำระเงิน',
    fullPaymentNote:
      'กด “ชำระเงินผ่าน MoMo” เพื่อเปิด MoMo หรือเบราว์เซอร์และดำเนินการชำระเงินให้เสร็จสิ้น',

    payWithMomo: 'ชำระเงินผ่าน MoMo',
    setupRecurring: 'ยืนยันการสมัคร',
    recurringSetupSuccess: 'ตั้งค่าการสมัครรายเดือนสำเร็จแล้ว',

    missingData:
      'กรุณาเลือกยานพาหนะ ภาคการศึกษา และวิธีการชำระเงินให้ครบถ้วน',
    noPaymentUrl: 'ไม่ได้รับ URL สำหรับชำระเงินผ่าน MoMo',
    cannotOpenPaymentUrl:
      'อุปกรณ์นี้ไม่สามารถเปิด URL สำหรับชำระเงินผ่าน MoMo ได้',
    redirectingMomoTitle: 'กำลังเปลี่ยนไปยัง MoMo',
    redirectingMomoAndroid:
      'หากแอปไม่เปิดกลับมาอัตโนมัติ คุณสามารถกลับมาที่แอปด้วยตนเองหลังจากชำระเงิน',
    redirectingMomoIos:
      'คุณสามารถกลับมาที่แอปหลังจากชำระเงินได้',
    paymentFailed: 'การชำระเงินผ่าน MoMo ล้มเหลว',
    noSelectedPlan: 'ยังไม่ได้เลือกแพ็กเกจที่จอดรถ',
  },

  paymentReturn: {
    title: 'สถานะการชำระเงิน',
    pendingDesc:
      'คุณกำลังถูกนำไปยังหน้าชำระเงิน หลังจากชำระเงินเสร็จแล้ว กรุณากลับมาที่แอปเพื่อตรวจสอบสถานะ',
    defaultDesc:
      'หากคุณเพิ่งชำระเงินเสร็จ กรุณากลับมาที่แอปเพื่อตรวจสอบสถานะการชำระเงิน',
    invoice: 'ใบแจ้งหนี้',
    backToPlans: 'กลับไปยังแพ็กเกจที่จอดรถ',
  },

  auth: {
    loginTitle: 'เข้าสู่ระบบ',
    loginSubtitle: 'เข้าสู่ระบบจัดการที่จอดรถอัจฉริยะ',
    userCode: 'รหัสผู้ใช้',
    userCodePlaceholder: 'กรอกรหัสผู้ใช้',
    password: 'รหัสผ่าน',
    passwordPlaceholder: 'กรอกรหัสผ่าน',
    loginButton: 'เข้าสู่ระบบ',
    forgotPassword: 'ลืมรหัสผ่าน?',
    language: 'ภาษา',
    forgotTitle: 'ลืมรหัสผ่าน',
    forgotSubtitle: 'กรอกรหัสผู้ใช้เพื่อดำเนินการต่อ',
    sendRequest: 'ส่งคำขอ',

    stepRequest: 'Request',
    stepVerify: 'Verify',
    stepReset: 'Reset',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    resend: 'Resend code',
    resendIn: 'Resend in',
    codeSent: 'Verification code sent to your email.',
    verificationCode: 'Verification code',
    codePlaceholder: '6 digits',
    userCodeRequired: 'User code is required',
    invalidEmail: 'Invalid email',
    invalidCode: 'Invalid or expired code',
    requestFailed: 'Request failed',
    verifyFailed: 'Verification failed',
    resetFailed: 'Reset failed',
    newPassword: 'New password',
    newPasswordPlaceholder: 'Enter new password',
    confirmPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'Re-enter new password',
    updatePassword: 'Update password',
    passwordUpdated: 'Password updated.',
    passwordRules: 'Password does not meet requirements',
    passwordMismatch: 'Passwords do not match',
    passwordRuleText:
      '8-20 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special (!@#$%^&*()_-+=[]{}?/|)',

    backToLogin: 'กลับไปหน้าเข้าสู่ระบบ',
    fieldRequired: 'จำเป็นต้องกรอก',
  },
};

export default th;

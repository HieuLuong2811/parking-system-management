const th = {
  common: {
    all: 'ทั้งหมด',
    success: 'สำเร็จ',
    error: 'เกิดข้อผิดพลาด',
    loading: 'กำลังโหลด...',
    next: 'ถัดไป',
    back: 'ย้อนกลับ',
    retry: 'ลองใหม่',
    cancel: 'ยกเลิก',
    resetChanges: 'รีเซ็ต',
    continue: 'ดําเนินการต่อ',
    vehicleType: {
      motorbike: 'รถจักรยานยนต์',
      bicycle: 'จักรยาน',
      electricBicycle: 'จักรยานไฟฟ้า',
    }
  },

  tabs: {
    home: 'หน้าหลัก',
    plan: 'แพ็กเกจ',
    sessions: 'รอบจอดรถ',
    invoices: 'ใบแจ้งหนี้',
    profile: 'โปรไฟล์',
  },

  drawer: {
    title: 'เมนู',
    subtitle: 'เข้าถึงบัญชีอย่างรวดเร็ว',
    noUserInfo: 'ไม่มีข้อมูลผู้ใช้',
    quickAccess: 'ทางลัด',
    language: 'ภาษา',
    currentLanguage: 'ภาษาปัจจุบัน',
    profileDesc: 'ดูและอัปเดตข้อมูลบัญชีของคุณ',
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
    inUseBadge: "กำลังใช้งาน",
    viewCurrentPlan: "ดูแพ็กเกจที่ลงทะเบียน",
    currentPlanFallback: 'แพ็กเกจปัจจุบัน',
    overrideActivePlanDialog: {
      title: 'คุณมีแพ็กเกจที่ต้องดำเนินการอยู่',
      message:
        'คุณมีแพ็กเกจ {{plan}} ที่มีสถานะ {{status}} หากลงทะเบียนแพ็กเกจใหม่ แพ็กเกจเดิมจะถูกยกเลิกแต่ยอดค้างชำระจะยังถูกติดตามต่อไป ยอดคงเหลือ: {{debt}} คุณต้องการดำเนินการต่อหรือไม่?',
    },  
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

  parkingHistory: {
    title: 'ประวัติการเช็คอินเช็คเอาท์',
    subtitle:
      'ติดตามประวัติการจอดรถ เวลาเข้า/ออก และสถานะของรายการจอดรถของคุณ',

    loading: 'กำลังโหลดรายการจอดรถ...',
    filter: 'ตัวกรอง',
    fromDate: 'จากวันที่',
    toDate: 'ถึงวันที่',
    selectDate: 'เลือกวันที่',
    clearFilters: 'ล้าง',

    unknownVehicle: 'ยานพาหนะ',
    noLicensePlate: 'ไม่มีป้ายทะเบียน',

    checkIn: 'เช็กอิน',
    checkOut: 'เช็กเอาต์',
    notYet: 'ยังไม่มี',
    status: {
      active: 'กําลังจอด',
      done: 'จอดเสร็จแล้ว',    
    },
    amount: 'จำนวนเงิน',

    empty: 'ยังไม่มีรายการจอดรถ',
    loadError: 'ไม่สามารถโหลดรายการจอดรถได้',

    prev: 'ก่อนหน้า',
    next: 'ถัดไป',
    pageOf: '{{page}} / {{totalPages}}',
    showingRange: 'แสดง {{from}}-{{to}} / {{total}} รายการ',
  },

  invoices: {
    title: 'ใบแจ้งหนี้',
    subtitle: 'ติดตามใบแจ้งหนี้และชำระยอดค้างของคุณ',
    loading: 'กำลังโหลดใบแจ้งหนี้...',
    loadError: 'ไม่สามารถโหลดใบแจ้งหนี้ได้',
    empty: 'ยังไม่มีใบแจ้งหนี้',

    filters: {
      title: 'ตัวกรอง',
      from: 'จากวันที่',
      to: 'ถึงวันที่',
      selectDate: 'เลือกวันที่',
      clear: 'ล้าง',
    },

    card: {
      invoice: 'ใบแจ้งหนี้',
      createdAt: 'วันที่สร้าง',
      paymentMethod: 'วิธีชำระเงิน',
      copySuccess: "คัดลอกรหัสใบแจ้งหนี้ไปยังคลิปบอร์ดแล้ว",
    },

    status: {
      paid: 'ชำระแล้ว',
      pending: 'รอชำระเงิน',
      failed: 'ล้มเหลว',
    },

    actions: {
      payWithMomo: 'ชำระเงินผ่าน MoMo',
      retryPayment: 'ชำระเงินอีกครั้ง',
      momoMissingUrl: 'ไม่ได้รับ URL สำหรับชำระเงินผ่าน MoMo',
      cannotOpenPaymentUrl: 'อุปกรณ์นี้ไม่สามารถเปิด URL สำหรับชำระเงินผ่าน MoMo ได้',
    },

    pagination: {
      prev: 'ก่อนหน้า',
      next: 'ถัดไป',
      pageOf: '{{page}} / {{totalPages}}',
      showingRange: 'แสดง {{from}}-{{to}} / {{total}} ใบแจ้งหนี้',
    },
  },

  profile: {
    title: 'ข้อมูลส่วนตัว',
    subtitle: 'จัดการข้อมูลบัญชี ยานพาหนะ และแพ็กเกจที่จอดรถของคุณ',

    accountInfo: 'ข้อมูลบัญชี',
    userCode: 'รหัสผู้ใช้',
    fullName: 'ชื่อ-นามสกุล',
    email: 'อีเมล',
    phoneNumber: 'เบอร์โทรศัพท์',

    fullNamePlaceholder: 'กรอกชื่อ-นามสกุล',
    emailPlaceholder: 'กรอกอีเมล',
    phoneNumberPlaceholder: 'กรอกเบอร์โทรศัพท์',

    fullNameRequired: 'กรุณากรอกชื่อ-นามสกุล',
    emailRequired: 'กรุณากรอกอีเมล',
    invalidEmail:
      'อีเมลไม่ถูกต้องหรือมีอักขระพิเศษในชื่อโดเมน',
    invalidPhone: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก',

    updateSuccess: 'อัปเดตข้อมูลโปรไฟล์สำเร็จ',
    updateFailed: 'อัปเดตข้อมูลโปรไฟล์ไม่สำเร็จ',
    saveChanges: 'บันทึกการเปลี่ยนแปลง',

    noUserInfo: 'ยังไม่ได้โหลดข้อมูลผู้ใช้',

    personalManagement: 'การจัดการส่วนบุคคล',
    vehicles: 'ยานพาหนะ',
    vehiclesDesc: 'จัดการรายการยานพาหนะที่ใช้สำหรับจอดรถ',
    subscriptions: 'แพ็กเกจที่ลงทะเบียน',
    subscriptionsDesc:
      'ดูแพ็กเกจที่จอดรถปัจจุบันและประวัติการลงทะเบียน',

    account: 'บัญชี',
    logout: 'ออกจากระบบ',
    logoutDesc: 'ออกจากบัญชีปัจจุบัน',

    logoutConfirmTitle: 'ยืนยันการออกจากระบบ',
    logoutConfirmMessage:
      'คุณแน่ใจหรือไม่ว่าต้องการออกจากบัญชีนี้?',
  },

  userSubscriptions: {
    title: 'แพ็กเกจที่ลงทะเบียน',
    subtitle: 'ติดตามแพ็กเกจที่จอดรถ ภาคการศึกษา และสถานะการใช้งานของคุณ',
    loadError: 'ไม่สามารถโหลดรายการแพ็กเกจที่ลงทะเบียนได้',
    filterTitle: 'ตัวกรองสถานะ',
    empty: 'ยังไม่มีแพ็กเกจที่ลงทะเบียน',
    emptyDesc: 'แพ็กเกจที่จอดรถที่คุณลงทะเบียนจะแสดงที่นี่',
    subscriptionId: 'รหัส: {{id}}',
    term: 'ภาคการศึกษา',
    period: 'ระยะเวลา',
    totalAmount: 'ยอดรวม',
    paidAmount: 'ชำระแล้ว',
    debtAmount: 'คงเหลือ',
    status: {
      active: 'ใช้งานอยู่',
      payment_due: 'ถึงกำหนดชำระ',
      overdue: 'เกินกำหนด',
      canceled: 'ยกเลิกแล้ว',
      suspended: 'ถูกระงับ',
      inactive: 'ไม่ได้ใช้งาน',
    },
  },

  vehicles: {
    title: "ยานพาหนะ",
    subtitle: "จัดการยานพาหนะที่มีและไม่มีป้ายทะเบียนของคุณ",
    loadError: "ไม่สามารถโหลดรายการยานพาหนะได้",

    registerPlan: "ลงทะเบียนแพ็กเกจที่จอดรถ",
    addVehicle: "เพิ่มยานพาหนะ",

    withPlate: "มีป้ายทะเบียน",
    withoutPlate: "ไม่มีป้ายทะเบียน",
    searchPlatePlaceholder: "ค้นหาด้วยป้ายทะเบียน",

    empty: "ยังไม่มียานพาหนะ",
    emptyDesc: "เพิ่มยานพาหนะเพื่อสมัครแพ็กเกจที่จอดรถ",

    autoBarcode: "ระบบจะสร้างบาร์โค้ดอัตโนมัติ",
    vehicleId: "รหัสยานพาหนะ",
    createdAt: "วันที่สร้าง",

    edit: "แก้ไข",
    delete: "ลบ",

    createSuccess: "เพิ่มยานพาหนะแล้ว",
    updateSuccess: "อัปเดตยานพาหนะแล้ว",
    deleteSuccess: "ลบยานพาหนะแล้ว",

    saveFailed: "ไม่สามารถบันทึกยานพาหนะได้",
    deleteFailed: "ไม่สามารถลบยานพาหนะได้",

    deleteConfirmTitle: "ลบยานพาหนะ",
    deleteConfirmMessage: "คุณแน่ใจหรือไม่ว่าต้องการลบยานพาหนะนี้?",

    types: {
      motorbike: "รถจักรยานยนต์",
      bicycle: "จักรยาน",
      electric_bicycle: "จักรยานไฟฟ้า",
    },

    form: {
      missingUser: "ไม่พบข้อมูลผู้ใช้",
      vehicleType: "ประเภทยานพาหนะ",
      vehicleTypeRequired: "กรุณาเลือกประเภทยานพาหนะ",
      invalidVehicleType: "ประเภทยานพาหนะไม่ถูกต้อง",
      licensePlate: "ป้ายทะเบียน",
      licensePlateRequired: "กรุณากรอกป้ายทะเบียน",
      licensePlatePlaceholder: "เช่น 30K12345",
      barcodeNote:
        "ยานพาหนะที่ไม่มีป้ายทะเบียน ระบบจะสร้างบาร์โค้ดให้อัตโนมัติหลังจากบันทึก",
    },

    modal: {
      createTitle: "เพิ่มยานพาหนะ",
      editTitle: "อัปเดตยานพาหนะ",
      subtitle: "เลือกประเภทยานพาหนะและกรอกข้อมูลที่จำเป็น",
      create: "บันทึกยานพาหนะ",
      save: "บันทึกการเปลี่ยนแปลง",
    },
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

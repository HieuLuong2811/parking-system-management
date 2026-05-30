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
    vehicleMode: {
      licensed: 'มีป้ายทะเบียน',
      unlicensed: 'ไม่มีป้ายทะเบียน',
    },
    parkingAccessCardStatus: {
      available: 'พร้อมใช้งาน',
      assigned: 'ถูกใช้งาน',
      active: 'กำลังใช้งาน',
      disable: 'ถูกระงับ',
      lost: 'สูญหาย',
    },
    userWalletStatus: {
      active: 'กำลังใช้งาน',
      locked: 'ถูกระงับ',
    },
    paymentMethod: {
      CASH: "เงินสด",
      MOMO: "MoMo",
      WALLET: "กระเป๋าเงิน",
      SYSTEM: "ระบบ",
    },
    dateRange: {
      invalidDateRange: "วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น",
    },
  },

  tabs: {
    home: 'หน้าหลัก',
    plan: 'แพ็กเกจ',
    sessions: 'รอบจอดรถ',
    plans: 'แพ็กเกจ',
    profile: 'โปรไฟล์',
  },

  notifications: {
    title: 'การแจ้งเตือน',
    viewAll: 'ดูทั้งหมด',
    empty: 'ยังไม่มีการแจ้งเตือน',
    payment: {
      title: 'การชำระเงิน',
      success: 'ชำระเงินสำเร็จ{{invoicePart}}',
      failed: 'ชำระเงินล้มเหลว{{invoicePart}}',
    },
    topUp: {
      title: 'เติมเงิน',
      success: 'เติมเงินสำเร็จ{{amountPart}}{{invoicePart}}',
      failed: 'เติมเงินล้มเหลว{{invoicePart}}',
    },
    subscription: {
      title: 'แพ็กเกจ',
      success: 'ชำระแพ็กเกจสำเร็จ{{invoicePart}}',
      pending: 'กำลังรอชำระแพ็กเกจ{{invoicePart}}',
      failed: 'ชำระแพ็กเกจล้มเหลว{{invoicePart}}',
    },
    filter: {
      all: 'ทั้งหมด',
      system: 'ระบบ',
      payment: 'การชำระเงิน',
      timeAll: 'ทุกช่วงเวลา',
      last7d: '7 วันที่ผ่านมา',
      last30d: '30 วันที่ผ่านมา',
    },
  },

  transactions: {
    empty: 'ไม่พบรายการธุรกรรม',
    invoice: 'ใบแจ้งหนี้',
    tx: 'ธุรกรรม',
    filters: {
      title: 'ตัวกรอง',
      fromDate: 'ตั้งแต่วันที่',
      toDate: 'ถึงวันที่',
      invoiceId: 'รหัสใบแจ้งหนี้',
      invoiceIdPlaceholder: 'กรอกรหัสใบแจ้งหนี้',
      transactionCode: 'รหัสธุรกรรม',
      transactionCodePlaceholder: 'กรอกรหัสธุรกรรม',
      direction: 'ทิศทางเงิน',
      type: 'ประเภท',
      clear: 'ล้าง',
    },
    direction: {
      all: 'ทั้งหมด',
      in: 'เงินเข้า',
      out: 'เงินออก',
    },
    type: {
      all: 'ทั้งหมด',
      TOP_UP: 'เติมเงิน',
      SUBSCRIPTION_FULL_PAYMENT: 'ชำระแพ็กเกจ',
      MONTHLY_CHARGE: 'หักรายเดือน',
      INVOICE_DIRECT_PAYMENT: 'ชำระใบแจ้งหนี้',
      REFUND: 'คืนเงิน',
      ADMIN_ADJUSTMENT: 'ปรับโดยระบบ',
    },
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
    discount: 'ส่วนลด {{discount}}%',

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

    pay: 'ชำระเงิน',
    payWithMomo: 'ชำระเงินผ่าน MoMo',
    payWithWallet: 'ชำระเงินด้วยวอลเล็ต',
    choosePayMethod: 'เลือกวิธีชำระเงิน',
    walletBalance: 'ยอดเงินวอลเล็ต: {{balance}}',
    insufficientWallet: 'ยอดเงินวอลเล็ตไม่เพียงพอ โปรดเติมเงินหรือเลือก MoMo',
    walletPaymentSuccess: 'ชำระเงินด้วยวอลเล็ตสำเร็จ',
    momoNote: 'ไปที่ MoMo เพื่อชำระเงินให้เสร็จสิ้น',
    monthlyWalletRequired:
      'การชำระรายเดือนต้องใช้วอลเล็ต โปรดตรวจสอบให้แน่ใจว่ายอดเงินเพียงพอสำหรับเดือนแรก',
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

  wallet: {
    title: 'กระเป๋าเงินอิเล็กทรอนิกส์',
    screenTitle: 'กระเป๋าเงินอิเล็กทรอนิกส์',
    atmCardTitle: 'บัตร ATM',
    balance: 'ยอดคงเหลือ',
    availableBalance: 'ยอดเงินที่ใช้ได้',
    status: 'สถานะ',
    topupAmount: 'จำนวนเงินที่เติม',
    topupAmountPlaceholder: 'กรอกจำนวนเงิน',
    topup: 'เติมเงิน',
    confirmTopup: 'ยืนยันการเติมเงิน',
    topupWarning:
      'กรุณาเติมเงินเท่าที่จำเป็นสำหรับการชำระเงินเท่านั้น ระบบยังไม่รองรับการถอนเงิน หากต้องการความช่วยเหลือ กรุณาติดต่อฝ่ายกิจการนักศึกษา',
    invalidAmount: 'จำนวนเงินไม่ถูกต้อง',
    noPaymentUrl: 'ไม่ได้รับ URL สำหรับชำระเงิน MoMo',
    cannotOpenPaymentUrl: 'อุปกรณ์นี้ไม่สามารถเปิด URL ชำระเงิน MoMo ได้',
    redirectingMomo: 'กำลังเปลี่ยนเส้นทางไปยัง MoMo...',
    topupFailed: 'เติมเงินไม่สำเร็จ',
    unavailable: 'ไม่สามารถโหลดข้อมูลกระเป๋าเงินได้',

    transactionsHistory: 'ประวัติการทำรายการ',
    recentTransactions: 'รายการล่าสุด',
    seeAll: 'ดูทั้งหมด',
    all: 'ทั้งหมด',
    income: 'รายรับ',
    expense: 'รายจ่าย',
    history: 'ประวัติ',
    card: 'บัตร',
  },

  presentCard: {
    title: 'แสดงบัตรเข้าถึงที่จอดรถ',
    subtitle:
      'ใช้รหัสบัตรดิจิทัลเพื่อยืนยันตัวตนเมื่อเข้า/ออกจากลานจอดรถของโรงเรียน',
    schoolName: 'TRƯỜNG ĐẠI HỌC SPKT HƯNG YÊN',
    cardType: 'บัตรเข้าถึงที่จอดรถสำหรับนักเรียน',
    loading: 'กำลังโหลดข้อมูลบัตร...',
    loadError: 'ไม่สามารถโหลดข้อมูลบัตรได้',
    fullName: 'ชื่อนักเรียน:',
    userCode: 'รหัสผู้ใช้:',
    noUser: 'ไม่มีข้อมูลผู้ใช้.',
    noCard: 'ไม่พบบัตรเข้าถึงที่จอดรถ.',
    noBarcode: 'ไม่มีบาร์โค้ดที่ใช้งานได้.',
    warning: {
      title: 'ข้อควรระวังในการใช้บัตรจอดรถ',
      rule1: 'บัตรจอดรถสำหรับนักเรียนมีอายุใช้งานตลอดระยะเวลาการศึกษาของนักเรียนที่โรงเรียน',
      rule2: 'บัตรจอดรถสำหรับนักเรียนใช้เพื่อระบุตัวตนนักเรียนเมื่อจอดรถในวิทยาเขต',
      rule3: 'นักเรียนไม่ได้รับอนุญาตให้ยืม ลบ หรือแก้ไขข้อมูลบนบัตรโดยไม่ได้รับอนุญาต',
      rule4: 'ในกรณีที่บัตรประจำตัวนักศึกษาสูญหายหรือชำรุด โปรดติดต่อสำนักงานกิจการนักศึกษาโดยทันที (ผ่านทางแผนกบริการแบบครบวงจร) เพื่อขอออกบัตรใหม่.',
    },
    reportLostSuccess: 'บัตรถูกรายงานเป็นสูญหายแล้ว.',
    reportLostFailed: 'ไม่สามารถรายงานบัตรเป็นสูญหายได้.',
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
    vehicleMode: 'Vehicle mode',
    modeAll: 'All',
    modeLicensed: 'Licensed',
    modeUnlicensed: 'Unlicensed',
    licensePlate: 'License plate',
    licensePlatePlaceholder: 'Search by license plate',

    unknownVehicle: 'ยานพาหนะ',
    noLicensePlate: 'ไม่มีป้ายทะเบียน',

    checkIn: 'เช็กอิน',
    checkOut: 'เช็กเอาต์',
    notYet: 'ยังไม่มี',
    status: {
      active: 'กําลังจอด',
      done: 'เสร็จสิ้น',
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
      status: 'สถานะ',
      statusAll: 'ทุกสถานะ',
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
    subtitle: 'จัดการข้อมูลบัญชีและแพ็กเกจที่จอดรถของคุณ',

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
    subscriptions: 'แพ็กเกจที่ลงทะเบียน',
    subscriptionsDesc:
      'ดูแพ็กเกจที่จอดรถปัจจุบันและประวัติการลงทะเบียน',

    personalInfo: "ข้อมูลส่วนตัว",
    changePassword: "เปลี่ยนรหัสผ่าน",
    transactionHistory: "ประวัติการทำธุรกรรม",
    invoice: "ใบแจ้งหนี้",
    currentPassword: "รหัสผ่านปัจจุบัน",
    currentPasswordPlaceholder: "กรอกรหัสผ่านปัจจุบัน",
    currentPasswordRequired: "กรุณากรอกรหัสผ่านปัจจุบัน",
    changePasswordSuccess: "เปลี่ยนรหัสผ่านสำเร็จ",
    changePasswordFailed: "เปลี่ยนรหัสผ่านไม่สำเร็จ",

    account: 'บัญชี',
    logout: 'ออกจากระบบ',

    logoutConfirmTitle: 'ยืนยันการออกจากระบบ',
    logoutConfirmMessage:
      'คุณแน่ใจหรือไม่ว่าต้องการออกจากบัญชีนี้?',
  },

  userSubscriptions: {
    subscriptionCode: 'รหัสการสมัคร',
    title: 'แพ็กเกจที่ลงทะเบียน',
    subtitle: 'ติดตามแพ็กเกจที่จอดรถ ภาคการศึกษา และสถานะการใช้งานของคุณ',
    loadError: 'ไม่สามารถโหลดรายการแพ็กเกจที่ลงทะเบียนได้',
    filterTitle: 'ตัวกรองสถานะ',
    empty: 'ยังไม่มีแพ็กเกจที่ลงทะเบียน',
    emptyDesc: 'แพ็กเกจที่จอดรถที่คุณลงทะเบียนจะแสดงที่นี่',
    subscriptionId: 'รหัส: {{id}}',
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

    stepRequest: 'คำขอ',
    stepVerify: 'ยืนยัน',
    stepReset: 'รีเซ็ต',
    email: 'อีเมล',
    emailPlaceholder: 'กรอกอีเมลของคุณ',
    resend: 'ส่งรหัสใหม่',
    resendIn: 'ส่งใหม่ใน',
    codeSent: 'รหัสยืนยันถูกส่งไปยังอีเมลของคุณแล้ว',
    verificationCode: 'รหัสยืนยัน',
    codePlaceholder: 'กรอกรหัสยืนยัน',
    userCodeRequired: 'กรุณากรอกรหัสผู้ใช้',
    invalidEmail: 'อีเมลไม่ถูกต้อง',
    invalidCode: 'รหัสไม่ถูกต้องหรือหมดอายุ',
    requestFailed: 'การขอล้มเหลว',
    verifyFailed: 'การยืนยันล้มเหลว',
    resetFailed: 'การรีเซ็ตล้มเหลว',
    loginFailed: 'เข้าสู่ระบบล้มเหลว',
    networkError: 'ข้อผิดพลาดเครือข่าย: ไม่สามารถเชื่อมต่อ API ได้ หากรันบนโทรศัพท์/Android emulator อย่าใช้ localhost; ให้ใช้ IP เครื่องหรือ 10.0.2.2.',
    userOrPasswordInvalid: 'รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    userNotFound: 'ไม่พบผู้ใช้',
    emailMismatch: 'อีเมลไม่ตรงกับรหัสผู้ใช้',
    userOrEmailInvalid: 'รหัสผู้ใช้หรืออีเมลไม่ถูกต้อง',
    newPassword: 'รหัสผ่านใหม่',
    newPasswordPlaceholder: 'กรอกรหัสผ่านใหม่',
    confirmPassword: 'ยืนยันรหัสผ่าน',
    confirmPasswordPlaceholder: 'กรอกรหัสผ่านใหม่อีกครั้ง',
    updatePassword: 'อัปเดตรหัสผ่าน',
    passwordUpdated: 'อัปเดตรหัสผ่านแล้ว',
    passwordRules: 'รหัสผ่านไม่ตรงตามข้อกำหนด',
    passwordMismatch: 'รหัสผ่านไม่ตรงกัน',
    passwordRuleText:
      '8-20 ตัวอักษร, อย่างน้อย 1 ตัวพิมพ์ใหญ่, 1 ตัวพิมพ์เล็ก, 1 ตัวเลข, 1 สัญลักษณ์ (!@#$%^&*()_-+=[]{}?/|)',

    backToLogin: 'กลับไปหน้าเข้าสู่ระบบ',
    fieldRequired: 'จำเป็นต้องกรอก',
  },
};

export default th;

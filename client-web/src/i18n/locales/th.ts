import en from './en';

const th = {
  ...en,

  brand: {
    name: 'มหาวิทยาลัยเทคโนโลยีและครุศาสตร์ฮึงเอียน',
    shortName: 'UTEHY',
    tagline: 'ระบบจัดการที่จอดรถภายในมหาวิทยาลัย',
  },

  announcement: {
    message: 'ระบบลงทะเบียนที่จอดรถสำหรับนักศึกษามหาวิทยาลัยเทคโนโลยีและครุศาสตร์ฮึงเอียน',
  },

  notifications: {
    title: 'การแจ้งเตือน',
  },

  nav: {
    home: 'หน้าแรก',
    plan: 'สมัครแพ็กเกจ',
    vehicles: 'ยานพาหนะ',
    sessions: 'ประวัติการจอดรถ',
    invoices: 'ใบแจ้งหนี้',
    profile: 'โปรไฟล์',
    userName: 'Hiếu',
  },

  validation: {
    requiredField: '{{field}} จำเป็นต้องกรอก',
    fieldFallback: 'ฟิลด์',
  },

  vehicle: {
    subtitle: 'การจัดการยานพาหนะส่วนบุคคล',
    registerPlanButton: 'ลงทะเบียนแพ็กเกจการส่งรถ',
    registerVehicleButton: 'ลงทะเบียนยานพาหนะ',
    search: {
      userCode: 'รหัสผู้ใช้',
      license: 'ทะเบียนรถ',
    },
    clearFilter: 'ล้างตัวกรอง',
    table: {
      vehicleId: 'รหัสยานพาหนะ',
      userCode: 'รหัสผู้ใช้',
      type: 'ประเภท',
      licensePlate: 'ทะเบียนรถ',
      qrCode: 'รหัส QR',
      createdAt: 'วันที่สร้าง',
      actions: 'การดำเนินการ',
      actionsMenu: {
        edit: 'แก้ไข',
        delete: 'ลบ',
      },
    },
    empty: 'ยังไม่มีข้อมูล',
    error: {
      load: 'ไม่สามารถโหลดรายการยานพาหนะได้ โปรดลองใหม่ภายหลัง.',
    },
    modal: {
      ...en.vehicle.modal,
      types: {
        motorbike: 'มอเตอร์ไซค์',
        bicycle: 'จักรยาน',
        electricBicycle: 'รถจักรยานยนต์ไฟฟ้า',
      },
      fields: {
        ...en.vehicle.modal.fields,
        licensePlatePlaceholder: 'เช่น: 30K12345',
        vehicleTypePlaceholder: 'เลือกรถที่ต้องการลงทะเบียน',
      },
    },
  },

  sessions: {
    ...en.sessions,
    sectionTitle: 'ประวัติการจอดรถ',
    loading: 'กำลังโหลดประวัติการจอดรถ…',
    empty: 'ไม่พบข้อมูลการจอดรถ',
    filters: {
      from: 'จากวันที่',
      to: 'ถึงวันที่',
      search: 'ค้นหา',
      searchPlaceholder: 'เลขทะเบียน หรือ รหัสเซสชัน',
      clear: 'ล้างตัวกรอง',
    },
    table: {
      vehicle: 'รถ',
      checkIn: 'เวลาเข้า',
      checkOut: 'เวลาออก',
      status: 'สถานะ',
      userType: 'ประเภทผู้ใช้',
      amount: 'จำนวนเงิน',
    },
    notProvided: 'ไม่ระบุ',
    statusUnknown: 'รอ',
  },

  profile: {
    loading: 'กำลังโหลดข้อมูลโปรไฟล์…',
    sectionTitle: 'ข้อมูลส่วนตัว',
    tagline: 'จัดการข้อมูลส่วนตัวและการตั้งค่าของคุณ',
    highlightTitle: 'ยินดีต้อนรับกลับมา',
    planLabel: 'แพ็กเกจของคุณ:',
    update: 'อัปเดตโปรไฟล์',
    download: 'ดาวน์โหลดข้อมูลของฉัน',
    logout: 'ออกจากระบบ',
    tabs: {
      profile: 'ข้อมูลส่วนตัว',
      subscriptions: 'แพ็กเกจที่สมัคร',
    },
    statusLabel: 'สถานะ:',
    statusActive: 'กำลังใช้งาน',
    statusInactive: 'ถูกปิดใช้งาน',
    fields: {
      userCode: 'รหัสผู้ใช้',
      fullName: 'ชื่อ-นามสกุล',
      email: 'อีเมล',
      phone: 'หมายเลขโทรศัพท์',
      required: 'ฟิลด์ที่จำเป็น',
      saveSuccess: 'ข้อมูลได้รับการอัปเดตแล้ว.',
    },
    saveChanges: 'บันทึกการเปลี่ยนแปลง',
    passwordDialog: {
      button: 'เปลี่ยนรหัสผ่าน',
      title: 'เปลี่ยนรหัสผ่าน',
      currentLabel: 'รหัสผ่านปัจจุบัน',
      newLabel: 'รหัสผ่านใหม่',
      confirmLabel: 'ยืนยันรหัสผ่านใหม่',
      save: 'บันทึก',
      cancel: 'ยกเลิก',
      required: 'ฟิลด์ที่จำเป็น',
      minLength: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร.',
      confirmMismatch: 'ยืนยันรหัสผ่านไม่ตรงกัน.',
      success: 'รหัสผ่านได้รับการอัปเดตแล้ว.',
      genericError: 'ไม่สามารถเปลี่ยนรหัสผ่านได้. กรุณาลองใหม่อีกครั้ง.',
    },
    subscriptions: {
      heading: 'แพ็กเกจที่สมัคร',
      empty: 'คุณยังไม่ได้สมัครแพ็กเกจใดๆ.',
      vehicle: 'รถ',
      term: 'ภาคการศึกษา',
      paymentPlan: 'วิธีการชำระเงิน',
      amount: 'รวมเงิน',
      period: 'ช่วงเวลา',
      paidAmount: 'จำนวนเงินที่ชำระแล้ว',
      changePaymentMethod: 'เปลี่ยนแปลงวิธีการชำระเงิน',
      stripeHeader: 'อัปเดตบัตรประจำตัว',
      stripeCardMissing: 'ฟอร์มบัตรยังไม่พร้อมใช้งาน.',
      stripeCardNotReady: 'ไม่สามารถบันทึกวิธีการชำระเงินได้.',
      stripeNotReady: 'Stripe ยังไม่พร้อมใช้งาน. กรุณาลองใหม่อีกครั้งหลังจากนี้.',
      stripeSuccess: 'อัปเดตวิธีการชำระเงินสำเร็จ.',
      savePaymentMethod: 'บันทึกบัตรใหม่',
      cancelChange: 'ยกเลิก',
      unnamedPlan: 'แพ็กเกจที่ไม่มีชื่อ',
      noPaymentPlan: 'ยังไม่ได้เลือกวิธีการชำระเงิน',
      status: {
        active: 'กำลังใช้งาน',
        pending: 'กำลังรอ',
        expired: 'หมดอายุ',
        suspended: 'ถูกหยุดใช้งาน',
      },
    },
  },

  plan: {
    ...en.plan,

    sectionTitle: 'ยินดีต้อนรับกลับมา',
    sectionDescription: 'เลือกรายการที่ตรงกับเวลาของคุณและยืนยันเพื่อรักษาสิทธิ์ที่จอดรถไว้',

    steps: ['เลือกเทอม', 'ตั้งค่าความต้องการ', 'ยืนยัน'],
    backToVehicles: 'กลับไปที่หน้าจัดการยานพาหนะ',
    calculatingPrice: 'กำลังคำนวณราคา…',
    pricingSummary: '{{days}} วันต้องชำระ (ตัดวันอาทิตย์ {{sundayDays}} วันและวันหยุด {{holidayDays}} วันออกแล้ว)',
    cta: 'สมัครแพ็กเกจนี้',

    registering: 'คุณกำลังสมัคร',
    notes: 'หมายเหตุ:',
    noNotes: 'ยังไม่มีหมายเหตุ',
    reminder: 'คุณสามารถย้อนกลับไปแก้ไขข้อมูลได้',
    noPlans: 'ยังไม่มีแพ็กเกจสมัครสมาชิกให้เลือกขณะนี้',
    planMeta: {
      created: 'สร้างเมื่อ {{date}}',
      updated: 'อัปเดตเมื่อ {{date}}',
    },

    back: 'ย้อนกลับ',
    next: 'ถัดไป',
    submit: 'ส่งคำขอ',

    alert: 'ส่งคำขอเรียบร้อยแล้ว!',
    notChosen: 'ยังไม่ได้เลือก',

    checkoutTitle: 'ชำระเงิน',
    checkoutSubtitle: 'กรอกรายละเอียดการชำระเงินเพื่อยืนยันแพ็กเกจ',
    priceLabel: 'ราคา',
    perDay: 'วัน',
    cards: {
      noPlate: {
        title: 'จักรยาน / รถจักรยานยนต์ไฟฟ้า',
        subtitle: 'ไม่มีป้ายทะเบียน',
      },
      withPlate: {
        title: 'มอเตอร์ไซค์ / รถจักรยานยนต์ไฟฟ้า',
        subtitle: 'มีป้ายทะเบียน',
      },
    },
    checkoutCta: 'สมัครแพ็กเกจนี้',
    checkoutConfirmed: 'ยืนยันการชำระเงินสำหรับ {{plan}} แล้ว',

    checkoutFields: {
      cardNumber: 'หมายเลขบัตร',
      bank: 'ธนาคาร',
      paymentMethod: 'วิธีการชำระเงิน',
      full: 'ชำระเต็มจำนวน',
      installment: 'ผ่อนชำระ',
      notes: 'หมายเหตุ',
      notesPlaceholder: 'เพิ่มรายละเอียดหรือคำแนะนำ',
    },

    checkoutRules:
      'เมื่อยืนยัน แสดงว่าคุณยอมรับนโยบายการจอดรถ เงื่อนไขการคืนเงิน และการแจ้งเตือนอัตโนมัติ',

    checkoutCancel: 'ยกเลิก',
    checkoutConfirm: 'ยืนยันการชำระเงิน',
    checkoutPaymentMomo: 'ชำระผ่าน MoMo',
    checkoutPlanNote: 'รายละเอียดแพ็กเกจที่คุณเลือกจะแสดงที่นี่',
    priceNote: 'ราคาแสดงเป็นหน่วย VND เพื่อความสอดคล้องทั้งหมด',
    checkoutStepper: {
      steps: ['เลือกภาคการศึกษา', 'แผนการชำระเงิน', 'ข้อมูลการชำระเงิน'],
      termLabel: 'ภาคการศึกษา',
      termPlaceholder: 'เลือกภาคการศึกษา',
      termHelper: 'เลือกภาคที่ต้องการก่อนดำเนินการชำระเงิน',
      termOptions: ['ภาคต้นปี 2026', 'ภาคกลางปี 2026', 'ภาคปลายปี 2026'],
      termEmpty: 'ยังไม่มีข้อมูลภาคการศึกษาในขณะนี้ กรุณาลองใหม่ภายหลัง',
      paymentPlanLabel: 'แผนการชำระเงิน',
      paymentPlanDescription: 'เลือกการชำระแบบรายเดือนหรือแบบครั้งเดียวเพื่อเปิดแบบฟอร์มด้านล่าง',
        cardFormTitle: 'ข้อมูลบัตร',
        cardHolder: 'ชื่อผู้ถือบัตร',
        cardExpiry: 'วันหมดอายุ (MM/YY)',
        cardCvc: 'CVC',
        cardSetupError: 'ไม่สามารถเชื่อมต่อกับ Stripe โปรดลองอีกครั้งในภายหลัง',
        cardNotLoaded: 'แบบฟอร์มบัตรยังไม่พร้อมใช้งาน',
        cardNotReady: 'ไม่พบวิธีการชำระเงิน',
        cardGeneralError: 'ไม่สามารถบันทึกข้อมูลบัตรได้ กรุณาลองอีกครั้ง',
      momoTitle: 'ชำระด้วย MoMo',
      momoDescription: 'คุณจะถูกเปลี่ยนเส้นทางไปยัง MoMo เพื่อดำเนินการชำระเงินภายใน 5 นาที',
      momoRedirect: 'กำลังนำคุณไปยัง MoMo เพื่อยืนยันการชำระเงิน',
      momoMissingVehicle: 'กรุณาลงทะเบียนรถก่อนชำระเงินผ่าน MoMo',
      momoSetupError: 'ข้อมูลไม่ครบสำหรับการชำระเงิน MoMo กรุณาลองใหม่ภายหลัง',
      momoUrlMissing: 'ไม่พบลิงก์ชำระเงิน MoMo',
      momoGeneralError: 'ไม่สามารถเริ่มการชำระเงิน MoMo ได้ กรุณาลองใหม่',
      next: 'ถัดไป',
      back: 'ย้อนกลับ',
      confirm: 'ยืนยันการชำระเงิน',
      payMomo: 'ชำระด้วย MoMo',
      termCards: [
        {
          id: 'spring-2026',
          term_name: 'เทอมที่ 1',
          start_date: '01/09/2026',
          end_date: '31/01/2027',
        },
        {
          id: 'summer-2026',
          term_name: 'เทอมที่ 2',
          start_date: '01/02/2027',
          end_date: '30/06/2027',
        },
        {
          id: 'fall-2026',
          term_name: 'ทั้งปีการศึกษา',
          start_date: '01/09/2026',
          end_date: '30/06/2027',
        },
      ],
      termRange: 'ตั้งแต่ {{start}} ถึง {{end}}',
    },

    paymentModes: {
      recurring: {
        title: 'จ่ายรายเดือน',
        price: '1,200,000 VND / เดือน',
        suffix: 'VND / เดือน',
        description: 'ต่ออายุอัตโนมัติพร้อมเตือน 3 วันก่อน',
        badge: 'แนะนำ',
        perkReminder: 'เตือนล่วงหน้า 3 วัน',
        perkSecureCard: 'เก็บข้อมูลบัตรอย่างปลอดภัย',
        perkFlexible: 'พักหรือเริ่มใช้อีกครั้งได้ทุกเมื่อ',
      },

      oneTime: {
        title: 'จ่ายครั้งเดียว',
        price: '4,900,000 VND/ เทอม',
        suffix: 'VND / เทอม',
        description: 'จ่ายทีเดียวรับส่วนลด 8%',
        badge: 'คุ้มค่า',
        perkFast: 'ยืนยันภายใน 24 ชั่วโมง',
        perkNoRenewal: 'ไม่มีการต่ออายุอัตโนมัติ',
        perkSupport: 'รองรับธนาคารและวอลเล็ต',
      },
    },
  },

  invoices: {
    sectionTitle: 'ใบแจ้งหนี้',
    headerTitle: 'ประวัติการเรียกเก็บเงิน',
    filters: {
      from: 'จากวันที่',
      to: 'ถึงวันที่',
    },
    resultsTitle: 'ผลลัพธ์',
    empty: 'ไม่มีใบแจ้งหนี้ตามช่วงวันที่ที่เลือก',
    table: {
      invoiceId: 'รหัสใบแจ้งหนี้',
      period: 'ช่วงเวลา',
      created_at: 'วันที่ออก',
      dueOn: 'ครบกำหนด',
      amount: 'จำนวนเงิน',
      status: 'สถานะ',
    },
    issuedOn: 'ออกเมื่อ',
    dueOn: 'ครบกำหนด',
    amountLabel: 'จำนวนเงิน',
    status: {
      paid: 'ชำระแล้ว',
      pending: 'รอดำเนินการ',
      overdue: 'เกินกำหนด',
    },
  },

  footer: {
    hotline: 'สายด่วน: 1900 1234',
    email: 'อีเมล: support@campusparking.vn',
  },
};

export default th;

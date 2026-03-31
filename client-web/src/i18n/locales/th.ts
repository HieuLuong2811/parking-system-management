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
    ...en.profile,
    sectionTitle: 'ข้อมูลส่วนตัว',
  },

  plan: {
    ...en.plan,

    sectionTitle: 'สมัครแพ็กเกจรายเทอม',

    steps: ['เลือกเทอม', 'ตั้งค่าความต้องการ', 'ยืนยัน'],
    vehiclePackages: {
      sectionTitle: 'แพ็กเกจตามประเภทรถ',
      description: 'เลือกแพ็กเกจสำหรับรถที่มีหรือไม่มีป้ายทะเบียนก่อนดำเนินการชำระเงิน',
      cta: 'สมัครแพ็กเกจนี้',
      withoutPlate: {
        subtitle: 'ไม่มีป้ายทะเบียน',
        title: 'รถไม่มีป้าย',
        price: '4,500 đ / วัน',
        description: 'เหมาะสำหรับรถที่ใช้บัตร QR หรือไม่แสดงป้ายทะเบียน',
        features: [
          'รองรับ QR เช็คอินทันที',
          'บันทึกการใช้งานผ่านสแกน QR อัตโนมัติ',
          'ไม่ต้องกรอกป้ายทะเบียนขาเข้า-ออก',
          'แจ้งเตือนสถานะผ่านแอป',
          'คิวพิเศษในช่วงเวลาเร่งด่วน',
        ],
      },
      withPlate: {
        subtitle: 'มีป้ายทะเบียน',
        title: 'รถมีป้าย',
        price: '5,200 đ / วัน',
        description: 'ออกแบบสำหรับรถที่แสดงป้ายทะเบียนอย่างต่อเนื่อง',
        features: [
          'กล้องตรวจจับป้ายทะเบียนอัตโนมัติ',
          'ตรวจสอบทะเบียนกับผู้ใช้งาน',
          'แจ้งเตือนเมื่อพบทะเบียนซ้ำหรือผิดปกติ',
          'ควบคุมการเข้า-ออกตามสิทธิ์',
          'รายงานการใช้งานแยกตามทะเบียน',
        ],
      },
    },

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
      momoTitle: 'ชำระด้วย MoMo',
      momoDescription: 'คุณจะถูกเปลี่ยนเส้นทางไปยัง MoMo เพื่อดำเนินการชำระเงินภายใน 5 นาที',
      momoRedirect: 'กำลังนำคุณไปยัง MoMo เพื่อยืนยันการชำระเงิน',
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
      issuedOn: 'วันที่ออก',
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

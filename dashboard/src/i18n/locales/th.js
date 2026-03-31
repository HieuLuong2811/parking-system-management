const th = {
  translation: {
    sideBar: {
      title: "ระบบที่จอดรถ",
      children: {
        home: "หน้าแรก",
        users: "ผู้ใช้งาน",
        resources: "ตารางข้อมูล",
        settings: "ตั้งค่า",
      },
    },
    pageTitle: {
      home: "ระบบจัดการที่จอดรถ - มหาวิทยาลัยเทคโนโลยีและการศึกษาเหิงเยิน",
      users: "ผู้ใช้งาน",
      resources: "ทรัพยากร",
      settings: "ตั้งค่า",
    },
    breadcrumb: {
      home: "หน้าแรก",
      users: "ผู้ใช้งาน",
      resources: "ทรัพยากร",
      settings: "ตั้งค่า",
    },
    button: {
      login: "เข้าสู่ระบบ",
      logout: "ออกจากระบบ",
      register: "สมัครสมาชิก",
      btnAdd: "เพิ่ม",
      btnEdit: "แก้ไข",
      btnDelete: "ลบ",
      btnSearch: "ค้นหา",
      refresh: "รีเฟรช",
      cancel: "ยกเลิก",
      save: "บันทึก",
    },
    placeHolder: {
      search: "ค้นหา",
    },
    home: {
      title: "หน้าแรก",
      description:
        "ยินดีต้อนรับ {{name}} ส่วนภาพรวมนี้ช่วยคุณเข้าถึงตารางข้อมูลสำคัญได้เร็วขึ้น",
      fallbackName: "คุณ",
      cardInfo: "ดู เพิ่ม และกรองข้อมูลได้อย่างรวดเร็วผ่านแต่ละคอลัมน์",
      cardEndpoint: "Endpoint: /{{endpoint}}",
      quickAccessTitle: "ทางลัด",
      quickAccessDescription: "ใช้ปุ่มด้านล่างเพื่อข้ามไปยังตารางข้อมูลสำคัญทันที",
    },
    parkingEventsPage: {
      title: "เหตุการณ์การจอดรถ",
    },
    usersPage: {
      title: "การจัดการผู้ใช้งาน",
      importButton: "อิมพอร์ตรายการ {{role}}",
      importProcessing: "กำลังดำเนินการ...",
      importSuccess: "นำเข้า {{count}} ผู้ใช้สำหรับ {{role}} เรียบร้อยแล้ว",
      importErrorNoData: "ไม่พบแถวข้อมูลที่ถูกต้องในไฟล์",
      importHint:
        "ไฟล์ XLSX ต้องมีคอลัมน์ user_code, full_name และ email; คอลัมน์อื่นจะถูกละไว้",
      importModal: {
        title: "อิมพอร์ตรายการ {{role}}",
        description: "เลือกไฟล์ Excel เพื่ออิมพอร์ตข้อมูลผู้ใช้งาน",
        searchPlaceholder: "ค้นหาตามรหัส ชื่อ หรืออีเมล",
        statusLabel: "สถานะของแถวข้อมูล",
        statusOptions: {
          all: "ทั้งหมด",
          valid: "ถูกต้อง",
          invalid: "ไม่ถูกต้อง",
        },
        errors: {
          missingUserCode: "ไม่มีรหัสผู้ใช้",
          missingEmail: "ไม่มีอีเมล",
          invalidEmail: "อีเมลไม่ถูกต้อง",
        },
      },

    },
    vehiclesPage: {
      title: "ยานพาหนะ",
    },
    rolesPage: {
      title: "บทบาท",
    },
    userRolesPage: {
      title: "บทบาทผู้ใช้",
    },
    termsPage: {
      title: "ภาคการศึกษา",
    },
    plansPage: {
      title: "แผนสมัครสมาชิก",
    },
    subscriptionsPage: {
      title: "การสมัครสมาชิก",
    },
    billingEventLogsPage: {
      title: "เหตุการณ์เรียกเก็บเงิน",
    },
    resource: {
      dialogTitleAdd: "{{action}} {{resource}}",
      dialogTitleUpdate: "{{action}} {{resource}}",
      notFound: "ไม่พบแหล่งข้อมูลตามที่ร้องขอ กรุณาเลือกตารางอื่น",
    },
    accessDenied: {
      title: "คุณไม่มีสิทธิ์เข้าถึง",
      description:
        "เฉพาะบัญชีผู้ดูแลระบบเท่านั้นที่เข้าได้ กรุณาเข้าสู่ระบบด้วยสิทธิ์ที่ถูกต้อง",
      backToHome: "กลับหน้าหลัก",
      viewUsers: "ดูรายชื่อผู้ใช้งาน",
    },
    notFound: {
      title: "404 - ไม่พบหน้า",
      description: "เส้นทางที่คุณเรียกไม่มีอยู่จริง กลับไปยังแดชบอร์ดเพื่อจัดการข้อมูลต่อ",
    },
    settingsPage: {
      title: "⚙ ตั้งค่า",
      description: "ที่นี่คุณสามารถปรับค่าคอนฟิกของแอปพลิเคชันได้",
    },
    notifications: {
      sendBy: "ส่งโดย {{sender}}",
      empty: "ไม่มีการแจ้งเตือนใหม่",
      senders: {
        system: "ระบบ",
      },
      times: {
        twoHours: "2 ชั่วโมงที่แล้ว",
        yesterday: "เมื่อวานนี้",
      },
      items: {
        permissions: {
          title: "อัปเดตสิทธิ์ผู้ใช้",
          detail: "บทบาทนักศึกษาได้รับการปรับเพื่อสะท้อนโครงสร้างใหม่",
        },
        vehicles: {
          title: "ซิงก์ข้อมูลยานพาหนะ",
          detail: "นำเข้าสองรถยนต์จาก Excel จำนวน 10 คันเรียบร้อยแล้ว",
        },
      },
    },
    resources: {
      tables: {
        users: "ผู้ใช้งาน",
        vehicles: "ยานพาหนะ",
        roles: "บทบาท",
        userRoles: "บทบาทผู้ใช้",
        terms: "ภาคการศึกษา",
        plans: "แผนสมัครสมาชิก",
        subscriptions: "การสมัครสมาชิกผู้ใช้",
        parkingSessions: "ช่วงเวลาจอดรถ",
        invoices: "ใบแจ้งหนี้",
        paymentTransactions: "รายการจ่ายเงิน",
        billingEventLogs: "เหตุการณ์เรียกเก็บเงิน",
      },
    },
  },
};

export default th;

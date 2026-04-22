const th = {
  translation: {
    sideBar: {
      title: "ระบบที่จอดรถ",
      children: {
        home: "หน้าแรก",
        users: "ผู้ใช้งาน",
        resources: "หมวดหมู่การจัดการ",
        settings: "ตั้งค่า",
      },
    },
    common: {
      tooltips: {
        user_code: "รหัสผู้ใช้",
        full_name: "ชื่อเต็ม",
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
      clear: "ล้าง",
    },
    validation: {
      requiredField: "{{field}} จำเป็นต้องกรอก",
      fieldFallback: "ฟิลด์",
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
        selectFile: "เลือกไฟล์",
        selectedFile: "ไฟล์ที่เลือก: {{name}}",
        noRows: "ยังไม่มีข้อมูล. เลือกไฟล์เพื่อดูตัวอย่างแถว.",
        tableHeaders: {
          userCode: "รหัสผู้ใช้",
          fullName: "ชื่อ-สกุล",
          email: "อีเมล",
          phoneNumber: "เบอร์โทร",
          status: "สถานะ",
          errors: "ข้อผิดพลาด",
        },
        statusTags: {
          valid: "พร้อมใช้งาน",
          invalid: "ต้องตรวจสอบ",
        },
        pagination: "จำนวนแถวต่อหน้า",
        footer: {
          cancel: "ยกเลิก",
          import: "นำเข้าผู้ใช้",
        },
        errors: {
          missingUserCode: "ไม่มีรหัสผู้ใช้",
          missingEmail: "ไม่มีอีเมล",
          invalidEmail: "อีเมลไม่ถูกต้อง",
        },
        warning: {
          partial: "{{invalidCount}} แถวมีข้อผิดพลาดและจะถูกข้าม",
        },
        toast: {
          noValidRows: "ไม่มีข้อมูลที่ถูกต้องสำหรับนำเข้า กรุณาตรวจสอบไฟล์",
          success: "สร้างผู้ใช้ {{count}} ราย ข้าม {{skipped}} แถวที่ไม่ถูกต้อง",
          error: "การนำเข้าล้มเหลว {{message}}",
        },
      },
      actions: {
        subtitle: "ตรวจสอบ สร้าง และแก้ไขบัญชีได้อย่างเต็มรูปแบบ",
        rows: "ผู้ใช้",
        filtered: "ผลลัพธ์ที่กรองแล้ว",
        createButton: "สร้างผู้ใช้",
        createDialogTitle: "สร้างผู้ใช้",
        editDialogTitle: "แก้ไขผู้ใช้",
        saveButton: "บันทึกการเปลี่ยนแปลง",
        created: "สร้างผู้ใช้ {{user}} แล้ว",
        updated: "อัปเดตผู้ใช้ {{user}} แล้ว",
        deleted: "ลบผู้ใช้ {{user}} แล้ว",
        error: "ไม่สามารถบันทึกการเปลี่ยนแปลงได้",
        deleteConfirm: "ลบผู้ใช้ {{user}} ใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนกลับได้",
      },
      roleSelector: {
        label: "กำหนดบทบาท",
        placeholder: "เลือกบทบาท",
        noOptions: "ไม่มีบทบาทเหลือให้กำหนด",
        loading: "กำลังโหลดบทบาท…",
        assigning: "กำลังกำหนดบทบาท…",
        removing: "กำลังลบบทบาท…",
        assignSuccess: "กำหนด {{role}} สำเร็จแล้ว",
        assignError: "ไม่สามารถกำหนด {{role}} ได้",
        removeTooltip: "ลบ {{role}}",
        removeSuccess: "ลบ {{role}} เรียบร้อยแล้ว",
        removeError: "ไม่สามารถลบ {{role}} ได้",
        optionLabel: "{{role}}",
        optionLabel: "{{role}}",
      },
      subscriptionDrawer: {
        title: "แพ็กเกจจอดรถล่าสุด",
        subtitle: "แสดงข้อมูลสมาชิกล่าสุดของผู้ใช้ที่เลือก",
        selectUser: "เลือกผู้ใช้เพื่อดูข้อมูลการสมัคร",
        loading: "กำลังโหลดข้อมูลการสมัคร…",
        current: "การสมัครล่าสุด",
        noSubscription: "ยังไม่มีการสมัครสำหรับผู้ใช้นี้",
        noPaymentPlan: "ยังไม่มีแผนชำระเงิน",
        duration: "ระยะเวลา",
        total: "จำนวนเงินทั้งหมด",
        paid: "จำนวนเงินที่ชำระแล้ว",
        balance: "ยอดค้างชำระ",
        updated: "อัปเดตล่าสุด",
        viewAll: "ดูรายการสมาชิก",
        status: {
          ACTIVE: "กำลังใช้งาน",
          EXPIRED: "หมดอายุ",
          SUSPENDED: "ถูกระงับ",
          PENDING: "รอดำเนินการ",
        },
      },
      columns: {
        userCode: "รหัสผู้ใช้",
        fullName: "ชื่อเต็ม",
        email: "อีเมล",
        phoneNumber: "หมายเลขโทรศัพท์",
        active: "สถานะ",
        role: "บทบาท",
        createdAt: "สร้างเมื่อ",
        updatedAt: "อัปเดตเมื่อ",
        actions: "การดำเนินการ",
        status: {
          active: "กำลังใช้งาน",
          inactive: "ไม่ใช้งาน",
        },
      },
      filters: {
        role: "บทบาท",
        allRoles: "ทุกบทบาท",
      },
      form: {
        userCode: "รหัสผู้ใช้",
        fullName: "ชื่อ-นามสกุล",
        email: "อีเมล",
        language: "ภาษา",
        password: "รหัสผ่าน",
        passwordHelper: "ปล่อยว่างไว้หากต้องการใช้รหัสผ่านเดิมเมื่อแก้ไข",
        status: "บัญชีใช้งาน",
      },
    },
    vehiclesPage: {
      title: "ยานพาหนะ",
      description: "จัดการยานพาหนะที่ลงทะเบียนในระบบ",
      searchPlaceholder: "ค้นหาด้วย id, รหัส, ป้ายทะเบียน",
      empty: "ไม่มียานพาหนะ",
      columns: {
        id: "รหัสยานพาหนะ",
        userCode: "รหัสผู้ใช้",
        type: "ประเภท",
        licensePlate: "ป้ายทะเบียน",
        qrCode: "QR code",
        status: "สถานะ",
        createdAt: "สร้างเมื่อ",
        updatedAt: "อัปเดตเมื่อ",
      },
      status: {
        active: "ใช้งาน",
        deleted: "ถูกลบ",
      },
      vehicleTypes: {
        motorbike: "รถจักรยานยนต์",
        electricBicycle: "รถจักรยานไฟฟ้า",
        bicycle: "รถจักรยาน",
      }
    },
    rolesPage: {
      title: "บทบาท",
    },
    userRolesPage: {
      title: "บทบาทผู้ใช้",
    },
    termsPage: {
      title: "ภาคการศึกษา",
      description: "กำหนดภาคการศึกษาและช่วงเวลาการใช้งาน",
      searchTerm: {
        name: "ค้นหาด้วยชื่อภาคการศึกษา"
      },
      empty: "ยังไม่มีภาคการศึกษาที่ลงทะเบียน",
      fields: {
        termName: "ชื่อภาคการศึกษา",
        startDate: "วันที่เริ่มต้น",
        endDate: "วันที่สิ้นสุด",
        createdAt: "สร้างเมื่อ",
        actions: "การดำเนินการ",
      },
      buttons: {
        add: "เพิ่มภาคการศึกษาใหม่",
      },
      warnings: {
        rename: "หากคุณเปลี่ยนชื่อภาคการศึกษา ระบบจะส่งการแจ้งเตือน (และอีเมล) ไปยังผู้ใช้ทั้งหมดที่กำลังใช้ภาคการศึกษานี้อยู่",
      },
      tooltips: {
         edit: "แก้ไขภาคการศึกษา",
         delete: "ลบภาคการศึกษา",
         inUse: "ภาคการศึกษาอยู่ในใช้งานและไม่สามารถลบได้",
      },
    },
    plansPage: {
      title: "แผนสมัครสมาชิก",
      fields: {
        planName: "ชื่อแพ็กเกจ",
        pricePerDay: "ราคาต่อวัน",
        description: "รายละเอียด",
      },
    },
    subscriptionsPage: {
      title: "รายการการสมัครรับข้อมูลของผู้ใช้",
      description: "ภาพรวมของทุกการสมัครที่ลงทะเบียนในระบบ",
      searchPlaceholder: "ค้นหาตามผู้ใช้ แพ็กเกจ หรือภาคเรียน",
      filters: {
        status: "สถานะ",
      },
      periodLabels: {
        from: "จาก",
        to: "ถึง",
      },
      columns: {
        user: "ผู้ใช้",
        plan: "แผน",
        paymentPlan: "แผนการชำระเงิน",
        term: "ระยะเวลา",
        period: "งวด",
        amount: "จำนวนเงิน",
        paid: "ชำระแล้ว",
        vehicle: "ยานพาหนะ",
        status: "สถานะ",
        actions: "การกระทำ",
      },
      empty: "ไม่พบรายการสมัครสมาชิก",
      error: "ไม่สามารถโหลดข้อมูลรายการได้",
    },
    subscriptionPlansPage: {
      title: "แผนสมัครสมาชิก",
      description: "รายการแผนสมัครสมาชิกที่มีอยู่",
      searchPlaceholder: "ค้นหาตามชื่อแผนหรือรหัส",
      empty: "ยังไม่มีแผนที่ถูกกำหนด",
      columns: {
        planName: "ชื่อแพ็กเกจ",
        pricePerDay: "ค่าจอดรถต่อวัน",
        description: "รายละเอียด",
        createdAt: "สร้างเมื่อ",
        updatedAt: "อัปเดตเมื่อ",
        actions: "การดำเนินการ",
      },
      tooltips: {
        locked: 'แผนนี้กำลังถูกใช้งาน',
        delete: 'ลบแผน',
        edit: 'แก้ไขแผน',
      },
      button: {
        add: "เพิ่มแผนใหม่",
      }
    },
    subscriptionInvoicesPage: {
      title: "ใบแจ้งหนี้การสมัครสมาชิก",
      noSubscription: "ไม่พบ ID การสมัครสมาชิก",
      error: "ไม่สามารถโหลดใบแจ้งหนี้ได้",
      empty: "ยังไม่มีใบแจ้งหนี้สำหรับการสมัครนี้",
      selectInvoice: "เลือกใบแจ้งหนี้จากรายการเพื่อดูตัวอย่างที่นี่",
      invoiceIdLabel: "รหัสใบแจ้งหนี้",
      payerTitle: "ผู้ชำระเงิน",
      recipientTitle: "ผู้รับเงิน",
      amountDueLabel: "จำนวนเงินที่ต้องชำระ",
      common: {
        back: "กลับ"
      }
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
        paymentTransactions: "ประวัติธุรกรรม",
        billingEventLogs: "เหตุการณ์เรียกเก็บเงิน",
      },
    },
    paymentTransactionsPage: {
      description: "ประวัติธุรกรรมการชำระเงิน",
      searchLabel: "ค้นหา",
      searchPlaceholder: "ค้นหาตามใบแจ้งหนี้, โค้ด, หรือผู้ใช้",
      empty: "ยังไม่มีธุรกรรม",
      columns: {
        user: "ผู้ใช้",
        invoice: "ใบแจ้งหนี้",
        amount: "จำนวนเงิน",
        paymentMethod: "วิธีการชำระเงิน",
        attempt: "ครั้งที่ #",
        code: "รหัส",
        status: "สถานะ",
        response: "ข้อความตอบกลับ",
        createdAt: "สร้างเมื่อ",
      },
      tooltips: {
        invoice_id: "รหัสใบแจ้งหนี้",
        invoice_createdAt: "วันที่สร้างใบแจ้งหนี้",
      },
    },
  },
};

export default th;

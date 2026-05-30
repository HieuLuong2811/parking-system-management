const lo = {
  common: {
    all: 'ທັງໝົດ',
    success: 'ສຳເລັດ',
    error: 'ຂໍ້ຜິດພາດ',
    loading: 'ກຳລັງໂຫຼດ...',
    next: 'ຖັດໄປ',
    back: 'ກັບຄືນ',
    retry: 'ລອງໃໝ່',
    cancel: 'ຍົກເລີກ',
    resetChanges: 'ຣີເຊັດການປ່ຽນແປງ',
    continue: 'ດຳເນີນຕໍ່',
    vehicleMode: {
      licensed: 'ມີບັນຊີຢ່າງວ່ອງ',
      unlicensed: 'ບໍ່ມີບັນຊີຢ່າງວ່ອງ',
    },
    parkingAccessCardStatus: {
      available: 'ມີ',
      assigned: 'ມອບໝາຍແລ້ວ',
      active: 'ກຳລັງໃຊ້ງານ',
      disable: 'ຖືກປິດໃຊ້',
      lost: 'ສູນຫາຍ',
    },
    userWalletStatus: {
      active: 'ກຳລັງໃຊ້ງານ',
      locked: 'ປິດໃຊ້ງານ',
    },
    paymentMethod: {
      CASH: "ເງິນສົດ",
      MOMO: "MoMo",
      WALLET: "ກະເປົາເງິນ",
      SYSTEM: "ລະບົບ",
    },
    dateRange: {
      invalidDateRange: "ວັນທີສິ້ນສຸດຕ້ອງບໍ່ນ້ອຍກວ່າວັນທີເລີ່ມຕົ້ນ.",
    },
  },

  tabs: {
    home: 'ໜ້າຫຼັກ',
    plan: 'ແພັກເກດ',
    sessions: 'ຮອບຝາກລົດ',
    plans: 'ແພັກເກດ',
    profile: 'ໂປຣໄຟລ໌',
  },

  notifications: {
    title: 'ແຈ້ງເຕືອນ',
    viewAll: 'ເບິ່ງທັງໝົດ',
    empty: 'ຍັງບໍ່ມີແຈ້ງເຕືອນ.',
    payment: {
      title: 'ການຊໍາລະ',
      success: 'ຊໍາລະສໍາເລັດ{{invoicePart}}.',
      failed: 'ຊໍາລະລົ້ມເຫຼວ{{invoicePart}}.',
    },
    topUp: {
      title: 'ເຕີມເງິນ',
      success: 'ເຕີມເງິນສໍາເລັດ{{amountPart}}{{invoicePart}}.',
      failed: 'ເຕີມເງິນລົ້ມເຫຼວ{{invoicePart}}.',
    },
    subscription: {
      title: 'ແພັກເກດ',
      success: 'ຊໍາລະແພັກເກດສໍາເລັດ{{invoicePart}}.',
      pending: 'ກໍາລັງລໍຖ້າຊໍາລະແພັກເກດ{{invoicePart}}.',
      failed: 'ຊໍາລະແພັກເກດລົ້ມເຫຼວ{{invoicePart}}.',
    },
    filter: {
      all: 'ທັງໝົດ',
      system: 'ລະບົບ',
      payment: 'ການຊໍາລະ',
      timeAll: 'ທຸກເວລາ',
      last7d: '7 ມື້ຫຼ້າສຸດ',
      last30d: '30 ມື້ຫຼ້າສຸດ',
    },
  },

  transactions: {
    empty: 'ບໍ່ພົບທຸລະກໍາ.',
    invoice: 'ໃບບິນ',
    tx: 'ທຸລະກໍາ',
    filters: {
      title: 'ຕົວກອງ',
      fromDate: 'ຈາກວັນທີ',
      toDate: 'ເຖິງວັນທີ',
      invoiceId: 'ລະຫັດໃບບິນ',
      invoiceIdPlaceholder: 'ປ້ອນລະຫັດໃບບິນ',
      transactionCode: 'ລະຫັດທຸລະກໍາ',
      transactionCodePlaceholder: 'ປ້ອນລະຫັດທຸລະກໍາ',
      direction: 'ທິດທາງເງິນ',
      type: 'ປະເພດ',
      clear: 'ລ້າງ',
    },
    direction: {
      all: 'ທັງໝົດ',
      in: 'ເງິນເຂົ້າ',
      out: 'ເງິນອອກ',
    },
    type: {
      all: 'ທັງໝົດ',
      TOP_UP: 'ເຕີມເງິນ',
      SUBSCRIPTION_FULL_PAYMENT: 'ຈ່າຍຄ່າແພັກເກດ',
      MONTHLY_CHARGE: 'ຫັກຄ່າລາຍເດືອນ',
      INVOICE_DIRECT_PAYMENT: 'ຈ່າຍໃບບິນ',
      REFUND: 'ຄືນເງິນ',
      ADMIN_ADJUSTMENT: 'ປັບປຸງໂດຍລະບົບ',
    },
  },

  drawer: {
    title: 'ເມນູ',
    subtitle: 'ເຂົ້າເຖິງບັນຊີຢ່າງວ່ອງໄວ',
    noUserInfo: 'ບໍ່ມີຂໍ້ມູນຜູ້ໃຊ້.',
    quickAccess: 'ເຂົ້າເຖິງດ່ວນ',
    language: 'ພາສາ',
    currentLanguage: 'ພາສາປັດຈຸບັນ',
    profileDesc: 'ເບິ່ງ ແລະ ອັບເດດຂໍ້ມູນບັນຊີຂອງທ່ານ.',
  },

  plans: {
    title: 'ແພັກເກດຝາກລົດ',
    subtitle: 'ເລືອກແພັກເກດຝາກລົດທີ່ເໝາະສົມ ແລະ ຊຳລະເງິນ.',

    loading: 'ກຳລັງໂຫຼດແພັກເກດ...',
    loadError: 'ບໍ່ສາມາດໂຫຼດແພັກເກດໄດ້.',
    empty: 'ບໍ່ມີແພັກເກດທີ່ພ້ອມໃຊ້.',

    current: 'ແພັກເກດປັດຈຸບັນ',
    register: 'ລົງທະບຽນ',

    basic: 'ພື້ນຖານ',
    startup: 'ເລີ່ມຕົ້ນ',
    enterprise: 'ອົງກອນ',

    perDay: '/ ມື້',

    monthlyPayment: 'ຮອງຮັບການຊຳລະລາຍເດືອນ',
    fullPayment: 'ຮອງຮັບການຊຳລະເຕັມຈຳນວນ',
    noFullPayment: 'ບໍ່ຮອງຮັບການຊຳລະເຕັມຈຳນວນ',

    dailyFee: 'ຄ່າບໍລິການລາຍມື້: {{price}} VND',
    after18Free: 'ຟຣີຫຼັງ 18:00',
    after18Fee: 'ຫຼັງ 18:00: {{price}} VND',
    inUseBadge: 'ກຳລັງໃຊ້ງານ',
    viewCurrentPlan: 'ເບິ່ງແພັກເກດທີ່ລົງທະບຽນ',
    currentPlanFallback: 'ແພັກເກດປັດຈຸບັນ',

    overrideActivePlanDialog: {
      title: 'ທ່ານມີແພັກເກດຝາກລົດຢູ່ແລ້ວ',
      message:
        'ປັດຈຸບັນທ່ານມີແພັກເກດ {{plan}} ສະຖານະ {{status}}. ຖ້າທ່ານລົງທະບຽນແພັກເກດໃໝ່, ແພັກເກດເກົ່າຈະຖືກຍົກເລີກ ແຕ່ໜີ້ຄົງເຫຼືອຍັງຈະຖືກຕິດຕາມ. ຈຳນວນເງິນຄົງເຫຼືອ: {{debt}}. ທ່ານຕ້ອງການດຳເນີນຕໍ່ບໍ?',
    },
  },

  checkout: {
    title: 'ຊຳລະແພັກເກດ',
    subtitle: 'ກອກຂໍ້ມູນສຳລັບ {{plan}}',

    stepVehicle: 'ຍານພາຫະນະ',
    stepTerm: 'ພາກຮຽນ',
    stepPaymentMethod: 'ວິທີຊຳລະ',
    stepConfirm: 'ຢືນຢັນ',

    selectLicensedVehicle: 'ເລືອກຍານພາຫະນະທີ່ມີປ້າຍທະບຽນ',
    selectUnlicensedVehicle: 'ເລືອກຍານພາຫະນະທີ່ບໍ່ມີປ້າຍທະບຽນ',
    noLicensedVehicle: 'ບໍ່ມີຍານພາຫະນະທີ່ມີປ້າຍທະບຽນ.',
    noUnlicensedVehicle: 'ບໍ່ມີຍານພາຫະນະທີ່ບໍ່ມີປ້າຍທະບຽນ.',
    noLicensePlate: 'ບໍ່ມີປ້າຍທະບຽນ',

    selectTerm: 'ເລືອກພາກຮຽນ',
    noTerm: 'ບໍ່ມີພາກຮຽນ.',
    selectTermFirst: 'ກະລຸນາເລືອກພາກຮຽນກ່ອນ.',

    selectPaymentMethod: 'ເລືອກວິທີຊຳລະເງິນ',
    noAvailablePaymentMethod:
      'ແພັກເກດນີ້ບໍ່ມີວິທີຊຳລະເງິນທີ່ພ້ອມໃຊ້.',
    pricingLoadError: 'ບໍ່ສາມາດໂຫຼດລາຄາໄດ້. ກະລຸນາລອງໃໝ່.',

    monthlyPayment: 'ຊຳລະລາຍເດືອນ',
    monthlyPaymentDesc:
      'ລະບົບຈະສ້າງໃບແຈ້ງໜີ້ ແລະ ສົ່ງການແຈ້ງເຕືອນຊຳລະເງິນທຸກເດືອນ.',
    fullPayment: 'ຊຳລະເຕັມຈຳນວນ',
    fullPaymentDesc:
      'ຊຳລະຄັ້ງດຽວສຳລັບໄລຍະເວລາລົງທະບຽນທັງໝົດ.',
    recommended: 'ແນະນຳ',
    discount: 'ສ່ວນຫຼຸດ {{discount}}%',

    summary: 'ສະຫຼຸບການຊຳລະ',
    plan: 'ແພັກເກດ',
    term: 'ພາກຮຽນ',
    vehicle: 'ຍານພາຫະນະ',
    paymentMethod: 'ວິທີຊຳລະ',
    amount: 'ຈຳນວນເງິນ',

    paymentNoteTitle: 'ຂໍ້ມູນການຊຳລະ',
    monthlyPaymentNote:
      'ຫຼັງຈາກຢືນຢັນ, ລະບົບຈະສ້າງໃບແຈ້ງໜີ້ລາຍເດືອນ ແລະ ສົ່ງການແຈ້ງເຕືອນຊຳລະເງິນ.',
    fullPaymentNote:
      'ກົດ “ຊຳລະດ້ວຍ MoMo” ເພື່ອເປີດ MoMo ຫຼື browser ແລະ ຊຳລະໃຫ້ສຳເລັດ.',

    pay: 'ຊຳລະ',
    payWithMomo: 'ຊຳລະດ້ວຍ MoMo',
    payWithWallet: 'ຊຳລະດ້ວຍກະເປົາເງິນ',
    choosePayMethod: 'ເລືອກວິທີຊຳລະ',
    walletBalance: 'ຍອດເງິນໃນກະເປົາ: {{balance}}',
    insufficientWallet: 'ຍອດເງິນໃນກະເປົາບໍ່ພຽງພໍ. ກະລຸນາເຕີມເງິນ ຫຼື ເລືອກ MoMo.',
    walletPaymentSuccess: 'ຊຳລະດ້ວຍກະເປົາເງິນສຳເລັດ.',
    momoNote: 'ດຳເນີນໄປທີ່ MoMo ເພື່ອຊຳລະໃຫ້ສຳເລັດ.',
    monthlyWalletRequired:
      'ການຊຳລະລາຍເດືອນຕ້ອງໃຊ້ກະເປົາເງິນ. ກະລຸນາກວດສອບວ່າກະເປົາຂອງທ່ານມີຍອດເງິນພໍສຳລັບເດືອນທຳອິດ.',
    setupRecurring: 'ຢືນຢັນການສະໝັກ',
    recurringSetupSuccess: 'ຕັ້ງຄ່າການສະໝັກລາຍເດືອນສຳເລັດ.',

    missingData:
      'ກະລຸນາເລືອກຍານພາຫະນະ, ພາກຮຽນ ແລະ ວິທີຊຳລະ.',
    noPaymentUrl: 'ບໍ່ມີ URL ຊຳລະເງິນ MoMo ຖືກສົ່ງກັບມາ.',
    cannotOpenPaymentUrl:
      'ອຸປະກອນນີ້ບໍ່ສາມາດເປີດ URL ຊຳລະເງິນ MoMo ໄດ້.',
    redirectingMomoTitle: 'ກຳລັງໄປທີ່ MoMo',
    redirectingMomoAndroid:
      'ຖ້າແອັບບໍ່ເປີດກັບມາອັດຕະໂນມັດ, ທ່ານສາມາດກັບມາເອງຫຼັງຈາກຊຳລະເງິນ.',
    redirectingMomoIos:
      'ທ່ານສາມາດກັບມາທີ່ແອັບຫຼັງຈາກຊຳລະເງິນ.',
    paymentFailed: 'ການຊຳລະ MoMo ລົ້ມເຫຼວ.',
    noSelectedPlan: 'ຍັງບໍ່ໄດ້ເລືອກແພັກເກດຝາກລົດ.',
  },

  wallet: {
    title: 'ກະເປົາເງິນອິເລັກໂທຣນິກ',
    screenTitle: 'ກະເປົາເງິນ',
    atmCardTitle: 'ບັດ ATM',
    balance: 'ຍອດເງິນ',
    availableBalance: 'ຍອດເງິນທີ່ໃຊ້ໄດ້',
    status: 'ສະຖານະ',
    topupAmount: 'ຈຳນວນເງິນທີ່ເຕີມ',
    topupAmountPlaceholder: 'ປ້ອນຈຳນວນເງິນ',
    topup: 'ເຕີມເງິນ',
    confirmTopup: 'ຢືນຢັນການເຕີມເງິນ',
    topupWarning:
      'ເຕີມເງິນພຽງແຕ່ຈຳນວນທີ່ຕ້ອງໃຊ້ຊຳລະເທົ່ານັ້ນ. ລະບົບຍັງບໍ່ຮອງຮັບການຖອນເງິນ. ຖ້າຕ້ອງການຊ່ວຍເຫຼືອ ກະລຸນາຕິດຕໍ່ຫ້ອງການກິດຈະການນັກສຶກສາ.',
    invalidAmount: 'ຈຳນວນເງິນບໍ່ຖືກຕ້ອງ',
    noPaymentUrl: 'ບໍ່ໄດ້ຮັບ URL ຊຳລະເງິນ MoMo.',
    cannotOpenPaymentUrl: 'ອຸປະກອນນີ້ບໍ່ສາມາດເປີດ URL ຊຳລະເງິນ MoMo ໄດ້.',
    redirectingMomo: 'ກຳລັງໄປທີ່ MoMo...',
    topupFailed: 'ເຕີມເງິນລົ້ມເຫຼວ.',
    unavailable: 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນກະເປົາເງິນໄດ້.',

    transactionsHistory: 'ປະຫວັດທຸລະກຳ',
    recentTransactions: 'ທຸລະກຳຫຼ້າສຸດ',
    seeAll: 'ເບິ່ງທັງໝົດ',
    all: 'ທັງໝົດ',
    income: 'ລາຍຮັບ',
    expense: 'ລາຍຈ່າຍ',
    history: 'ປະຫວັດ',
    card: 'ບັດ',
  },

  presentCard: {
    title: 'ສະແດງບັດເຂົ້າອອກບ່ອນຝາກລົດ',
    subtitle:
      'ໃຊ້ລະຫັດບັດດິຈິຕອນເພື່ອຢືນຢັນຕົວຕົນເມື່ອເຂົ້າ/ອອກບ່ອນຝາກລົດຂອງໂຮງຮຽນ.',
    schoolName: 'TRƯỜNG ĐẠI HỌC SPKT HƯNG YÊN',
    cardType: 'ບັດເຂົ້າອອກບ່ອນຝາກລົດນັກສຶກສາ',
    loading: 'ກຳລັງໂຫຼດຂໍ້ມູນບັດ...',
    loadError: 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນບັດໄດ້.',
    fullName: 'ຊື່ນັກສຶກສາ:',
    userCode: 'ລະຫັດນັກສຶກສາ:',
    noUser: 'ບໍ່ມີຂໍ້ມູນຜູ້ໃຊ້.',
    noCard: 'ບໍ່ພົບບັດເຂົ້າອອກບ່ອນຝາກລົດ.',
    noBarcode: 'ບໍ່ມີ barcode.',
    warning: {
      title: 'ໝາຍເຫດໃນການໃຊ້ບັດຝາກລົດ',
      rule1: 'ບັດຝາກລົດນັກສຶກສາມີອາຍຸການໃຊ້ງານຕະຫຼອດໄລຍະທີ່ນັກສຶກສາຮຽນຢູ່.',
      rule2: 'ບັດຝາກລົດນັກສຶກສາໃຊ້ເພື່ອຢືນຢັນຕົວຕົນເມື່ອຝາກລົດໃນວິທະຍາເຂດ.',
      rule3: 'ນັກສຶກສາບໍ່ອະນຸຍາດໃຫ້ຢືມ, ລຶບ ຫຼື ແກ້ໄຂຂໍ້ມູນບັດໂດຍບໍ່ໄດ້ຮັບອະນຸຍາດ.',
      rule4: 'ໃນກໍລະນີທີ່ບັດນັກສຶກສາຂອງທ່ານສູນເສຍ ຫຼື ເສຍຫາຍ, ກະລຸນາຕິດຕໍ່ຫາຫ້ອງການຄຸ້ມຄອງນັກສຶກສາໂດຍດ່ວນ (ຜ່ານພະແນກບໍລິການປະຕູດຽວ) ເພື່ອໃຫ້ອອກບັດໃໝ່ໃຫ້.',
    },
    reportLostSuccess: 'ບັດຖືກລາຍງານວ່າສູນເສຍສຳເລັດ.',
    reportLostFailed: 'ລົ້ມເຫຼວໃນການລາຍງານບັດທີ່ສູນເສຍ. ກະລຸນາພະຍາຍາມອີກຄັ້ງ.',
  },

  paymentReturn: {
    title: 'ສະຖານະການຊຳລະ',
    pendingDesc:
      'ທ່ານກຳລັງຖືກນຳໄປຍັງໜ້າຊຳລະເງິນ. ຫຼັງຈາກຊຳລະສຳເລັດ ກະລຸນາກັບມາທີ່ແອັບເພື່ອກວດສອບສະຖານະ.',
    defaultDesc:
      'ຖ້າທ່ານຫາກໍ່ຊຳລະເງິນສຳເລັດ, ກະລຸນາກັບມາທີ່ແອັບເພື່ອກວດສອບສະຖານະການຊຳລະ.',
    invoice: 'ໃບແຈ້ງໜີ້',
    backToPlans: 'ກັບໄປແພັກເກດຝາກລົດ',
  },

  parkingHistory: {
    title: 'ປະຫວັດເຂົ້າ-ອອກ',
    subtitle:
      'ຕິດຕາມປະຫວັດການຝາກລົດ, ເວລາເຂົ້າ/ອອກ ແລະ ສະຖານະຮອບຝາກລົດ.',

    loading: 'ກຳລັງໂຫຼດຮອບຝາກລົດ...',
    filter: 'ກັ່ນຕອງ',
    fromDate: 'ຈາກວັນທີ',
    toDate: 'ເຖິງວັນທີ',
    selectDate: 'ເລືອກວັນທີ',
    clearFilters: 'ລ້າງ',
    vehicleMode: 'Vehicle mode',
    modeAll: 'All',
    modeLicensed: 'Licensed',
    modeUnlicensed: 'Unlicensed',
    licensePlate: 'License plate',
    licensePlatePlaceholder: 'Search by license plate',

    unknownVehicle: 'ຍານພາຫະນະ',
    noLicensePlate: 'ບໍ່ມີປ້າຍທະບຽນ',

    checkIn: 'ເຂົ້າ',
    checkOut: 'ອອກ',
    notYet: 'ຍັງບໍ່ມີ',
    status: {
      active: 'ກຳລັງໃຊ້ງານ',
      done: 'ສຳເລັດ',
    },
    amount: 'ຈຳນວນເງິນ',

    empty: 'ບໍ່ພົບຮອບຝາກລົດ.',
    loadError: 'ບໍ່ສາມາດໂຫຼດຮອບຝາກລົດໄດ້.',

    prev: 'ກ່ອນໜ້າ',
    next: 'ຖັດໄປ',
    pageOf: '{{page}} / {{totalPages}}',
    showingRange: 'ສະແດງ {{from}}-{{to}} / {{total}} ຮອບຝາກລົດ',
  },

  invoices: {
    title: 'ໃບແຈ້ງໜີ້',
    subtitle: 'ຕິດຕາມໃບແຈ້ງໜີ້ ແລະ ຊຳລະໜີ້ຄ້າງ.',
    loading: 'ກຳລັງໂຫຼດໃບແຈ້ງໜີ້...',
    loadError: 'ບໍ່ສາມາດໂຫຼດໃບແຈ້ງໜີ້ໄດ້.',
    empty: 'ບໍ່ພົບໃບແຈ້ງໜີ້.',

    filters: {
      title: 'ກັ່ນຕອງ',
      from: 'ຈາກວັນທີ',
      to: 'ເຖິງວັນທີ',
      selectDate: 'ເລືອກວັນທີ',
      status: 'ສະຖານະ',
      statusAll: 'ທຸກສະຖານະ',
      clear: 'ລ້າງ',
    },

    card: {
      invoice: 'ໃບແຈ້ງໜີ້',
      createdAt: 'ສ້າງເມື່ອ',
      paymentMethod: 'ວິທີຊຳລະ',
      copySuccess: 'ຄັດລອກລະຫັດໃບແຈ້ງໜີ້ແລ້ວ',
    },

    status: {
      paid: 'ຊຳລະແລ້ວ',
      pending: 'ລໍຖ້າຊຳລະ',
      failed: 'ລົ້ມເຫຼວ',
    },

    actions: {
      payWithMomo: 'ຊຳລະດ້ວຍ MoMo',
      retryPayment: 'ລອງຊຳລະໃໝ່',
      momoMissingUrl: 'ບໍ່ມີ URL ຊຳລະເງິນ MoMo ຖືກສົ່ງກັບມາ.',
      cannotOpenPaymentUrl: 'ອຸປະກອນນີ້ບໍ່ສາມາດເປີດ URL ຊຳລະເງິນ MoMo ໄດ້.',
    },

    pagination: {
      prev: 'ກ່ອນໜ້າ',
      next: 'ຖັດໄປ',
      pageOf: '{{page}} / {{totalPages}}',
      showingRange: 'ສະແດງ {{from}}-{{to}} / {{total}} ໃບແຈ້ງໜີ້',
    },
  },

  profile: {
    title: 'ຂໍ້ມູນສ່ວນຕົວ',
    subtitle: 'ຈັດການຂໍ້ມູນບັນຊີ ແລະ ແພັກເກດຝາກລົດຂອງທ່ານ.',

    accountInfo: 'ຂໍ້ມູນບັນຊີ',
    userCode: 'ລະຫັດຜູ້ໃຊ້',
    fullName: 'ຊື່ເຕັມ',
    email: 'ອີເມວ',
    phoneNumber: 'ເບີໂທ',

    fullNamePlaceholder: 'ປ້ອນຊື່ເຕັມ',
    emailPlaceholder: 'ປ້ອນອີເມວ',
    phoneNumberPlaceholder: 'ປ້ອນເບີໂທ',

    fullNameRequired: 'ກະລຸນາປ້ອນຊື່ເຕັມ.',
    emailRequired: 'ກະລຸນາປ້ອນອີເມວ.',
    invalidEmail:
      'ອີເມວບໍ່ຖືກຕ້ອງ ຫຼື ບໍ່ອະນຸຍາດໂດເມນທີ່ມີອັກຂະລະພິເສດ.',
    invalidPhone: 'ເບີໂທຕ້ອງມີ 10 ຕົວເລກເທົ່ານັ້ນ.',

    updateSuccess: 'ອັບເດດໂປຣໄຟລ໌ສຳເລັດ.',
    updateFailed: 'ອັບເດດໂປຣໄຟລ໌ລົ້ມເຫຼວ.',
    saveChanges: 'ບັນທຶກການປ່ຽນແປງ',

    noUserInfo: 'ຂໍ້ມູນຜູ້ໃຊ້ຍັງບໍ່ໄດ້ຖືກໂຫຼດ.',

    personalManagement: 'ການຈັດການສ່ວນຕົວ',
    subscriptions: 'ແພັກເກດທີ່ລົງທະບຽນ',
    subscriptionsDesc: 'ເບິ່ງແພັກເກດຝາກລົດປັດຈຸບັນ ແລະ ປະຫວັດການລົງທະບຽນ.',

    personalInfo: "ຂໍ້ມູນສ່ວນຕົວ",
    changePassword: "ປ່ຽນລະຫັດຜ່ານ",
    transactionHistory: "ປະຫວັດການໃຊ້ຈ່າຍ",
    invoice: "ໃບແຈ້ງໜີ້",
    currentPassword: "ລະຫັດຜ່ານປັດຈຸບັນ",
    currentPasswordPlaceholder: "ປ້ອນລະຫັດຜ່ານປັດຈຸບັນ",
    currentPasswordRequired: "ກະລຸນາປ້ອນລະຫັດຜ່ານປັດຈຸບັນ",
    changePasswordSuccess: "ປ່ຽນລະຫັດຜ່ານສຳເລັດ",
    changePasswordFailed: "ປ່ຽນລະຫັດຜ່ານບໍ่ສຳເລັດ",

    account: 'ບັນຊີ',
    logout: 'ອອກຈາກລະບົບ',

    logoutConfirmTitle: 'ຢືນຢັنການອອກຈາກລະບົບ',
    logoutConfirmMessage: 'ທ່ານແມ່ໃຈບໍວ່າຕ້ອງການອອກຈາກບັນຊີนි?',
  },

  userSubscriptions: {
    subscriptionCode: 'ລະຫັດການສະໝັກ',
    title: 'ແພြက်ເက်တိုင်းလျင်',
    subtitle: 'ຕິດຕາມແພັກເກດຝາກລົດ, ພາກຮຽນ ແລະ ສະຖານະການໃຊ້ງານ.',
    loadError: 'ບໍ່ສາມາດໂຫຼດແພັກເກດທີ່ລົງທະບຽນໄດ້.',
    filterTitle: 'ກັ່ນຕອງສະຖານະ',
    empty: 'ຍັງບໍ່ມີແພັກເກດທີ່ລົງທະບຽນ.',
    emptyDesc: 'ແພັກເກດຝາກລົດທີ່ທ່ານລົງທະບຽນຈະສະແດງຢູ່ບ່ອນນີ້.',
    subscriptionId: 'ID: {{id}}',
    period: 'ໄລຍະເວລາ',
    totalAmount: 'ຈຳນວນເງິນລວມ',
    paidAmount: 'ຈຳນວນເງິນທີ່ຊຳລະແລ້ວ',
    debtAmount: 'ຄົງເຫຼືອ',
    status: {
      active: 'ກຳລັງໃຊ້ງານ',
      payment_due: 'ຮອດກຳນົດຊຳລະ',
      overdue: 'ເກີນກຳນົດ',
      canceled: 'ຖືກຍົກເລີກ',
      suspended: 'ຖືກລະງັບ',
      inactive: 'ບໍ່ໃຊ້ງານ',
    },
  },

  auth: {
    loginTitle: 'ເຂົ້າສູ່ລະບົບ',
    loginSubtitle: 'ເຂົ້າໃຊ້ລະບົບຝາກລົດອັດສະລິຍະ',
    userCode: 'ລະຫັດຜູ້ໃຊ້',
    userCodePlaceholder: 'ປ້ອນລະຫັດຜູ້ໃຊ້',
    password: 'ລະຫັດຜ່ານ',
    passwordPlaceholder: 'ປ້ອນລະຫັດຜ່ານ',
    loginButton: 'ເຂົ້າສູ່ລະບົບ',
    forgotPassword: 'ລືມລະຫັດຜ່ານ?',
    language: 'ພາສາ',
    forgotTitle: 'ລືມລະຫັດຜ່ານ',
    forgotSubtitle: 'ປ້ອນລະຫັດຜູ້ໃຊ້ເພື່ອດຳເນີນຕໍ່',
    sendRequest: 'ສົ່ງຄຳຂໍ',
    stepRequest: 'ຄຳຂໍ',
    stepVerify: 'ຢືນຢັນ',
    stepReset: 'ຣີເຊັດ',
    email: 'ອີເມວ',
    emailPlaceholder: 'ປ້ອນອີເມວ',
    resend: 'ສົ່ງລະຫັດໃໝ່',
    resendIn: 'ສົ່ງໃໝ່ໃນ',
    codeSent: 'ສົ່ງລະຫັດຢືນຢັນໄປທີ່ອີເມວຂອງທ່ານແລ້ວ.',
    verificationCode: 'ລະຫັດຢືນຢັນ',
    codePlaceholder: '6 ຕົວເລກ',
    userCodeRequired: 'ຕ້ອງປ້ອນລະຫັດຜູ້ໃຊ້',
    invalidEmail: 'ອີເມວບໍ່ຖືກຕ້ອງ',
    invalidCode: 'ລະຫັດບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸ',
    requestFailed: 'ສົ່ງຄຳຂໍລົ້ມເຫຼວ',
    verifyFailed: 'ຢືນຢັນລົ້ມເຫຼວ',
    resetFailed: 'ຣີເຊັດລົ້ມເຫຼວ',
    loginFailed: 'ເຂົ້າລະບົບລົ້ມເຫຼວ',
    networkError: 'ຂໍ້ຜິດພາດເຄືອຂ່າຍ: ບໍ່ສາມາດເຂົ້າເຖິງ API. ຖ້າໃຊ້ Android emulator ຢ່າໃຊ້ localhost; ໃຫ້ໃຊ້ IP ຄອມພິວເຕີ ຫຼື 10.0.2.2.',
    userOrPasswordInvalid: 'ລະຫັດຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ',
    userNotFound: 'ບໍ່ພົບຜູ້ໃຊ້',
    emailMismatch: 'ອີເມວບໍ່ກົງກັບລະຫັດຜູ້ໃຊ້',
    userOrEmailInvalid: 'ລະຫັດຜູ້ໃຊ້ ຫຼື ອີເມວບໍ່ຖືກຕ້ອງ',
    newPassword: 'ລະຫັດຜ່ານໃໝ່',
    newPasswordPlaceholder: 'ປ້ອນລະຫັດຜ່ານໃໝ່',
    confirmPassword: 'ຢືນຢັນລະຫັດຜ່ານ',
    confirmPasswordPlaceholder: 'ປ້ອນລະຫັດຜ່ານໃໝ່ອີກຄັ້ງ',
    updatePassword: 'ອັບເດດລະຫັດຜ່ານ',
    passwordUpdated: 'ອັບເດດລະຫັດຜ່ານແລ້ວ.',
    passwordRules: 'ລະຫັດຜ່ານບໍ່ກົງຕາມເງື່ອນໄຂ',
    passwordMismatch: 'ລະຫັດຜ່ານບໍ່ກົງກັນ',
    passwordRuleText:
      '8-20 ຕົວອັກສອນ, ຢ່າງໜ້ອຍ 1 ຕົວພິມໃຫຍ່, 1 ຕົວພິມນ້ອຍ, 1 ຕົວເລກ, 1 ອັກຂະລະພິເສດ (!@#$%^&*()_-+=[]{}?/|)',
    backToLogin: 'ກັບໄປໜ້າເຂົ້າສູ່ລະບົບ',
    fieldRequired: 'ຈຳເປັນຕ້ອງປ້ອນຊ່ອງນີ້',
  },
};

export default lo;

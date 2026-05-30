const vi = {
  common: {
    all: 'Tất cả',
    success: 'Thành công',
    error: 'Lỗi',
    loading: 'Đang xử lý...',
    next: 'Tiếp theo',
    back: 'Quay lại',
    retry: 'Thử lại',
    cancel: 'Huỷ',
    resetChanges: 'Đặt lại',
    continue: 'Tiếp tục',
    vehicleMode: {
      licensed: 'Có biển số',
      unlicensed: 'Không có biển số',
    },
    parkingAccessCardStatus: {
      available: 'Có sẵn',
      assigned: 'Đã cấp',
      active: 'Đang hoạt động',
      disable: 'Vô hiệu hóa',
      lost: 'Mất',
    },
    userWalletStatus: {
      active: 'Hoạt động',
      locked: 'Bị khoa',
    },
    paymentMethod: {
      CASH: "Tiền mặt",
      MOMO: "MoMo",
      WALLET: "Ví điện tử",
      SYSTEM: "Hệ thống",
    },
    dateRange: {
      invalidDateRange: "Ngày kết thúc không được nhỏ hơn ngày bắt đầu.",
    },
  },

  tabs: {
    home: 'Trang chủ',
    plan: 'Vé gửi xe',
    sessions: 'Phiên gửi xe',
    plans: 'Vé gửi xe',
    profile: 'Cá nhân',
  },

  notifications: {
    title: 'Thông báo',
    viewAll: 'Xem tất cả',
    empty: 'Chưa có thông báo.',
    payment: {
      title: 'Thanh toán',
      success: 'Thanh toán thành công{{invoicePart}}.',
      failed: 'Thanh toán thất bại{{invoicePart}}.',
    },
    topUp: {
      title: 'Nạp tiền',
      success: 'Nạp tiền thành công{{amountPart}}{{invoicePart}}.',
      failed: 'Nạp tiền thất bại{{invoicePart}}.',
    },
    subscription: {
      title: 'Vé gửi xe',
      success: 'Thanh toán vé xe thành công{{invoicePart}}.',
      pending: 'Thanh toán vé xe đang chờ xử lý{{invoicePart}}.',
      failed: 'Thanh toán vé xe thất bại{{invoicePart}}.',
    },
    filter: {
      all: 'Tất cả',
      system: 'Hệ thống',
      payment: 'Thanh toán',
      timeAll: 'Mọi thời gian',
      last7d: '7 ngày gần đây',
      last30d: '30 ngày gần đây',
    },
  },

  transactions: {
    empty: 'Không có giao dịch.',
    invoice: 'Hóa đơn',
    tx: 'Giao dịch',
    filters: {
      title: 'Bộ lọc',
      fromDate: 'Từ ngày',
      toDate: 'Đến ngày',
      invoiceId: 'Mã hóa đơn',
      invoiceIdPlaceholder: 'Nhập mã hóa đơn',
      transactionCode: 'Mã giao dịch',
      transactionCodePlaceholder: 'Nhập mã giao dịch',
      direction: 'Dòng tiền',
      type: 'Loại giao dịch',
      clear: 'Xóa bộ lọc',
    },
    direction: {
      all: 'Tất cả',
      in: 'Tiền vào',
      out: 'Tiền ra',
    },
    type: {
      all: 'Tất cả',
      TOP_UP: 'Nạp tiền',
      SUBSCRIPTION_FULL_PAYMENT: 'Thanh toán vé gửi xe',
      MONTHLY_CHARGE: 'Trừ phí theo tháng',
      INVOICE_DIRECT_PAYMENT: 'Thanh toán hóa đơn',
      REFUND: 'Hoàn tiền',
      ADMIN_ADJUSTMENT: 'Điều chỉnh hệ thống',
    },
  },

  drawer: {
    title: 'Menu',
    subtitle: 'Truy cập nhanh tài khoản',
    noUserInfo: 'Chưa có thông tin người dùng.',
    quickAccess: 'Truy cập nhanh',
    language: 'Ngôn ngữ',
    currentLanguage: 'Ngôn ngữ hiện tại',
    profileDesc: 'Xem và cập nhật thông tin tài khoản.',
  },

  plans: {
    title: 'Vé gửi xe',
    subtitle: 'Chọn vé gửi xe phù hợp và tiến hành thanh toán.',

    loading: 'Đang tải danh sách vé gửi xe...',
    loadError: 'Không tải được danh sách vé gửi xe.',
    empty: 'Chưa có vé gửi xe khả dụng.',

    current: 'Đang sử dụng',
    register: 'Đăng ký',

    basic: 'Vé cơ bản',
    startup: 'Vé linh hoạt',
    enterprise: 'Vé toàn diện',

    perDay: '/ ngày',

    monthlyPayment: 'Hỗ trợ thanh toán theo tháng',
    fullPayment: 'Hỗ trợ thanh toán toàn bộ',
    noFullPayment: 'Không hỗ trợ thanh toán toàn bộ',

    dailyFee: 'Phí theo ngày: {{price}}',
    after18Free: 'Miễn phí sau 18:00',
    after18Fee: 'Sau 18:00: {{price}}',
    inUseBadge: "Đang sử dụng",
    viewCurrentPlan: "Xem vé gửi xe đã đăng ký",
    currentPlanFallback: 'Vé gửi xe hiện tại',
    overrideActivePlanDialog: {
      title: 'Bạn đang có vé gửi xe cần xử lý',
      message:
        'Bạn đang có vé gửi xe {{plan}} với trạng thái {{status}}. Nếu đăng ký vé gửi xe mới, vé gửi xe cũ sẽ được chuyển sang trạng thái đã hủy nhưng vẫn tiếp tục được theo dõi công nợ nếu còn thiếu. Số tiền còn thiếu: {{debt}}. Bạn có muốn tiếp tục?',
    },  
  },

  checkout: {
    title: 'Thanh toán vé gửi xe',
    subtitle: 'Hoàn tất thông tin cho vé gửi xe {{plan}}',

    stepVehicle: 'Xe',
    stepTerm: 'Học kỳ',
    stepPaymentMethod: 'Hình thức',
    stepConfirm: 'Xác nhận',

    selectLicensedVehicle: 'Chọn xe có biển số',
    selectUnlicensedVehicle: 'Chọn xe không có biển số',
    noLicensedVehicle: 'Chưa có xe có biển số.',
    noUnlicensedVehicle: 'Chưa có xe không biển số.',
    noLicensePlate: 'Không biển số',

    selectTerm: 'Chọn học kỳ',
    noTerm: 'Chưa có học kỳ khả dụng.',
    selectTermFirst: 'Vui lòng chọn học kỳ trước.',

    selectPaymentMethod: 'Chọn hình thức thanh toán',
    noAvailablePaymentMethod: 'Vé gửi xe này chưa có hình thức thanh toán khả dụng.',
    pricingLoadError: 'Không tải được bảng giá. Vui lòng thử lại.',

    monthlyPayment: 'Thanh toán hàng tháng',
    monthlyPaymentDesc:
      'Hệ thống sẽ tự động thanh toán hàng tháng bằng ví điện tử và gửi email thông báo.',
    fullPayment: 'Thanh toán toàn bộ',
    fullPaymentDesc:
      'Thanh toán một lần cho toàn bộ thời gian đăng ký.',
    recommended: 'Đề xuất',
    discount: 'Giảm giá: {{discount}}%',

    summary: 'Tóm tắt thanh toán',
    plan: 'Vé gửi xe',
    term: 'Học kỳ',
    vehicle: 'Phương tiện',
    paymentMethod: 'Hình thức',
    amount: 'Số tiền',

    paymentNoteTitle: 'Thông tin thanh toán',
    monthlyPaymentNote:
      'Sau khi xác nhận, hệ thống sẽ tạo hóa đơn định kỳ theo tháng và gửi thông báo nhắc thanh toán.',
    fullPaymentNote:
      'Bấm “Thanh toán MoMo” để chuyển sang MoMo hoặc trình duyệt và hoàn tất thanh toán.',

    pay: 'Thanh toán',
    payWithMomo: 'Thanh toán MoMo',
    payWithWallet: 'Thanh toán bằng ví',
    choosePayMethod: 'Chọn phương thức thanh toán',
    walletBalance: 'Số dư ví: {{balance}}',
    insufficientWallet: 'Số dư ví không đủ, vui lòng nạp thêm hoặc chọn MoMo',
    walletPaymentSuccess: 'Thanh toán bằng ví thành công.',
    momoNote: 'Chuyển sang MoMo để hoàn tất thanh toán.',
    monthlyWalletRequired:
      'Thanh toán hàng tháng bắt buộc dùng ví. Vui lòng đảm bảo ví đủ số dư cho kỳ đầu tiên.',
    setupRecurring: 'Xác nhận đăng ký',
    recurringSetupSuccess: 'Đăng ký thanh toán hàng tháng thành công.',

    missingData:
      'Vui lòng chọn đầy đủ phương tiện, học kỳ và hình thức thanh toán.',
    noPaymentUrl: 'Không nhận được URL thanh toán MoMo.',
    cannotOpenPaymentUrl: 'Thiết bị không thể mở URL thanh toán MoMo.',
    redirectingMomoTitle: 'Đang chuyển sang MoMo',
    redirectingMomoAndroid:
      'Nếu không tự quay lại app, bạn có thể quay lại thủ công sau khi thanh toán.',
    redirectingMomoIos:
      'Bạn có thể quay lại app sau khi thanh toán.',
    paymentFailed: 'Thanh toán MoMo thất bại.',
    noSelectedPlan: 'Chưa có vé gửi xe được chọn.',
  },

  wallet: {
    title: 'Ví điện tử',
    screenTitle: 'Ví điện tử',
    atmCardTitle: 'Thẻ ATM',
    balance: 'Số dư',
    availableBalance: 'Số dư khả dụng',
    status: 'Trạng thái',
    topupAmount: 'Số tiền nạp',
    topupAmountPlaceholder: 'Nhập số tiền',
    topup: 'Nạp tiền',
    confirmTopup: 'Xác nhận nạp tiền',
    topupWarning:
      'Chỉ nạp đủ số tiền cần thanh toán. Hệ thống chưa hỗ trợ rút tiền. Nếu cần trợ giúp hãy liên hệ cho phòng công tác sinh viên.',
    invalidAmount: 'Số tiền không hợp lệ',
    noPaymentUrl: 'Không nhận được URL thanh toán MoMo.',
    cannotOpenPaymentUrl: 'Thiết bị không thể mở URL thanh toán MoMo.',
    redirectingMomo: 'Đang chuyển sang MoMo...',
    topupFailed: 'Nạp tiền thất bại.',
    unavailable: 'Không thể tải thông tin ví.',

    transactionsHistory: 'Lịch sử giao dịch',
    recentTransactions: 'Giao dịch gần đây',
    seeAll: 'Xem tất cả',
    all: 'Tất cả',
    income: 'Tiền vào',
    expense: 'Tiền ra',
    history: 'Lịch sử',
    card: 'Thẻ',
    loadTransactionsFailed: 'Không thể tải giao dịch.',
    noRecentTransactions: 'Chưa có giao dịch gần đây.',
  },

  presentCard: {
    title: 'Xuất trình thẻ gửi xe',
    subtitle:
      'Sử dụng mã thẻ điện tử để định danh khi ra / vào bãi gửi xe của trường.',
    schoolName: 'TRƯỜNG ĐẠI HỌC SPKT HƯNG YÊN',
    cardType: 'Thẻ gửi xe sinh viên',
    loading: 'Đang tải thông tin thẻ...',
    loadError: 'Không tải được thông tin thẻ.',
    fullName: 'Họ tên sinh viên:',
    userCode: 'Mã sinh viên:',
    noUser: 'Chưa có thông tin người dùng.',
    noCard: 'Chưa có thẻ ra vào.',
    noBarcode: 'Không có mã vạch.',
    warning: {
      title: 'Quy định sử dụng thẻ gửi xe sinh viên',
      rule1: 'Thẻ gửi xe sinh viên có hiệu lực trong thời gian học tập tại trường.',
      rule2: 'Thẻ gửi xe sinh viên được sử dụng để xác định danh tính sinh viên khi gửi xe trong trường.',
      rule3: 'Sinh viên không được cho mượn, tẩy xóa hoặc sửa đổi thông tin thẻ.',
      rule4: 'Trong trường hợp mất hoặc hư hỏng thẻ cần liên hệ ngay với phòng Công tác sinh viên (qua Bộ phận một cửa) để được cấp lại.',
    },
    reportLostSuccess: 'Thẻ đã được báo mất thành công.',
    reportLostFailed: 'Không thể báo mất thẻ. Vui lòng thử lại.',
  },

  paymentReturn: {
    title: 'Trạng thái thanh toán',
    pendingDesc:
      'Bạn đang được chuyển sang trang thanh toán. Sau khi thanh toán xong, hãy quay lại ứng dụng để kiểm tra trạng thái.',
    defaultDesc:
      'Nếu bạn vừa thanh toán, hãy quay lại ứng dụng để kiểm tra trạng thái thanh toán.',
    invoice: 'Hóa đơn',
    backToPlans: 'Về trang vé gửi xe',
  },

  parkingHistory: {
    title: 'Lịch sử gửi xe',
    subtitle:
      'Theo dõi lịch sử gửi xe, thời điểm vào/ra và trạng thái phiên gửi xe của bạn.',

    loading: 'Đang tải danh sách phiên gửi xe...',
    filter: 'Bộ lọc',
    fromDate: 'Từ ngày',
    toDate: 'Đến ngày',
    selectDate: 'Chọn ngày',
    clearFilters: 'Xóa lọc',
    vehicleMode: 'Chế độ xe',
    modeAll: 'Tất cả',
    modeLicensed: 'Có biển số',
    modeUnlicensed: 'Không biển số',
    licensePlate: 'Biển số',
    licensePlatePlaceholder: 'Tìm theo biển số',

    unknownVehicle: 'Phương tiện',
    noLicensePlate: 'Không biển số',

    checkIn: 'Check-in',
    checkOut: 'Check-out',
    notYet: 'Chưa có',
    status: {
      active: 'Đang gửi',
      done: 'Hoàn tất',
    },
    amount: 'Số tiền',

    empty: 'Chưa có phiên gửi xe.',
    loadError: 'Không tải được danh sách phiên gửi xe.',

    prev: 'Trước',
    next: 'Sau',
    pageOf: '{{page}} / {{totalPages}}',
    showingRange: 'Hiển thị {{from}}-{{to}} / {{total}} phiên',
  },

  invoices: {
    title: 'Hóa đơn',
    subtitle: 'Theo dõi hóa đơn và thanh toán công nợ của bạn.',
    loading: 'Đang tải danh sách hóa đơn...',
    loadError: 'Không tải được hóa đơn.',
    empty: 'Chưa có hóa đơn.',

    filters: {
      title: 'Bộ lọc',
      from: 'Từ ngày',
      to: 'Đến ngày',
      selectDate: 'Chọn ngày',
      status: 'Trạng thái',
      statusAll: 'Tất cả trạng thái',
      clear: 'Xóa lọc',
    },

    card: {
      invoice: 'Hóa đơn',
      createdAt: 'Ngày tạo',
      paymentMethod: 'Phương thức',
      copySuccess: "Đã sao chép mã hóa đơn vào clipboard",
    },

    status: {
      paid: 'Đã thanh toán',
      pending: 'Chờ thanh toán',
      failed: 'Thất bại',
    },

    actions: {
      payWithMomo: 'Thanh toán MoMo',
      retryPayment: 'Thanh toán lại',
      momoMissingUrl: 'Không nhận được URL thanh toán MoMo.',
      cannotOpenPaymentUrl: 'Thiết bị không thể mở URL thanh toán MoMo.',
    },

    pagination: {
      prev: 'Trước',
      next: 'Sau',
      pageOf: '{{page}} / {{totalPages}}',
      showingRange: 'Hiển thị {{from}}-{{to}} / {{total}} hóa đơn',
    },
  },

  profile: {
    title: 'Thông tin cá nhân',
    subtitle: 'Quản lý thông tin tài khoản và vé gửi xe.',

    accountInfo: 'Thông tin tài khoản',
    userCode: 'Mã người dùng',
    fullName: 'Họ và tên',
    email: 'Email',
    phoneNumber: 'Số điện thoại',

    fullNamePlaceholder: 'Nhập họ và tên',
    emailPlaceholder: 'Nhập email',
    phoneNumberPlaceholder: 'Nhập số điện thoại',

    fullNameRequired: 'Vui lòng nhập họ và tên.',
    emailRequired: 'Vui lòng nhập email.',
    invalidEmail: 'Email không hợp lệ hoặc chứa ký tự đặc biệt trong tên miền.',
    invalidPhone: 'Số điện thoại phải gồm đúng 10 chữ số.',

    updateSuccess: 'Cập nhật thông tin thành công.',
    updateFailed: 'Cập nhật thông tin thất bại.',
    saveChanges: 'Lưu thay đổi',

    noUserInfo: 'Chưa tải thông tin người dùng.',

    personalManagement: 'Quản lý cá nhân',
    subscriptions: 'Vé gửi xe đã đăng ký',
    subscriptionsDesc: 'Xem vé gửi xe hiện tại và lịch sử đăng ký.',

    personalInfo: "Thông tin cá nhân",
    changePassword: "Đổi mật khẩu",
    transactionHistory: "Lịch sử giao dịch",
    invoice: "Hóa đơn",
    currentPassword: "Mật khẩu hiện tại",
    currentPasswordPlaceholder: "Nhập mật khẩu hiện tại",
    currentPasswordRequired: "Vui lòng nhập mật khẩu hiện tại.",
    changePasswordSuccess: "Đổi mật khẩu thành công.",
    changePasswordFailed: "Đổi mật khẩu thất bại.",

    account: 'Tài khoản',
    logout: 'Đăng xuất',

    logoutConfirmTitle: 'Xác nhận đăng xuất',
    logoutConfirmMessage:
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?',
  },

  userSubscriptions: {
    subscriptionCode: 'Mã đăng ký',
    title: 'Vé gửi xe đã đăng ký',
    subtitle: 'Theo dõi vé gửi xe, học kỳ áp dụng và trạng thái sử dụng của bạn.',
    loadError: 'Không tải được danh sách vé gửi xe đã đăng ký.',
    filterTitle: 'Bộ lọc trạng thái',
    empty: 'Chưa có vé gửi xe đăng ký.',
    emptyDesc: 'Các vé gửi xe bạn đăng ký sẽ được hiển thị tại đây.',
    subscriptionId: 'Mã: {{id}}',
    period: 'Thời gian',
    totalAmount: 'Tổng tiền',
    paidAmount: 'Đã thanh toán',
    debtAmount: 'Còn thiếu',
    status: {
      active: 'Đang hoạt động',
      payment_due: 'Đến hạn thanh toán',
      overdue: 'Quá hạn',
      canceled: 'Đã hủy',
      suspended: 'Tạm ngưng',
      inactive: 'Không hoạt động',
    },
  },


  auth: {
    loginTitle: 'Đăng nhập',
    loginSubtitle: 'Truy cập hệ thống gửi xe thông minh',
    userCode: 'Mã người dùng',
    userCodePlaceholder: 'Nhập mã người dùng',
    password: 'Mật khẩu',
    passwordPlaceholder: 'Nhập mật khẩu',
    loginButton: 'Đăng nhập',
    forgotPassword: 'Quên mật khẩu?',
    language: 'Ngôn ngữ',
    forgotTitle: 'Quên mật khẩu',
    forgotSubtitle: 'Nhập mã người dùng để tiếp tục',
    sendRequest: 'Gửi yêu cầu',

    stepRequest: 'Gửi mã',
    stepVerify: 'Xác minh',
    stepReset: 'Đổi mật khẩu',
    email: 'Email',
    emailPlaceholder: 'Nhập email',
    resend: 'Gửi lại mã',
    resendIn: 'Gửi lại sau',
    codeSent: 'Đã gửi mã xác minh qua email.',
    verificationCode: 'Mã xác minh',
    codePlaceholder: 'Nhập 6 số',
    userCodeRequired: 'Vui lòng nhập mã người dùng',
    invalidEmail: 'Email không hợp lệ',
    invalidCode: 'Mã không đúng hoặc đã hết hạn',
    requestFailed: 'Gửi yêu cầu thất bại',
    verifyFailed: 'Xác minh thất bại',
    resetFailed: 'Đổi mật khẩu thất bại',
    loginFailed: 'Đăng nhập thất bại',
    networkError: 'Lỗi mạng: không gọi được API. Nếu chạy trên điện thoại/Android emulator, đừng dùng localhost; hãy dùng IP máy hoặc 10.0.2.2.',
    userOrPasswordInvalid: 'Mã người dùng hoặc mật khẩu không chính xác',
    userNotFound: 'Không tìm thấy người dùng',
    emailMismatch: 'Email không khớp với mã người dùng',
    userOrEmailInvalid: 'Mã người dùng hoặc email không chính xác',
    newPassword: 'Mật khẩu mới',
    newPasswordPlaceholder: 'Nhập mật khẩu mới',
    confirmPassword: 'Xác nhận mật khẩu',
    confirmPasswordPlaceholder: 'Nhập lại mật khẩu mới',
    updatePassword: 'Cập nhật',
    passwordUpdated: 'Đổi mật khẩu thành công.',
    passwordRules: 'Mật khẩu chưa đạt yêu cầu',
    passwordMismatch: 'Mật khẩu xác nhận không khớp',
    passwordRuleText:
      '8-20 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt (!@#$%^&*()_-+=[]{}?/|)',

    backToLogin: 'Quay lại đăng nhập',
    fieldRequired: 'Trường này là bắt buộc',
  },
};

export default vi;

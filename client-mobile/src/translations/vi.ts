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
    vehicleType: {
      motorbike: 'Xe máy',
      bicycle: 'Xe đạp',
      electricBicycle: 'Xe đạp điện',
    }
  },

  tabs: {
    home: 'Trang chủ',
    plan: 'Gói gửi xe',
    sessions: 'Phiên gửi xe',
    invoices: 'Hóa đơn',
    profile: 'Cá nhân',
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
    title: 'Gói gửi xe',
    subtitle: 'Chọn gói gửi xe phù hợp và tiến hành thanh toán.',

    loading: 'Đang tải danh sách gói...',
    loadError: 'Không tải được danh sách gói.',
    empty: 'Chưa có gói khả dụng.',

    current: 'Đang sử dụng',
    register: 'Đăng ký',

    basic: 'Cơ bản',
    startup: 'Khởi đầu',
    enterprise: 'Doanh nghiệp',

    perDay: '/ ngày',

    monthlyPayment: 'Hỗ trợ thanh toán theo tháng',
    fullPayment: 'Hỗ trợ thanh toán toàn bộ',
    noFullPayment: 'Không hỗ trợ thanh toán toàn bộ',

    maxLicensedVehicle: 'Tối đa 1 phương tiện có biển số',
    maxUnlicensedVehicle: 'Tối đa 1 phương tiện không có biển số',

    dailyFee: 'Phí theo ngày: {{price}} đ',
    after18Free: 'Miễn phí sau 18:00',
    after18Fee: 'Sau 18:00: {{price}} đ',
    inUseBadge: "Đang sử dụng",
    viewCurrentPlan: "Xem gói đã đăng ký",
    currentPlanFallback: 'gói hiện tại',
    overrideActivePlanDialog: {
      title: 'Bạn đang có gói gửi xe cần xử lý',
      message:
        'Bạn đang có gói {{plan}} với trạng thái {{status}}. Nếu đăng ký gói mới, gói cũ sẽ được chuyển sang trạng thái đã hủy nhưng vẫn tiếp tục được theo dõi công nợ nếu còn thiếu. Số tiền còn thiếu: {{debt}}. Bạn có muốn tiếp tục?',
    },  
  },

  checkout: {
    title: 'Thanh toán gói',
    subtitle: 'Hoàn tất thông tin cho gói {{plan}}',

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
    noAvailablePaymentMethod: 'Gói này chưa có hình thức thanh toán khả dụng.',
    pricingLoadError: 'Không tải được bảng giá. Vui lòng thử lại.',

    monthlyPayment: 'Thanh toán hàng tháng',
    monthlyPaymentDesc:
      'Hệ thống sẽ tự động tạo hóa đơn và gửi email yêu cầu thanh toán hàng tháng.',
    fullPayment: 'Thanh toán toàn bộ',
    fullPaymentDesc:
      'Thanh toán một lần cho toàn bộ thời gian đăng ký.',
    recommended: 'Đề xuất',

    summary: 'Tóm tắt thanh toán',
    plan: 'Gói',
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
    noSelectedPlan: 'Chưa có gói gửi xe được chọn.',
  },

  wallet: {
    title: 'Ví điện tử',
    balance: 'Số dư',
    status: 'Trạng thái',
    topupAmount: 'Số tiền nạp',
    topupAmountPlaceholder: 'Nhập số tiền',
    topup: 'Nạp tiền',
    invalidAmount: 'Số tiền không hợp lệ',
    noPaymentUrl: 'Không nhận được URL thanh toán MoMo.',
    cannotOpenPaymentUrl: 'Thiết bị không thể mở URL thanh toán MoMo.',
    redirectingMomo: 'Đang chuyển sang MoMo...',
    topupFailed: 'Nạp tiền thất bại.',
    unavailable: 'Không thể tải thông tin ví.',
  },

  presentCard: {
    schoolName: 'TRƯỜNG ĐẠI HỌC SPKT HƯNG YÊN',
    fullName: 'Họ tên sinh viên:',
    userCode: 'Mã sinh viên:',
    noUser: 'Chưa có thông tin người dùng.',
    noCard: 'Chưa có thẻ ra vào.',
    noBarcode: 'Không có mã vạch.',
  },

  paymentReturn: {
    title: 'Trạng thái thanh toán',
    pendingDesc:
      'Bạn đang được chuyển sang trang thanh toán. Sau khi thanh toán xong, hãy quay lại ứng dụng để kiểm tra trạng thái.',
    defaultDesc:
      'Nếu bạn vừa thanh toán, hãy quay lại ứng dụng để kiểm tra trạng thái thanh toán.',
    invoice: 'Hóa đơn',
    backToPlans: 'Về trang gói gửi xe',
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
    subtitle: 'Quản lý thông tin tài khoản và gói gửi xe.',

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
    subscriptions: 'Gói đã đăng ký',
    subscriptionsDesc: 'Xem gói gửi xe hiện tại và lịch sử đăng ký.',

    account: 'Tài khoản',
    logout: 'Đăng xuất',
    logoutDesc: 'Thoát khỏi tài khoản hiện tại.',

    logoutConfirmTitle: 'Xác nhận đăng xuất',
    logoutConfirmMessage:
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?',
  },

  userSubscriptions: {
    title: 'Gói đã đăng ký',
    subtitle: 'Theo dõi gói gửi xe, học kỳ áp dụng và trạng thái sử dụng của bạn.',
    loadError: 'Không tải được danh sách gói đã đăng ký.',
    filterTitle: 'Bộ lọc trạng thái',
    empty: 'Chưa có gói đăng ký.',
    emptyDesc: 'Các gói bạn đăng ký sẽ được hiển thị tại đây.',
    subscriptionId: 'Mã: {{id}}',
    term: 'Học kỳ',
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

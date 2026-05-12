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

    payWithMomo: 'Thanh toán MoMo',
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
    subtitle: 'Quản lý thông tin tài khoản, phương tiện và gói gửi xe.',

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
    vehicles: 'Phương tiện',
    vehiclesDesc: 'Quản lý danh sách phương tiện dùng để gửi xe.',
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

  vehicles: {
    title: "Phương tiện",
    subtitle: "Quản lý phương tiện có biển số và không có biển số của bạn.",
    loadError: "Không tải được danh sách phương tiện.",

    registerPlan: "Đăng ký gói gửi xe",
    addVehicle: "Thêm phương tiện",

    withPlate: "Có biển số",
    withoutPlate: "Không biển số",
    searchPlatePlaceholder: "Tìm theo biển số",

    empty: "Chưa có phương tiện.",
    emptyDesc: "Bạn có thể thêm phương tiện mới để đăng ký gói gửi xe.",

    autoBarcode: "Tự động tạo mã barcode",
    vehicleId: "Mã phương tiện",
    createdAt: "Ngày tạo",

    edit: "Sửa",
    delete: "Xóa",

    createSuccess: "Đã thêm phương tiện",
    updateSuccess: "Đã cập nhật phương tiện",
    deleteSuccess: "Đã xóa phương tiện",

    saveFailed: "Không thể lưu phương tiện.",
    deleteFailed: "Không thể xóa phương tiện.",

    deleteConfirmTitle: "Xóa phương tiện",
    deleteConfirmMessage: "Bạn có chắc muốn xóa phương tiện này không?",

    types: {
      motorbike: "Xe máy",
      bicycle: "Xe đạp",
      electric_bicycle: "Xe đạp điện",
    },

    form: {
      missingUser: "Không tìm thấy thông tin người dùng.",
      vehicleType: "Loại phương tiện",
      vehicleTypeRequired: "Vui lòng chọn loại phương tiện.",
      invalidVehicleType: "Loại phương tiện không hợp lệ.",
      licensePlate: "Biển số xe",
      licensePlateRequired: "Vui lòng nhập biển số xe.",
      licensePlatePlaceholder: "VD: 30K12345",
      barcodeNote:
        "Phương tiện không có biển số sẽ được hệ thống tự động tạo barcode sau khi lưu.",
    },

    modal: {
      createTitle: "Thêm phương tiện",
      editTitle: "Cập nhật phương tiện",
      subtitle: "Chọn loại phương tiện và nhập thông tin cần thiết.",
      create: "Lưu phương tiện",
      save: "Lưu thay đổi",
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

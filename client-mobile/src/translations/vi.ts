const vi = {
  common: {
    success: 'Thành công',
    error: 'Lỗi',
    loading: 'Đang xử lý...',
    next: 'Tiếp theo',
    back: 'Quay lại',
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

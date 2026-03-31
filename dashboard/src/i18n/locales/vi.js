const vi = {
  translation: {
    sideBar: {
      title: "Hệ thống bãi đỗ xe",
      children: {
        home: "Trang chủ",
        users: "Người dùng",
        parkingSessions: "Phiên gửi xe",
        resources: "Bảng dữ liệu",
        settings: "Cài đặt",
      },
    },
    pageTitle: {
      home: "Hệ thống quản lý bãi đỗ xe - Trường Đại học SPKT Hưng Yên",
      users: "Người dùng",
      parkingSessions: "Phiên gửi xe",
      settings: "Cài đặt",
    },
    breadcrumb: {
      home: "Trang chủ",
      users: "Người dùng",
      parkingSessions: "Phiên gửi xe",
      resources: "Bảng dữ liệu",
      settings: "Cài đặt",
    },
    button: {
      login: "Đăng nhập",
      logout: "Đăng xuất",
      register: "Đăng ký",
      btnAdd: "Thêm",
      btnEdit: "Chỉnh sửa",
      btnDelete: "Xóa",
      btnSearch: "Tìm kiếm",
      refresh: "Làm mới",
      cancel: "Hủy",
      save: "Lưu",
    },
    placeHolder: {
      search: "Tìm kiếm",
    },
    home: {
      title: "Trang chính",
      description:
        "Chào mừng {{name}}, đây là khu vực tổng quan giúp bạn tiếp cận nhanh các bảng dữ liệu quan trọng.",
      fallbackName: "bạn",
      cardInfo: "Có thể xem, thêm và lọc nhanh dữ liệu theo từng cột.",
      cardEndpoint: "Endpoint: /{{endpoint}}",
      quickAccessTitle: "Điểm nhanh",
      quickAccessDescription: "Sử dụng các nút bên dưới để chuyển nhanh đến từng bảng dữ liệu quan trọng.",
    },
    parkingEventsPage: {
      title: "Phiên gửi xe",
    },
    parkingSessionsPage: {
      title: "Phiên gửi xe",
      tableHeaders: {
        sessionId: "Mã phiên",
        vehicleId: "Phương tiện",
        checkIn: "Vào lúc",
        checkOut: "Ra lúc",
        totalDays: "Số ngày",
        amount: "Tiền",
        paymentMethod: "Hình thức",
      },
      exportButton: "Xuất phiên gửi xe",
      exportModal: {
        title: "Xuất danh sách phiên gửi xe",
        description: "Chọn khoảng thời gian check-in để xuất bảng, tên cột sẽ theo ngôn ngữ hiện tại.",
        fromLabel: "Từ ngày",
        toLabel: "Đến ngày",
        exportLabel: "Xuất file",
        cancelLabel: "Hủy",
        note: "Chỉ những phiên có thời gian check-in nằm trong khoảng này mới được xuất.",
        errors: {
          invalidRange: "Ngày bắt đầu phải trước hoặc trùng ngày kết thúc.",
        },
      },
    },
    usersPage: {
      title: "Quản lý người dùng",
      importButton: "Import danh sách {{role}}",
      importProcessing: "Đang xử lý...",
      importSuccess: "Đã import {{count}} người dùng cho {{role}}.",
      importErrorNoData: "Không tìm thấy dữ liệu hợp lệ trong tệp.",
      importHint:
        "Tệp XLSX phải có cột user_code, full_name và email; các cột khác sẽ bị bỏ qua.",
      importModal: {
        title: "Import danh sách sinh viên / giảng viên",
        description: "Chọn file Excel để xem trước dữ liệu trước khi tạo tài khoản.",
        searchPlaceholder: "Tìm theo mã, tên hoặc email",
        statusLabel: "Trạng thái bản ghi",
        statusOptions: {
          all: "Tất cả",
          valid: "Hợp lệ",
          invalid: "Thiếu / sai",
        },
        selectFile: "Chọn file",
        selectedFile: "File đã chọn: {{name}}",
        noRows: "Chưa có dữ liệu. Chọn file để xem trước.",
        tableHeaders: {
          userCode: "Mã người dùng",
          fullName: "Họ tên",
          email: "Email",
          status: "Trạng thái",
          errors: "Lỗi",
        },
        statusTags: {
          valid: "Sẵn sàng",
          invalid: "Cần sửa",
        },
        pagination: "Hàng mỗi trang",
        footer: {
          cancel: "Hủy",
          import: "Import user",
        },
        errors: {
          missingUserCode: "Thiếu mã người dùng",
          missingEmail: "Thiếu email",
          invalidEmail: "Email không hợp lệ",
        },
        warning: {
          partial: "{{invalidCount}} dòng lỗi sẽ được bỏ qua.",
        },
        toast: {
          noValidRows: "Không có dòng hợp lệ để import. Vui lòng kiểm tra lại file.",
          success: "Tạo {{count}} người dùng, bỏ qua {{skipped}} dòng lỗi.",
          error: "Import thất bại. {{message}}",
        },
      },
    },
    vehiclesPage: {
      title: "Phương tiện",
    },
    rolesPage: {
      title: "Vai trò",
    },
    userRolesPage: {
      title: "Vai trò người dùng",
    },
    termsPage: {
      title: "Học kỳ",
    },
    plansPage: {
      title: "Gói đăng ký",
    },
    subscriptionsPage: {
      title: "Đăng ký người dùng",
    },
    billingEventLogsPage: {
      title: "Sự kiện thanh toán",
    },
    resource: {
      dialogTitleAdd: "{{action}} {{resource}}",
      dialogTitleUpdate: "{{action}} {{resource}}",
      notFound: "Không tìm thấy nguồn dữ liệu yêu cầu. Vui lòng chọn bảng khác.",
    },
    accessDenied: {
      title: "Bạn không có quyền truy cập",
      description:
        "Chỉ tài khoản Admin mới được phép vào khu vực quản trị. Vui lòng đăng nhập lại bằng tài khoản đúng quyền.",
      backToHome: "Về trang chính",
      viewUsers: "Xem danh sách người dùng",
    },
    notFound: {
      title: "404 - Không tìm thấy trang",
      description: "Đường dẫn bạn yêu cầu không tồn tại. Quay lại trang chủ.",
    },
    settingsPage: {
      title: "⚙ Trang Cài Đặt",
      description: "Đây là nơi bạn có thể thiết lập các tùy chọn cho ứng dụng.",
    },
    notifications: {
      sendBy: "Gửi bởi {{sender}}",
      empty: "Không có thông báo mới",
      senders: {
        system: "Hệ thống",
      },
      times: {
        twoHours: "2 giờ trước",
        yesterday: "Hôm qua",
      },
      items: {
        permissions: {
          title: "Cập nhật quyền người dùng",
          detail: "Vai trò Sinh viên đã được điều chỉnh để phản ánh cấu trúc mới.",
        },
        vehicles: {
          title: "Đồng bộ dữ liệu xe mới",
          detail: "10 phương tiện vừa được nhập khẩu từ Excel.",
        },
      },
    },
    resources: {
      tables: {
        users: "Người dùng",
        vehicles: "Phương tiện",
        roles: "Vai trò",
        userRoles: "Vai trò người dùng",
        terms: "Học kỳ",
        plans: "Gói đăng ký",
        subscriptions: "Đăng ký người dùng",
        parkingSessions: "Phiên gửi xe",
        invoices: "Hóa đơn",
        paymentTransactions: "Giao dịch thanh toán",
        billingEventLogs: "Sự kiện thanh toán",
      },
    },
  },
};

export default vi;

const en = {
  common: {
    all: 'All',
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
    next: 'Next',
    back: 'Back',
    retry: 'Retry',
    cancel: 'Cancel',
    resetChanges: 'Reset changes',
    continue: 'Continue',
    vehicleMode: {
      licensed: 'Licensed',
      unlicensed: 'Unlicensed',
    },
    parkingAccessCardStatus: {
      available: 'Available',
      assigned: 'Assigned',
      active: 'Active',
      disable: 'Disabled',
      lost: 'Lost',
    },
    userWalletStatus: {
      active: 'Active',
      locked: 'Locked',
    },
    paymentMethod: {
      CASH: "Cash",
      MOMO: "MoMo",
      WALLET: "Wallet",
      SYSTEM: "System",
    },
    dateRange: {
      invalidDateRange: "End date cannot be earlier than start date.",
    },
  },

  tabs: {
    home: 'Home',
    plan: 'Plans',
    sessions: 'Sessions',
    plans: 'Plans',
    profile: 'Profile',
  },

  notifications: {
    title: 'Notifications',
    viewAll: 'View all',
    empty: 'No notifications yet.',
    payment: {
      title: 'Payment',
      success: 'Payment successful{{invoicePart}}.',
      failed: 'Payment failed{{invoicePart}}.',
    },
    topUp: {
      title: 'Top up',
      success: 'Top up successful{{amountPart}}{{invoicePart}}.',
      failed: 'Top up failed{{invoicePart}}.',
    },
    subscription: {
      title: 'Subscription',
      success: 'Subscription payment successful{{invoicePart}}.',
      pending: 'Subscription payment pending{{invoicePart}}.',
      failed: 'Subscription payment failed{{invoicePart}}.',
    },
    filter: {
      all: 'All',
      system: 'System',
      payment: 'Payment',
      timeAll: 'All time',
      last7d: 'Last 7 days',
      last30d: 'Last 30 days',
    },
  },

  transactions: {
    empty: 'No transactions found.',
    invoice: 'Invoice',
    tx: 'Transaction',
    filters: {
      title: 'Filters',
      fromDate: 'From date',
      toDate: 'To date',
      invoiceId: 'Invoice code',
      invoiceIdPlaceholder: 'Invoice id/code',
      transactionCode: 'Transaction code',
      transactionCodePlaceholder: 'Transaction code',
      direction: 'Direction',
      type: 'Type',
      clear: 'Clear',
    },
    direction: {
      all: 'All',
      in: 'Money in',
      out: 'Money out',
    },
    type: {
      all: 'All',
      TOP_UP: 'Top up',
      SUBSCRIPTION_FULL_PAYMENT: 'Subscription payment',
      MONTHLY_CHARGE: 'Monthly charge',
      INVOICE_DIRECT_PAYMENT: 'Invoice payment',
      REFUND: 'Refund',
      ADMIN_ADJUSTMENT: 'Admin adjustment',
    },
  },

  drawer: {
    title: 'Menu',
    subtitle: 'Quick account access',
    noUserInfo: 'User information is not available.',
    quickAccess: 'Quick access',
    language: 'Language',
    currentLanguage: 'Current language',
    profileDesc: 'View and update your account information.',
  },

  plans: {
    title: 'Parking plans',
    subtitle: 'Choose a suitable parking plan and complete payment.',

    loading: 'Loading plans...',
    loadError: 'Unable to load plans.',
    empty: 'No available plans.',

    current: 'Current plan',
    register: 'Register',

    basic: 'Basic ticket',
    startup: 'Startup ticket',
    enterprise: 'Enterprise ticket',

    perDay: '/ day',

    monthlyPayment: 'Monthly payment supported',
    fullPayment: 'Full payment supported',
    noFullPayment: 'Full payment not supported',

    dailyFee: 'Daily fee: {{price}} VND',
    after18Free: 'Free after 18:00',
    after18Fee: 'After 18:00: {{price}} VND',
    inUseBadge: "In use",
    viewCurrentPlan: "View registered plan",
    currentPlanFallback: 'current plan',

    overrideActivePlanDialog: {
      title: 'You have an existing parking plan',
      message:
        'You currently have the {{plan}} plan with status {{status}}. If you register a new plan, the old plan will be canceled but any remaining debt will still be tracked. Remaining amount: {{debt}}. Do you want to continue?',
    },
  },

  checkout: {
    title: 'Plan checkout',
    subtitle: 'Complete information for {{plan}}',

    stepVehicle: 'Vehicle',
    stepTerm: 'Term',
    stepPaymentMethod: 'Method',
    stepConfirm: 'Confirm',

    selectLicensedVehicle: 'Select licensed vehicle',
    selectUnlicensedVehicle: 'Select unlicensed vehicle',
    noLicensedVehicle: 'No licensed vehicle available.',
    noUnlicensedVehicle: 'No unlicensed vehicle available.',
    noLicensePlate: 'No license plate',

    selectTerm: 'Select academic term',
    noTerm: 'No academic term available.',
    selectTermFirst: 'Please select an academic term first.',

    selectPaymentMethod: 'Select payment method',
    noAvailablePaymentMethod:
      'This plan has no available payment method.',
    pricingLoadError: 'Unable to load pricing. Please try again.',

    monthlyPayment: 'Monthly payment',
    monthlyPaymentDesc:
      'The system creates invoices and sends monthly payment reminders.',
    fullPayment: 'Full payment',
    fullPaymentDesc:
      'Pay once for the entire registration period.',
    recommended: 'Recommended',
    discount: '{{discount}}% discount',

    summary: 'Payment summary',
    plan: 'Plan',
    term: 'Academic term',
    vehicle: 'Vehicle',
    paymentMethod: 'Payment method',
    amount: 'Amount',

    paymentNoteTitle: 'Payment information',
    monthlyPaymentNote:
      'After confirmation, the system will create monthly invoices and send payment reminders.',
    fullPaymentNote:
      'Tap “Pay with MoMo” to open MoMo or browser and complete the payment.',

    pay: 'Pay',
    payWithMomo: 'Pay with MoMo',
    payWithWallet: 'Pay with wallet',
    choosePayMethod: 'Choose payment method',
    walletBalance: 'Wallet balance: {{balance}}',
    insufficientWallet: 'Insufficient wallet balance. Please top up or choose MoMo.',
    walletPaymentSuccess: 'Wallet payment successful.',
    momoNote: 'Proceed to MoMo to complete payment.',
    monthlyWalletRequired:
      'Monthly payment requires wallet. Please ensure your wallet has enough balance for the first month.',
    setupRecurring: 'Confirm subscription',
    recurringSetupSuccess: 'Monthly subscription setup successfully.',

    missingData:
      'Please select vehicle, academic term, and payment method.',
    noPaymentUrl: 'No MoMo payment URL was returned.',
    cannotOpenPaymentUrl:
      'This device cannot open the MoMo payment URL.',
    redirectingMomoTitle: 'Redirecting to MoMo',
    redirectingMomoAndroid:
      'If the app does not reopen automatically, you can return manually after payment.',
    redirectingMomoIos:
      'You can return to the app after payment.',
    paymentFailed: 'MoMo payment failed.',
    noSelectedPlan: 'No parking plan selected.',
  },

  wallet: {
    title: 'E-Wallet',
    screenTitle: 'E-Wallet',
    atmCardTitle: 'ATM Card',
    balance: 'Balance',
    availableBalance: 'Available Balance',
    status: 'Status',
    topupAmount: 'Top-up Amount',
    topupAmountPlaceholder: 'Enter amount',
    topup: 'Top up',
    confirmTopup: 'Confirm Top-up',
    topupWarning:
      'Only top up the amount needed for payment. The system does not support withdrawals yet. If you need help, please contact the Student Affairs Office.',
    invalidAmount: 'Invalid amount',
    noPaymentUrl: 'MoMo payment URL was not received.',
    cannotOpenPaymentUrl: 'This device cannot open the MoMo payment URL.',
    redirectingMomo: 'Redirecting to MoMo...',
    topupFailed: 'Top-up failed.',
    unavailable: 'Unable to load wallet information.',

    transactionsHistory: 'Transactions History',
    recentTransactions: 'Recent Transactions',
    seeAll: 'See all',
    all: 'All',
    income: 'Income',
    expense: 'Expense',
    history: 'History',
    card: 'Card',
    loadTransactionsFailed: 'Unable to load transactions.',
    noRecentTransactions: 'No recent transactions.',
  },

  presentCard: {
    title: 'Present parking access card',
    subtitle:
      'Use the digital card code to identify yourself when entering/exiting the school parking lot.',
    schoolName: 'TRƯỜNG ĐẠI HỌC SPKT HƯNG YÊN',
    cardType: 'Student parking access card',
    loading: 'Loading card information...',
    loadError: 'Unable to load card information.',
    fullName: 'Student name:',
    userCode: 'Student code:',
    noUser: 'User information is not available.',
    noCard: 'No parking access card found.',
    noBarcode: 'No barcode available.',
    warning: {
      title: 'Notes on using the parking card',
      rule1: 'Student parking cards are valid for the entire duration of the student\'s enrollment.',
      rule2: 'Student parking cards are used to identify students when parking on campus.',
      rule3: 'Students are not permitted to borrow, delete, or modify card information without authorization.',
      rule4: 'In case of loss or damage to your student ID card, please contact the Student Affairs Office immediately (via the One-Stop Service Department) to have it reissued.',
    },
    reportLostSuccess: 'Card reported as lost successfully.',
    reportLostFailed: 'Failed to report lost card. Please try again.',
  },

  paymentReturn: {
    title: 'Payment status',
    pendingDesc:
      'You are being redirected to the payment page. After completing payment, please return to the app to check the status.',
    defaultDesc:
      'If you have just completed payment, please return to the app to check the payment status.',
    invoice: 'Invoice',
    backToPlans: 'Back to parking plans',
  },

  parkingHistory: {
    title: 'Check in-out history',
    subtitle:
      'Track your parking history, entry/exit times, and parking session status.',

    loading: 'Loading parking sessions...',
    filter: 'Filter',
    fromDate: 'From date',
    toDate: 'To date',
    selectDate: 'Select date',
    clearFilters: 'Clear',
    vehicleMode: 'Vehicle mode',
    modeAll: 'All',
    modeLicensed: 'Licensed',
    modeUnlicensed: 'Unlicensed',
    licensePlate: 'License plate',
    licensePlatePlaceholder: 'Search by license plate',

    unknownVehicle: 'Vehicle',
    noLicensePlate: 'No license plate',

    checkIn: 'Check-in',
    checkOut: 'Check-out',
    notYet: 'Not yet',
    status: {
      active: 'Active',
      done: 'Done',
    },
    amount: 'Amount',

    empty: 'No parking sessions found.',
    loadError: 'Unable to load parking sessions.',

    prev: 'Prev',
    next: 'Next',
    pageOf: '{{page}} / {{totalPages}}',
    showingRange: 'Showing {{from}}-{{to}} / {{total}} sessions',

  },

  invoices: {
    title: 'Invoices',
    subtitle: 'Track your invoices and pay outstanding debts.',
    loading: 'Loading invoices...',
    loadError: 'Unable to load invoices.',
    empty: 'No invoices found.',

    filters: {
      title: 'Filter',
      from: 'From date',
      to: 'To date',
      selectDate: 'Select date',
      status: 'Status',
      statusAll: 'All statuses',
      clear: 'Clear',
    },

    card: {
      invoice: 'Invoice',
      createdAt: 'Created at',
      paymentMethod: 'Payment method',
      copySuccess: "Invoice ID copied to clipboard",
    },

    status: {
      paid: 'Paid',
      pending: 'Pending',
      failed: 'Failed',
    },

    actions: {
      payWithMomo: 'Pay with MoMo',
      retryPayment: 'Retry payment',
      momoMissingUrl: 'No MoMo payment URL was returned.',
      cannotOpenPaymentUrl: 'This device cannot open the MoMo payment URL.',
    },

    pagination: {
      prev: 'Prev',
      next: 'Next',
      pageOf: '{{page}} / {{totalPages}}',
      showingRange: 'Showing {{from}}-{{to}} / {{total}} invoices',
    },
  },

  profile: {
    title: 'Personal information',
    subtitle: 'Manage your account information and parking plans.',

    accountInfo: 'Account information',
    userCode: 'User code',
    fullName: 'Full name',
    email: 'Email',
    phoneNumber: 'Phone number',

    fullNamePlaceholder: 'Enter full name',
    emailPlaceholder: 'Enter email',
    phoneNumberPlaceholder: 'Enter phone number',

    fullNameRequired: 'Please enter your full name.',
    emailRequired: 'Please enter your email.',
    invalidEmail:
      'Invalid email address or special characters in the domain are not allowed.',
    invalidPhone: 'Phone number must contain exactly 10 digits.',

    updateSuccess: 'Profile updated successfully.',
    updateFailed: 'Failed to update profile.',
    saveChanges: 'Save changes',

    noUserInfo: 'User information has not been loaded.',

    personalManagement: 'Personal management',
    subscriptions: 'Registered plans',
    subscriptionsDesc: 'View your current parking plan and registration history.',

    personalInfo: "Personal information",
    changePassword: "Change password",
    transactionHistory: "Transaction history",
    invoice: "Invoices",
    currentPassword: "Current password",
    currentPasswordPlaceholder: "Enter current password",
    currentPasswordRequired: "Please enter your current password.",
    changePasswordSuccess: "Password changed successfully.",
    changePasswordFailed: "Failed to change password.",

    account: 'Account',
    logout: 'Logout',

    logoutConfirmTitle: 'Confirm logout',
    logoutConfirmMessage: 'Are you sure you want to log out of this account?',
  },

  userSubscriptions: {
    subscriptionCode: 'Subscription code',
    title: 'Registered plans',
    subtitle: 'Track your parking plans, academic terms, and usage status.',
    loadError: 'Unable to load registered plans.',
    filterTitle: 'Status filter',
    empty: 'No registered plans yet.',
    emptyDesc: 'Your registered parking plans will appear here.',
    subscriptionId: 'ID: {{id}}',
    period: 'Period',
    totalAmount: 'Total amount',
    paidAmount: 'Paid amount',
    debtAmount: 'Remaining',
    status: {
      active: 'Active',
      payment_due: 'Payment due',
      overdue: 'Overdue',
      canceled: 'Canceled',
      suspended: 'Suspended',
      inactive: 'Inactive',
    },
  },

  auth: {
    loginTitle: 'Login',
    loginSubtitle: 'Access the smart parking system',
    userCode: 'User code',
    userCodePlaceholder: 'Enter your user code',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    loginButton: 'Login',
    forgotPassword: 'Forgot password?',
    language: 'Language',
    forgotTitle: 'Forgot password',
    forgotSubtitle: 'Enter your user code to continue',
    sendRequest: 'Send request',
    stepRequest: 'Request',
    stepVerify: 'Verify',
    stepReset: 'Reset',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    resend: 'Resend code',
    resendIn: 'Resend in',
    codeSent: 'Verification code sent to your email.',
    verificationCode: 'Verification code',
    codePlaceholder: '6 digits',
    userCodeRequired: 'User code is required',
    invalidEmail: 'Invalid email',
    invalidCode: 'Invalid or expired code',
    requestFailed: 'Request failed',
    verifyFailed: 'Verification failed',
    resetFailed: 'Reset failed',
    loginFailed: 'Login failed',
    networkError: "Network error: can't reach API. If running on phone/Android emulator, don't use localhost; use your PC IP or 10.0.2.2.",
    userOrPasswordInvalid: 'User code or password is incorrect',
    userNotFound: 'User not found',
    emailMismatch: 'Email does not match user code',
    userOrEmailInvalid: 'User code or email is incorrect',
    newPassword: 'New password',
    newPasswordPlaceholder: 'Enter new password',
    confirmPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'Re-enter new password',
    updatePassword: 'Update password',
    passwordUpdated: 'Password updated.',
    passwordRules: 'Password does not meet requirements',
    passwordMismatch: 'Passwords do not match',
    passwordRuleText:
      '8-20 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special (!@#$%^&*()_-+=[]{}?/|)',
    backToLogin: 'Back to login',
    fieldRequired: 'This field is required',
  },
};
export default en;

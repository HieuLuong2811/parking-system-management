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
    vehicleType: {
      motorbike: 'Motorbike',
      bicycle: 'Bicycle',
      electricBicycle: 'Electric bicycle',

    }
  },

  tabs: {
    home: 'Home',
    plan: 'Plans',
    sessions: 'Sessions',
    invoices: 'Invoices',
    profile: 'Profile',
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

    basic: 'Basic',
    startup: 'Startup',
    enterprise: 'Enterprise',

    perDay: '/ day',

    monthlyPayment: 'Monthly payment supported',
    fullPayment: 'Full payment supported',
    noFullPayment: 'Full payment not supported',

    maxLicensedVehicle: 'Maximum 1 vehicle with license plate',
    maxUnlicensedVehicle: 'Maximum 1 vehicle without license plate',

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

    payWithMomo: 'Pay with MoMo',
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
    subtitle: 'Manage your account information, vehicles, and parking plans.',

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
    vehicles: 'Vehicles',
    vehiclesDesc: 'Manage the list of vehicles used for parking.',
    subscriptions: 'Registered plans',
    subscriptionsDesc: 'View your current parking plan and registration history.',

    account: 'Account',
    logout: 'Logout',
    logoutDesc: 'Sign out of the current account.',

    logoutConfirmTitle: 'Confirm logout',
    logoutConfirmMessage: 'Are you sure you want to log out of this account?',
  },

  userSubscriptions: {
    title: 'Registered plans',
    subtitle: 'Track your parking plans, academic terms, and usage status.',
    loadError: 'Unable to load registered plans.',
    filterTitle: 'Status filter',
    empty: 'No registered plans yet.',
    emptyDesc: 'Your registered parking plans will appear here.',
    subscriptionId: 'ID: {{id}}',
    term: 'Academic term',
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

  vehicles: {
    title: "Vehicles",
    subtitle: "Manage your licensed and unlicensed vehicles.",
    loadError: "Unable to load vehicles.",

    registerPlan: "Register parking plan",
    addVehicle: "Add vehicle",

    withPlate: "With plate",
    withoutPlate: "Without plate",
    searchPlatePlaceholder: "Search by license plate",

    empty: "No vehicles yet.",
    emptyDesc: "Add a vehicle to register for a parking plan.",

    autoBarcode: "Barcode will be generated automatically",
    vehicleId: "Vehicle ID",
    createdAt: "Created at",

    edit: "Edit",
    delete: "Delete",

    createSuccess: "Vehicle added successfully",
    updateSuccess: "Vehicle updated successfully",
    deleteSuccess: "Vehicle deleted successfully",

    saveFailed: "Unable to save vehicle.",
    deleteFailed: "Unable to delete vehicle.",

    deleteConfirmTitle: "Delete vehicle",
    deleteConfirmMessage: "Are you sure you want to delete this vehicle?",

    types: {
      motorbike: "Motorbike",
      bicycle: "Bicycle",
      electric_bicycle: "Electric bicycle",
    },

    form: {
      missingUser: "User information was not found.",
      vehicleType: "Vehicle type",
      vehicleTypeRequired: "Please select a vehicle type.",
      invalidVehicleType: "Invalid vehicle type.",
      licensePlate: "License plate",
      licensePlateRequired: "Please enter the license plate.",
      licensePlatePlaceholder: "E.g. 30K12345",
      barcodeNote:
        "For vehicles without a license plate, the system will automatically generate a barcode after saving.",
    },

    modal: {
      createTitle: "Add vehicle",
      editTitle: "Update vehicle",
      subtitle: "Select the vehicle type and enter the required information.",
      create: "Save vehicle",
      save: "Save changes",
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

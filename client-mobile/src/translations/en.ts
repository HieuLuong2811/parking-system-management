const en = {
  common: {
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
    next: 'Next',
    back: 'Back',
    retry: 'Retry',
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

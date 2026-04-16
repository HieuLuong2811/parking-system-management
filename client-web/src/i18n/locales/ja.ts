import en from './en';

const ja = {
  ...en,

  brand: {
    name: 'フンイエン技術師範大学',
    shortName: 'UTEHY',
    tagline: 'キャンパス駐車管理システム',
  },

  announcement: {
    message: 'フンイエン技術師範大学の学生向け駐車登録システム',
  },

  notifications: {
    title: '通知',
  },

  nav: {
    home: 'ホーム',
    plan: 'プラン登録',
    vehicles: '車両',
    sessions: '駐車履歴',
    invoices: '請求書',
    profile: 'プロフィール',
    userName: 'Hiếu',
  },

  validation: {
    requiredField: '{{field}}は必須です。',
    fieldFallback: 'フィールド',
  },

  vehicle: {
    subtitle: '個人車両管理',
    registerPlanButton: '送信プラン登録',
    registerVehicleButton: '車両登録',
    search: {
      userCode: 'ユーザーID',
      license: 'ナンバープレート',
    },
    clearFilter: 'クリア',
    table: {
      vehicleId: '車両ID',
      userCode: 'ユーザーID',
      type: '種類',
      licensePlate: 'ナンバープレート',
      qrCode: 'QRコード',
      createdAt: '作成日時',
      actions: '行動',
      actionsMenu: {
        edit: '編集',
        delete: '削除',
      },
    },
    empty: '車両が登録されていません。',
    error: {
      load: '車両リストを読み込めません。後ほど再度お試しください。',
    },
    modal: {
      ...en.vehicle.modal,
      types: {
        motorbike: 'オートバイ',
        bicycle: '自転車',
        electricBicycle: '電動自転車',
      },
      fields: {
        ...en.vehicle.modal.fields,
        licensePlatePlaceholder: '例: 30K12345',
        vehicleTypePlaceholder: '車種を選択',
      },
    },
  },

  sessions: {
    ...en.sessions,
    sectionTitle: '駐車履歴',
    loading: '駐車履歴を読み込んでいます…',
    empty: '条件に一致する履歴はありません。',
    filters: {
      from: '開始日時',
      to: '終了日時',
      search: '検索',
      searchPlaceholder: '車両番号やセッションID',
      clear: 'フィルタをクリア',
    },
    table: {
      vehicle: '車両',
      checkIn: '入庫',
      checkOut: '出庫',
      status: 'ステータス',
      userType: 'ユーザー種別',
      amount: '金額',
    },
    notProvided: '未登録',
    statusUnknown: '保留中',
  },

  profile: {
    loading: 'プロフィール情報を読み込んでいます…',
    sectionTitle: '個人情報',
    tagline: 'お客様 {{id}}',
    planLabel: '登録プラン:',
    update: 'プロフィールを更新',
    download: 'ドキュメントをダウンロード',
    logout: 'ログアウト',
    tabs: {
      profile: 'プロフィール',
      subscriptions: 'サブスクリプション',
    },
    statusLabel: 'ステータス:',
    statusActive: '有効',
    statusInactive: '無効',
    fields: {
      userCode: 'ユーザーコード',
      fullName: '氏名',
      email: 'メールアドレス',
      phone: '電話番号',
      required: '必須フィールド',
      saveSuccess: 'プロフィールが更新されました。',
    },
    saveChanges: '変更を保存',
    passwordDialog: {
      button: 'パスワードを変更',
      title: 'パスワードを変更',
      currentLabel: '現在のパスワード',
      newLabel: '新しいパスワード',
      confirmLabel: '新しいパスワードを確認',
      save: '保存',
      cancel: 'キャンセル',
      required: '必須フィールド',
      minLength: 'パスワードは6文字以上である必要があります。',
      confirmMismatch: 'パスワードが一致しません。',
      success: 'パスワードが正常に更新されました。',
      genericError: 'パスワードを変更できません。再度お試しください。',
    },
    subscriptions: {
      heading: '登録されたサブスクリプション',
      empty: 'まだ登録されたサブスクリプションはありません。',
      vehicle: '車両',
      term: '学年',
      paymentPlan: '支払いプラン',
      amount: '金額',
      period: '期間',
      paidAmount: '支払済み',
      changePaymentMethod: '支払い方法を変更',
      stripeHeader: '定期支払いカードを更新',
      stripeCardMissing: 'カードフォームが準備されていません。',
      stripeCardNotReady: '支払い方法をキャプチャできません。',
      stripeNotReady: 'Stripeは現在利用できません。',
      stripeSuccess: '支払い方法が正常に更新されました。',
      savePaymentMethod: '新しいカードを保存',
      cancelChange: 'キャンセル',
      unnamedPlan: '名前のないプラン',
      noPaymentPlan: '支払いプランが設定されていません',
      status: {
        active: '有効',
        pending: '保留中',
        expired: '期限切れ',
        suspended: '停止中',
      },
    },
  },

  plan: {
    ...en.plan,

    sectionTitle: '学期パスの登録',
    sectionDescription: 'あなたのスケジュールに合わせたプランを選んで、予約を確定しましょう。',

    steps: ['学期を選択', '設定を更新', '確認'],
    backToVehicles: '車両管理ページに戻る',
    calculatingPrice: '価格を計算中…',
    pricingSummary: '{{days}} 営業日 (日曜日 {{sundayDays}} 日と祝日 {{holidayDays}} 日を除く)。',
    cta: 'このパッケージを登録',

    registering: '登録中のプラン',
    notes: 'メモ:',
    noNotes: 'メモはありません',
    reminder: '前のステップに戻って内容を修正できます。',
    noPlans: 'サブスクリプションプランがまだ設定されていません。',
    planMeta: {
      created: '{{date}} に作成',
      updated: '{{date}} に更新',
    },

    back: '戻る',
    next: '次へ',
    submit: '申請を送信',

    alert: '申請が送信されました！',
    notChosen: '未選択',

    checkoutTitle: 'お支払い',
    checkoutSubtitle: '選択したプランを確定するために支払い情報を入力してください',
    priceLabel: '価格',
    perDay: '日',
    cards: {
      noPlate: {
        title: '自転車 / 電動自転車',
        subtitle: 'ナンバープレートなし',
      },
      withPlate: {
        title: 'オートバイ / 電動自転車',
        subtitle: 'ナンバープレートあり',
      },
    },
    checkoutCta: 'このプランを登録',
    checkoutConfirmed: '{{plan}} の支払いが確認されました',

    checkoutFields: {
      cardNumber: 'カード番号',
      bank: '銀行名',
      paymentMethod: '支払い方法',
      full: '一括払い',
      installment: '分割払い',
      notes: 'メモ',
      notesPlaceholder: '参照情報や追加指示を入力',
    },

    checkoutRules:
      '確認することで、駐車ポリシー、返金規則、および自動通知に同意したものとみなされます。',

    checkoutCancel: 'キャンセル',
    checkoutConfirm: '支払いを確定',
    checkoutPaymentMomo: 'MoMoで支払う',
    checkoutPlanNote: '選択したプランの内容をここで確認できます。',
    priceNote: '価格はVND表記で統一しています。',
    checkoutStepper: {
      steps: ['学期を選択', '支払い方法', '支払い情報'],
      termLabel: '学期',
      termPlaceholder: '学期を選んでください',
      termHelper: '表示される学期から選択し、支払いを続行してください。',
      termOptions: ['2026年春学期', '2026年夏学期', '2026年秋学期'],
      termEmpty: '現在学期情報を準備中です。後ほど再試行してください。',
      paymentPlanLabel: '支払いプラン',
      paymentPlanDescription: '定期支払いまたは一括支払いを選択すると、以下にフォームが表示されます。',
        cardFormTitle: 'カード情報',
        cardHolder: 'カード名義',
        cardExpiry: '有効期限 (MM/YY)',
        cardCvc: 'CVC',
        cardSetupError: 'Stripeに接続できません。時間を置いて再度お試しください。',
        cardNotLoaded: 'カードフォームがまだ読み込まれていません。',
        cardNotReady: '支払い方法が見つかりません。',
        cardGeneralError: 'カード情報を保存できません。もう一度お試しください。',
      momoTitle: 'MoMoで支払う',
      momoDescription: 'MoMoにリダイレクトし、5分以内に支払いを完了します。',
      momoRedirect: 'MoMo画面に移動して取引内容を確認してください。',
      momoMissingVehicle: 'MoMoで支払う前に車両を登録してください。',
      momoSetupError: 'MoMo決済に必要な情報が不足しています。後でもう一度お試しください。',
      momoUrlMissing: 'MoMoの支払いリンクが見つかりません。',
      momoGeneralError: 'MoMoの支払いを開始できませんでした。もう一度お試しください。',
      next: '次のステップ',
      back: '戻る',
      confirm: '支払いを確定',
      payMomo: 'MoMoで支払う',
      termCards: [
        {
          id: 'spring-2026',
          term_name: 'セメスター1',
          start_date: '01/09/2026',
          end_date: '31/01/2027',
        },
        {
          id: 'summer-2026',
          term_name: 'セメスター2',
          start_date: '01/02/2027',
          end_date: '30/06/2027',
        },
        {
          id: 'fall-2026',
          term_name: '通年',
          start_date: '01/09/2026',
          end_date: '30/06/2027',
        },
      ],
      termRange: '{{start}} 〜 {{end}}',
    },

    paymentModes: {
      recurring: {
        title: '定期支払い',
        price: '1,200,000 VND ／月',
        suffix: 'VND ／月',
        description: '毎月自動的に料金が引き落とされ、3日前にリマインダー通知が届きます。',
        badge: 'おすすめ',
        perkReminder: '更新3日前に通知',
        perkSecureCard: 'カード情報を安全に保存',
        perkFlexible: 'いつでも一時停止／再開可能',
      },

      oneTime: {
        title: '一括払い',
        price: '4,900,000 VND ／学期',
        suffix: 'VND ／学期',
        description: '一度の支払いで割引を確定できます。',
        badge: '8%オフ',
        perkFast: '24時間以内に確認',
        perkNoRenewal: '自動更新なし',
        perkSupport: '銀行振込・ウォレット対応',
      },
    },
  },

  invoices: {
    sectionTitle: '請求書',
    headerTitle: '請求履歴',
    filters: {
      from: '開始日',
      to: '終了日',
    },
    resultsTitle: '該当する請求書',
    empty: '指定された期間に該当する請求書がありません。',
    table: {
      invoiceId: '請求書ID',
      period: '対象期間',
      created_at: '発行日',
      dueOn: '支払期限',
      amount: '金額',
      status: 'ステータス',
    },
    issuedOn: '発行日',
    dueOn: '支払期限',
    amountLabel: '金額',
    status: {
      paid: '支払い済み',
      pending: '保留中',
      overdue: '期限切れ',
    },
  },

  footer: {
    hotline: 'サポートホットライン: 1900 1234',
    email: 'メール: support@campusparking.vn',
  },
};

export default ja;

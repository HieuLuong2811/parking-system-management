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
    ...en.profile,
    sectionTitle: '個人情報',
  },

  plan: {
    ...en.plan,

    sectionTitle: '学期パスの登録',

    steps: ['学期を選択', '設定を更新', '確認'],
    vehiclePackages: {
      sectionTitle: '車種別パッケージ',
      description: 'ナンバープレートの有無に応じたパッケージを選んでください。',
      cta: 'このパッケージを登録',
      withoutPlate: {
        subtitle: 'ナンバープレートなし',
        title: 'ナンバープレートなし車両',
        price: '4,500 đ / 日',
        description: 'フルQR対応でプレートなしでもスムーズに入退場。',
        features: [
          'QRコードで即時チェックイン',
          '利用ログを自動記録',
          '出入口でナンバー入力不要',
          'アプリでステータス通知',
          'ピーク時も優先待機',
        ],
      },
      withPlate: {
        subtitle: 'ナンバープレートあり',
        title: 'ナンバープレート車両',
        price: '5,200 đ / 日',
        description: '常にプレートを表示している車両向けの安心設計。',
        features: [
          'ナンバーカメラが自動識別',
          '登録者とナンバーを照合',
          '重複や怪しい車両を通知',
          '入退出時のアクセス制御',
          'ナンバー別の利用統計',
        ],
      },
    },

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
      momoTitle: 'MoMoで支払う',
      momoDescription: 'MoMoにリダイレクトし、5分以内に支払いを完了します。',
      momoRedirect: 'MoMo画面に移動して取引内容を確認してください。',
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
      issuedOn: '発行日',
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

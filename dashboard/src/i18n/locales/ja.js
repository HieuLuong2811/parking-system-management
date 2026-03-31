const ja = {
  translation: {
    sideBar: {
      title: "駐車場システム",
      children: {
        home: "ホーム",
        users: "ユーザー",
        resources: "リソース",
        settings: "設定",
      },
    },
    pageTitle: {
      home: "駐車場管理システム - ハンイェン工科教育大学",
      users: "ユーザー",
      resources: "リソース",
      settings: "設定",
    },
    breadcrumb: {
      home: "ホーム",
      users: "ユーザー",
      resources: "リソース",
      settings: "設定",
    },
    button: {
      login: "ログイン",
      logout: "ログアウト",
      register: "登録",
      btnAdd: "追加",
      btnEdit: "編集",
      btnDelete: "削除",
      btnSearch: "検索",
      refresh: "更新",
      cancel: "キャンセル",
      save: "保存",
    },
    placeHolder: {
      search: "検索",
    },
    home: {
      title: "ホーム",
      description:
        "ようこそ{{name}}、この概要セクションから重要なデータテーブルへすばやくアクセスできます。",
      fallbackName: "あなた",
      cardInfo: "各列を使ってデータを参照、追加、フィルターできます。",
      cardEndpoint: "エンドポイント: /{{endpoint}}",
      quickAccessTitle: "クイックアクセス",
      quickAccessDescription: "下のボタンを使って各データリソースへ直接移動します。",
    },
    parkingEventsPage: {
      title: "駐車イベント",
    },
    usersPage: {
      title: "ユーザー管理",
      importButton: "{{role}}のリストをインポート",
      importProcessing: "処理中...",
      importSuccess: "{{count}} 件のユーザーを {{role}} にインポートしました。",
      importErrorNoData: "ファイル内に有効なデータが見つかりませんでした。",
      importHint:
        "XLSXファイルには user_code、full_name、email の列が必要です。他の列は無視されます。",
      importModal: {
        title: "学生/講師のリストをインポート",
        description: "Excelファイルを選択して、アカウント作成前にデータをプレビューします。",
        searchPlaceholder: "コード、名前、またはメールで検索",
        statusLabel: "レコードの状態",
        statusOptions: {
          valid: "有効",
          invalid: "無効",
          duplicate: "重複",
        },
        selectFile: "ファイルを選択",
        selectedFile: "選択されたファイル: {{name}}",
        noRows: "データがありません。プレビューするにはファイルを選択してください。",
        tableHeaders: {
          userCode: "ユーザーコード",
          fullName: "フルネーム",
          email: "メール",
          status: "状態",
          error: "エラー",
        },
        statusTags: {
          valid: "有効",
          invalid: "無効",
          duplicate: "重複",
        },
        pagination: 
          "ページあたりの行数",
        footer: {
          cancel: "キャンセル",
          import: "インポート",
        },
        errors: {
          missingUserCode: "ユーザーコードがありません",
          missingEmail: "メールがありません",
          invalidEmail: "メールが無効です",
        },
        warnings: {
          partial: "{{invalidCount}} 行のエラーが無視されます。",
        },
        toast: {
          noValidRows: "インポートする有効な行がありません。ファイルを再確認してください。",
          success: "{{count}} 件のユーザーが作成され、{{skipped}} 行のエラーが無視されました。",
          error: "インポートに失敗しました。{{message}}",
        },
      },
    },
    vehiclesPage: {
      title: "車両",
    },
    rolesPage: {
      title: "ロール",
    },
    userRolesPage: {
      title: "ユーザーロール",
    },
    termsPage: {
      title: "学期",
    },
    plansPage: {
      title: "サブスクリプションプラン",
    },
    subscriptionsPage: {
      title: "ユーザーサブスクリプション",
    },
    billingEventLogsPage: {
      title: "請求イベント",
    },
    resource: {
      dialogTitleAdd: "{{action}} {{resource}}",
      dialogTitleUpdate: "{{action}} {{resource}}",
      notFound: "リクエストされたリソースが見つかりません。別のテーブルを選択してください。",
    },
    accessDenied: {
      title: "アクセス権がありません",
      description:
        "管理エリアには管理者アカウントのみアクセスできます。適切なロールを持つアカウントで再度ログインしてください。",
      backToHome: "ホームへ戻る",
      viewUsers: "ユーザー一覧を表示",
    },
    notFound: {
      title: "404 - ページが見つかりません",
      description: "指定されたパスは存在しません。データ管理を続けるにはダッシュボードへ戻ってください。",
    },
    settingsPage: {
      title: "⚙ 設定",
      description: "ここでアプリ全体の設定や好みを調整できます。",
    },
    notifications: {
      sendBy: "送信者: {{sender}}",
      empty: "新しい通知はありません",
      senders: {
        system: "システム",
      },
      times: {
        twoHours: "2時間前",
        yesterday: "昨日",
      },
      items: {
        permissions: {
          title: "アクセス権の更新",
          detail: "学生ロールが新しい構成に合わせて調整されました。",
        },
        vehicles: {
          title: "車両データを同期しました",
          detail: "Excelから10台の車両がインポートされました。",
        },
      },
    },
    resources: {
      tables: {
        users: "ユーザー",
        vehicles: "車両",
        roles: "ロール",
        userRoles: "ユーザーロール",
        terms: "学期",
        plans: "サブスクリプションプラン",
        subscriptions: "ユーザーサブスクリプション",
        parkingSessions: "駐車セッション",
        invoices: "請求書",
        paymentTransactions: "決済トランザクション",
        billingEventLogs: "請求イベント",
      },
    },
  },
};

export default ja;

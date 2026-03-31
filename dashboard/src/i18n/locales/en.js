const en = {
  translation: {
    sideBar: {
      title: "Parking System",
      children: {
        home: "Home",
        users: "Users",
        parkingSessions: "Parking sessions",
        resources: "Resource Tables",
        settings: "Settings",
      },
    },
    pageTitle: {
      home: "Parking Management System - Hung Yen University of Technology and Education",
      parkingSessions: "Parking sessions",
      users: "Users",
      resources: "Resources",
      settings: "Settings",
    },
    breadcrumb: {
      home: "Home",
      users: "Users",
      parkingSessions: "Parking sessions",
      resources: "Resources",
      settings: "Settings",
    },
    button: {
      login: "Login",
      logout: "Logout",
      register: "Register",
      btnAdd: "Add",
      btnEdit: "Edit",
      btnDelete: "Delete",
      btnSearch: "Search",
      refresh: "Refresh",
      cancel: "Cancel",
      save: "Save",
    },
    placeHolder: {
      search: "Search",
    },
    home: {
      title: "Home",
      description:
        "Welcome {{name}}, this overview section helps you reach the most important datasets fast.",
      fallbackName: "there",
      filters: {
        title: "Quick filters",
        termLabel: "Academic term",
        yearLabel: "Academic year",
        statusLabel: "Status",
        searchLabel: "Search keyword",
        searchPlaceholder: "Student, vehicle, or invoice ID",
      },
      cards: {
        activeUsers: {
          title: "Active users",
          subtitle: "checked in this week",
          chip: "Live",
        },
        revenue: {
          title: "Collected revenue",
          subtitle: "VND from subscriptions",
          chip: "Growing",
        },
        sessions: {
          title: "Parking sessions",
          subtitle: "in the current term",
          chip: "Trending",
        },
        vehicles: {
          title: "Registered vehicles",
          subtitle: "linked to active users",
          chip: "Stable",
        },
      },
      charts: {
        sessionTitle: "Sessions distribution",
        sessionDescription: "Last 6 weeks",
        revenueTitle: "Revenue overview",
        revenueDescription: "Subscription revenue breakdown",
        revenueMetric: {
          weekly: "Weekly snapshot",
          monthly: "Monthly average",
          yearly: "Yearly target",
        },
        revenueFooter: "Conversion rate improved over the last quarter.",
      },
    },
    parkingEventsPage: {
      title: "Parking session",
    },
    parkingSessionsPage: {
      title: "Parking sessions",
      tableHeaders: {
        sessionId: "Session ID",
        vehicleId: "Vehicle",
        checkIn: "Check-in",
        checkOut: "Check-out",
        totalDays: "Days",
        amount: "Amount",
        paymentMethod: "Payment method",
      },
      exportButton: "Export sessions",
      exportModal: {
        title: "Export parking sessions",
        description: "Pick the check-in range to export, the sheet will include localized column headers.",
        fromLabel: "From date",
        toLabel: "To date",
        exportLabel: "Export file",
        cancelLabel: "Cancel",
        note: "Only sessions whose check-in time falls between the selected dates are exported.",
        errors: {
          invalidRange: "Start date must be on or before the end date.",
        },
      },
    },
    usersPage: {
      title: "User management",
      importButton: "Import {{role}} list",
      importProcessing: "Processing...",
      importSuccess: "Imported {{count}} users into {{role}}.",
      importErrorNoData: "No valid rows were found in the file.",
      importHint:
        "The XLSX file must include user_code, full_name, and email columns; other columns will be ignored.",
      importModal: {
        title: "Import students / lecturers list",
        description: "Choose an Excel file to preview the data before creating accounts.",
        searchPlaceholder: "Filter by code, name or email",
        statusLabel: "Record status",
        statusOptions: {
          all: "All",
          valid: "Valid",
          invalid: "Missing / invalid",
        },
        selectFile: "Choose file",
        selectedFile: "Selected file: {{name}}",
        noRows: "No data yet. Pick a file to preview the rows.",
        tableHeaders: {
          userCode: "User code",
          fullName: "Full name",
          email: "Email",
          status: "Status",
          errors: "Errors",
        },
        statusTags: {
          valid: "Ready",
          invalid: "Needs review",
        },
        pagination: "Rows per page",
        footer: {
          cancel: "Cancel",
          import: "Import user",
        },
        errors: {
          missingUserCode: "Missing user code",
          missingEmail: "Missing email",
          invalidEmail: "Invalid email",
        },
        warning: {
          partial: "{{invalidCount}} rows contain errors and will be skipped.",
        },
        toast: {
          noValidRows: "No valid rows to import. Please check your file.",
          success: "Created {{count}} users, skipped {{skipped}} invalid rows.",
          error: "Import failed. {{message}}",
        },
      },
      actions: {
        subtitle: "Review, create, and update accounts with full control.",
        rows: "users",
        filtered: "Filtered results",
        createButton: "Create user",
        createDialogTitle: "Create user",
        editDialogTitle: "Edit user",
        saveButton: "Save changes",
        created: "Created user {{user}}.",
        updated: "Updated user {{user}}.",
        deleted: "Deleted user {{user}}.",
        error: "Unable to save changes.",
        deleteConfirm: "Delete user {{user}}? This cannot be undone.",
      },
      columns: {
        userCode: "User code",
        fullName: "Full name",
        email: "Email",
        language: "Language",
        active: "Active",
        createdAt: "Created at",
        updatedAt: "Updated at",
        actions: "Actions",
      },
      status: {
        active: "Active",
        inactive: "Inactive",
      },
      form: {
        userCode: "User code",
        fullName: "Full name",
        email: "Email",
        language: "Language",
        password: "Password",
        passwordHelper: "Leave blank to keep the existing password when editing.",
        status: "Account active",
      },
    },
    vehiclesPage: {
      title: "Vehicles",
    },
    rolesPage: {
      title: "Roles",
    },
    userRolesPage: {
      title: "User roles",
    },
    termsPage: {
      title: "Academic terms",
    },
    plansPage: {
      title: "Subscription plans",
    },
    subscriptionsPage: {
      title: "User subscriptions",
    },
    billingEventLogsPage: {
      title: "Billing events",
    },
    resource: {
      dialogTitleAdd: "{{action}} {{resource}}",
      dialogTitleUpdate: "{{action}} {{resource}}",
      notFound: "No resource was found for the requested table. Please pick a different one.",
      underConstruction: "The {{resource}} section is being refactored. Visit a different table for now.",
    },
    accessDenied: {
      title: "You do not have access",
      description:
        "Only Admin accounts may reach the control area. Please sign in again with an account that has the correct role.",
      backToHome: "Back to home",
      viewUsers: "View users list",
    },
    notFound: {
      title: "404 - Page not found",
      description: "The path you requested does not exist. Back to the home page to continue managing data.",
      backToHome: "Back to Home",
    },
    settingsPage: {
      title: "⚙ Settings",
      description: "This is where you can configure global preferences for the application.",
    },
    notifications: {
      sendBy: "Sent by {{sender}}",
      empty: "No new notifications",
      senders: {
        system: "System",
      },
      times: {
        twoHours: "2 hours ago",
        yesterday: "Yesterday",
      },
      items: {
        permissions: {
          title: "Permission update",
          detail: "The Student role has been adjusted to reflect the new structure.",
        },
        vehicles: {
          title: "Vehicle data synced",
          detail: "10 vehicles were just imported from Excel.",
        },
      },
    },
    resources: {
      tables: {
        users: "Users",
        vehicles: "Vehicles",
        roles: "Roles",
        userRoles: "User roles",
        terms: "Academic terms",
        plans: "Subscription plans",
        subscriptions: "User subscriptions",
        parkingSessions: "Parking sessions",
        invoices: "Invoices",
        paymentTransactions: "Payment transactions",
        billingEventLogs: "Billing events",
      },
    },
  },
};

export default en;

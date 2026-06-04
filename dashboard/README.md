# Dashboard

Ứng dụng quản trị của hệ thống Parking System, được xây dựng bằng React, TypeScript và Vite.

## Yêu cầu

- Node.js
- npm
- Backend của hệ thống đang chạy

## Cài đặt

Từ thư mục `./dashboard/`, cài dependencies:

```console
$ npm install
```

## Cấu hình môi trường

Ứng dụng đọc các biến môi trường trong file `.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_LOGIN_URL=http://localhost:5173/
VITE_BYPASS_AUTH=false
```

Ý nghĩa:

- `VITE_API_URL`: URL gốc của backend API.
- `VITE_LOGIN_URL`: URL của ứng dụng login để chuyển hướng xác thực.
- `VITE_BYPASS_AUTH`: bật/tắt cơ chế bỏ qua xác thực trong một số môi trường phát triển.

Nếu backend hoặc login app chạy ở địa chỉ khác, cập nhật lại các giá trị này trước khi chạy.

## Chạy ứng dụng

Từ thư mục `./dashboard/`, chạy:

```console
$ npm run dev
```

Các lệnh khác:

```console
$ npm run build
$ npm run preview
$ npm run lint
$ npm run check
```

- `npm run build`: build production.
- `npm run preview`: xem bản build local.
- `npm run lint`: chạy ESLint.
- `npm run check`: kiểm tra TypeScript và ESLint.

## Cấu trúc thư mục

### `src/api`

Chứa các hàm gọi API theo từng domain nghiệp vụ:

- `auth.ts`: đăng nhập, xác thực, lấy thông tin tài khoản.
- `users.ts`, `roles.ts`, `userRoles.ts`: quản lý người dùng và vai trò.
- `subscriptions.ts`, `subscriptionPlans.ts`, `paymentPlans.ts`.
- `invoices.ts`, `billingEvents.ts`, `paymentTransactions.ts`.
- `parkingSessions.ts`, `parkingAccessCards.ts`, `notifications.ts`.
- `statistics.ts`, `resources.ts`, `profile.ts`, `terms.ts`, `httpClient.ts`.

### `src/components`

Chứa các component tái sử dụng:

- `layout/`: sidebar, navbar, layout khung chính.
- `dashboard/`: summary cards, charts, recent sections.
- `users/`: form, role selector, import dialog.
- `common/`: header, form input, confirm dialog, data grid.
- `modals/`, `parkingAccessCards/`, `parkingSessions/`, `resource/`, `auth/`.

### `src/pages`

Chứa các trang chính của admin dashboard:

- `HomePage.tsx`
- `usersPage.tsx`
- `userProfilePage.tsx`
- `rolesPage.tsx`
- `subscriptionsPage.tsx`
- `subscriptionPlansPage.tsx`
- `subscriptionInvoicesPage.tsx`
- `paymentPlansPage.tsx`
- `paymentTransactionsPage.tsx`
- `parkingSessionsPage.tsx`
- `parkingAccessCardsPage.tsx`
- `notificationsPage.tsx`
- `invoicesPage.tsx`
- `termsPage.tsx`
- `SettingsPage.tsx`
- `myProfilePage.tsx`
- `accessDeniedPage.tsx`
- `notFoundPage.tsx`
- `resources/resourceExplorerPage.tsx`

### `src/routes`

Chứa router và phần hiển thị breadcrumb:

- `AppRouter.tsx`
- `RouterBreadcrumbs.tsx`

### `src/contexts`

Chứa auth context và hook liên quan:

- `authContext.tsx`
- `authContextCore.ts`
- `useAuth.ts`

### `src/providers`

- `QueryProvider.tsx`: bọc React Query provider cho toàn app.

### `src/constant`

- `config.ts`: cấu hình URL, hằng số nghiệp vụ.
- `userForm.ts`: cấu hình form liên quan user.

### `src/config`

- `resources.ts`: cấu hình tài nguyên / resource explorer.

### `src/hooks`

- `useDebouncedValue.ts`: hook debounce.

### `src/i18n`

Chứa cấu hình đa ngôn ngữ và file dịch:

- `index.js`
- `locales/en.js`
- `locales/vi.js`

### `src/ultis` và `src/utils`

Chứa các hàm tiện ích:

- format dữ liệu
- xử lý font size
- flag / locale helper

Lưu ý: project hiện đang dùng tên thư mục `ultis`. Nếu tiếp tục phát triển, nên thống nhất tên thư mục để tránh nhầm lẫn.

### Root files

- `src/main.tsx`: entry point render ứng dụng.
- `src/App.tsx`: component gốc.
- `src/theme.ts`: cấu hình theme MUI.
- `src/index.css`: style global.
- `public/`: static assets.
- `vite.config.ts`: cấu hình Vite.
- `eslint.config.js`: cấu hình ESLint.

## Luồng chạy tổng quát

1. `src/main.tsx` khởi tạo app.
2. `src/App.tsx` gắn router, theme và provider.
3. `src/routes/AppRouter.tsx` điều hướng theo trang.
4. `src/components/layout/Layout.tsx` dựng shell giao diện.
5. `src/api/` gọi backend thông qua `VITE_API_URL`.

## Ghi chú triển khai

- Trước khi chạy dashboard, hãy đảm bảo backend và login app đang hoạt động.
- Nếu thay đổi URL backend hoặc login, cập nhật lại `.env`.
- Dùng `npm run check` trước khi commit để kiểm tra type và lint.

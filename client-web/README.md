# Client Web

Ứng dụng web của hệ thống Parking System, xây dựng bằng React, TypeScript và React Scripts.

## Yêu cầu

- Node.js
- npm
- Backend của hệ thống đang chạy

## Cài đặt

Từ thư mục `./client-web/`, cài dependencies:

```console
$ npm install
```

## Cấu hình môi trường

Ứng dụng đang dùng các biến môi trường sau trong file `.env`:

```env
PORT=2800
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_LOGIN_URL=http://localhost:5173/
REACT_APP_CLIENT_WEB_APP_ID=client_web
```

Ý nghĩa:

- `PORT`: cổng chạy local của client web.
- `REACT_APP_API_URL`: URL gốc của backend API.
- `REACT_APP_LOGIN_URL`: URL chuyển hướng tới trang login.
- `REACT_APP_CLIENT_WEB_APP_ID`: mã định danh ứng dụng web trong hệ thống.

Nếu backend hoặc login service chạy ở địa chỉ khác, cập nhật lại các giá trị này trước khi chạy.

## Chạy ứng dụng

Từ thư mục `./client-web/`, chạy:

```console
$ npm start
```

Ứng dụng sẽ chạy ở local, mặc định theo `PORT=2800`.

Các lệnh khác:

```console
$ npm run build
$ npm test
$ npm run check
```

- `npm run build`: build bản production.
- `npm test`: chạy test theo cấu hình React Scripts.
- `npm run check`: kiểm tra TypeScript và ESLint.

## Cấu trúc thư mục

### `src/api`

Chứa các hàm gọi API theo từng domain nghiệp vụ, ví dụ:

- `auth.ts`: đăng nhập, đăng xuất, lấy thông tin người dùng.
- `users.ts`: thao tác với người dùng.
- `wallets.ts`: ví tiền.
- `subscription_plans.ts`: gói đăng ký.
- `payment_transactions.ts`: giao dịch thanh toán.
- `parking_sessions.ts`: phiên gửi xe.
- `notifications.ts`: thông báo.
- `checkout.ts`, `momo.ts`, `invoices.ts`, `payment_plan_pricing.ts`, `parkingAccessCards.ts`, `academic_terms.ts`, `user_subscriptions.ts`.

### `src/components`

Chứa các component tái sử dụng trong toàn bộ ứng dụng:

- `common/`: input, checklist mật khẩu, thông báo yêu cầu đăng nhập.
- `layout/`: layout chính, navbar, footer, loading overlay.
- `profile/`: các khối UI trong trang hồ sơ.
- `plan/`: UI cho luồng mua gói / checkout.
- `parkingCard/`: các component liên quan đến thẻ gửi xe.
- `subscription/`, `shared/`, `userWallet/`.

### `src/pages`

Chứa các trang chính của ứng dụng:

- `HomePage.tsx`
- `CheckoutPage.tsx`
- `InvoicesPage.tsx`
- `PlanPage.tsx`
- `SessionPage.tsx`
- `TransactionsPage.tsx`
- `UserSubscriptionsPage.tsx`
- `profilePage.tsx`

### `src/contexts`

Chứa context và hook liên quan đến trạng thái toàn cục, hiện tại chủ yếu là auth:

- `AppAuthContext.tsx`
- `useAppAuth.ts`

### `src/hooks`

Các custom hook dùng chung, như:

- `useModal`
- `useDropdown`
- `useDebouncedValue`
- `useConfirmDialog`
- `usePreventClickOutside`

### `src/i18n`

Chứa cấu hình đa ngôn ngữ và các file dịch:

- `index.ts`: khởi tạo i18n.
- `locales/en.ts`
- `locales/vi.ts`
- `locales/th.ts`
- `locales/lo.ts`

### `src/constant`

Chứa các hằng số và cấu hình dùng chung:

- `config.ts`: URL backend, URL login, các enum/trạng thái nghiệp vụ.

### `src/utils` và `src/ultis`

Chứa các hàm tiện ích:

- format dữ liệu
- validate
- mapping trạng thái
- xử lý ngôn ngữ
- quy tắc mật khẩu

Lưu ý: project hiện đang dùng cả `utils` và `ultis`. Nếu tiếp tục phát triển, nên thống nhất về một tên thư mục để tránh nhầm lẫn.

### Root files

- `src/App.tsx`: component gốc của ứng dụng.
- `src/index.tsx`: entry point render ứng dụng.
- `src/theme.ts`: cấu hình theme MUI.
- `src/index.css`: style global.
- `src/App.css`: style cho App.
- `public/`: static assets.

## Luồng chạy tổng quát

1. `src/index.tsx` khởi tạo ứng dụng.
2. `src/App.tsx` gắn router, theme và context.
3. `src/components/layout/ClientLayout.tsx` dựng khung giao diện chính.
4. `src/pages/` hiển thị từng màn hình nghiệp vụ.
5. `src/api/` gọi backend thông qua `REACT_APP_API_URL`.

## Ghi chú triển khai

- Trước khi chạy web, hãy đảm bảo backend đang hoạt động.
- Nếu thay đổi API hoặc route login, cập nhật lại `.env`.
- Nếu cần kiểm tra toàn bộ kiểu và lint, dùng `npm run check`.

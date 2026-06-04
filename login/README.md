# Login

Ứng dụng đăng nhập của hệ thống Parking System, được xây dựng bằng React, TypeScript và Vite.

## Yêu cầu

- Node.js
- npm
- Dashboard và backend của hệ thống đang chạy

## Cài đặt

Từ thư mục `./login/`, cài dependencies:

```console
$ npm install
```

## Cấu hình môi trường

Ứng dụng đọc các biến môi trường trong file `.env`:

```env
VITE_DASHBOARD_URL=http://localhost:2558/
VITE_API_URL=http://localhost:8000/api/v1
VITE_CLIENT_WEB_URL=http://localhost:2800/
```

Ý nghĩa:

- `VITE_DASHBOARD_URL`: URL chuyển hướng sau khi đăng nhập thành công cho admin/dashboard.
- `VITE_API_URL`: URL gốc của backend API.
- `VITE_CLIENT_WEB_URL`: URL của client web để điều hướng người dùng cuối.

File `.env.example` chỉ chứa mẫu tối thiểu để tham khảo. Khi chạy thực tế, nên dùng `.env` đầy đủ như trên.

## Chạy ứng dụng

Từ thư mục `./login/`, chạy:

```console
$ npm run dev
```

Các lệnh khác:

```console
$ npm run build
$ npm run preview
$ npm run lint
```

- `npm run build`: build production.
- `npm run preview`: xem bản build local.
- `npm run lint`: chạy ESLint.

## Cấu trúc thư mục

### `src/api`

Chứa các hàm gọi API cho luồng đăng nhập:

- `login.ts`: đăng nhập và lấy thông tin liên quan.
- `forgotpassword.ts`: quên mật khẩu / đặt lại mật khẩu.

### `src/components`

Chứa component tái sử dụng:

- `FormInput.tsx`: input dùng chung.
- `PasswordChecklist.tsx`: kiểm tra độ mạnh mật khẩu.

### `src/pages`

- `login.tsx`: màn hình đăng nhập chính.

### `src/hooks`

- `useLogin.ts`: xử lý state và logic cho form đăng nhập.

### `src/routers`

- `AppRouter.tsx`: điều hướng giữa các route của login app.

### `src/constant`

- `config.ts`: các hằng số và cấu hình URL.

### `src/ultis`

Chứa các tiện ích dùng chung:

- `url.ts`: xử lý ghép URL.
- `passwordRegex.ts`: rule kiểm tra mật khẩu.
- `palette.ts`: bảng màu.
- `language.ts`: cấu hình ngôn ngữ.
- `flags.ts`: flag/biểu tượng quốc gia.
- `cookieUtils.ts`: xử lý cookie.

Lưu ý: project đang dùng tên thư mục `ultis`. Nếu phát triển tiếp, nên thống nhất lại thành `utils` hoặc giữ nguyên để tránh lệch import.

### `src/translations`

Chứa nội dung dịch và các rule liên quan:

- `login.ts`
- `error.ts`
- `rule.ts`

### Root files

- `src/main.tsx`: entry point render ứng dụng.
- `src/App.tsx`: component gốc.
- `src/index.css`: style global.
- `src/App.css`: style riêng cho app.
- `vite.config.ts`: cấu hình Vite.
- `eslint.config.js`: cấu hình ESLint.
- `public/`: static assets.

## Luồng chạy tổng quát

1. `src/main.tsx` khởi tạo app.
2. `src/App.tsx` dựng giao diện login.
3. `src/hooks/useLogin.ts` xử lý submit và trạng thái form.
4. `src/api/login.ts` và `src/api/forgotpassword.ts` gọi backend qua `VITE_API_URL`.
5. Sau khi xác thực thành công, app chuyển hướng về dashboard hoặc client web theo URL cấu hình.

## Ghi chú triển khai

- Trước khi chạy login, hãy đảm bảo backend đang hoạt động.
- Nếu đổi cổng hoặc domain của dashboard/client web, cập nhật lại `.env`.
- Dùng `npm run build` hoặc `npm run lint` trước khi deploy.

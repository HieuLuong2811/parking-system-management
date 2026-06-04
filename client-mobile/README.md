# Client Mobile

Ứng dụng mobile của hệ thống Parking System, được xây dựng bằng Expo và React Native.

## Yêu cầu

- Node.js
- npm
- Expo Go trên điện thoại, hoặc Android Studio / Xcode nếu chạy trên emulator/simulator

## Cài đặt

Từ thư mục `./client-mobile/`, cài dependencies:

```console
$ npm install
```

## Cấu hình môi trường

Ứng dụng đọc các biến môi trường sau:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_RENDER_QR_CODE_URL`

Bạn có thể khai báo chúng trong file `.env` ở thư mục `client-mobile`.

Ví dụ:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_RENDER_QR_CODE_URL=http://localhost:8000/api/v1/render-qr-code
```

Lưu ý: `EXPO_PUBLIC_API_URL` phải trỏ đúng tới backend đang chạy.

## Chạy ứng dụng

Từ thư mục `./client-mobile/`, chạy một trong các lệnh sau:

```console
$ npm start
```

Hoặc chạy trực tiếp theo nền tảng:

```console
$ npm run android
$ npm run ios
$ npm run web
```

## Ghi chú

- Nếu dùng điện thoại thật, hãy đảm bảo thiết bị và máy chạy backend đang cùng mạng.
- Nếu đổi URL backend, hãy cập nhật lại `EXPO_PUBLIC_API_URL` và khởi động lại Expo.

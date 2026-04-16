/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_CLIENT_WEB_APP_ID: string;
  readonly VITE_LOGIN_URL?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_CLIENT_WEB_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}
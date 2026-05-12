/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOGIN_URL?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

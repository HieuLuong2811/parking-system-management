import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const defaultApiUrl = process.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';
const apiProxyTarget = (() => {
  try {
    const parsed = new URL(defaultApiUrl);
    parsed.pathname = '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return 'http://localhost:8000';
  }
})();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

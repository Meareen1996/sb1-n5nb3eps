import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useProxy = mode === 'production'
    ? (env.VITE_ZENDESK_PROD_USE_PROXY === 'true' || env.VITE_ZENDESK_PROD_USE_PROXY === undefined)
    : (env.VITE_ZENDESK_DEV_USE_PROXY === 'true' || env.VITE_ZENDESK_DEV_USE_PROXY === undefined)
  const target = mode === 'production'
    ? (env.VITE_ZENDESK_PROD_API_URL || 'https://veoride.zendesk.com')
    : (env.VITE_ZENDESK_DEV_API_URL || 'https://d3v-greenzonesupporthelp.zendesk.com')
  const email = mode === 'production' ? env.VITE_ZENDESK_PROD_EMAIL : env.VITE_ZENDESK_DEV_EMAIL
  const token = mode === 'production' ? env.VITE_ZENDESK_PROD_API_TOKEN : env.VITE_ZENDESK_DEV_API_TOKEN
  const auth = email && token ? 'Basic ' + Buffer.from(`${email}/token:${token}`).toString('base64') : undefined

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: useProxy && target ? {
      proxy: {
        '/zendesk': {
          target,
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/zendesk/, ''),
          headers: auth ? { Authorization: auth } : {},
        },
      },
    } : undefined,
  }
});

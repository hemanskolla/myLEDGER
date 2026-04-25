import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load server/.env so the proxy target stays in sync with the server's PORT
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const clientPort = parseInt(env.VITE_PORT || '5173');
  const serverPort = process.env.PORT || '3000';

  return {
    root: './client',
    plugins: [react()],
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, '../shared'),
      },
    },
    server: {
      port: clientPort,
      proxy: {
        '/api': `http://localhost:${serverPort}`,
      },
    },
  };
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the API runs on the ASP.NET Core server; Vite proxies /api to it.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // secure: false because Node doesn't read the Windows certificate store that trusts the localhost certificate
    proxy: { '/api': { target: 'https://localhost:5181', secure: false } },
  },
  build: { outDir: 'dist', emptyOutDir: true },
});

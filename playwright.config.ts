import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // PENTING: Ubah bagian ini agar mencari ke folder tests di root
  testDir: './tests',
  
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    // Sesuaikan dengan URL halaman auth Anda
    baseURL: 'http://localhost:8001',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
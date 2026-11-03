import { defineConfig, devices } from '@playwright/test'

// Requiere: MySQL en Docker (contenedor CYP_MYSQL_CONTAINER, root/root) y el backend en :8080
// arrancado con ADMIN_PASSWORD=admin-test-123 (ver e2e/README.md). El frontend lo levanta Vite en :5173.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  projects: [
    { name: 'unit', testMatch: /unit\/.*\.spec\.ts/ },
    { name: 'migration', testMatch: /migration\/.*\.spec\.ts/ },
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
      use: { baseURL: 'http://localhost:5173' },
    },
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { baseURL: 'http://localhost:5173' },
    },
    {
      name: 'ui',
      testMatch: /ui\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        baseURL: 'http://localhost:5173',
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})

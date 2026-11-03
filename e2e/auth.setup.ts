import { test as setup, expect } from '@playwright/test'
import { ADMIN_PASSWORD, ADMIN_USER } from './support/api'

// Un solo login de UI por run: el estado (cookie de refresh) se reutiliza en los tests de UI.
export const AUTH_FILE = 'e2e/.auth/admin.json'

setup('login de administrador', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('usuario').fill(ADMIN_USER)
  await page.getByPlaceholder('••••••••').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await page.waitForURL(url => !url.pathname.startsWith('/login'))
  await expect(page).not.toHaveURL(/login/)
  await page.context().storageState({ path: AUTH_FILE })
})

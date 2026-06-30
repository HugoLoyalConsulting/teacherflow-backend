import { test, expect } from '@playwright/test'

const QA_API_BASE = process.env.QA_API_BASE || 'https://backend-production-c4f8f.up.railway.app/api/v1'
const QA_EXISTING_USER_EMAIL = process.env.QA_EXISTING_USER_EMAIL || 'hugo.login.test@outlook.com'
const QA_USER_CRED = process.env.QA_USER_CRED
if (!QA_USER_CRED) throw new Error('QA_USER_CRED env var is required')

test.describe('auth headed use-cases: production', () => {
  test('existing user can login via UI and API', async ({ page, request }) => {
    await page.goto('/login', { waitUntil: 'load' })
    await page.locator('input[autocomplete="email"]').fill(QA_EXISTING_USER_EMAIL)
    await page.locator('input[autocomplete="current-password"]').fill(QA_USER_CRED)
    await page.getByRole('button', { name: 'Entrar' }).click()

    await page.waitForTimeout(2500)
    expect(page.url().includes('/login')).toBeFalsy()

    const apiLogin = await request.post(`${QA_API_BASE}/auth/login`, {
      data: { email: QA_EXISTING_USER_EMAIL, password: QA_USER_CRED },
    })
    expect(apiLogin.status()).toBe(200)
  })

  test('wrong password is blocked in UI and API', async ({ page, request }) => {
    await page.goto('/login', { waitUntil: 'load' })
    await page.locator('input[autocomplete="email"]').fill(QA_EXISTING_USER_EMAIL)
    await page.locator('input[autocomplete="current-password"]').fill(`${QA_USER_CRED}x`)
    await page.getByRole('button', { name: 'Entrar' }).click()

    await page.waitForTimeout(1500)
    expect(page.url().includes('/login')).toBeTruthy()

    const apiLogin = await request.post(`${QA_API_BASE}/auth/login`, {
      data: { email: QA_EXISTING_USER_EMAIL, password: `${QA_USER_CRED}x` },
    })
    expect([401, 429]).toContain(apiLogin.status())
  })

  test('unknown user is blocked by API', async ({ request }) => {
    const randomEmail = `qa.unknown.${Date.now()}@outlook.com`
    const apiLogin = await request.post(`${QA_API_BASE}/auth/login`, {
      data: { email: randomEmail, password: QA_USER_CRED },
    })
    expect([401, 429]).toContain(apiLogin.status())
  })
})

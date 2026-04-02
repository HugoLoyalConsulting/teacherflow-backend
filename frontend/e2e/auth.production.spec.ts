import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import os from 'os'

const QA_API_BASE = process.env.QA_API_BASE || 'https://backend-production-c4f8f.up.railway.app/api/v1'

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function maskPassword(pw: string): string {
  return pw.slice(0, 2) + '*'.repeat(Math.max(pw.length - 4, 4)) + pw.slice(-2)
}

function appendCredentialEntry(entry: Record<string, unknown>): void {
  const runtimeDir =
    process.env.QA_RUNTIME_DIR ||
    path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'TeacherFlowQA')
  ensureDir(runtimeDir)

  const filePath = path.join(runtimeDir, 'test-users.json')
  const existing = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    : []

  existing.push(entry)
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8')
}

test('auth e2e: register, verify otp, login, and negative login case', async ({ page, request }, testInfo) => {
  const runId = `${Date.now()}`
  const localPart = `qa${runId.slice(-8)}`
  const testEmail = `${localPart}@outlook.com`
  // Use env-injected password (set by run-qa-headed.ps1) or generate a unique one per run
  // Must satisfy: length>=12, uppercase, lowercase, digit, special char
  const testPassword =
    process.env.QA_TEST_PASSWORD ||
    `Qa${runId.slice(-8)}!Bc`  // 13 chars, meets all strength requirements

  const runtimeDir =
    process.env.QA_RUNTIME_DIR ||
    path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'TeacherFlowQA')
  const evidenceDir = path.join(runtimeDir, 'qa-artifacts', runId)
  ensureDir(evidenceDir)

  const report: Record<string, unknown> = {
    run_id: runId,
    started_at: new Date().toISOString(),
    qa_frontend_url: process.env.QA_FRONTEND_URL || 'https://frontend-production-a7c5.up.railway.app',
    qa_api_base: QA_API_BASE,
    test_user_email: testEmail,
    checks: [] as Record<string, unknown>[],
  }

  const pushCheck = (name: string, status: string, details?: Record<string, unknown>) => {
    ;(report.checks as Record<string, unknown>[]).push({
      name,
      status,
      at: new Date().toISOString(),
      details: details || {},
    })
  }

  const healthResp = await request.get(`${QA_API_BASE.replace('/api/v1', '')}/health`)
  pushCheck('backend_health', healthResp.status() === 200 ? 'passed' : 'failed', { status: healthResp.status() })
  expect(healthResp.status()).toBe(200)

  const versionResp = await request.get(`${QA_API_BASE}/health/version`)
  pushCheck('backend_version', versionResp.status() === 200 ? 'passed' : 'failed', { status: versionResp.status() })
  expect(versionResp.status()).toBe(200)

  await page.goto('/register', { waitUntil: 'load' })
  await page.screenshot({ path: path.join(evidenceDir, '01-register-page.png'), fullPage: true })

  const registerResponsePromise = page.waitForResponse(
    (resp) => resp.url().includes('/auth/register') && resp.request().method() === 'POST'
  )

  await page.locator('#email').fill(testEmail)
  await page.locator('#full_name').fill('QA Automation User')
  await page.locator('#password').fill(testPassword)
  await page.locator('#confirmPassword').fill(testPassword)
  await page.getByRole('button', { name: 'Criar Conta' }).click()

  const registerResponse = await registerResponsePromise
  const registerBody = await registerResponse.json()
  pushCheck('register_api_call', registerResponse.status() === 200 ? 'passed' : 'failed', {
    status: registerResponse.status(),
    email: registerBody.email,
    email_sent: registerBody.email_sent,
    has_otp_code: !!registerBody.otp_code,
  })
  expect(registerResponse.status()).toBe(200)

  let otpCode = registerBody.otp_code as string | undefined
  let otpSource = otpCode ? 'register_response' : 'none'

  // ── Fallback 1: debug endpoint (requires QA_SECRET env var + Railway config) ──
  if (!otpCode && process.env.QA_SECRET) {
    const debugResp = await request.get(`${QA_API_BASE}/auth/debug/otp?email=${encodeURIComponent(testEmail)}`, {
      headers: { 'X-QA-Secret': process.env.QA_SECRET },
    })
    if (debugResp.status() === 200) {
      const debugBody = await debugResp.json()
      otpCode = debugBody.otp_code as string
      otpSource = 'debug_endpoint'
      pushCheck('otp_debug_endpoint', 'passed', { has_otp: !!otpCode })
    } else {
      pushCheck('otp_debug_endpoint', 'skipped', {
        status: debugResp.status(),
        reason: 'endpoint_returned_non_200',
      })
    }
  }

  // ── Fallback 2: resend-otp (only if debug endpoint not available) ──
  if (!otpCode) {
    const resendResp = await request.post(`${QA_API_BASE}/auth/resend-otp`, {
      data: { email: testEmail },
    })
    if (resendResp.status() === 200) {
      const resendBody = await resendResp.json()
      otpCode = resendBody.otp_code as string | undefined
      otpSource = otpCode ? 'resend_otp' : 'none'
      pushCheck('resend_otp_fallback', otpCode ? 'passed' : 'failed', {
        status: resendResp.status(),
        has_otp_code: !!otpCode,
      })
    }
  }

  appendCredentialEntry({
    created_at: new Date().toISOString(),
    environment: 'production',
    api_base: QA_API_BASE,
    frontend_url: process.env.QA_FRONTEND_URL || 'https://frontend-production-a7c5.up.railway.app',
    scenario_tag: 'qa_auth_e2e',
    user_email: testEmail,
    password_masked: maskPassword(testPassword),
    otp_obtained: !!otpCode,
    otp_source: otpSource,
    run_id: runId,
    note: 'User created during QA run',
  })

  await page.waitForURL('**/verify-email**', { timeout: 20_000 })
  await page.screenshot({ path: path.join(evidenceDir, '02-verify-email-page.png'), fullPage: true })

  if (otpCode) {
    await page.locator('#otp').fill(otpCode)
    await page.screenshot({ path: path.join(evidenceDir, '03-verify-email-filled.png'), fullPage: true })
    await page.getByRole('button', { name: 'Verificar Código' }).click()

    await expect(page.getByText('Email verificado!')).toBeVisible({ timeout: 20_000 })
    pushCheck('verify_email_ui', 'passed', { otp_source: 'api_or_resend' })
    await page.waitForURL('**/login', { timeout: 20_000 })
  } else {
    pushCheck('verify_email_ui', 'blocked', {
      reason: 'otp_not_available_in_api_response',
      note: 'Environment sends OTP by email and does not expose code in API response.',
    })
    await page.goto('/login', { waitUntil: 'load' })
  }

  await page.screenshot({ path: path.join(evidenceDir, '03-login-page.png'), fullPage: true })

  const passwordField = page.locator('input[autocomplete="current-password"]')
  await expect(passwordField).toHaveAttribute('type', 'password')

  const toggleShow = page.getByRole('button', { name: 'Mostrar senha' })
  const hasToggle = (await toggleShow.count()) > 0

  if (hasToggle) {
    await toggleShow.click()
    await expect(passwordField).toHaveAttribute('type', 'text')
    await page.getByRole('button', { name: 'Ocultar senha' }).click()
    await expect(passwordField).toHaveAttribute('type', 'password')
    pushCheck('password_visibility_toggle', 'passed')
  } else {
    pushCheck('password_visibility_toggle', 'failed', {
      reason: 'toggle_button_not_found_in_deployed_frontend',
    })
  }

  await page.locator('input[autocomplete="email"]').fill(testEmail)
  await page.locator('input[autocomplete="current-password"]').fill(testPassword)
  await page.getByRole('button', { name: 'Entrar' }).click()

  await page.waitForTimeout(2500)
  const loginUrl = page.url()
  const loginSucceeded = !loginUrl.includes('/login')
  pushCheck('login_ui', loginSucceeded ? 'passed' : 'failed', { final_url: loginUrl, otp_available: !!otpCode })

  await page.screenshot({ path: path.join(evidenceDir, '04-post-login.png'), fullPage: true })

  const expectedLoginResp = await request.post(`${QA_API_BASE}/auth/login`, {
    data: { email: testEmail, password: testPassword },
  })
  const expectedLoginBody = await expectedLoginResp.text()

  if (otpCode) {
    pushCheck('api_login_after_verification', expectedLoginResp.status() === 200 ? 'passed' : 'failed', {
      status: expectedLoginResp.status(),
      body: expectedLoginBody,
    })
    expect(expectedLoginResp.status()).toBe(200)
  } else {
    const blockedStatusOk = expectedLoginResp.status() === 403 || expectedLoginResp.status() === 401
    pushCheck('api_login_unverified_user', blockedStatusOk ? 'passed' : 'failed', {
      status: expectedLoginResp.status(),
      body: expectedLoginBody,
    })
    expect(blockedStatusOk, 'Login de usuario nao verificado deveria bloquear com 401/403.').toBeTruthy()
  }

  const wrongLoginResp = await request.post(`${QA_API_BASE}/auth/login`, {
    data: { email: testEmail, password: `${testPassword}x` },
  })
  const wrongLoginBody = await wrongLoginResp.text()
  const wrongLoginStatusOk = wrongLoginResp.status() === 401 || wrongLoginResp.status() === 429
  pushCheck('negative_wrong_password', wrongLoginStatusOk ? 'passed' : 'failed', {
    status: wrongLoginResp.status(),
    body: wrongLoginBody,
  })

  report.finished_at = new Date().toISOString()
  report.test_status = testInfo.status
  report.final_url = loginUrl
  report.otp_obtained = !!otpCode
  fs.writeFileSync(path.join(evidenceDir, 'qa-report.json'), JSON.stringify(report, null, 2), 'utf-8')

  if (otpCode) {
    expect(loginSucceeded, 'Login nao concluiu no fluxo UI apos verificacao de email.').toBeTruthy()
  }
  expect(wrongLoginStatusOk, 'Caso negativo de senha incorreta retornou status inesperado.').toBeTruthy()
})

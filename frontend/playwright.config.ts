import { defineConfig } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'
import os from 'os'

// Store artifacts outside OneDrive to avoid sync churn and accidental exposure
const runtimeRoot =
  process.env.QA_RUNTIME_DIR ||
  path.join(os.homedir(), 'AppData', 'Local', 'TeacherFlowQA')
const artifactRoot = path.join(runtimeRoot, 'qa-artifacts')

export default defineConfig({
  testDir: './e2e',
  timeout: 180_000,
  retries: 0,
  outputDir: path.join(artifactRoot, 'test-output'),
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(artifactRoot, 'html-report'), open: 'never' }],
    ['json', { outputFile: path.join(artifactRoot, 'results.json') }],
  ],
  use: {
    baseURL: process.env.QA_FRONTEND_URL || 'https://frontend-production-a7c5.up.railway.app',
    headless: true,
    screenshot: 'on',
    trace: 'on',
    video: 'on',
    // Do NOT ignore HTTPS errors — a certificate failure must fail the test
    ignoreHTTPSErrors: false,
    // Deny all sensitive browser permissions so a rogue skill can't access
    // the microphone, camera, location, clipboard or notifications
    permissions: [],
    geolocation: undefined,
    // Isolated storage: each test run gets a clean context, no cookies/storage
    // shared with your real browser profile
    storageState: undefined,
    // Prevent the browser from accessing the local filesystem via file:// URLs
    // (Playwright default, but made explicit here)
    extraHTTPHeaders: {},
    // No proxy auto-configuration that could redirect traffic
    proxy: undefined,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        // Launch args that restrict what the sandboxed Chromium can do:
        // --disable-extensions: no browser extensions that could intercept traffic
        // --disable-background-networking: no background phone-home requests
        // --no-default-browser-check / --no-first-run: suppress dialogs
        // --disable-component-update: prevent auto-update network traffic during test
        launchOptions: {
          args: [
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-sync',
            '--disable-component-update',
            '--disable-default-apps',
            '--no-default-browser-check',
            '--no-first-run',
            '--safebrowsing-disable-auto-update',
          ],
        },
      },
    },
  ],
})

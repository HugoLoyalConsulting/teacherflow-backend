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
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
})

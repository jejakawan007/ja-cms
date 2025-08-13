// E2E Test Setup untuk JA-CMS
// Setup untuk end-to-end testing

import { chromium, firefox, webkit } from 'playwright';

// Browser configuration
const browsers = {
  chromium,
  firefox,
  webkit,
};

// Test configuration
const testConfig = {
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
  apiURL: process.env.TEST_API_URL || 'http://localhost:3001',
  timeout: 30000,
  retries: 2,
};

// Global test setup
beforeAll(async () => {
  // Setup test environment
  console.log('🚀 Starting E2E tests...');
  console.log(`📱 Frontend URL: ${testConfig.baseURL}`);
  console.log(`🔧 API URL: ${testConfig.apiURL}`);
});

afterAll(async () => {
  // Cleanup
  console.log('✅ E2E tests completed');
});

beforeEach(async () => {
  // Reset test state before each test
});

// Test utilities
export const createBrowser = async (browserType: 'chromium' | 'firefox' | 'webkit' = 'chromium') => {
  const browser = await browsers[browserType].launch({
    headless: process.env.CI === 'true',
    slowMo: process.env.CI === 'true' ? 0 : 100,
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'JA-CMS E2E Test',
  });
  
  const page = await context.newPage();
  
  return { browser, context, page };
};

export const loginAsUser = async (page: any, email: string, password: string) => {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
};

export const createTestPost = async (page: any, postData: any) => {
  await page.goto('/dashboard/posts/create');
  await page.fill('[data-testid="title-input"]', postData.title);
  await page.fill('[data-testid="content-input"]', postData.content);
  await page.selectOption('[data-testid="status-select"]', postData.status);
  await page.click('[data-testid="save-button"]');
  await page.waitForURL('/dashboard/posts');
};

export const waitForAPI = async (page: any, endpoint: string) => {
  await page.waitForResponse(response => 
    response.url().includes(endpoint) && response.status() === 200
  );
};

// Export configuration
export { testConfig, browsers }; 
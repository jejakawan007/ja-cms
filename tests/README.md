# 🧪 Testing Structure - JA-CMS

Centralized testing structure untuk JA-CMS dengan support untuk backend, frontend, integration, dan E2E tests.

## 📁 Struktur Testing

```
tests/
├── 📁 backend/              # Backend-specific tests
│   ├── setup.ts            # Backend test setup
│   ├── controllers/         # Controller tests
│   ├── services/           # Service tests
│   ├── models/             # Model tests
│   ├── middleware/         # Middleware tests
│   └── routes/             # Route tests
├── 📁 frontend/            # Frontend-specific tests
│   ├── setup.ts            # Frontend test setup
│   ├── components/         # Component tests
│   ├── hooks/              # Hook tests
│   ├── utils/              # Utility tests
│   └── pages/              # Page tests
├── 📁 integration/         # Cross-service tests
│   ├── setup.ts            # Integration test setup
│   ├── api/                # API integration tests
│   ├── auth/               # Authentication tests
│   └── database/           # Database integration tests
├── 📁 e2e/                 # End-to-end tests
│   ├── setup.ts            # E2E test setup
│   ├── auth/               # Authentication flows
│   ├── posts/              # Post management flows
│   └── dashboard/          # Dashboard flows
└── README.md               # Testing documentation
```

## 🚀 Running Tests

### **Semua Tests:**
```bash
npm test                    # Run all tests
npm run test:watch         # Run all tests in watch mode
npm run test:coverage      # Run all tests with coverage
```

### **Backend Tests:**
```bash
npm run test:backend       # Run backend tests only
npm run test:backend:watch # Run backend tests in watch mode
```

### **Frontend Tests:**
```bash
npm run test:frontend      # Run frontend tests only
npm run test:frontend:watch # Run frontend tests in watch mode
```

### **Integration Tests:**
```bash
npm run test:integration   # Run integration tests only
npm run test:integration:watch # Run integration tests in watch mode
```

### **E2E Tests:**
```bash
npm run test:e2e          # Run E2E tests only
npm run test:e2e:watch    # Run E2E tests in watch mode
```

## 🎯 Test Types

### **✅ Backend Tests (`tests/backend/`):**
- **Unit Tests:** Controllers, Services, Models
- **API Tests:** Endpoint testing
- **Database Tests:** Prisma operations
- **Authentication Tests:** JWT, permissions
- **Middleware Tests:** Custom middleware

### **✅ Frontend Tests (`tests/frontend/`):**
- **Component Tests:** React components
- **Hook Tests:** Custom React hooks
- **Utility Tests:** Helper functions
- **Page Tests:** Next.js pages
- **API Client Tests:** Frontend API calls

### **✅ Integration Tests (`tests/integration/`):**
- **Cross-Service Tests:** Frontend + Backend
- **API Integration:** Full API workflows
- **Database Integration:** Real database operations
- **Authentication Flows:** Login/logout flows

### **✅ E2E Tests (`tests/e2e/`):**
- **User Flows:** Complete user journeys
- **Critical Paths:** Important business flows
- **Cross-Browser:** Multiple browser testing
- **Performance:** Load and stress testing

## 🔧 Configuration

### **Jest Configuration (`jest.config.js`):**
- **Multi-Project Setup:** Separate configs per test type
- **Coverage Reports:** Individual coverage per project
- **Module Mapping:** Path aliases for imports
- **Environment Setup:** Different environments per test type

### **Test Setup Files:**
- **`tests/backend/setup.ts`:** Backend test environment
- **`tests/frontend/setup.ts`:** Frontend test environment
- **`tests/integration/setup.ts`:** Integration test environment
- **`tests/e2e/setup.ts`:** E2E test environment

## 📊 Coverage Reports

### **Coverage Directories:**
- `coverage/backend/` - Backend test coverage
- `coverage/frontend/` - Frontend test coverage
- `coverage/integration/` - Integration test coverage
- `coverage/e2e/` - E2E test coverage

### **Coverage Reports:**
- **Text:** Console output
- **HTML:** Detailed HTML reports
- **LCOV:** CI/CD integration

## 🛠️ Test Utilities

### **Backend Utilities:**
```typescript
// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: { findUnique: jest.fn(), create: jest.fn() },
    post: { findMany: jest.fn(), create: jest.fn() },
    // ... other models
  })),
}));
```

### **Frontend Utilities:**
```typescript
// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      push: jest.fn(),
      // ... other router methods
    };
  },
}));
```

### **Integration Utilities:**
```typescript
// Test database utilities
export const createTestUser = async (userData: any) => {
  return await testPrisma.user.create({ data: userData });
};

export const createTestPost = async (postData: any) => {
  return await testPrisma.post.create({ data: postData });
};
```

### **E2E Utilities:**
```typescript
// Browser utilities
export const createBrowser = async (browserType = 'chromium') => {
  const browser = await browsers[browserType].launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  return { browser, context, page };
};
```

## 🧪 Writing Tests

### **Backend Test Example:**
```typescript
// tests/backend/controllers/auth-controller.test.ts
import { AuthController } from '../../../backend/controllers/auth-controller';

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(() => {
    authController = new AuthController();
  });

  describe('login', () => {
    it('should authenticate valid user', async () => {
      // Test implementation
    });
  });
});
```

### **Frontend Test Example:**
```typescript
// tests/frontend/components/login-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../../../frontend/src/components/login-form';

describe('LoginForm', () => {
  it('should submit form with valid data', async () => {
    render(<LoginForm />);
    
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Assertions
  });
});
```

### **Integration Test Example:**
```typescript
// tests/integration/api/auth.test.ts
import { testPrisma, createTestUser } from '../setup';

describe('Auth API Integration', () => {
  it('should login and return JWT token', async () => {
    const user = await createTestUser({
      email: 'test@example.com',
      password: 'hashedPassword',
    });

    // Test API call
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

### **E2E Test Example:**
```typescript
// tests/e2e/auth/login.test.ts
import { createBrowser, loginAsUser } from '../setup';

describe('Login E2E', () => {
  it('should login successfully', async () => {
    const { browser, page } = await createBrowser();
    
    await loginAsUser(page, 'test@example.com', 'password123');
    
    await expect(page).toHaveURL('/dashboard');
    
    await browser.close();
  });
});
```

## 🔍 Test Data

### **Test Database:**
- **Development:** `ja_cms_test` database
- **CI/CD:** Isolated test database
- **Cleanup:** Automatic cleanup between tests

### **Test Users:**
```typescript
const testUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'ADMIN',
  },
  editor: {
    email: 'editor@example.com',
    password: 'editor123',
    role: 'EDITOR',
  },
  author: {
    email: 'author@example.com',
    password: 'author123',
    role: 'AUTHOR',
  },
};
```

## 🚀 CI/CD Integration

### **GitHub Actions:**
```yaml
- name: Run Tests
  run: |
    npm run test:backend
    npm run test:frontend
    npm run test:integration
    npm run test:e2e
```

### **Coverage Thresholds:**
- **Backend:** 80% minimum
- **Frontend:** 70% minimum
- **Integration:** 60% minimum
- **E2E:** 50% minimum

## 📚 Best Practices

### **✅ Test Organization:**
- ✅ Group related tests together
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Keep tests independent

### **✅ Test Data:**
- ✅ Use factories for test data
- ✅ Clean up after each test
- ✅ Use realistic test scenarios
- ✅ Avoid hardcoded values

### **✅ Performance:**
- ✅ Mock external dependencies
- ✅ Use test databases
- ✅ Parallel test execution
- ✅ Optimize test setup

### **✅ Maintenance:**
- ✅ Update tests with code changes
- ✅ Remove obsolete tests
- ✅ Keep test utilities updated
- ✅ Document test patterns

---

**Status:** ✅ **CENTRALIZED TESTING STRUCTURE COMPLETE**
**Next Phase:** 🔄 **ADD COMPREHENSIVE TEST SUITES**
**Last Updated:** $(date) 
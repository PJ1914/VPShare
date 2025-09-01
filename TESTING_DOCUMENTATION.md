# CodeKurukshetra Testing Strategy & Plan

## Overview

This document outlines the comprehensive testing strategy for the CodeKurukshetra hackathon registration platform, covering frontend, backend, payment integration, and end-to-end workflows.

## Testing Pyramid

```
                    E2E Tests
                   /         \
              Integration Tests  
             /                 \
        Unit Tests         Component Tests
       /         \        /              \
   Backend API   Utils   Frontend       UI Components
```

## 1. Unit Testing

### Frontend Unit Tests (React + Jest + React Testing Library)

#### Component Tests
```javascript
// src/components/CodeKurukshetra.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CodeKurukshetra from './CodeKurukshetra';

const MockedCodeKurukshetra = () => (
  <BrowserRouter>
    <CodeKurukshetra />
  </BrowserRouter>
);

describe('CodeKurukshetra Component', () => {
  test('renders hero section with correct title', () => {
    render(<MockedCodeKurukshetra />);
    expect(screen.getByText('CodeKurukshetra')).toBeInTheDocument();
    expect(screen.getByText('Battle of Ideas — Code the Dharma')).toBeInTheDocument();
  });

  test('displays timeline navigation', () => {
    render(<MockedCodeKurukshetra />);
    expect(screen.getByText('Day 1')).toBeInTheDocument();
    expect(screen.getByText('Day 2')).toBeInTheDocument();
  });

  test('switches between timeline phases', () => {
    render(<MockedCodeKurukshetra />);
    
    const day2Button = screen.getByText('Day 2');
    fireEvent.click(day2Button);
    
    expect(screen.getByText('Day 2: The Final Assault')).toBeInTheDocument();
  });

  test('shows all required tracks', () => {
    render(<MockedCodeKurukshetra />);
    
    expect(screen.getByText('AI & Machine Learning')).toBeInTheDocument();
    expect(screen.getByText('Web & Mobile Development')).toBeInTheDocument();
    expect(screen.getByText('Blockchain & Web3')).toBeInTheDocument();
    expect(screen.getByText('IoT & Hardware')).toBeInTheDocument();
    expect(screen.getByText('Social Impact')).toBeInTheDocument();
    expect(screen.getByText('Open Innovation')).toBeInTheDocument();
  });

  test('displays correct prize information', () => {
    render(<MockedCodeKurukshetra />);
    
    expect(screen.getByText('₹1,00,000')).toBeInTheDocument(); // 1st prize
    expect(screen.getByText('₹75,000')).toBeInTheDocument();   // 2nd prize
    expect(screen.getByText('₹50,000')).toBeInTheDocument();   // 3rd prize
  });
});
```

#### Registration Form Tests
```javascript
// src/components/RegistrationForm.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegistrationForm from './RegistrationForm';

// Mock API calls
jest.mock('../services/api', () => ({
  registerTeam: jest.fn(),
  createPaymentOrder: jest.fn(),
}));

describe('RegistrationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('validates team name requirement', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);
    
    const submitButton = screen.getByText('Register Team');
    await user.click(submitButton);
    
    expect(screen.getByText('Team name is required')).toBeInTheDocument();
  });

  test('validates email format', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);
    
    const emailInput = screen.getByLabelText('Email');
    await user.type(emailInput, 'invalid-email');
    
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  test('enforces team size limits', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);
    
    // Try to add 5th member (should be prevented)
    for (let i = 0; i < 5; i++) {
      const addMemberButton = screen.getByText('Add Member');
      await user.click(addMemberButton);
    }
    
    expect(screen.getAllByTestId('member-form')).toHaveLength(4); // Max 4 members
    expect(screen.getByText('Maximum 4 members allowed')).toBeInTheDocument();
  });

  test('prevents duplicate emails', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);
    
    // Add first member with email
    const firstEmail = screen.getAllByLabelText('Email')[0];
    await user.type(firstEmail, 'test@example.com');
    
    // Add second member with same email
    const addMemberButton = screen.getByText('Add Member');
    await user.click(addMemberButton);
    
    const secondEmail = screen.getAllByLabelText('Email')[1];
    await user.type(secondEmail, 'test@example.com');
    
    fireEvent.blur(secondEmail);
    
    await waitFor(() => {
      expect(screen.getByText('This email is already used by another team member')).toBeInTheDocument();
    });
  });

  test('submits valid form successfully', async () => {
    const user = userEvent.setup();
    const mockRegisterTeam = require('../services/api').registerTeam;
    mockRegisterTeam.mockResolvedValue({
      success: true,
      data: { team_id: 'test-team-123', order_id: 'order_123' }
    });

    render(<RegistrationForm />);
    
    // Fill team name
    await user.type(screen.getByLabelText('Team Name'), 'Test Warriors');
    
    // Fill leader details
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Phone'), '+91-9876543210');
    await user.type(screen.getByLabelText('College'), 'Test University');
    await user.selectOptions(screen.getByLabelText('Year'), '3rd Year');
    
    // Submit form
    await user.click(screen.getByText('Register Team'));
    
    await waitFor(() => {
      expect(mockRegisterTeam).toHaveBeenCalledWith({
        team_name: 'Test Warriors',
        members: expect.arrayContaining([
          expect.objectContaining({
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            is_leader: true
          })
        ])
      });
    });
  });
});
```

### Backend Unit Tests (Go + Testify)

#### API Handler Tests
```go
// handlers/registration_test.go
package handlers

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
)

type MockTeamService struct {
    mock.Mock
}

func (m *MockTeamService) CreateTeam(req CreateTeamRequest) (*Team, error) {
    args := m.Called(req)
    return args.Get(0).(*Team), args.Error(1)
}

func TestCreateTeamHandler(t *testing.T) {
    tests := []struct {
        name           string
        requestBody    CreateTeamRequest
        setupMock      func(*MockTeamService)
        expectedStatus int
        expectedBody   string
    }{
        {
            name: "valid team creation",
            requestBody: CreateTeamRequest{
                TeamName: "Test Warriors",
                Members: []Member{
                    {
                        FirstName: "John",
                        LastName:  "Doe",
                        Email:     "john@example.com",
                        Phone:     "+91-9876543210",
                        College:   "Test University",
                        Year:      "3rd Year",
                        IsLeader:  true,
                    },
                    {
                        FirstName: "Jane",
                        LastName:  "Smith", 
                        Email:     "jane@example.com",
                        Phone:     "+91-9876543211",
                        College:   "Test University",
                        Year:      "2nd Year",
                        IsLeader:  false,
                    },
                },
            },
            setupMock: func(m *MockTeamService) {
                m.On("CreateTeam", mock.AnythingOfType("CreateTeamRequest")).Return(&Team{
                    ID:   "test-team-123",
                    Name: "Test Warriors",
                }, nil)
            },
            expectedStatus: 200,
            expectedBody:   `{"success":true,"data":{"team_id":"test-team-123"}}`,
        },
        {
            name: "invalid team size - less than 2 members",
            requestBody: CreateTeamRequest{
                TeamName: "Solo Team",
                Members: []Member{
                    {
                        FirstName: "John",
                        LastName:  "Doe",
                        Email:     "john@example.com",
                        IsLeader:  true,
                    },
                },
            },
            setupMock:     func(m *MockTeamService) {},
            expectedStatus: 400,
            expectedBody:   `{"success":false,"error":{"code":"INVALID_TEAM_SIZE","message":"Team must have 2-4 members"}}`,
        },
        {
            name: "duplicate email",
            requestBody: CreateTeamRequest{
                TeamName: "Duplicate Email Team",
                Members: []Member{
                    {
                        FirstName: "John",
                        LastName:  "Doe",
                        Email:     "john@example.com",
                        IsLeader:  true,
                    },
                    {
                        FirstName: "Jane",
                        LastName:  "Smith",
                        Email:     "john@example.com", // Same email
                        IsLeader:  false,
                    },
                },
            },
            setupMock:     func(m *MockTeamService) {},
            expectedStatus: 400,
            expectedBody:   `{"success":false,"error":{"code":"DUPLICATE_EMAIL","message":"Duplicate email addresses not allowed"}}`,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            mockService := new(MockTeamService)
            tt.setupMock(mockService)
            
            handler := NewRegistrationHandler(mockService)
            
            body, _ := json.Marshal(tt.requestBody)
            req := httptest.NewRequest("POST", "/register/team", bytes.NewBuffer(body))
            req.Header.Set("Content-Type", "application/json")
            
            rr := httptest.NewRecorder()
            handler.CreateTeam(rr, req)
            
            assert.Equal(t, tt.expectedStatus, rr.Code)
            
            if tt.expectedBody != "" {
                assert.JSONEq(t, tt.expectedBody, rr.Body.String())
            }
            
            mockService.AssertExpectations(t)
        })
    }
}
```

#### Payment Service Tests
```go
// services/payment_test.go
package services

import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
)

type MockRazorpayClient struct {
    mock.Mock
}

func (m *MockRazorpayClient) CreateOrder(data map[string]interface{}) (map[string]interface{}, error) {
    args := m.Called(data)
    return args.Get(0).(map[string]interface{}), args.Error(1)
}

func TestPaymentService_CreateOrder(t *testing.T) {
    tests := []struct {
        name          string
        teamID        string
        amount        int
        setupMock     func(*MockRazorpayClient)
        expectedError bool
    }{
        {
            name:   "successful order creation",
            teamID: "test-team-123",
            amount: 99900,
            setupMock: func(m *MockRazorpayClient) {
                m.On("CreateOrder", mock.MatchedBy(func(data map[string]interface{}) bool {
                    return data["amount"] == 99900 && data["currency"] == "INR"
                })).Return(map[string]interface{}{
                    "id":       "order_razorpay_123",
                    "amount":   99900,
                    "currency": "INR",
                    "status":   "created",
                }, nil)
            },
            expectedError: false,
        },
        {
            name:   "invalid amount",
            teamID: "test-team-123",
            amount: 0,
            setupMock: func(m *MockRazorpayClient) {
                // Mock should not be called for invalid amount
            },
            expectedError: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            mockClient := new(MockRazorpayClient)
            tt.setupMock(mockClient)
            
            service := NewPaymentService(mockClient)
            
            order, err := service.CreateOrder(tt.teamID, tt.amount)
            
            if tt.expectedError {
                assert.Error(t, err)
                assert.Nil(t, order)
            } else {
                assert.NoError(t, err)
                assert.NotNil(t, order)
                assert.Equal(t, "order_razorpay_123", order.ID)
            }
            
            mockClient.AssertExpectations(t)
        })
    }
}

func TestPaymentService_VerifySignature(t *testing.T) {
    service := NewPaymentService(nil)
    
    tests := []struct {
        name            string
        orderID         string
        paymentID       string
        signature       string
        secret          string
        expectedValid   bool
    }{
        {
            name:          "valid signature",
            orderID:       "order_123",
            paymentID:     "pay_123",
            signature:     "valid_signature_hash",
            secret:        "test_secret",
            expectedValid: true,
        },
        {
            name:          "invalid signature",
            orderID:       "order_123",
            paymentID:     "pay_123", 
            signature:     "invalid_signature",
            secret:        "test_secret",
            expectedValid: false,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Mock environment for testing
            t.Setenv("RAZORPAY_KEY_SECRET", tt.secret)
            
            isValid := service.VerifySignature(tt.orderID, tt.paymentID, tt.signature)
            assert.Equal(t, tt.expectedValid, isValid)
        })
    }
}
```

## 2. Integration Testing

### Database Integration Tests
```go
// integration/database_test.go
package integration

import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/suite"
)

type DatabaseTestSuite struct {
    suite.Suite
    db *DynamoDBClient
}

func (suite *DatabaseTestSuite) SetupSuite() {
    // Setup test DynamoDB instance
    suite.db = NewDynamoDBClient("test-table")
}

func (suite *DatabaseTestSuite) TearDownSuite() {
    // Cleanup test data
    suite.db.Cleanup()
}

func (suite *DatabaseTestSuite) TestCreateAndRetrieveTeam() {
    team := &Team{
        ID:   "test-team-integration",
        Name: "Integration Test Team",
        Members: []Member{
            {
                FirstName: "John",
                LastName:  "Doe",
                Email:     "john@integration-test.com",
                IsLeader:  true,
            },
        },
        PaymentStatus: "pending",
    }
    
    // Create team
    err := suite.db.CreateTeam(team)
    assert.NoError(suite.T(), err)
    
    // Retrieve team
    retrievedTeam, err := suite.db.GetTeam(team.ID)
    assert.NoError(suite.T(), err)
    assert.Equal(suite.T(), team.ID, retrievedTeam.ID)
    assert.Equal(suite.T(), team.Name, retrievedTeam.Name)
    assert.Len(suite.T(), retrievedTeam.Members, 1)
}

func (suite *DatabaseTestSuite) TestDuplicateEmailPrevention() {
    // Create first team
    team1 := &Team{
        ID:   "team-1",
        Name: "Team One",
        Members: []Member{
            {Email: "duplicate@test.com", IsLeader: true},
        },
    }
    err := suite.db.CreateTeam(team1)
    assert.NoError(suite.T(), err)
    
    // Try to create second team with same email
    team2 := &Team{
        ID:   "team-2",
        Name: "Team Two", 
        Members: []Member{
            {Email: "duplicate@test.com", IsLeader: true},
        },
    }
    err = suite.db.CreateTeam(team2)
    assert.Error(suite.T(), err)
    assert.Contains(suite.T(), err.Error(), "duplicate email")
}

func TestDatabaseTestSuite(t *testing.T) {
    suite.Run(t, new(DatabaseTestSuite))
}
```

### Payment Integration Tests
```go
// integration/payment_test.go
package integration

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestRazorpayIntegration(t *testing.T) {
    if testing.Short() {
        t.Skip("Skipping integration test in short mode")
    }
    
    // Use test API keys
    service := NewPaymentService(os.Getenv("RAZORPAY_TEST_KEY_ID"), os.Getenv("RAZORPAY_TEST_SECRET"))
    
    t.Run("create order", func(t *testing.T) {
        order, err := service.CreateOrder("test-team-123", 99900)
        assert.NoError(t, err)
        assert.NotEmpty(t, order.ID)
        assert.Equal(t, 99900, order.Amount)
        assert.Equal(t, "INR", order.Currency)
    })
    
    t.Run("verify webhook signature", func(t *testing.T) {
        // Test with known test signature
        isValid := service.VerifyWebhookSignature([]byte("test payload"), "test signature")
        // Assert based on expected behavior
    })
}
```

## 3. End-to-End Testing

### Cypress E2E Tests
```javascript
// cypress/e2e/registration-flow.cy.js
describe('Team Registration Flow', () => {
  beforeEach(() => {
    cy.visit('/hackathon');
  });

  it('completes full registration and payment flow', () => {
    // Navigate to registration
    cy.contains('Register Team').click();
    
    // Fill team details
    cy.get('[data-testid="team-name"]').type('E2E Test Warriors');
    cy.get('[data-testid="track-select"]').select('AI & Machine Learning');
    
    // Fill leader details
    cy.get('[data-testid="member-0-firstname"]').type('John');
    cy.get('[data-testid="member-0-lastname"]').type('Doe');
    cy.get('[data-testid="member-0-email"]').type('john@e2etest.com');
    cy.get('[data-testid="member-0-phone"]').type('+91-9876543210');
    cy.get('[data-testid="member-0-college"]').type('E2E Test University');
    cy.get('[data-testid="member-0-year"]').select('3rd Year');
    cy.get('[data-testid="member-0-github"]').type('johndoe');
    
    // Add second member
    cy.get('[data-testid="add-member"]').click();
    cy.get('[data-testid="member-1-firstname"]').type('Jane');
    cy.get('[data-testid="member-1-lastname"]').type('Smith');
    cy.get('[data-testid="member-1-email"]').type('jane@e2etest.com');
    cy.get('[data-testid="member-1-phone"]').type('+91-9876543211');
    cy.get('[data-testid="member-1-college"]').type('E2E Test University');
    cy.get('[data-testid="member-1-year"]').select('2nd Year');
    
    // Submit registration
    cy.get('[data-testid="submit-registration"]').click();
    
    // Mock payment success (in test environment)
    cy.window().then((win) => {
      win.mockRazorpaySuccess({
        razorpay_payment_id: 'pay_test_123',
        razorpay_order_id: 'order_test_123',
        razorpay_signature: 'test_signature'
      });
    });
    
    // Verify success page
    cy.contains('Registration Successful').should('be.visible');
    cy.contains('E2E Test Warriors').should('be.visible');
    cy.contains('Payment Confirmed').should('be.visible');
  });

  it('handles payment failure gracefully', () => {
    // Fill form and submit
    // ... (same as above)
    
    // Mock payment failure
    cy.window().then((win) => {
      win.mockRazorpayFailure({
        error: {
          code: 'PAYMENT_FAILED',
          description: 'Payment failed due to insufficient funds'
        }
      });
    });
    
    // Verify error handling
    cy.contains('Payment Failed').should('be.visible');
    cy.contains('Try Again').should('be.visible');
  });

  it('validates form fields correctly', () => {
    cy.get('[data-testid="submit-registration"]').click();
    
    // Check validation messages
    cy.contains('Team name is required').should('be.visible');
    cy.contains('First name is required').should('be.visible');
    cy.contains('Email is required').should('be.visible');
  });

  it('prevents duplicate emails within team', () => {
    cy.get('[data-testid="member-0-email"]').type('duplicate@test.com');
    cy.get('[data-testid="add-member"]').click();
    cy.get('[data-testid="member-1-email"]').type('duplicate@test.com');
    cy.get('[data-testid="member-1-email"]').blur();
    
    cy.contains('This email is already used by another team member').should('be.visible');
  });
});
```

### Playwright E2E Tests
```javascript
// tests/e2e/hackathon-journey.spec.js
import { test, expect } from '@playwright/test';

test.describe('CodeKurukshetra User Journey', () => {
  test('user can browse hackathon details', async ({ page }) => {
    await page.goto('/hackathon');
    
    // Check hero section
    await expect(page.locator('h1')).toContainText('CodeKurukshetra');
    await expect(page.locator('.hero-subtitle')).toContainText('Battle of Ideas — Code the Dharma');
    
    // Check timeline navigation
    await page.click('text=Day 2');
    await expect(page.locator('.day-content')).toContainText('Day 2: The Final Assault');
    
    // Check tracks section
    await expect(page.locator('.tracks-section')).toContainText('AI & Machine Learning');
    await expect(page.locator('.tracks-section')).toContainText('Web & Mobile Development');
    
    // Check prizes
    await expect(page.locator('.prizes-section')).toContainText('₹1,00,000');
  });

  test('responsive design works correctly', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/hackathon');
    
    // Check mobile-specific elements
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('.phase-buttons')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Verify layout adaptation
    await expect(page.locator('.tracks-grid')).toBeVisible();
  });

  test('accessibility standards are met', async ({ page }) => {
    await page.goto('/hackathon');
    
    // Check for proper headings hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
    
    // Check for alt texts on images
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Check for form labels
    const inputs = await page.locator('input').all();
    for (const input of inputs) {
      const labelId = await input.getAttribute('aria-labelledby');
      const label = await input.getAttribute('aria-label');
      expect(labelId || label).toBeTruthy();
    }
  });
});
```

## 4. Performance Testing

### Load Testing with Artillery
```yaml
# load-test/registration-load.yml
config:
  target: 'https://api.codetapasya.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Peak registration load"
    - duration: 60
      arrivalRate: 5
      name: "Cool down"
  processor: "./load-test-processor.js"

scenarios:
  - name: "Team Registration Flow"
    weight: 70
    flow:
      - post:
          url: "/hackathon/register/team"
          headers:
            Authorization: "Bearer {{ $randomFirebaseToken }}"
          json:
            team_name: "Load Test Team {{ $randomInt(1, 10000) }}"
            members:
              - first_name: "{{ $randomFirstName }}"
                last_name: "{{ $randomLastName }}"
                email: "{{ $randomEmail }}"
                phone: "{{ $randomPhone }}"
                college: "{{ $randomCollege }}"
                year: "{{ $randomYear }}"
                is_leader: true
      - post:
          url: "/hackathon/payment/verify"
          json:
            team_id: "{{ teamId }}"
            razorpay_order_id: "{{ orderId }}"
            razorpay_payment_id: "pay_test_{{ $randomString }}"
            razorpay_signature: "{{ $generateSignature }}"

  - name: "Browse Hackathon Info"
    weight: 30
    flow:
      - get:
          url: "/hackathon/config"
      - get:
          url: "/hackathon/tracks"
```

### Frontend Performance Testing
```javascript
// tests/performance/lighthouse.spec.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

describe('Performance Tests', () => {
  let chrome;
  
  beforeAll(async () => {
    chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  });
  
  afterAll(async () => {
    await chrome.kill();
  });
  
  test('hackathon page meets performance standards', async () => {
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
    };
    
    const runnerResult = await lighthouse('http://localhost:3000/hackathon', options);
    const score = runnerResult.lhr.categories.performance.score * 100;
    
    expect(score).toBeGreaterThan(90); // 90+ performance score
  });
  
  test('registration page is accessible', async () => {
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['accessibility'],
      port: chrome.port,
    };
    
    const runnerResult = await lighthouse('http://localhost:3000/hackathon/register', options);
    const score = runnerResult.lhr.categories.accessibility.score * 100;
    
    expect(score).toBeGreaterThan(95); // 95+ accessibility score
  });
});
```

## 5. Security Testing

### API Security Tests
```go
// security/api_security_test.go
package security

import (
    "testing"
    "net/http"
    "net/http/httptest"
)

func TestAPISecurityHeaders(t *testing.T) {
    handler := setupTestHandler()
    
    req := httptest.NewRequest("GET", "/hackathon/config", nil)
    rr := httptest.NewRecorder()
    
    handler.ServeHTTP(rr, req)
    
    // Check security headers
    assert.Equal(t, "nosniff", rr.Header().Get("X-Content-Type-Options"))
    assert.Equal(t, "DENY", rr.Header().Get("X-Frame-Options"))
    assert.Equal(t, "1; mode=block", rr.Header().Get("X-XSS-Protection"))
    assert.Contains(t, rr.Header().Get("Content-Security-Policy"), "default-src 'self'")
}

func TestRateLimiting(t *testing.T) {
    handler := setupTestHandler()
    
    // Make multiple rapid requests
    for i := 0; i < 10; i++ {
        req := httptest.NewRequest("POST", "/hackathon/register/team", nil)
        rr := httptest.NewRecorder()
        handler.ServeHTTP(rr, req)
        
        if i >= 5 { // After 5 requests, should be rate limited
            assert.Equal(t, http.StatusTooManyRequests, rr.Code)
        }
    }
}

func TestSQLInjectionPrevention(t *testing.T) {
    maliciousInputs := []string{
        "'; DROP TABLE participants; --",
        "1' OR '1'='1",
        "<script>alert('xss')</script>",
        "../../etc/passwd",
    }
    
    for _, input := range maliciousInputs {
        req := httptest.NewRequest("POST", "/hackathon/register/team", 
            strings.NewReader(fmt.Sprintf(`{"team_name": "%s"}`, input)))
        rr := httptest.NewRecorder()
        
        handler.ServeHTTP(rr, req)
        
        // Should either reject with 400 or sanitize the input
        assert.True(t, rr.Code == 400 || !strings.Contains(rr.Body.String(), input))
    }
}
```

## 6. Test Automation & CI/CD

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: VPShare-frontend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd VPShare-frontend
        npm ci
    
    - name: Run unit tests
      run: |
        cd VPShare-frontend
        npm run test:coverage
    
    - name: Run e2e tests
      run: |
        cd VPShare-frontend
        npm run test:e2e
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./VPShare-frontend/coverage/lcov.info

  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      dynamodb:
        image: amazon/dynamodb-local
        ports:
          - 8000:8000
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Go
      uses: actions/setup-go@v3
      with:
        go-version: '1.21'
    
    - name: Run unit tests
      run: |
        cd Backend
        go test -v -cover ./...
    
    - name: Run integration tests
      run: |
        cd Backend
        go test -v -tags=integration ./...
      env:
        DYNAMODB_ENDPOINT: http://localhost:8000
        RAZORPAY_KEY_ID: ${{ secrets.RAZORPAY_TEST_KEY_ID }}
        RAZORPAY_KEY_SECRET: ${{ secrets.RAZORPAY_TEST_SECRET }}

  security-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Run SAST scan
      uses: github/super-linter@v4
      env:
        DEFAULT_BRANCH: main
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Run dependency check
      uses: actions/dependency-review-action@v3

  performance-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Run Lighthouse CI
      run: |
        npm install -g @lhci/cli
        lhci autorun
      env:
        LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

## 7. Test Data Management

### Test Data Factory
```javascript
// tests/factories/teamFactory.js
export const createTeamData = (overrides = {}) => ({
  team_name: 'Test Warriors',
  track: 'ai-ml',
  members: [
    {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@test.com',
      phone: '+91-9876543210',
      college: 'Test University',
      year: '3rd Year',
      github_username: 'johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
      student_status: true,
      is_leader: true,
    },
    {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@test.com',
      phone: '+91-9876543211',
      college: 'Test University',
      year: '2nd Year',
      github_username: 'janesmith',
      student_status: true,
      is_leader: false,
    },
  ],
  ...overrides,
});
```

## 8. Test Coverage & Reporting

### Coverage Requirements
- **Frontend Components**: 90%+ line coverage
- **Backend Handlers**: 95%+ line coverage
- **Critical Payment Flow**: 100% line coverage
- **Security Functions**: 100% branch coverage

### Test Reports
```bash
# Generate comprehensive test report
npm run test:report

# Coverage thresholds in package.json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 90,
        "functions": 90,
        "lines": 90,
        "statements": 90
      },
      "./src/components/payment/": {
        "branches": 100,
        "functions": 100,
        "lines": 100,
        "statements": 100
      }
    }
  }
}
```

## 9. Production Testing Strategy

### Smoke Tests
```javascript
// tests/smoke/production-smoke.spec.js
describe('Production Smoke Tests', () => {
  test('hackathon page loads successfully', async () => {
    const response = await fetch('https://codetapasya.com/hackathon');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
  });
  
  test('API health check passes', async () => {
    const response = await fetch('https://api.codetapasya.com/hackathon/health');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });
  
  test('payment gateway is accessible', async () => {
    // Test Razorpay checkout script loads
    const response = await fetch('https://checkout.razorpay.com/v1/checkout.js');
    expect(response.status).toBe(200);
  });
});
```

This comprehensive testing strategy ensures the CodeKurukshetra platform is robust, secure, and provides an excellent user experience under all conditions.

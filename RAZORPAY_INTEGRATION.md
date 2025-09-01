# CodeKurukshetra Razorpay Payment Integration

## Overview

This document outlines the Razorpay payment integration for CodeKurukshetra hackathon registrations. We'll integrate Razorpay's payment gateway to handle team registration fees of ₹999 per team.

## Razorpay Account Setup

### Account Configuration
- **Business Type**: Educational Services / Event Management
- **Settlement**: Daily settlements to bank account
- **Pricing**: Standard rates (check current Razorpay pricing)

### API Keys
For CodeKurukshetra hackathon, we'll need separate API keys from the existing CodeTapasya subscription keys.

#### Recommended Approach: Separate Keys
**Why separate keys?**
- Different settlement accounts possible
- Separate webhook endpoints
- Independent monitoring and reporting
- Better financial tracking
- Reduced risk of conflicts

#### Create New Razorpay Account/Subaccount
```bash
# New API Keys for CodeKurukshetra
RAZORPAY_KEY_ID_HACKATHON=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET_HACKATHON=xxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET_HACKATHON=xxxxxxxxxxxxxxxxxx
```

### Webhook Configuration
```
Webhook URL: https://api.codetapasya.com/hackathon/payment/webhook
Events: payment.authorized, payment.captured, payment.failed
Secret: Use strong random secret for signature verification
```

## Payment Flow Architecture

### 1. Registration Initiation
```
User submits team registration → 
Create Razorpay order → 
Return order details to frontend →
User completes payment →
Webhook updates database →
Send confirmation emails
```

### 2. Frontend Integration

#### Create Razorpay Order (Frontend)
```javascript
// In React component
const createOrder = async (teamData) => {
  try {
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`
      },
      body: JSON.stringify({
        team_name: teamData.name,
        members: teamData.members
      })
    });
    
    const orderData = await response.json();
    return orderData;
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
};
```

#### Initialize Razorpay Checkout
```javascript
import { loadScript } from '../utils/razorpay';

const initiatePayment = async (orderData) => {
  // Load Razorpay script
  const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
  
  if (!res) {
    alert('Razorpay SDK failed to load. Please check your connection.');
    return;
  }

  const options = {
    key: process.env.REACT_APP_RAZORPAY_KEY_ID,
    amount: orderData.amount, // Amount in paise
    currency: orderData.currency,
    name: 'CodeKurukshetra',
    description: 'Team Registration Fee',
    image: '/logo-razorpay.png',
    order_id: orderData.order_id,
    handler: function (response) {
      // Payment successful
      verifyPayment(response, orderData.team_id);
    },
    prefill: {
      name: orderData.leader_name,
      email: orderData.leader_email,
      contact: orderData.leader_phone
    },
    notes: {
      team_id: orderData.team_id,
      event: 'CodeKurukshetra',
      team_size: orderData.member_count
    },
    theme: {
      color: '#7B241C' // CodeKurukshetra brand color
    },
    modal: {
      ondismiss: function() {
        console.log('Payment cancelled by user');
        // Handle payment cancellation
        updatePaymentStatus('cancelled');
      }
    }
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};
```

#### Payment Verification
```javascript
const verifyPayment = async (response, teamId) => {
  try {
    const verification = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`
      },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        team_id: teamId
      })
    });
    
    const result = await verification.json();
    
    if (result.success) {
      // Payment verified successfully
      showSuccessMessage();
      redirectToConfirmation();
    } else {
      // Verification failed
      showErrorMessage(result.error);
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
    showErrorMessage('Payment verification failed. Please contact support.');
  }
};
```

### 3. Backend Integration (Go)

#### Create Order Endpoint
```go
package payment

import (
    "github.com/razorpay/razorpay-go"
    "encoding/json"
    "net/http"
)

type OrderRequest struct {
    TeamName string `json:"team_name"`
    Members  []Member `json:"members"`
}

type OrderResponse struct {
    OrderID    string `json:"order_id"`
    Amount     int    `json:"amount"`
    Currency   string `json:"currency"`
    TeamID     string `json:"team_id"`
    LeaderName string `json:"leader_name"`
    LeaderEmail string `json:"leader_email"`
}

func CreateOrderHandler(w http.ResponseWriter, r *http.Request) {
    var req OrderRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }
    
    // Validate team data
    if err := validateTeamData(req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    // Create team in database with pending status
    teamID, err := createTeamInDB(req)
    if err != nil {
        http.Error(w, "Failed to create team", http.StatusInternalServerError)
        return
    }
    
    // Create Razorpay order
    client := razorpay.NewClient(os.Getenv("RAZORPAY_KEY_ID"), os.Getenv("RAZORPAY_KEY_SECRET"))
    
    data := map[string]interface{}{
        "amount":   99900, // ₹999 in paise
        "currency": "INR",
        "receipt":  teamID,
        "notes": map[string]interface{}{
            "team_id": teamID,
            "event": "CodeKurukshetra",
            "team_name": req.TeamName,
        },
    }
    
    order, err := client.Order.Create(data, nil)
    if err != nil {
        http.Error(w, "Failed to create order", http.StatusInternalServerError)
        return
    }
    
    // Update team with order ID
    updateTeamOrderID(teamID, order["id"].(string))
    
    response := OrderResponse{
        OrderID:     order["id"].(string),
        Amount:      99900,
        Currency:    "INR", 
        TeamID:      teamID,
        LeaderName:  getLeaderName(req.Members),
        LeaderEmail: getLeaderEmail(req.Members),
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}
```

#### Payment Verification Endpoint
```go
func VerifyPaymentHandler(w http.ResponseWriter, r *http.Request) {
    var req VerifyRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }
    
    // Verify signature
    if !verifySignature(req.RazorpayOrderID, req.RazorpayPaymentID, req.RazorpaySignature) {
        http.Error(w, "Invalid signature", http.StatusBadRequest)
        return
    }
    
    // Update payment status in database
    err := updatePaymentStatus(req.TeamID, "paid", req.RazorpayPaymentID)
    if err != nil {
        http.Error(w, "Failed to update payment status", http.StatusInternalServerError)
        return
    }
    
    // Send confirmation emails
    go sendConfirmationEmails(req.TeamID)
    
    response := map[string]interface{}{
        "success": true,
        "message": "Payment verified successfully",
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func verifySignature(orderID, paymentID, signature string) bool {
    secret := os.Getenv("RAZORPAY_KEY_SECRET")
    body := orderID + "|" + paymentID
    
    expectedSignature := hmac.New(sha256.New, []byte(secret))
    expectedSignature.Write([]byte(body))
    expectedHex := hex.EncodeToString(expectedSignature.Sum(nil))
    
    return expectedHex == signature
}
```

### 4. Webhook Implementation

#### Webhook Handler
```go
func WebhookHandler(w http.ResponseWriter, r *http.Request) {
    body, err := ioutil.ReadAll(r.Body)
    if err != nil {
        http.Error(w, "Unable to read body", http.StatusBadRequest)
        return
    }
    
    // Verify webhook signature
    signature := r.Header.Get("X-Razorpay-Signature")
    if !verifyWebhookSignature(body, signature) {
        http.Error(w, "Invalid signature", http.StatusUnauthorized)
        return
    }
    
    var event WebhookEvent
    if err := json.Unmarshal(body, &event); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }
    
    // Process based on event type
    switch event.Event {
    case "payment.authorized":
        handlePaymentAuthorized(event.Payload.Payment)
    case "payment.captured":
        handlePaymentCaptured(event.Payload.Payment)
    case "payment.failed":
        handlePaymentFailed(event.Payload.Payment)
    }
    
    w.WriteHeader(http.StatusOK)
}

func verifyWebhookSignature(body []byte, signature string) bool {
    secret := os.Getenv("RAZORPAY_WEBHOOK_SECRET")
    expectedSignature := hmac.New(sha256.New, []byte(secret))
    expectedSignature.Write(body)
    expectedHex := hex.EncodeToString(expectedSignature.Sum(nil))
    
    return expectedHex == signature
}
```

## Payment Flow Scenarios

### 1. Successful Payment
```
1. User submits registration → Create order → Payment successful
2. Webhook received → Verify signature → Update database
3. Send confirmation emails → Update team status to "registered"
```

### 2. Failed Payment
```
1. User submits registration → Create order → Payment fails
2. Webhook received → Update payment status to "failed"
3. Allow user to retry payment with same order
```

### 3. Abandoned Payment
```
1. User starts payment → Closes window/cancels
2. Order remains in "created" status
3. TTL cleanup after 24 hours
4. Send reminder email option
```

### 4. Duplicate Payment
```
1. Use Razorpay's idempotency to prevent duplicates
2. Check team payment status before processing
3. Return existing order if already paid
```

## Error Handling

### Frontend Error Messages
```javascript
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet.',
  PAYMENT_FAILED: 'Payment failed. Please try again or use different payment method.',
  INVALID_CARD: 'Invalid card details. Please check and try again.',
  INSUFFICIENT_FUNDS: 'Insufficient funds. Please try with different card.',
  DUPLICATE_REGISTRATION: 'This email is already registered.',
  SERVER_ERROR: 'Server error occurred. Please contact support.'
};
```

### Backend Error Responses
```go
type ErrorResponse struct {
    Success bool   `json:"success"`
    Error   struct {
        Code    string `json:"code"`
        Message string `json:"message"`
    } `json:"error"`
}

const (
    ErrInvalidRequest    = "INVALID_REQUEST"
    ErrPaymentFailed     = "PAYMENT_FAILED"
    ErrDuplicateEmail    = "DUPLICATE_EMAIL"
    ErrInsufficientFunds = "INSUFFICIENT_FUNDS"
    ErrServerError       = "SERVER_ERROR"
)
```

## Testing

### Test Environment Setup
```bash
# Test API Keys
RAZORPAY_KEY_ID_TEST=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET_TEST=xxxxxxxxxxxxxxxxxx

# Test webhook endpoint
WEBHOOK_URL=https://dev-api.codetapasya.com/hackathon/payment/webhook
```

### Test Scenarios
```javascript
// Test payment flows
const testPayments = [
  {
    card: '4111111111111111', // Success
    expected: 'payment.captured'
  },
  {
    card: '4000000000000002', // Declined
    expected: 'payment.failed'
  },
  {
    card: '4000000000000069', // Expired card
    expected: 'payment.failed'
  }
];
```

### Webhook Testing
```bash
# Test webhook locally with ngrok
ngrok http 8080
# Update webhook URL in Razorpay dashboard
```

## Security Best Practices

### API Key Management
- Store keys in environment variables
- Use different keys for test/production
- Rotate keys periodically
- Monitor API key usage

### Signature Verification
- Always verify webhook signatures
- Use constant-time comparison
- Log failed verification attempts

### PCI Compliance
- Never store card details
- Use HTTPS for all communications
- Validate all inputs
- Log security events

## Monitoring & Analytics

### Key Metrics
- Payment success rate
- Average payment time
- Failed payment reasons
- Revenue tracking

### Dashboards
```json
{
  "metrics": [
    "total_payments",
    "successful_payments", 
    "failed_payments",
    "revenue_collected",
    "refunds_processed"
  ],
  "alerts": [
    "payment_failure_rate > 5%",
    "webhook_failures > 10/hour",
    "revenue_drop > 20%"
  ]
}
```

### Reporting
```sql
-- Daily payment report
SELECT 
  DATE(created_at) as payment_date,
  COUNT(*) as total_transactions,
  SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as successful_payments,
  SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as revenue
FROM payments 
WHERE created_at >= CURRENT_DATE - INTERVAL 30 DAY
GROUP BY DATE(created_at);
```

## Troubleshooting

### Common Issues
1. **Payment stuck in pending**: Check webhook delivery
2. **Signature verification fails**: Verify webhook secret
3. **Duplicate payments**: Implement idempotency checks
4. **Failed webhooks**: Implement retry mechanism

### Debug Tools
```go
func logPaymentEvent(event string, data interface{}) {
    log.Printf("Payment Event: %s, Data: %+v", event, data)
}
```

### Support Contact
- Razorpay Support: support@razorpay.com
- Integration Issues: 24x7 chat support
- Emergency: Phone support for critical issues

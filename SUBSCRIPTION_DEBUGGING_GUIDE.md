# Subscription Payment Debugging Guide

## Current Error: "Failed to create order"

### What's Happening
When a user clicks "Subscribe Now", the frontend tries to create an order via the API endpoint `/subscriptions/orders/create` but it's failing.

### Debug Steps

#### 1. Check Browser Console Logs

After clicking Subscribe, you should see these console logs:
```
Creating order for plan: <plan_id> <plan_name>
Order response received: <full API response>
```

If you're getting to the error, check what the `Order response received` shows.

#### 2. Common Causes & Solutions

**A. API Endpoint Not Available**
- **Check**: Is your backend running on `http://13.60.201.69:8000`?
- **Test**: Try this in browser: `http://13.60.201.69:8000/plans`
- **Solution**: Start your backend server

**B. Authentication Issue**
- **Check**: Are you logged in? Open localStorage and look for `token`
- **Test**: In console, run: `localStorage.getItem('token')`
- **Solution**: Login first, then try subscribing

**C. API Response Structure Mismatch**
- **Expected Response**:
```json
{
  "success": true,
  "message": "Order created",
  "data": {
    "orderId": "internal_123",
    "razorpayOrderId": "order_xyz",
    "amount": 20999,
    "currency": "INR"
  }
}
```
- **Check**: Look at `Order response received` in console
- **Solution**: Update backend to match this structure

**D. CORS Issue**
- **Symptom**: Network error, request blocked
- **Check**: Look for CORS errors in console
- **Solution**: Add CORS headers in backend

#### 3. Testing API Directly

Test the endpoint with curl:

```bash
curl -X POST 'http://13.60.201.69:8000/subscriptions/orders/create' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{"planId": "PLAN_ID_HERE"}'
```

Replace:
- `YOUR_TOKEN_HERE` with your actual token from localStorage
- `PLAN_ID_HERE` with a real plan ID from `/plans` endpoint

#### 4. Check Network Tab

Click Subscribe and in Network tab:
1. Find the request to `create`
2. Check **Status Code**:
   - 200 = Success but wrong response format
   - 401 = Authentication error
   - 404 = Endpoint not found
   - 500 = Server error
3. Check **Response** tab to see what server returned

### Temporary Workaround (Testing Only)

If you want to test the payment UI while fixing backend, you can temporarily use a mock response.

**Option 1: Mock the API call**

In `subscription-service.ts`, temporarily change:

```typescript
createOrder: async (data: CreateOrderRequest) => {
  // TEMPORARY MOCK - REMOVE AFTER BACKEND IS READY
  return {
    data: {
      success: true,
      message: "Mock order created",
      data: {
        orderId: "mock_order_123",
        razorpayOrderId: "order_MockTestOrder123",
        amount: 20999,
        currency: "INR"
      }
    }
  };
  
  // Actual API call (uncomment when backend is ready):
  // const response = await apiClient.post<CreateOrderResponse>(
  //   API_ENDPOINTS.SUBSCRIPTION.CREATE_ORDER,
  //   data
  // );
  // return response;
},
```

**⚠️ WARNING**: This is only for testing the UI! Remove it before production!

### Expected Frontend Flow

1. User clicks "Subscribe Now"
2. Frontend checks if logged in
3. Frontend calls `POST /subscriptions/orders/create` with `{ planId: "xxx" }`
4. Backend creates Razorpay order
5. Backend returns order details
6. Frontend opens Razorpay payment modal
7. User completes payment
8. Razorpay sends webhook to backend
9. Backend activates subscription
10. User sees success message

### Backend Requirements Checklist

- [ ] Endpoint `/subscriptions/orders/create` exists
- [ ] Endpoint accepts POST requests
- [ ] Endpoint requires authentication (Bearer token)
- [ ] Endpoint validates planId
- [ ] Endpoint creates Razorpay order
- [ ] Returns correct response structure
- [ ] CORS headers configured for frontend domain
- [ ] Razorpay credentials configured
- [ ] Webhook endpoint configured

### Quick Test Script

Run this in browser console after logging in:

```javascript
// Get token
const token = localStorage.getItem('token');
console.log('Token:', token ? 'Present' : 'Missing');

// Try to create order
fetch('http://13.60.201.69:8000/subscriptions/orders/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ planId: 'REPLACE_WITH_ACTUAL_PLAN_ID' })
})
.then(res => res.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

### Next Steps After Fixing

Once the API works:
1. Remove any temporary mocks
2. Test the complete flow:
   - Select plan
   - Click Subscribe
   - Complete test payment
   - Verify subscription activated
3. Check webhook is being received
4. Verify subscription appears in profile

---

**Status**: Waiting for backend endpoint to be configured/fixed

**Last Updated**: December 4, 2025

# Steadfast Courier API Configuration

## API Credentials Setup

The Steadfast Courier integration requires valid API credentials to function properly. The 429 error ("Too many failed attempts") typically occurs when:

1. **Invalid API credentials** - The API Key or Secret Key is incorrect
2. **Incomplete Secret Key** - The Secret Key provided appears to be incomplete ("aal")
3. **Rate limiting** - Too many failed authentication attempts have temporarily blocked your client

## Configuration Steps

### Option 1: Environment Variables (Recommended)

Create or update your `.env` file in the project root:

```env
VITE_STEADFAST_API_KEY=your_full_api_key_here
VITE_STEADFAST_SECRET_KEY=your_full_secret_key_here
```

**Important:** Make sure to use the **complete** Secret Key provided by Steadfast Courier. The current default value ("aal") appears to be incomplete.

### Option 2: Direct Configuration

If you prefer to hardcode the credentials (not recommended for production), edit:
`src/features/steadfast/steadfastApiSlice.js`

```javascript
const API_KEY = "your_full_api_key_here";
const SECRET_KEY = "your_full_secret_key_here";
```

## Verifying Credentials

1. Check with Steadfast Courier support to confirm your API credentials
2. Ensure the Secret Key is the complete key (not truncated)
3. Wait a few minutes if you've been blocked (429 error) before retrying

## API Base URL

The integration uses: `https://portal.packzy.com/api/v1`

## Features Available

- ✅ Create Single Order
- ✅ Bulk Order Create (up to 500 orders)
- ✅ Check Delivery Status (by Consignment ID, Invoice, or Tracking Code)
- ✅ Check Current Balance
- ✅ Return Requests Management
- ✅ View Payments
- ✅ View Police Stations

## Troubleshooting

### Error 429: Too Many Failed Attempts
- **Solution:** Wait 5-10 minutes before retrying
- **Prevention:** Verify your API credentials are correct before making requests

### Error 401: Unauthorized
- **Solution:** Check that both API Key and Secret Key are correct and complete
- **Prevention:** Use environment variables to securely store credentials

### Invalid Credentials Warning
- If you see a yellow warning banner, your Secret Key may be incomplete
- Update the credentials in your `.env` file or contact Steadfast Courier support

/**
 * paymentService.js
 * Calls the FoodOrder backend payment endpoints (which call Flutterwave).
 * The backend keeps FLW_SECRET_KEY safe — never exposed to the mobile app.
 */

const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';

/**
 * Network error handler with retry logic and timeout
 */
async function fetchWithRetry(url, options, retries = 2) {
  if (!API_BASE) {
    throw new Error('API URL not configured. Please check your environment settings.');
  }

  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Request failed with status ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.');
      }
      
      if (i === retries - 1) {
        // Last retry failed
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

/**
 * Initiate MTN or Airtel Uganda Mobile Money payment.
 * Customer receives a prompt on their phone to authorize.
 *
 * @param {{ phone, network, amount, email, orderId, customerName }} payload
 * @returns {{ success, message, txRef, flwRef }}
 */
export async function initMobileMoney({ phone, network, amount, email, orderId, customerName }) {
  return fetchWithRetry(`${API_BASE}/api/payment/mobile-money`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, network, amount, email, orderId, customerName }),
  });
}

/**
 * Initiate a card payment via Flutterwave.
 * Returns a payment link you can open in a WebView or browser.
 *
 * @param {{ amount, email, orderId, customerName }} payload
 * @returns {{ success, paymentLink, txRef }}
 */
export async function initCardPayment({ amount, email, orderId, customerName }) {
  return fetchWithRetry(`${API_BASE}/api/payment/card`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, email, orderId, customerName }),
  });
}

/**
 * Verify a payment by transaction reference.
 * Call this after the user authorizes on their phone / after redirect.
 *
 * @param {string} txRef
 * @returns {{ success, status, data }}
 */
export async function verifyPayment(txRef) {
  return fetchWithRetry(`${API_BASE}/api/payment/verify/${encodeURIComponent(txRef)}`);
}

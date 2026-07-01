/**
 * paymentService.js
 * Calls the FoodOrder backend payment endpoints (which call Flutterwave).
 * The backend keeps FLW_SECRET_KEY safe — never exposed to the mobile app.
 */

const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';

/**
 * Initiate MTN or Airtel Uganda Mobile Money payment.
 * Customer receives a prompt on their phone to authorize.
 *
 * @param {{ phone, network, amount, email, orderId, customerName }} payload
 * @returns {{ success, message, txRef, flwRef }}
 */
export async function initMobileMoney({ phone, network, amount, email, orderId, customerName }) {
  const res = await fetch(`${API_BASE}/api/payment/mobile-money`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, network, amount, email, orderId, customerName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Mobile money payment failed');
  return data;
}

/**
 * Initiate a card payment via Flutterwave.
 * Returns a payment link you can open in a WebView or browser.
 *
 * @param {{ amount, email, orderId, customerName }} payload
 * @returns {{ success, paymentLink, txRef }}
 */
export async function initCardPayment({ amount, email, orderId, customerName }) {
  const res = await fetch(`${API_BASE}/api/payment/card`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, email, orderId, customerName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Card payment failed');
  return data;
}

/**
 * Verify a payment by transaction reference.
 * Call this after the user authorizes on their phone / after redirect.
 *
 * @param {string} txRef
 * @returns {{ success, status, data }}
 */
export async function verifyPayment(txRef) {
  const res = await fetch(`${API_BASE}/api/payment/verify/${encodeURIComponent(txRef)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Verification failed');
  return data;
}

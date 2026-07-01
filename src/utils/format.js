export const CURRENCY_SYMBOL = 'UGX';
const LOCALE = 'en-UG';

export function formatCurrency(amount) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${CURRENCY_SYMBOL} ${(num || 0).toLocaleString(LOCALE)}`;
}

export function formatPrice(amount) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (num || 0).toLocaleString(LOCALE);
}

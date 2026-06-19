export function formatCurrency(amount) {
  const num = Math.round(amount);
  return `UGX ${num.toLocaleString('en-UG')}`;
}

export function formatDeliveryTime(minutes) {
  return `${minutes} min`;
}

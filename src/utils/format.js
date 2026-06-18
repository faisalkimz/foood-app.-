export function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

export function formatDeliveryTime(minutes) {
  return `${minutes} min`;
}

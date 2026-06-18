const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';

export async function apiClient(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getRestaurants: () => apiClient('/restaurants'),
  getRestaurant: (id) => apiClient(`/restaurants/${id}`),
  getMenu: (restaurantId) => apiClient(`/restaurants/${restaurantId}/menu`),
  createOrder: (payload) =>
    apiClient('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getOrders: () => apiClient('/orders'),
  getOrder: (id) => apiClient(`/orders/${id}`),
};

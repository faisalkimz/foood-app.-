export const ROUTES = {
  ONBOARDING: '/(auth)/onboarding',
  LOGIN: '/(auth)/login',
  SIGNUP: '/(auth)/signup',
  HOME: '/(tabs)',
  SEARCH: '/(tabs)/search',
  CART: '/(tabs)/cart',
  ORDERS: '/(tabs)/orders',
  PROFILE: '/(tabs)/profile',
  RESTAURANT: (id) => `/restaurant/${id}`,
  FOOD: (id) => `/food/${id}`,
  CHECKOUT: '/checkout',
  ORDER: (id) => `/order/${id}`,
};

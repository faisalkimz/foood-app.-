export const CATEGORIES = [
    { id: 'all', name: 'All', emoji: '🍽️' },
    { id: 'burger', name: 'Burger', emoji: '🍔' },
    { id: 'pizza', name: 'Pizza', emoji: '🍕' },
    { id: 'chicken', name: 'Chicken', emoji: '🍗' },
    { id: 'sushi', name: 'Sushi', emoji: '🍣' },
    { id: 'pasta', name: 'Pasta', emoji: '🍝' },
    { id: 'salad', name: 'Salad', emoji: '🥗' },
    { id: 'dessert', name: 'Dessert', emoji: '🍰' },
    { id: 'coffee', name: 'Coffee', emoji: '☕' },
];

export const PIZZA_SIZES = [
    { label: '10"', value: 'sm' },
    { label: '14"', value: 'md' },
    { label: '16"', value: 'lg' },
];

export const PAYMENT_METHODS = [
    { id: 'cash', label: 'Cash', icon: 'cash-outline' },
    { id: 'card', label: 'Card', icon: 'card-outline' },
    { id: 'mobile', label: 'Mobile Money', icon: 'phone-portrait-outline' },
];

export const MOBILE_PROVIDERS = [
    { id: 'mtn', label: 'MTN MoMo', color: '#FFCC00', textColor: '#1A1A1A', prefix: '0770' },
    { id: 'airtel', label: 'Airtel Money', color: '#ED1C24', textColor: '#FFF', prefix: '0750' },
];

export const DEFAULT_DELIVERY_FEE = 0;

export const FALLBACK_CHAT_MESSAGES = (formatTime) => [
    { id: '1', text: 'Hi! How can we help you?', sender: 'restaurant', time: formatTime() }
];

export const FALLBACK_CONTACT = {
    name: 'Support Team',
    image_url: 'https://ui-avatars.com/api/?name=Support+Team&background=random',
};

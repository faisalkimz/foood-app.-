// Mock data for admin dashboard
export const users = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@gmail.com', role: 'customer', status: 'active', orders: 12, spent: 245.50, joined: '2026-01-15', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', lastActive: '2 min ago' },
  { id: '2', name: 'Mike Davis', email: 'mike@gmail.com', role: 'customer', status: 'active', orders: 8, spent: 156.00, joined: '2026-02-20', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', lastActive: '15 min ago' },
  { id: '3', name: 'Emily Chen', email: 'emily@gmail.com', role: 'customer', status: 'active', orders: 23, spent: 489.75, joined: '2025-11-10', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', lastActive: '1h ago' },
  { id: '4', name: 'James Wilson', email: 'james@gmail.com', role: 'customer', status: 'inactive', orders: 3, spent: 52.00, joined: '2026-03-05', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', lastActive: '3 days ago' },
  { id: '5', name: 'Lisa Anderson', email: 'lisa@gmail.com', role: 'customer', status: 'active', orders: 15, spent: 312.25, joined: '2025-12-22', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', lastActive: '30 min ago' },
  { id: '6', name: 'Robert Fox', email: 'robert@gmail.com', role: 'customer', status: 'active', orders: 31, spent: 672.90, joined: '2025-09-01', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', lastActive: '5 min ago' },
  { id: '7', name: 'Anna Smith', email: 'anna@gmail.com', role: 'customer', status: 'active', orders: 7, spent: 134.50, joined: '2026-04-18', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100', lastActive: '2h ago' },
  { id: '8', name: 'Tom Brown', email: 'tom@gmail.com', role: 'customer', status: 'inactive', orders: 1, spent: 18.99, joined: '2026-05-10', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', lastActive: '1 week ago' },
];

export const chefs = [
  { id: 'c1', name: 'Marco Rossi', email: 'marco@rosegarden.com', restaurant: 'Rose Garden Restaurant', status: 'active', orders: 248, revenue: 12450.00, rating: 4.8, joined: '2025-06-15', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100', menuItems: 24, avgPrepTime: '18 min' },
  { id: 'c2', name: 'Aisha Patel', email: 'aisha@burgerbistro.com', restaurant: 'Burger Bistro', status: 'active', orders: 189, revenue: 9230.50, rating: 4.5, joined: '2025-08-20', avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100', menuItems: 18, avgPrepTime: '22 min' },
  { id: 'c3', name: 'David Kim', email: 'david@sushimaster.com', restaurant: 'Sushi Master', status: 'pending', orders: 0, revenue: 0, rating: 0, joined: '2026-06-18', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', menuItems: 0, avgPrepTime: '—' },
  { id: 'c4', name: 'Sophie Laurent', email: 'sophie@cafebliss.com', restaurant: 'Café Bliss', status: 'active', orders: 156, revenue: 7890.25, rating: 4.7, joined: '2025-10-05', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100', menuItems: 31, avgPrepTime: '15 min' },
  { id: 'c5', name: 'Carlos Mendez', email: 'carlos@tacofiesta.com', restaurant: 'Taco Fiesta', status: 'inactive', orders: 87, revenue: 4350.00, rating: 4.2, joined: '2025-07-12', avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100', menuItems: 12, avgPrepTime: '20 min' },
];

export const allOrders = [
  { id: 'ORD-1001', customer: 'Sarah Johnson', customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', restaurant: 'Rose Garden Restaurant', chef: 'Marco Rossi', items: ['2x Margherita Pizza', '1x Garlic Bread'], total: 30.48, status: 'delivered', date: '2026-06-19 09:12', paymentMethod: 'Card', deliveryTime: '28 min' },
  { id: 'ORD-1002', customer: 'Mike Davis', customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', restaurant: 'Burger Bistro', chef: 'Aisha Patel', items: ['1x Double Burger', '2x Fries'], total: 22.97, status: 'preparing', date: '2026-06-19 09:30', paymentMethod: 'Cash', deliveryTime: '—' },
  { id: 'ORD-1003', customer: 'Emily Chen', customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', restaurant: 'Café Bliss', chef: 'Sophie Laurent', items: ['1x Caesar Salad', '2x Lemonade'], total: 15.97, status: 'on_the_way', date: '2026-06-19 09:25', paymentMethod: 'Card', deliveryTime: '15 min' },
  { id: 'ORD-1004', customer: 'Robert Fox', customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', restaurant: 'Rose Garden Restaurant', chef: 'Marco Rossi', items: ['3x BBQ Wings', '1x Coleslaw'], total: 39.47, status: 'new', date: '2026-06-19 09:45', paymentMethod: 'Mobile Money', deliveryTime: '—' },
  { id: 'ORD-1005', customer: 'Lisa Anderson', customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', restaurant: 'Taco Fiesta', chef: 'Carlos Mendez', items: ['1x Pepperoni Pizza'], total: 14.99, status: 'delivered', date: '2026-06-19 08:50', paymentMethod: 'Card', deliveryTime: '32 min' },
  { id: 'ORD-1006', customer: 'Anna Smith', customerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100', restaurant: 'Burger Bistro', chef: 'Aisha Patel', items: ['1x Chicken Tikka', '2x Naan'], total: 17.50, status: 'delivered', date: '2026-06-19 07:30', paymentMethod: 'Cash', deliveryTime: '25 min' },
  { id: 'ORD-1007', customer: 'Tom Brown', customerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', restaurant: 'Café Bliss', chef: 'Sophie Laurent', items: ['1x Fish & Chips'], total: 11.99, status: 'cancelled', date: '2026-06-19 08:15', paymentMethod: 'Card', deliveryTime: '—' },
  { id: 'ORD-1008', customer: 'James Wilson', customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', restaurant: 'Rose Garden Restaurant', chef: 'Marco Rossi', items: ['2x Spaghetti', '1x Tiramisu'], total: 34.97, status: 'preparing', date: '2026-06-19 09:40', paymentMethod: 'Card', deliveryTime: '—' },
  { id: 'ORD-1009', customer: 'Sarah Johnson', customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', restaurant: 'Café Bliss', chef: 'Sophie Laurent', items: ['1x Cappuccino', '1x Croissant'], total: 8.50, status: 'delivered', date: '2026-06-18 16:20', paymentMethod: 'Card', deliveryTime: '12 min' },
  { id: 'ORD-1010', customer: 'Robert Fox', customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', restaurant: 'Burger Bistro', chef: 'Aisha Patel', items: ['2x Classic Burger', '1x Milkshake'], total: 26.50, status: 'delivered', date: '2026-06-18 13:45', paymentMethod: 'Mobile Money', deliveryTime: '30 min' },
];

export const activityLog = [
  { id: 'a1', action: 'New order placed', detail: 'ORD-1004 by Robert Fox — UGX 39,470', type: 'order', time: '2 min ago' },
  { id: 'a2', action: 'Chef approved', detail: 'David Kim (Sushi Master) approved by admin', type: 'chef', time: '15 min ago' },
  { id: 'a3', action: 'Order delivered', detail: 'ORD-1001 delivered to Sarah Johnson in 28 min', type: 'order', time: '30 min ago' },
  { id: 'a4', action: 'User registered', detail: 'New user Tom Brown signed up', type: 'user', time: '1h ago' },
  { id: 'a5', action: 'Menu item added', detail: 'Marco Rossi added "Truffle Pasta" — UGX 18,990', type: 'menu', time: '1h ago' },
  { id: 'a6', action: 'Order cancelled', detail: 'ORD-1007 cancelled by Tom Brown', type: 'order', time: '2h ago' },
  { id: 'a7', action: 'Payment received', detail: 'UGX 17,500 from Anna Smith via Cash', type: 'payment', time: '2h ago' },
  { id: 'a8', action: 'Chef deactivated', detail: 'Carlos Mendez (Taco Fiesta) deactivated', type: 'chef', time: '3h ago' },
  { id: 'a9', action: 'Review submitted', detail: 'Emily Chen rated Café Bliss ⭐ 4.5', type: 'review', time: '3h ago' },
  { id: 'a10', action: 'User promoted', detail: 'Lisa Anderson promoted to Chef role', type: 'user', time: '5h ago' },
  { id: 'a11', action: 'Order delivered', detail: 'ORD-1005 delivered to Lisa Anderson in 32 min', type: 'order', time: '6h ago' },
  { id: 'a12', action: 'New order placed', detail: 'ORD-1009 by Sarah Johnson — UGX 8,500', type: 'order', time: '8h ago' },
];

export const revenueByDay = [
  { day: 'Mon', amount: 1120 },
  { day: 'Tue', amount: 980 },
  { day: 'Wed', amount: 1450 },
  { day: 'Thu', amount: 890 },
  { day: 'Fri', amount: 1340 },
  { day: 'Sat', amount: 1680 },
  { day: 'Sun', amount: 1250 },
];

export const ordersByStatus = {
  new: 2,
  preparing: 2,
  on_the_way: 1,
  delivered: 5,
  cancelled: 1,
};

export const dashboardStats = {
  totalUsers: 156,
  totalChefs: 12,
  totalOrders: 1847,
  totalRevenue: 48250.75,
  userGrowth: '+12%',
  chefGrowth: '+3',
  orderGrowth: '+8%',
  revenueGrowth: '+15%',
  todayOrders: 10,
  todayRevenue: 1250.75,
  avgDeliveryTime: '24 min',
  satisfaction: '96%',
};

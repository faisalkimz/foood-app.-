export const categories = [
  { id: '1', name: 'All', icon: 'grid', emoji: '🍽️', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=120' },
  { id: '2', name: 'Hot Dog', icon: 'flame', emoji: '🌭', image: 'https://images.unsplash.com/photo-1612392062126-21ce18e43a44?w=120' },
  { id: '3', name: 'Burger', icon: 'fast-food', emoji: '🍔', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120' },
  { id: '4', name: 'Pizza', icon: 'pizza', emoji: '🍕', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120' },
  { id: '5', name: 'Sushi', icon: 'fish', emoji: '🍣', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=120' },
  { id: '6', name: 'Sandwich', icon: 'cafe', emoji: '🥪', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=120' },
  { id: '7', name: 'Salad', icon: 'leaf', emoji: '🥗', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120' },
  { id: '8', name: 'Dessert', icon: 'ice-cream', emoji: '🍰', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=120' },
];

export const restaurants = [
  {
    id: '1',
    name: 'Rose Garden Restaurant',
    cuisine: 'Burger · Chicken · Riche · Wings',
    rating: 4.7,
    deliveryTime: 20,
    deliveryFee: 0,
    freeDelivery: true,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
  },
  {
    id: '2',
    name: 'Burger Bistro',
    cuisine: 'American · Burgers · Fast Food',
    rating: 4.5,
    deliveryTime: 25,
    deliveryFee: 1.99,
    freeDelivery: false,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    price: 40,
  },
  {
    id: '3',
    name: 'Spicy Restaurant',
    cuisine: 'Indian · Thai · Spicy',
    rating: 4.7,
    deliveryTime: 20,
    deliveryFee: 0,
    freeDelivery: true,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
  },
  {
    id: '4',
    name: "Smokin' Burger",
    cuisine: 'Cafeteria Restaurant · BBQ',
    rating: 4.3,
    deliveryTime: 30,
    deliveryFee: 2.50,
    freeDelivery: false,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400',
    price: 60,
  },
  {
    id: '5',
    name: 'Pansi Restaurant',
    cuisine: 'Italian · Mediterranean',
    rating: 4.7,
    deliveryTime: 15,
    deliveryFee: 0,
    freeDelivery: true,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
  },
  {
    id: '6',
    name: 'Cafenio Coffee Club',
    cuisine: 'Coffee · Pastries · Breakfast',
    rating: 4.0,
    deliveryTime: 15,
    deliveryFee: 0,
    freeDelivery: true,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
  },
  {
    id: '7',
    name: 'Tasty Treat Gallery',
    cuisine: 'Desserts · Cakes · Ice Cream',
    rating: 4.7,
    deliveryTime: 35,
    deliveryFee: 0,
    freeDelivery: true,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
  },
  {
    id: '8',
    name: 'Buffalo Burgers',
    cuisine: 'Kebab Restaurant · Grills',
    rating: 4.4,
    deliveryTime: 20,
    deliveryFee: 0,
    freeDelivery: true,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
    price: 75,
  },
  {
    id: '9',
    name: 'Buttary Burgers',
    cuisine: 'Fast Food · American',
    rating: 4.6,
    deliveryTime: 25,
    deliveryFee: 0,
    freeDelivery: true,
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400',
    price: 94,
  },
];

export const menuItems = {
  '1': [
    { id: 'm1', name: 'Burger Ferguson', price: 40, description: 'Classic handcrafted burger with special sauce, lettuce, and tomato.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300', restaurantId: '1', restaurant: 'Spicy Restaurant' },
    { id: 'm2', name: "Rockin' Burgers", price: 40, description: 'Premium beef patty with caramelized onions and cheese.', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300', restaurantId: '1', restaurant: 'Cafenio/His.' },
    { id: 'm3', name: 'Chicken Wings', price: 25, description: 'Crispy fried wings with house-made buffalo sauce.', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=300', restaurantId: '1' },
    { id: 'm4', name: 'Garden Salad', price: 15, description: 'Fresh mixed greens with vinaigrette dressing.', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300', restaurantId: '1' },
  ],
  '2': [
    { id: 'm5', name: 'Classic Burger', price: 12, description: 'Beef patty, lettuce, tomato, special sauce.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300', restaurantId: '2' },
    { id: 'm6', name: 'Cheese Burger', price: 14, description: 'Double cheese, caramelized onions, pickles.', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300', restaurantId: '2' },
    { id: 'm7', name: 'BBQ Burger', price: 16, description: 'Smoky BBQ sauce, bacon, cheddar cheese.', image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=300', restaurantId: '2' },
  ],
  '3': [
    { id: 'm8', name: 'Spicy Noodles', price: 18, description: 'Thai-style noodles with vegetables and spicy sauce.', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300', restaurantId: '3' },
    { id: 'm9', name: 'Butter Chicken', price: 22, description: 'Tender chicken in creamy tomato sauce with naan.', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300', restaurantId: '3' },
    { id: 'm10', name: 'Tandoori Plate', price: 28, description: 'Assorted tandoori meats with rice and chutney.', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300', restaurantId: '3' },
  ],
  '4': [
    { id: 'm11', name: "Smokin' Classic", price: 15, description: 'House-smoked beef patty with mesquite sauce.', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300', restaurantId: '4' },
    { id: 'm12', name: 'BBQ Ribs', price: 32, description: 'Slow-cooked ribs with our signature BBQ glaze.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300', restaurantId: '4' },
  ],
  '5': [
    { id: 'm13', name: 'Margherita Pizza', price: 16, description: 'Fresh tomato, mozzarella, basil on thin crust.', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300', restaurantId: '5' },
    { id: 'm14', name: 'Pasta Carbonara', price: 19, description: 'Creamy egg sauce, pancetta, parmesan.', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=300', restaurantId: '5' },
  ],
  '6': [
    { id: 'm15', name: 'Latte', price: 5, description: 'Fresh espresso with steamed milk.', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300', restaurantId: '6' },
    { id: 'm16', name: 'Croissant', price: 4, description: 'Buttery, flaky French croissant.', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=300', restaurantId: '6' },
  ],
  '7': [
    { id: 'm17', name: 'Chocolate Cake', price: 8, description: 'Rich Belgian chocolate layer cake.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300', restaurantId: '7' },
    { id: 'm18', name: 'Ice Cream Sundae', price: 7, description: 'Three scoops with hot fudge and whipped cream.', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300', restaurantId: '7' },
  ],
  '8': [
    { id: 'm19', name: 'Buffalo Wings', price: 18, description: 'Spicy buffalo-style chicken wings.', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=300', restaurantId: '8' },
    { id: 'm20', name: 'Loaded Burger', price: 22, description: 'Triple stack with jalapeños and cheese.', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300', restaurantId: '8' },
  ],
  '9': [
    { id: 'm21', name: 'Butter Burger', price: 20, description: 'Butter-toasted bun with premium beef.', image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=300', restaurantId: '9' },
  ],
};

export const popularFoods = [
  { id: 'pf1', name: 'European Pizza', restaurant: 'Uttora Coffe House', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200' },
  { id: 'pf2', name: 'Buffalo Pizza', restaurant: 'Cafenio Coffee Club', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200' },
];

export const recentKeywords = ['Burger', 'Sandwich', 'Pizza', 'Sandwich'];

export const suggestedRestaurants = [
  { id: '5', name: 'Pansi Restaurant', rating: 4.7 },
  { id: '2', name: 'American Spicy Burger Shop', rating: 4.3 },
  { id: '6', name: 'Cafenio Coffee Club', rating: 4.0 },
];

export const onboardingSlides = [
  {
    id: '1',
    title: 'All your favorites',
    description: 'Get all your loved foods in one place, you just place the order we do the rest.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
  },
  {
    id: '2',
    title: 'Order from chosen chef',
    description: 'Get all your loved foods in one place, you just place the order we do the rest.',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
  },
  {
    id: '3',
    title: 'Free delivery offers',
    description: 'Get all your loved foods in one place, you just place the order we do the rest.',
    image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400',
  },
];

export const offers = [
  {
    id: 'o1',
    title: 'Hurry Offers!',
    code: '#1243CD2',
    discount: '25%',
    description: 'Use the coupon get 25% discount',
    color: '#FFB800',
  },
];

// ── Chef / Restaurant Side ──────────────────────────────────

export const chefStats = {
  todayOrders: 24,
  todayRevenue: 1250.75,
  activeOrders: 5,
  avgRating: 4.8,
  weekRevenue: 8420.50,
  monthRevenue: 32150.00,
};

export const chefOrders = [
  // New (pending)
  {
    id: 'co1', status: 'new', customer: 'Sarah Johnson',
    customerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    items: [
      { name: 'Margherita Pizza', qty: 2, price: 12.99 },
      { name: 'Garlic Bread', qty: 1, price: 4.50 },
    ],
    total: 30.48, time: '2 min ago', address: '3466 Royal Ln. Mesa',
    note: 'Extra cheese on pizza please',
  },
  {
    id: 'co2', status: 'new', customer: 'Mike Davis',
    customerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    items: [
      { name: 'Double Burger', qty: 1, price: 14.99 },
      { name: 'Fries', qty: 2, price: 3.99 },
    ],
    total: 22.97, time: '5 min ago', address: '1847 Elm St. Richardson',
    note: '',
  },
  {
    id: 'co3', status: 'new', customer: 'Emily Chen',
    customerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    items: [
      { name: 'Caesar Salad', qty: 1, price: 9.99 },
      { name: 'Lemonade', qty: 2, price: 2.99 },
    ],
    total: 15.97, time: '8 min ago', address: '921 Oak Ave. Jersey',
    note: 'No croutons',
  },
  // Preparing
  {
    id: 'co4', status: 'preparing', customer: 'James Wilson',
    customerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    items: [
      { name: 'BBQ Chicken Wings', qty: 3, price: 11.99 },
      { name: 'Coleslaw', qty: 1, price: 3.50 },
    ],
    total: 39.47, time: '15 min ago', address: '4521 Pine Rd. Mesa',
    note: 'Extra sauce on the side',
  },
  {
    id: 'co5', status: 'preparing', customer: 'Lisa Anderson',
    customerImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
    items: [
      { name: 'Pepperoni Pizza', qty: 1, price: 14.99 },
    ],
    total: 14.99, time: '20 min ago', address: '789 Maple Dr. Syracuse',
    note: '',
  },
  // Completed
  {
    id: 'co6', status: 'completed', customer: 'Robert Fox',
    customerImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    items: [
      { name: 'Spaghetti Bolognese', qty: 2, price: 13.99 },
      { name: 'Tiramisu', qty: 1, price: 6.99 },
    ],
    total: 34.97, time: '1h ago', address: '2118 Thornridge Cir.',
    note: '',
  },
  {
    id: 'co7', status: 'completed', customer: 'Anna Smith',
    customerImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
    items: [
      { name: 'Chicken Tikka', qty: 1, price: 12.50 },
      { name: 'Naan Bread', qty: 2, price: 2.50 },
    ],
    total: 17.50, time: '2h ago', address: '3891 Ranchview Dr.',
    note: 'Mild spice',
  },
  {
    id: 'co8', status: 'completed', customer: 'Tom Brown',
    customerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    items: [
      { name: 'Fish & Chips', qty: 1, price: 11.99 },
    ],
    total: 11.99, time: '3h ago', address: '5678 Cedar Blvd.',
    note: '',
  },
];

export const chefMenuItems = [
  { id: 'm1', name: 'Margherita Pizza', price: 12.99, category: 'Pizza', available: true, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300' },
  { id: 'm2', name: 'Pepperoni Pizza', price: 14.99, category: 'Pizza', available: true, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300' },
  { id: 'm3', name: 'Double Burger', price: 14.99, category: 'Burger', available: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300' },
  { id: 'm4', name: 'Caesar Salad', price: 9.99, category: 'Salad', available: false, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300' },
  { id: 'm5', name: 'BBQ Chicken Wings', price: 11.99, category: 'Chicken', available: true, image: 'https://images.unsplash.com/photo-1527477396000-e27163b4bdb5?w=300' },
  { id: 'm6', name: 'Garlic Bread', price: 4.50, category: 'Sides', available: true, image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=300' },
  { id: 'm7', name: 'Fish & Chips', price: 11.99, category: 'Seafood', available: true, image: 'https://images.unsplash.com/photo-1579208030886-b1715a638e6c?w=300' },
  { id: 'm8', name: 'Tiramisu', price: 6.99, category: 'Dessert', available: true, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300' },
];

export const earningsHistory = [
  { id: 'e1', label: 'Today', amount: 1250.75, orders: 24 },
  { id: 'e2', label: 'Yesterday', amount: 980.50, orders: 18 },
  { id: 'e3', label: 'Mon', amount: 1120.00, orders: 21 },
  { id: 'e4', label: 'Sun', amount: 1450.25, orders: 28 },
  { id: 'e5', label: 'Sat', amount: 1680.00, orders: 32 },
  { id: 'e6', label: 'Fri', amount: 1340.75, orders: 26 },
  { id: 'e7', label: 'Thu', amount: 890.00, orders: 16 },
];

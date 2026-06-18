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

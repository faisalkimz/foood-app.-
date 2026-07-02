import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import Flutterwave from 'flutterwave-node-v3';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── Supabase Admin Client (Service Role — bypasses RLS) ─────────────────────
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Flutterwave Client ───────────────────────────────────────────────────────
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY || '',
  process.env.FLW_SECRET_KEY || ''
);

// ─── Request Logging Middleware ───────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// ─── CORS Configuration ───────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : (NODE_ENV === 'production' 
      ? ['https://yourapp.com', 'https://admin.yourapp.com'] 
      : ['http://localhost:19006', 'http://localhost:3000', 'exp://192.168.*.*:19000']);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => {
      // Support wildcard patterns
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '.*');
        return new RegExp(pattern).test(origin);
      }
      return origin === allowed;
    })) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per 15 minutes in production
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Stricter rate limiting for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 payment requests per 15 minutes
  message: { error: 'Too many payment attempts, please try again later.' },
});

app.use(express.json());

// ─── JWT Auth Middleware ──────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * POST /api/admin/login
 * Body: { email, password }
 * Returns: { token, admin: { email, name, role } }
 */
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter your email and password.' });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (
    email.trim().toLowerCase() !== adminEmail.toLowerCase() ||
    password !== adminPassword
  ) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const admin = { email: adminEmail, name: 'Super Admin', role: 'super_admin' };
  const token = jwt.sign(admin, process.env.JWT_SECRET, { expiresIn: '8h' });

  return res.json({ token, admin });
});

/**
 * GET /api/admin/chefs
 * Returns all users with role=chef
 */
app.get('/api/admin/chefs', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id, full_name, email, phone_number, avatar_url, created_at,
        restaurants ( id, name, cuisine, rating, is_active )
      `)
      .eq('role', 'chef')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const chefs = data.map((p) => ({
      id: p.id,
      name: p.full_name || 'Unnamed Chef',
      email: p.email,
      phone: p.phone_number,
      avatar: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name || 'Chef')}&background=FF6B35&color=fff`,
      restaurant: p.restaurants?.[0]?.name || '—',
      restaurantId: p.restaurants?.[0]?.id || null,
      cuisine: p.restaurants?.[0]?.cuisine || '—',
      rating: p.restaurants?.[0]?.rating || 0,
      status: p.restaurants?.[0]?.is_active === false ? 'inactive' : 'active',
      joined: p.created_at?.split('T')[0],
    }));

    res.json({ chefs });
  } catch (err) {
    console.error('GET /chefs error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/chefs
 * Body: { name, email, restaurantName, phone? }
 * Creates a Supabase auth user + sets role=chef in profiles
 */
app.post('/api/admin/chefs', requireAdmin, async (req, res) => {
  const { name, email, restaurantName, phone } = req.body;

  if (!name || !email || !restaurantName) {
    return res.status(400).json({ error: 'Name, email, and restaurant name are required' });
  }

  try {
    // 1. Create the auth user (generates a temp password, chef will use OTP to login)
    const tempPassword = `Chef${Date.now()}!`;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: tempPassword,
      email_confirm: true, // auto-confirm so they can login right away via OTP
      user_metadata: { full_name: name },
    });

    if (authError) throw authError;

    const userId = authData.user.id;

    // 2. Set role to 'chef' in profiles (trigger creates the profile, we just update)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'chef', full_name: name, phone_number: phone || null })
      .eq('id', userId);

    if (profileError) throw profileError;

    // 3. Create the restaurant record for this chef
    const { data: restaurant, error: restError } = await supabaseAdmin
      .from('restaurants')
      .insert({
        chef_id: userId,
        name: restaurantName,
        cuisine: 'Various',
        delivery_time: 30,
        is_active: true,
      })
      .select()
      .single();

    if (restError) throw restError;

    res.status(201).json({
      message: `Chef account created. ${email} can now log in using OTP on the mobile app.`,
      chef: {
        id: userId,
        name,
        email,
        restaurant: restaurantName,
        restaurantId: restaurant.id,
        status: 'active',
        joined: new Date().toISOString().split('T')[0],
      },
    });
  } catch (err) {
    console.error('POST /chefs error:', err);
    // Handle duplicate email
    if (err.message?.includes('already been registered')) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/admin/chefs/:id
 * Body: { status: 'active' | 'inactive' }
 */
app.patch('/api/admin/chefs/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const { error } = await supabaseAdmin
      .from('restaurants')
      .update({ is_active: status === 'active' })
      .eq('chef_id', id);

    if (error) throw error;

    res.json({ message: `Chef ${status === 'active' ? 'activated' : 'deactivated'} successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/admin/chefs/:id
 * Deletes chef auth account (cascades to profile + restaurant)
 */
app.delete('/api/admin/chefs/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) throw error;
    res.json({ message: 'Chef removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/users
 * Returns all customers
 */
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, phone_number, avatar_url, created_at')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const users = data.map((p) => ({
      id: p.id,
      name: p.full_name || 'Unknown User',
      email: p.email,
      phone: p.phone_number,
      avatar: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name || 'User')}&background=4ECDC4&color=fff`,
      joined: p.created_at?.split('T')[0],
      status: 'active',
    }));

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/orders
 * Returns all orders with customer + restaurant info
 */
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id, status, total_amount, delivery_fee, notes, created_at, updated_at,
        profiles!orders_customer_id_fkey ( id, full_name, email, avatar_url ),
        restaurants ( id, name, chef_id,
          profiles!restaurants_chef_id_fkey ( full_name )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Fetch order_items for each order
    const orderIds = (orders || []).map((o) => o.id);
    const { data: allItems } = orderIds.length > 0
      ? await supabaseAdmin.from('order_items').select('order_id, name, quantity, unit_price').in('order_id', orderIds)
      : { data: [] };

    const itemsMap = {};
    (allItems || []).forEach((item) => {
      if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
      itemsMap[item.order_id].push(item);
    });

    const mapped = (orders || []).map((o) => {
      const items = itemsMap[o.id] || [];
      // Map DB status to dashboard status
      const statusMap = {
        pending: 'new', confirmed: 'preparing', preparing: 'preparing',
        ready: 'ready', delivering: 'on_the_way', delivered: 'delivered', cancelled: 'cancelled',
      };
      return {
        id: o.id.slice(0, 8).toUpperCase(),
        fullId: o.id,
        customer: o.profiles?.full_name || 'Unknown',
        customerAvatar: o.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(o.profiles?.full_name || 'U')}&background=4ECDC4&color=fff`,
        restaurant: o.restaurants?.name || 'Unknown',
        chef: o.restaurants?.profiles?.full_name || '—',
        items: items.map((i) => `${i.quantity}x ${i.name}`),
        total: parseFloat(o.total_amount || 0),
        status: statusMap[o.status] || o.status,
        dbStatus: o.status,
        date: formatDateTime(o.created_at),
        paymentMethod: 'Cash',
        deliveryTime: o.status === 'delivered' ? '~30 min' : '—',
      };
    });

    res.json({ orders: mapped });
  } catch (err) {
    console.error('GET /orders error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/admin/orders/:id
 * Body: { status: 'pending'|'confirmed'|'preparing'|'ready'|'delivering'|'delivered'|'cancelled' }
 */
app.patch('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: `Order updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/stats
 * Dashboard overview stats — all real from Supabase
 */
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: totalChefs },
      { count: totalOrders },
      { data: allOrdersData },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'chef'),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('total_amount, status, created_at').neq('status', 'cancelled'),
    ]);

    const totalRevenue = (allOrdersData || []).reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

    // Today's stats
    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = (allOrdersData || []).filter((o) => o.created_at?.startsWith(todayStr));
    const todayRevenue = todayOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

    // Weekly revenue breakdown
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueByDay = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOrders = (allOrdersData || []).filter((o) => o.created_at?.startsWith(dateStr));
      revenueByDay.push({
        day: dayNames[d.getDay()],
        amount: dayOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0),
      });
    }

    // Orders by status
    const { data: statusData } = await supabaseAdmin.from('orders').select('status');
    const ordersByStatus = { new: 0, preparing: 0, ready: 0, on_the_way: 0, delivered: 0, cancelled: 0 };
    const statusMap = { pending: 'new', confirmed: 'preparing', preparing: 'preparing', ready: 'ready', delivering: 'on_the_way', delivered: 'delivered', cancelled: 'cancelled' };
    (statusData || []).forEach((o) => {
      const mapped = statusMap[o.status] || o.status;
      if (ordersByStatus[mapped] !== undefined) ordersByStatus[mapped]++;
    });

    res.json({
      totalUsers: totalUsers || 0,
      totalChefs: totalChefs || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
      todayOrders: todayOrders.length,
      todayRevenue,
      revenueByDay,
      ordersByStatus,
    });
  } catch (err) {
    console.error('GET /stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/activity
 * Real activity log from recent orders + profiles
 */
app.get('/api/admin/activity', requireAdmin, async (req, res) => {
  try {
    // Fetch recent orders as activity
    const { data: recentOrders } = await supabaseAdmin
      .from('orders')
      .select(`
        id, status, total_amount, created_at, updated_at,
        profiles!orders_customer_id_fkey ( full_name ),
        restaurants ( name )
      `)
      .order('updated_at', { ascending: false })
      .limit(20);

    // Fetch recent user signups
    const { data: recentUsers } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    const activities = [];

    // Add order activities
    (recentOrders || []).forEach((o) => {
      const statusActions = {
        pending: 'New order placed',
        confirmed: 'Order confirmed',
        preparing: 'Order being prepared',
        ready: 'Order ready for pickup',
        delivering: 'Order out for delivery',
        delivered: 'Order delivered',
        cancelled: 'Order cancelled',
      };

      activities.push({
        id: `order-${o.id}`,
        action: statusActions[o.status] || 'Order updated',
        detail: `${o.profiles?.full_name || 'Customer'} — ${o.restaurants?.name || 'Restaurant'} — UGX ${parseFloat(o.total_amount || 0).toLocaleString()}`,
        type: o.status === 'cancelled' ? 'cancel' : 'order',
        time: timeAgo(o.updated_at || o.created_at),
        sortDate: new Date(o.updated_at || o.created_at).getTime(),
      });
    });

    // Add user signup activities
    (recentUsers || []).forEach((u) => {
      activities.push({
        id: `user-${u.id}`,
        action: u.role === 'chef' ? 'Chef registered' : 'User registered',
        detail: `${u.full_name || 'Unknown'} signed up as ${u.role}`,
        type: u.role === 'chef' ? 'chef' : 'user',
        time: timeAgo(u.created_at),
        sortDate: new Date(u.created_at).getTime(),
      });
    });

    // Sort by most recent first
    activities.sort((a, b) => b.sortDate - a.sortDate);

    res.json({ activities: activities.slice(0, 20) });
  } catch (err) {
    console.error('GET /activity error:', err);
    res.status(500).json({ error: err.message });
  }
});

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${h % 12 || 12}:${m} ${ampm}`;
}

// ─── Payment Routes ───────────────────────────────────────────────────────────

/**
 * POST /api/payment/mobile-money
 * Initiates MTN or Airtel Uganda mobile money payment via Flutterwave REST API
 * Body: { phone, network, amount, email, orderId, customerName }
 */
app.post('/api/payment/mobile-money', paymentLimiter, async (req, res) => {
  const { phone, network, amount, email, orderId, customerName } = req.body;

  if (!phone || !network || !amount || !email || !orderId) {
    return res.status(400).json({ error: 'phone, network, amount, email, orderId are required' });
  }

  const networkUpper = network.toUpperCase();
  if (!['MTN', 'AIRTEL'].includes(networkUpper)) {
    return res.status(400).json({ error: 'network must be MTN or AIRTEL' });
  }

  const txRef = `FOOD-${orderId.slice(-8).toUpperCase()}-${Date.now()}`;

  const payload = {
    phone_number: phone,
    network: networkUpper,
    amount: parseFloat(amount),
    currency: 'UGX',
    email,
    tx_ref: txRef,
    fullname: customerName || 'Customer',
  };

  console.log(`\n📱 [MoMo] Initiating ${networkUpper} payment:`, JSON.stringify(payload, null, 2));

  try {
    const flwRes = await fetch('https://api.flutterwave.com/v3/charges?type=mobile_money_uganda', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await flwRes.json();
    console.log(`📱 [MoMo] Flutterwave response:`, JSON.stringify(data, null, 2));

    if (data.status === 'success') {
      // Update order with transaction reference
      await supabaseAdmin
        .from('orders')
        .update({ transaction_id: txRef })
        .eq('id', orderId);

      // Uganda MoMo returns a redirect URL the user must visit to authorize
      const redirectUrl = data.meta?.authorization?.redirect || null;
      const mode = data.meta?.authorization?.mode || 'direct';

      console.log(`✅ [MoMo] Charge initiated — txRef: ${txRef}, mode: ${mode}, redirect: ${redirectUrl}`);
      return res.json({
        success: true,
        message: data.message || 'Payment initiated.',
        txRef,
        redirectUrl,   // open this in browser for user to authorize
        mode,
      });
    } else {
      return res.status(400).json({ error: data.message || 'Payment initiation failed' });
    }
  } catch (err) {
    console.error('Mobile money error:', err);
    res.status(500).json({ error: err.message || 'Payment failed. Please try again.' });
  }
});

/**
 * POST /api/payment/card
 * Uses Flutterwave Standard (hosted checkout page) — no enckey needed.
 * Body: { amount, email, orderId, customerName, cardNumber, expiry, cvc } (optional for hosted checkout)
 */
app.post('/api/payment/card', paymentLimiter, async (req, res) => {
  const { amount, email, orderId, customerName, cardNumber, expiry, cvc } = req.body;

  if (!amount || !email || !orderId) {
    return res.status(400).json({ error: 'amount, email, orderId are required' });
  }

  // Server-side card validation if provided
  if (cardNumber) {
    if (!validateCardNumber(cardNumber)) {
      return res.status(400).json({ error: 'Invalid card number' });
    }
    if (expiry && !validateExpiry(expiry)) {
      return res.status(400).json({ error: 'Invalid expiry date' });
    }
    if (cvc && (cvc.length < 3 || cvc.length > 4)) {
      return res.status(400).json({ error: 'Invalid CVC' });
    }
  }

  // Validate amount
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const txRef = `FOOD-CARD-${orderId.slice(-8).toUpperCase()}-${Date.now()}`;

  try {
    // Flutterwave Standard — creates a hosted payment page (only needs secret key, no enckey)
    const flwRes = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: parsedAmount,
        currency: 'UGX',
        redirect_url: `${process.env.APP_BASE_URL || `http://localhost:${PORT}`}/api/payment/callback`,
        customer: { email, name: customerName || 'Customer' },
        customizations: {
          title: 'FoodOrder',
          description: `Order #${orderId.slice(-6).toUpperCase()}`,
          logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100',
        },
        meta: { order_id: orderId },
      }),
    });

    const data = await flwRes.json();

    if (data.status === 'success' && data.data?.link) {
      await supabaseAdmin.from('orders').update({ transaction_id: txRef }).eq('id', orderId);
      console.log(`✅ Card payment link created: ${data.data.link}`);
      return res.json({ success: true, paymentLink: data.data.link, txRef });
    } else {
      throw new Error(data.message || 'Could not create payment link');
    }
  } catch (err) {
    console.error('Card payment error:', err.message);
    res.status(500).json({ error: err.message || 'Card payment failed.' });
  }
});

/**
 * GET /api/payment/verify/:txRef
 * Verifies payment status with Flutterwave and updates the order
 */
app.get('/api/payment/verify/:txRef', async (req, res) => {
  const { txRef } = req.params;

  try {
    const response = await flw.Transaction.verify({ id: txRef });

    if (response.data?.status === 'successful') {
      // Mark order as paid
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'paid', status: 'accepted' })
        .eq('transaction_id', txRef);

      return res.json({ success: true, status: 'paid', data: response.data });
    } else {
      return res.json({ success: false, status: response.data?.status || 'pending' });
    }
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Card Validation Helpers ───────────────────────────────────────────────────
function validateCardNumber(cardNumber) {
  const clean = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(clean)) return false;
  
  // Luhn algorithm
  let sum = 0;
  let alternate = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let n = parseInt(clean[i], 10);
    if (alternate) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function validateExpiry(expiry) {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const exp = new Date(year, month);
  return exp > now;
}

function getCardNetwork(cardNumber) {
  const clean = cardNumber.replace(/\s/g, '');
  if (clean.startsWith('4')) return 'Visa';
  if (clean.startsWith('5') || clean.startsWith('2')) return 'Mastercard';
  if (clean.startsWith('3')) return 'Amex';
  return null;
}

// ─── Webhook Endpoint for Payment Confirmation ─────────────────────────────────
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['verif-hash'];
  const secretHash = process.env.FLW_SECRET_HASH;

  // Verify webhook signature
  if (!secretHash) {
    console.warn('⚠️ FLW_SECRET_HASH not configured — webhook signature verification is disabled!');
  } else if (!signature || signature !== secretHash) {
    console.error('Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    const event = JSON.parse(req.body);
    console.log('Webhook received:', event);

    if (event.event === 'charge.completed' && event.data.status === 'successful') {
      const txRef = event.data.tx_ref;
      
      // Update order status
      const { error } = await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'paid', status: 'confirmed' })
        .eq('transaction_id', txRef);

      if (error) {
        console.error('Failed to update order:', error);
        return res.status(500).json({ error: 'Failed to process payment' });
      }

      console.log(`Payment confirmed for order: ${txRef}`);
      return res.status(200).json({ received: true });
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ─── 404 and 500 Error Handlers ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method 
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 FoodOrder Admin API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${NODE_ENV}`);
  if (!process.env.FLW_SECRET_HASH) {
    console.log(`   ⚠️  FLW_SECRET_HASH not set — webhook verification is disabled`);
  }
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

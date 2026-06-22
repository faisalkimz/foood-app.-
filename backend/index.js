import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Supabase Admin Client (Service Role — bypasses RLS) ─────────────────────
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173', // admin dashboard vite dev
    'http://localhost:3000',
    'http://localhost:19006', // expo web
  ],
  credentials: true,
}));
app.use(express.json());

// ─── JWT Auth Middleware ──────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
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
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2024!';

  if (
    email.trim().toLowerCase() !== adminEmail.toLowerCase() ||
    password !== adminPassword
  ) {
    return res.status(401).json({ error: 'Invalid credentials. Only admin@admin.com can access the dashboard.' });
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

    // Shape the data for the dashboard
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
 * GET /api/admin/stats
 * Dashboard overview stats
 */
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: totalChefs },
      { count: totalOrders },
      { data: revenueData },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'chef'),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('total_amount').eq('payment_status', 'paid'),
    ]);

    const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

    res.json({
      totalUsers: totalUsers || 0,
      totalChefs: totalChefs || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 FoodOrder Admin API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

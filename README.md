# FoodOrder

A full-stack food ordering platform built with **Expo (React Native)**, **Supabase**, **Express.js**, and a **React admin dashboard**.

## Architecture

```
Foodorder/
├── app/                    # Expo Router screens (mobile app)
│   ├── (auth)/             # Onboarding, Login, Signup, Verification
│   ├── (tabs)/             # Main tabs: Home, Search, Cart, Orders, Profile
│   ├── (chef)/             # Chef dashboard screens
│   ├── checkout/           # Checkout flow
│   ├── food/               # Food detail screens
│   ├── restaurant/         # Restaurant detail screens
│   └── _layout.js          # Root layout with auth state management
├── src/
│   ├── components/         # Shared UI components
│   ├── providers/          # Theme provider
│   ├── services/           # Supabase client, auth service, API
│   ├── store/              # Zustand stores (auth, theme)
│   └── theme/              # Design tokens, colors, spacing
├── admin-dashboard/        # React (Vite) admin panel
│   └── src/
│       ├── components/     # Sidebar, Topbar, Icons
│       ├── pages/          # Dashboard, Chefs, Users, Orders, etc.
│       └── services/       # API client for backend
├── backend/                # Express.js API server
│   └── index.js            # Admin auth, CRUD endpoints
└── supabase_schema.sql     # Database schema & RLS policies
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | Expo SDK 54, React Native 0.81, Expo Router 6 |
| State | Zustand |
| Auth & DB | Supabase (PostgreSQL, Auth, RLS) |
| Backend | Express.js, JWT, Supabase Admin SDK |
| Admin UI | React 19, Vite 8 |

## Getting Started

### Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- Supabase project (URL + anon key)

### 1. Mobile App

```bash
# Install dependencies
npm install

# Set up environment variables (copy template)
cp .env.example .env
# Edit .env with your Supabase URL and anon key

# Start the app
npx expo start
```

### 2. Backend (Admin API)

```bash
cd backend
npm install
# Edit backend/.env with your Supabase service_role key
npm run dev
```

### 3. Admin Dashboard

```bash
cd admin-dashboard
npm install
npm run dev
```

## Environment Variables

### Mobile App (`.env`)
| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (public) |

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin — keep secret) |
| `ADMIN_EMAIL` | Admin dashboard login email |
| `ADMIN_PASSWORD` | Admin dashboard password |
| `JWT_SECRET` | JWT signing secret (random 64-char hex) |
| `PORT` | Server port (default 3001) |

### Admin Dashboard
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (default `http://localhost:3001`) |

## Database

The schema is defined in `supabase_schema.sql`. It includes:

- **profiles** — linked to `auth.users` via trigger
- **restaurants** — each chef owns one restaurant
- **menu_items** — restaurant menu items with categories
- **orders** — full order lifecycle with payment tracking
- **order_items** — line items per order
- **favorites** — customer favorites (restaurant or menu item)
- **addresses** — saved delivery addresses

Row Level Security (RLS) is enabled on all tables with policies for customers, chefs, and admins.

## Screens

### Mobile App
- Onboarding carousel → Login/Signup via OTP → Home → Search → Cart → Checkout → Order tracking
- Chef dashboard for managing menu and viewing orders
- Profile management with addresses and order history

### Admin Dashboard
- Overview stats (users, chefs, orders, revenue)
- Chef management (create, activate, deactivate, delete)
- Customer management (view users)
- Order tracking with status progression
- Activity log and analytics

## License

MIT

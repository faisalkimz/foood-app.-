# Files Edited — Backend Wiring Session

All 8 files changed in the last session. Every file is in the main project folder.

---

## 1. `backend/index.js`
**Change:** Fixed accidental double semicolon `});;` → `});`

---

## 2. `src/services/restaurantService.js` ← NEW FILE
**Location:** `c:\Users\Coding-Kimz\Desktop\crazy\Foodorder\src\services\restaurantService.js`
**What it does:**
- `fetchRestaurants()` — all active restaurants for home screen
- `fetchRestaurant(id)` — single restaurant for detail screen
- `fetchMenuItems(restaurantId)` — menu for restaurant page
- `fetchMyRestaurant()` — chef's own restaurant
- `updateMyRestaurant(updates)` — chef updates their restaurant info
- `fetchMyMenuItems()` — chef's full menu (including unavailable)
- `addMenuItem(restaurantId, item)` — chef adds menu item
- `updateMenuItem(id, updates)` — chef edits / toggles availability
- `deleteMenuItem(id)` — chef removes menu item
- `fetchMyOrders()` — chef's orders with customer info
- `fetchChefStats()` — today's orders, revenue, active count, rating

---

## 3. `app/(tabs)/index.js` — Customer Home Screen
**What changed:**
- Removed all mock `restaurants` / `categories` imports
- Fetches real restaurants from Supabase on load
- Shows loading spinner → real data → empty state → error state
- Pull-to-refresh
- Real user avatar (generated from name if no photo)
- Dynamic greeting (Good Morning/Afternoon/Evening)
- Real address from saved `locationStore`

---

## 4. `app/restaurant/[id].js` — Restaurant Detail
**What changed:**
- Removed mock data lookup (`restaurants.find`, `menuItems[id]`)
- Fetches real restaurant + menu from Supabase
- Dynamic category tabs (built from actual menu item categories, not hardcoded)
- Loading, error, and empty states
- Proper UGX price formatting with `.toLocaleString()`

---

## 5. `app/chef/restaurant-info.js` — Chef: Edit Restaurant
**What changed:**
- Removed all hardcoded default strings
- Loads real restaurant data from Supabase on mount
- Saves changes to `restaurants` table on press
- Added Active/Closed toggle that updates `is_active` in DB
- Loading and saving states with spinner

---

## 6. `app/chef/add-item.js` — Chef: Add Menu Item
**What changed:**
- Removed `Alert.alert` fake save
- Now actually inserts into `menu_items` table in Supabase
- Added image URL input with live preview
- Loading state on save button

---

## 7. `app/(chef)/index.js` — Chef Dashboard
**What changed:**
- Removed `chefStats` and `chefOrders` mock data imports
- Fetches real stats (today's orders, revenue, active, rating) from DB
- Fetches real recent orders from DB
- Pull-to-refresh
- Dynamic greeting
- Empty state when no orders yet

---

## 8. `app/(chef)/menu.js` — Chef Menu Screen
**What changed:**
- Removed `chefMenuItems` mock data
- Fetches real menu items from `menu_items` table
- Toggle availability saves to DB (optimistic update + rollback on failure)
- Delete removes from DB
- Reloads every time screen comes into focus (after adding an item)
- Pull-to-refresh

---

## SQL Migration (run in Supabase)
**File:** `supabase/migrations.sql`

Run this in **Supabase → SQL Editor → New query → Run** to create:
- `user_addresses` table (for delivery addresses)
- Adds columns to `restaurants` (image_url, delivery_fee, description, etc.)
- `menu_items` table
- `order_items` table
- Row Level Security on all tables

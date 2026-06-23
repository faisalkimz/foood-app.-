# Supabase Database Implementation Plan

This document outlines the database architecture for the Foodorder app and provides step-by-step instructions on how to set it up in Supabase.

## Setup Instructions

Since we are focusing on the database structure before writing any backend integration code, here is how you build the database in Supabase:

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project (or select your existing Foodorder project).
3. On the left sidebar, click on **SQL Editor**.
4. Click **New query**.
5. Open the `supabase_schema.sql` file located in this same folder (`c:\Users\Coding-Kimz\Desktop\crazy\Foodorder\supabase_schema.sql`).
6. **Copy all the text** from that SQL file and **Paste** it into the Supabase SQL Editor.
7. Click the **Run** button (or press `Cmd/Ctrl + Enter`).
8. If it says "Success", your entire database, relationships, and security rules have been created!

---

## Schema Overview

The `supabase_schema.sql` script creates the following tables. We included "best alternative" fields like `transaction_id` for payment gateways (MTN MoMo/Airtel) and `driver_id` for future delivery tracking.

### 1. `profiles`
Linked directly to Supabase Auth (`auth.users`). A trigger automatically creates a profile here when a user signs up.
- `id` (References `auth.users`)
- `role` (`customer`, `chef`, `admin`)
- `full_name`, `email`, `phone_number`, `avatar_url`

### 2. `restaurants` (Chef Profiles)
- `chef_id` (References `profiles.id`)
- `name`, `description`, `cuisine`, `image_url`
- `rating`, `delivery_fee`, `free_delivery`, `delivery_time`, `is_active`

### 3. `menu_items`
- `restaurant_id` (References `restaurants.id`)
- `name`, `description`, `price`, `image_url`, `category`, `is_available`

### 4. `orders`
- `customer_id` (References `profiles.id`)
- `restaurant_id` (References `restaurants.id`)
- `driver_id` (References `profiles.id`) - *Added for future driver tracking*
- `status` (`pending`, `accepted`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `cancelled`)
- `total_amount`, `delivery_fee`, `delivery_address`, `special_instructions`
- `payment_method` (`cash`, `card`, `mobile_money`)
- `payment_status` (`pending`, `paid`, `failed`)
- `transaction_id` - *Added to track MTN MoMo / Stripe payment references*

### 5. `order_items`
- `order_id` (References `orders.id`)
- `menu_item_id` (References `menu_items.id`)
- `quantity`
- `unit_price` - *Locks in the price at the time of purchase so historical orders don't change if the menu price is updated later.*

### 6. `favorites` & 7. `addresses`
- Standard tables for saving a user's favorite foods/restaurants and their delivery addresses.

---

## Security (Row Level Security - RLS)
The SQL file also configures strict Row Level Security so no one can access another person's data:
- **Customers** can only INSERT/READ their own orders, addresses, and favorites.
- **Chefs** can only UPDATE their own restaurant, manage their own menu items, and UPDATE the status of orders belonging to their specific restaurant.
- **Profiles** are public (so a customer can see the name of their chef/driver), but a user can only UPDATE their own profile.

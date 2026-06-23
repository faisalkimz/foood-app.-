-- ============================================================
-- MIGRATION 4: Clean up duplicate addresses
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- This removes duplicate addresses, keeping only the OLDEST one
-- for each user + label + city combination.

DELETE FROM public.user_addresses
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, label, city)
    id
  FROM public.user_addresses
  ORDER BY user_id, label, city, created_at ASC
);

-- Verify: show remaining addresses per user
SELECT user_id, label, city, name, count(*) as count
FROM public.user_addresses
GROUP BY user_id, label, city, name
ORDER BY user_id;

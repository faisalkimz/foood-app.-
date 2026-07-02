-- ============================================================
-- MIGRATION 5: chat_messages, favourites, reviews tables
-- ============================================================

-- 1. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id      uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  sender_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message       text NOT NULL,
  created_at    timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_order ON public.chat_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(order_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Chat access" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat insert" ON public.chat_messages;

CREATE POLICY "Chat select" ON public.chat_messages
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE customer_id = auth.uid()
         OR restaurant_id IN (
           SELECT id FROM public.restaurants WHERE chef_id = auth.uid()
         )
    )
  );

CREATE POLICY "Chat insert" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND order_id IN (
      SELECT id FROM public.orders
      WHERE customer_id = auth.uid()
         OR restaurant_id IN (
           SELECT id FROM public.restaurants WHERE chef_id = auth.uid()
         )
    )
  );

-- 2. FAVOURITES TABLE
CREATE TABLE IF NOT EXISTS public.favourites (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  created_at    timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_favourites_user ON public.favourites(user_id);

ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own favourites" ON public.favourites;

CREATE POLICY "Users read own favourites" ON public.favourites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own favourites" ON public.favourites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own favourites" ON public.favourites
  FOR DELETE USING (auth.uid() = user_id);

-- 3. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id      uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  rating        int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       text DEFAULT '',
  created_at    timestamptz DEFAULT now() NOT NULL,
  UNIQUE(order_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON public.reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews read public" ON public.reviews;
DROP POLICY IF EXISTS "Users create own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users update own reviews" ON public.reviews;

CREATE POLICY "Reviews read public" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users create own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

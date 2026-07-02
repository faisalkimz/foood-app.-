import { supabase } from './supabase';

export async function fetchFavourites() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('favourites')
    .select(`
      id,
      restaurant_id,
      created_at,
      restaurants (
        id, name, cuisine, rating, image_url, delivery_time, delivery_fee
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((f) => {
    const r = f.restaurants;
    return {
      id: f.restaurant_id,
      favouriteId: f.id,
      name: r?.name || 'Restaurant',
      cuisine: r?.cuisine || 'Various',
      rating: r?.rating || 0,
      image: r?.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      deliveryTime: r?.delivery_time || 30,
      deliveryFee: parseFloat(r?.delivery_fee || 0),
      addedAt: f.created_at,
    };
  });
}

export async function addFavourite(restaurantId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('favourites')
    .insert({ user_id: user.id, restaurant_id: restaurantId })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Already in favourites');
    }
    throw error;
  }
  return data;
}

export async function removeFavourite(restaurantId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('favourites')
    .delete()
    .eq('user_id', user.id)
    .eq('restaurant_id', restaurantId);

  if (error) throw error;
}

export async function isFavourite(restaurantId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('favourites')
    .select('id')
    .eq('user_id', user.id)
    .eq('restaurant_id', restaurantId)
    .maybeSingle();

  return !!data;
}

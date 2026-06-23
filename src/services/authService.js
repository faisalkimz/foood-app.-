import { supabase } from './supabase';

/**
 * Sign up a new customer and trigger OTP verification email.
 * @param {string} email
 * @param {string} fullName
 */
export async function signUpWithOTP(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      shouldCreateUser: true,
    },
  });
  if (error) {
    // Surface rate-limit clearly
    if (error.status === 429 || error.message?.toLowerCase().includes('rate limit') || error.message?.toLowerCase().includes('security purposes')) {
      throw new Error('Please wait a moment before requesting another code.');
    }
    throw error;
  }
}

/**
 * Sign in an existing user by sending an OTP to their email.
 * @param {string} email
 */
export async function signInWithOTP(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: false },
  });
  if (error) throw error;
}

/**
 * Verify the OTP code the user received via email.
 * @param {string} email
 * @param {string} token  6-digit OTP code
 * @returns {{ user, session }} on success
 */
export async function verifyOTP(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'email',
  });
  if (error) throw error;
  return data;
}

/**
 * Fetch the user's profile from the profiles table.
 * @param {string} userId
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update the current user's profile.
 * @param {string} userId
 * @param {object} updates  e.g. { full_name, phone_number, avatar_url }
 */
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Sign the current user out.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current session (used on app start).
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

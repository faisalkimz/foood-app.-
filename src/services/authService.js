import { supabase } from './supabase';

/**
 * Safely extract a clean, user-friendly error message.
 * Handles: Error objects, Supabase AuthError, raw Response dumps, plain strings.
 */
function safeError(err, fallback) {
  if (!err) return fallback;

  // If it's a string
  if (typeof err === 'string') {
    if (err.length > 150 || err.startsWith('{')) return fallback;
    return err;
  }

  // Try .message
  const msg = err?.message;
  if (msg && typeof msg === 'string') {
    if (msg.length > 150 || msg.startsWith('{') || msg.startsWith('[') || msg.includes('"type"')) {
      return fallback;
    }
    return msg;
  }

  // Try other common error fields
  if (err?.error_description) return err.error_description;
  if (err?.msg) return err.msg;

  // If it's a Response object with status
  if (err?.status && typeof err.status === 'number') {
    if (err.status === 429) return 'Too many requests. Please wait a minute and try again.';
    if (err.status >= 500) return 'Server error. Please try again in a moment.';
    return `Request failed (${err.status}). Please try again.`;
  }

  return fallback;
}

/**
 * Sign up a new customer and trigger OTP verification email.
 */
export async function signUpWithOTP(email, fullName) {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
  } catch (err) {
    throw new Error(safeError(err, 'Failed to send verification code. Please try again in a few minutes.'));
  }
}

/**
 * Sign in an existing user by sending an OTP to their email.
 */
export async function signInWithOTP(email) {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false },
    });
    if (error) throw error;
  } catch (err) {
    throw new Error(safeError(err, 'Failed to send sign-in code. Please try again.'));
  }
}

/**
 * Verify the OTP code the user received via email.
 */
export async function verifyOTP(email, token) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'email',
    });
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(safeError(err, 'Invalid or expired code. Please request a new one.'));
  }
}

/**
 * Fetch the user's profile from the profiles table.
 */
export async function getProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(safeError(err, 'Could not load profile.'));
  }
}

/**
 * Update the current user's profile.
 */
export async function updateProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(safeError(err, 'Could not update profile.'));
  }
}

/**
 * Sign the current user out.
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (err) {
    throw new Error(safeError(err, 'Sign out failed.'));
  }
}

/**
 * Get the current session (used on app start).
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (err) {
    throw new Error(safeError(err, 'Could not restore session.'));
  }
}

# Backend Integration Plan — Phase 1: Authentication

Now that the Supabase database and client are configured, we need to replace the mock login system with real Supabase authentication. This will allow real users to sign up, log in, and persist their sessions when they close the app.

## Proposed Changes

### 1. `authStore.js` (State Management)
We will rewrite the Zustand `authStore` to communicate directly with Supabase:
- **`initialize()`:** Check for an existing session on app startup (persisted via `AsyncStorage`).
- **`login(email, password)`:** Call `supabase.auth.signInWithPassword()`.
- **`signUp(email, password, fullName)`:** Call `supabase.auth.signUp()`. Note: We will pass `full_name` in the metadata so our SQL trigger automatically adds it to the `profiles` table.
- **`fetchProfile(userId)`:** After a successful login, we need to query the `profiles` table to retrieve the user's `role` (Customer or Chef) so we can route them to the correct dashboard.
- **`logout()`:** Call `supabase.auth.signOut()`.

### 2. Auth Screens
We will update the UI to trigger the new store functions and handle errors/loading states:
#### [MODIFY] [login.js](file:///c:/Users/Coding-Kimz/Desktop/crazy/Foodorder/app/(auth)/login.js)
- Hook up the email/password text inputs to local state.
- Add a loading spinner to the button while authenticating.
- Display an alert if Supabase returns an error (e.g., "Invalid password").
- Route to `/(tabs)` or `/(chef)` depending on the role returned.

#### [MODIFY] [signup.js](file:///c:/Users/Coding-Kimz/Desktop/crazy/Foodorder/app/(auth)/signup.js)
- Hook up name, email, and password inputs.
- Call the new `signUp` function.

#### [MODIFY] [splash.js](file:///c:/Users/Coding-Kimz/Desktop/crazy/Foodorder/app/(auth)/splash.js)
- Update the splash screen to wait for the `authStore.initialize()` check. If a session exists, bypass the login screen entirely and drop them into their dashboard.

## User Review Required

> [!IMPORTANT]  
> Are we ready to proceed with integrating Auth? 
> 
> Also, for **Signup**, Supabase by default requires users to click a confirmation link sent to their email before they can log in. Do you want to keep Email Confirmation **ON** (secure, but slower for testing) or turn it **OFF** in your Supabase dashboard so users can log in immediately after signing up? 
> *(If you want it OFF: Go to Supabase -> Authentication -> Providers -> Email -> Toggle off "Confirm email")*

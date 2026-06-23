# Foodorder — Build Plan

> **Figma design:** [Food-Delivery-App--Community-](https://www.figma.com/design/OxzNxgmXo81EkczjMJ2ZYp/Food-Delivery-App--Community-?node-id=223-3474)
>
> **Note:** Figma requires login — design tokens (colors, fonts, spacing) must be exported manually and applied to `src/theme/`.

---

## 1. Project Overview

| Item | Choice |
|------|--------|
| Framework | React Native (Expo SDK 56) |
| Language | JavaScript |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| Styling | StyleSheet + design tokens |

---

## 2. Architecture

```
Foodorder/
├── app/                          # Routes (Expo Router)
│   ├── _layout.js                # Root providers + stack
│   ├── index.js                  # Auth gate redirect
│   ├── (auth)/                   # Unauthenticated flow
│   │   ├── onboarding.js
│   │   ├── login.js
│   │   └── signup.js
│   ├── (tabs)/                   # Main app (bottom tabs)
│   │   ├── index.js              # Home
│   │   ├── search.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   └── profile.js
│   ├── restaurant/[id].js        # Restaurant detail + menu
│   ├── food/[id].js              # Food item detail (modal)
│   ├── checkout/index.js         # Checkout flow
│   └── order/[id].js             # Order tracking
│
├── src/
│   ├── components/
│   │   ├── ui/                   # Design system primitives
│   │   └── shared/               # Composite components
│   ├── features/                 # Feature modules (Phase 2+)
│   ├── theme/                    # Colors, typography, spacing
│   ├── store/                    # Zustand stores
│   ├── services/                 # API + mock data
│   ├── hooks/                    # Custom hooks
│   ├── utils/                    # Helpers
│   └── constants/                # Routes, config
│
└── assets/
    ├── images/
    └── fonts/
```

### Layer responsibilities

| Layer | Purpose |
|-------|---------|
| `app/` | Screen composition, navigation, route params |
| `src/components/ui/` | Reusable primitives (Button, Text, Input, Card) |
| `src/components/shared/` | Domain composites (RestaurantCard, SearchBar) |
| `src/features/` | Business logic per feature (extracted in Phase 2) |
| `src/store/` | Global client state (auth, cart) |
| `src/services/` | API calls and mock data |
| `src/theme/` | Design tokens from Figma |

---

## 3. Figma → Screen Mapping

Typical Food Delivery Community kits include these flows. Map each Figma frame to a route:

| Phase | Figma Screen (typical) | Route | Status |
|-------|------------------------|-------|--------|
| 1 | Splash / Onboarding slides | `/(auth)/onboarding` | ✅ Skeleton |
| 1 | Login | `/(auth)/login` | ✅ Skeleton |
| 1 | Sign Up | `/(auth)/signup` | ✅ Skeleton |
| 1 | Home / Discovery | `/(tabs)/index` | ✅ Skeleton |
| 1 | Search | `/(tabs)/search` | ✅ Skeleton |
| 1 | Restaurant detail | `/restaurant/[id]` | ✅ Skeleton |
| 1 | Food item detail | `/food/[id]` | ✅ Skeleton |
| 1 | Cart | `/(tabs)/cart` | ✅ Skeleton |
| 1 | Checkout | `/checkout` | ✅ Skeleton |
| 1 | Order tracking | `/order/[id]` | ✅ Skeleton |
| 1 | Orders history | `/(tabs)/orders` | ✅ Skeleton |
| 1 | Profile | `/(tabs)/profile` | ✅ Skeleton |
| 2 | Filters / Sort | Modal or `/search/filters` | ⬜ Pending |
| 2 | Address picker / map | `/checkout/address` | ⬜ Pending |
| 2 | Payment methods | `/checkout/payment` | ⬜ Pending |
| 2 | Favorites | `/(tabs)/profile/favorites` | ⬜ Pending |
| 2 | Notifications permission | `/(auth)/notifications` | ⬜ Pending |
| 3 | Real API integration | `src/services/api.js` | ⬜ Pending |
| 3 | Push notifications | Expo Notifications | ⬜ Pending |
| 3 | Maps (delivery tracking) | react-native-maps | ⬜ Pending |

---

## 4. Build Phases

### Phase 1 — Foundation (current)
- [x] Initialize Expo + Expo Router
- [x] Folder structure and design tokens placeholder
- [x] UI component library (Button, Text, Input, Card)
- [x] Auth + cart Zustand stores
- [x] Navigation skeleton for all main flows
- [x] Mock data for development
- [ ] **Extract Figma tokens** — colors, fonts, spacing → `src/theme/`
- [ ] **Pixel-match screens** to Figma frames

### Phase 2 — UI Polish
- [ ] Match every screen to Figma (spacing, typography, images)
- [ ] Add missing screens (filters, address, payment)
- [ ] Custom fonts from Figma
- [ ] Animations (Reanimated) for transitions
- [ ] Empty states, loading skeletons, error states

### Phase 3 — Backend & Features
- [ ] Connect real API (or Firebase/Supabase)
- [ ] Persistent auth (AsyncStorage + secure store)
- [ ] Order history with real data
- [ ] Address management
- [ ] Payment integration (Stripe / local gateway)

### Phase 4 — Production
- [ ] EAS Build (Android + iOS)
- [ ] App icons and splash from Figma
- [ ] Performance audit
- [ ] Testing (unit + E2E)

---

## 5. Design Token Extraction (from Figma)

Once you have Figma access, export these into `src/theme/`:

1. **Colors** — Primary, secondary, background, text, semantic (error/success)
2. **Typography** — Font families, sizes, weights, line heights
3. **Spacing** — 4/8/12/16/24/32 scale
4. **Radius** — Button, card, input corner radii
5. **Shadows** — Card elevation values
6. **Icons** — Export SVGs or use matching Ionicons names

**Figma → Code workflow:**
- Use Figma Dev Mode to copy CSS/spacing values
- Or use a plugin like "Design Tokens" to export JSON
- Update `src/theme/colors.js`, `typography.js`, `spacing.js`

---

## 6. Dependencies

### Installed
- `expo` ~56
- `expo-router` — file-based navigation
- `react-native-safe-area-context`, `react-native-screens`
- `react-native-gesture-handler`, `react-native-reanimated`
- `zustand` — state management
- `@expo/vector-icons`

### Phase 2+
- `expo-image` — optimized images
- `@react-native-async-storage/async-storage` — persistence
- `expo-location` — delivery address
- `react-native-maps` — map views
- `expo-notifications` — push notifications

---

## 7. Running the App

```bash
npm start          # Expo dev server
npm run android    # Android emulator/device
npm run ios        # iOS simulator (macOS only)
npm run web        # Web preview
```

Use **Expo Go** on your phone to scan the QR code for quick testing.

---

## 8. Next Steps

1. **Share Figma access** or export design tokens / screenshots so we can match colors and layout exactly.
2. **Pick a screen** from Figma (e.g. Home) and we'll pixel-match it first.
3. **Confirm backend** — mock-only for now, or plan API (Firebase, custom REST, etc.).

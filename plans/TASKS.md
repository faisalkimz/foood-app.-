# Pre-Backend Cleanup Tasks

## Critical
- [x] Fix `authStore.js` getter bug
- [x] Delete unused `useColors.js` hook
- [x] Fix `FoodLogo.js` dark mode support

## Medium
- [x] Fix duplicate `recentKeywords`
- [x] Fix search screen variable shadowing
- [x] Remove unused imports (categories in restaurant, onboardingSlides, offers)
- [x] Remove/update dead `ROUTES` constants
- [x] Replace hardcoded `colors.*` with `useTheme()` in food/[id].js
- [x] Replace hardcoded `colors.*` with `useTheme()` in restaurant/[id].js
- [x] Replace hardcoded `colors.*` with `useTheme()` in checkout/index.js
- [x] Replace hardcoded `colors.*` with `useTheme()` in checkout/payment.js
- [x] Replace hardcoded `colors.*` with `useTheme()` in checkout/congratulations.js
- [x] Use `formatCurrency()` consistently across all screens

## Verification
- [x] Verify no import errors or missing references

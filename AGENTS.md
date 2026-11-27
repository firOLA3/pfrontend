This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Architecture

- PulseFit uses **React Navigation** (v7) with `@react-navigation/native-stack` and `@react-navigation/bottom-tabs`. Do NOT migrate to Expo Router unless explicitly requested.
- Navigation hierarchy: `Splash` (loading / `Auth` initial route) -> `Auth` (`Welcome`, `SignUp`, `SignIn`, `CheckEmail`, `ForgotPassword`, `ResetPassword`) -> `Onboarding` (6 steps) -> `Main` (Tabs: `Home`, `Explore`, `Progress`, `Profile`) + Root stack screens (`WorkoutPlayer`, `WorkoutPreview`, `ProgramPreview`, `SavedWorkouts`, `WorkoutHistory`, `Notifications`, `Menu`, `EditProfile`, `MyPlan`, `Achievements`, `Settings`, `ConnectedDevices`).
- Safe Back Navigation: Always guard back buttons on root stack screens with `if (navigation.canGoBack()) navigation.goBack(); else navigation.navigate('Main');` to avoid unhandled `GO_BACK` errors.
- Safe Area & StatusBar: ALWAYS import `SafeAreaView` from `react-native-safe-area-context`, NEVER from `react-native`. Use `expo-status-bar`'s `<StatusBar style="light" | "dark" />` without invalid `backgroundColor` prop.

## Icon Management
- All shared vector icons live in `src/components/icons/index.tsx`.
- Ensure every icon export has a unique identifier — never duplicate export names (`BackArrowIcon`, `CloseIcon`, `BookmarkIcon`).

## Exercise Video, Avatar & Media Engine
- Use `expo-video` (`useVideoPlayer` + `VideoView`) for looping exercise videos, NOT deprecated `expo-av`.
- Always resolve relative `/static/...` paths through `resolveMediaUrl()` in `src/services/api.ts`, and render profile pictures using the shared `<UserAvatar />` component (`src/components/common/UserAvatar.tsx`).
- For `expo-image-picker`, close any React Native `<Modal>` first and wait ~260ms on native platforms (`Platform.OS !== 'web'`) before opening the camera/library picker; include Android `getPendingResultAsync()` recovery.

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

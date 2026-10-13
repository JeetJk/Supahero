# SuperheroHQ 🦸‍♂️⚡

> **React Native (Android & iOS) Take-Home Assignment for Zuvomo**  
> Built with **React Native (Expo SDK 57)**, **Expo Router**, **TypeScript**, and **Public Superhero API**.

---

## 📱 Features & Highlights

This project addresses and exceeds all requirements outlined in the take-home specification:

1. **List Screen (`src/app/index.tsx`)**:
   - Fetches and displays characters from the public Superhero API (560+ characters).
   - Instant search by superhero name, real name / alter-ego, and publisher.
   - Filter pills for Universe Publishers (*Marvel Comics, DC Comics, Dark Horse, etc.*) and Alignment (*Heroes, Villains, Neutral*).
   - Favorite / Bookmark toggle with count badge.
   - Fixed header architecture ensuring zero keyboard flicker or focus loss.

2. **Detail Screen (`src/app/hero/[id].tsx`)**:
   - Hero visual banner with gradient overlays and back navigation.
   - Dynamic powerstats progress bars (*Intelligence, Strength, Speed, Durability, Energy Power, Combat Proficiency*).
   - Complete Biographical Dossier (*Full Name, Alter Egos, Place of Birth, First Appearance, Aliases*).
   - Physical attributes grid (*Height, Weight, Race, Gender, Eye & Hair color*).
   - Work & Affiliations (*Occupation, Operational Base, Group Affiliations, Relatives*).
   - In-app sharing and favorite bookmarking.

3. **Loading, Error States & Pull-to-Refresh**:
   - **Loading State**: Custom animated shimmer skeleton cards simulating the list layout.
   - **Error Handling**: Friendly error view with retry action for connection timeouts or offline scenarios.
   - **Pull-to-Refresh**: Native `RefreshControl` with subtle haptic feedback and smooth refresh lifecycle.

4. **Performance & Search Optimizations**:
   - **Pre-Indexed Search**: Character names, aliases, and publishers are normalized into an index string upon initial fetch, reducing filter time to `< 1ms`.
   - **Non-blocking Input**: Uses `useDeferredValue` alongside a debounced `SearchBar` so typing never lags or drops frames.
   - **List Virtualization**: `getItemLayout` calculates item heights upfront for instantaneous scrolling across 560+ items without layout shifts.
   - **Memoized Components**: `HeroCard` and `SearchBar` use `React.memo` and cached image policies (`expo-image`).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **iOS Simulator** (Mac / Xcode) or **Android Emulator / Device** (Android Studio / Expo Go)

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd superHeroTask
npm install
```

### 2. Run on iOS Simulator

```bash
npx expo start --ios
# or
npm run ios
```

### 3. Run on Android Emulator / Device

Ensure your Android emulator is booted or physical device is connected with USB debugging:

```bash
npx expo start --android
# or
npm run android
```

### 4. Interactive Dev Server (Expo QR Code / Expo Go)

```bash
npx expo start
```
Scan the displayed QR code with the **Expo Go** app on your physical iOS (Camera app) or Android device.

---

## 🧪 Code Quality & Verification

The project is strictly typed and conforms to Expo's linting suite:

```bash
# Typecheck
npx tsc --noEmit

# Lint
npm run lint

# Dependency Health Check
npx expo-doctor
```

---

## 📁 Project Architecture

```
superHeroTask/
├── src/
│   ├── app/                      # Expo Router navigation screens
│   │   ├── _layout.tsx           # Stack Navigator, Theme & Safe Area
│   │   ├── index.tsx             # List Screen (Fixed search & virtualized hero list)
│   │   └── hero/
│   │       └── [id].tsx          # Detail Screen (Powerstats, dossier, traits)
│   ├── components/               # Reusable UI components
│   │   ├── HeroCard.tsx          # Memoized hero item card
│   │   ├── SearchBar.tsx         # High-performance debounced search input
│   │   ├── FilterChips.tsx       # Publisher & alignment filter pills
│   │   ├── StatBar.tsx           # Animated powerstat bars
│   │   ├── LoadingSkeleton.tsx   # Shimmering loading placeholders
│   │   └── ErrorView.tsx         # Connection failure state with retry button
│   ├── context/
│   │   └── FavoritesContext.tsx  # Global favorites state & toggle handler
│   ├── hooks/
│   │   └── useHeroes.ts          # Data fetching, search indexing & filter hook
│   ├── services/
│   │   └── api.ts                # Public API service layer with timeouts & error mapping
│   ├── theme/
│   │   └── colors.ts             # Palette tokens, spacing, and border radius
│   └── types/
│       └── hero.ts               # Complete TypeScript data contracts
├── app.json                      # Expo application manifest
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript strict configuration
```

---

## 🌐 Public API Used
- **Akabab Superhero API**: `https://akabab.github.io/superhero-api/api/all.json`
- High-availability CDN-backed public API with zero API keys required.

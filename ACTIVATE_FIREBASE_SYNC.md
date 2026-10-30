# ACTIVATING FIREBASE SYNC & FIRESTORE IN MUGENCHESSX

This document provides step-by-step instructions to activate Firestore cloud synchronization for player data when deploying to Firebase Hosting.

---

## STEP 1: FIREBASE CONSOLE ONE-TIME SETUP

1. Go to [Firebase Console](https://console.firebase.google.com/) and select project **mugenchessx**.
2. **Build > Firestore Database**:
   - Click **Create database**.
   - Choose **Start in production mode**.
   - Choose a cloud location (e.g., `nam5 (us-central)`).
3. **Build > Authentication**:
   - Click **Get started**.
   - Under **Sign-in method**, enable:
     - **Anonymous** (for instant guest play without sign-in prompts)
     - **Email/Password**
     - **Google**
   - Under **Settings > Authorized domains**, confirm the following domains are listed:
     - `mugenchessx.web.app`
     - `mugenchessx.firebaseapp.com`
     - `localhost`
4. **Project Settings > General > Your apps**:
   - Register a **Web app** named `MugenChessX Web`.
   - Copy the `firebaseConfig` keys (`apiKey`, `authDomain`, `appId`, etc.).

---

## STEP 2: INSTALL DEPENDENCIES & ACTIVATE FILES (IN POWERSHELL)

Run these PowerShell commands on your local machine:

```powershell
# 1. Install the official Firebase JS SDK
npm install firebase

# 2. Create target directory inside src/
New-Item -ItemType Directory -Path "src/firebase" -Force

# 3. Copy and convert template files into active TypeScript source files
Copy-Item "firebase-sync/firebaseConfig.ts.template" "src/firebase/firebaseConfig.ts"
Copy-Item "firebase-sync/firebaseClient.ts.template" "src/firebase/firebaseClient.ts"
Copy-Item "firebase-sync/playerSchema.ts.template" "src/firebase/playerSchema.ts"
Copy-Item "firebase-sync/playerSync.ts.template" "src/firebase/playerSync.ts"
Copy-Item "firebase-sync/authBridge.tsx.template" "src/firebase/authBridge.tsx"
```

---

## STEP 3: CREATE PRODUCTION ENVIRONMENT FILE

Create `.env.production` in your project root with your copied web app configuration keys:

```ini
VITE_ENABLE_FIREBASE=true
VITE_FIREBASE_API_KEY=AIzaSy...YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=mugenchessx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mugenchessx
VITE_FIREBASE_STORAGE_BUCKET=mugenchessx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

> **IMPORTANT NOTE**: Do **NOT** create `.env.production` on Google AI Studio. Leaving it out keeps Google AI Studio on the pure local storage runtime without activating Firebase JS SDK.

---

## STEP 4: CODE INTEGRATION SNIPPETS (INSTRUCTIONS ONLY)

When you are ready to connect the UI to Firestore, make these tiny edits:

### 1. `src/App.tsx` (Wrap App with `FirebaseAuthProvider`)
Wrap `<AppContent />` inside `<FirebaseAuthProvider>`:

```tsx
// BEFORE:
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PredictorProvider>
          <SocketProvider>
            <MusicProvider>
              <AppContent />
            </MusicProvider>
          </SocketProvider>
        </PredictorProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// AFTER:
import { FirebaseAuthProvider } from './firebase/authBridge';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PredictorProvider>
          <SocketProvider>
            <MusicProvider>
              <FirebaseAuthProvider>
                <AppContent />
              </FirebaseAuthProvider>
            </MusicProvider>
          </SocketProvider>
        </PredictorProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### 2. `src/economy/mugenStore.ts` (Sync Gem / Key changes to Firestore)
Inside `mugenStore.ts` where gems/keys are saved:

```typescript
// IN ADDITION TO LOCALSTORAGE WRITE AT LINE 94:
import { savePlayer } from '../firebase/playerSync';

// AFTER: localStorage.setItem(key, next.toString());
if (userId) {
  savePlayer(userId, { wallet: { gems: next } as any });
}
```

---

## STEP 5: DEPLOY FIRESTORE RULES AND INDEXES

Deploy the security rules and composite indexes using Firebase CLI:

```powershell
firebase deploy --only firestore:rules,firestore:indexes
```

---

## STEP 6: LOCAL EMULATOR TESTING

Test rules and queries locally before deploying to production:

```powershell
firebase emulators:start --only firestore
```

---

## ROLLBACK INSTRUCTIONS (DEACTIVATING SYNC)

If you wish to return to pure local storage and turn off Firebase sync:

1. Delete `.env.production` or set `VITE_ENABLE_FIREBASE=false`.
2. Remove `src/firebase/` directory (`Remove-Item -Recurse -Force "src/firebase"`).
3. Re-run `npx vite build` to generate pure local storage production builds.

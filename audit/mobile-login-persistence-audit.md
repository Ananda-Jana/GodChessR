# Mobile/PWA Login Persistence Audit & Plan

## PHASE 1 — SELF-AUDIT

### A. Token Storage Location
* **Storage Location**: `localStorage` under the key `'dice_chess_token'`.
* **Exact Code Location**: `/src/context/AuthContext.tsx`
  * Line 21–23 (initialization):
    ```tsx
    const [token, setToken] = useState<string | null>(() => {
      return localStorage.getItem('dice_chess_token');
    });
    ```
  * Line 68 (login): `localStorage.setItem('dice_chess_token', data.token);`
  * Line 96 (register): `localStorage.setItem('dice_chess_token', data.token);`
  * Line 171 (guest login): `localStorage.setItem('dice_chess_token', data.token);`
  * Line 118 (explicit logout): `localStorage.removeItem('dice_chess_token');`

---

### B. Token Expiry, Refresh Flow, & Intermittent Mobile Use
1. **Token Expiry & Refresh Flow**:
   * Opaque session tokens are generated on the server using `crypto.randomBytes(32).toString('hex')` (`/server/auth.ts` lines 29–33) and stored in `db.sessions` (`/server/db.ts` line 39).
   * **There is no expiration timestamp** attached to server sessions, and **there is no refresh-token flow**.
2. **Automatic Execution on Load**:
   * In `/src/context/AuthContext.tsx` (lines 27–53), `loadMe()` executes automatically inside a `useEffect` on application launch:
     ```tsx
     const res = await fetch('/api/auth/me', {
       headers: { Authorization: `Bearer ${token}` },
     });
     ```
3. **Would a user stay logged in for weeks of intermittent mobile use?**: **NO.**
   * **Failure Cause 1 (Offline / Intermittent Mobile Startup)**: On mobile PWAs, launching the app offline or with poor cellular connectivity causes `fetch('/api/auth/me')` in `AuthContext.tsx` (lines 46–49) to throw a network error (`TypeError: Failed to fetch`). The catch block catches the error, leaves `user` as `null`, and sets `isLoading = false` in `finally`.
   * **Failure Cause 2 (Lack of Cached User Profile)**: Because `user` is `null` and `isLoading` becomes `false`, `/src/App.tsx` (line 715) evaluates `if (!user) return <AuthModal />;`, forcing the user to see the Login screen.
   * **Failure Cause 3 (Token Overwrite on Intermittent Prompt)**: When presented with the Login screen on an offline app launch, a user tapping "Play as Guest" or re-logging in calls `loginGuest()` or `login()`, which overwrites their original session token in `localStorage`.
   * **Failure Cause 4 (Transient Server Error Eviction)**: In `AuthContext.tsx` (line 42), any temporary HTTP error response (e.g. 502/503 gateway drop or transient 401 before sessions file load) executes `localStorage.removeItem('dice_chess_token')`, permanently destroying the token.

---

### C. User Resolution on App Startup
* `userId` is resolved asynchronously on app startup via the `/api/auth/me` endpoint.
* On app launch, `AuthContext.tsx` synchronously reads `dice_chess_token` from `localStorage` into state (`token`).
* `loadMe()` in `AuthContext.tsx` sends `Authorization: Bearer <token>` to `/api/auth/me`.
* The server (`/server/auth.ts` lines 44–64 & `/server/db.ts` line 122) looks up `db.sessions.get(token)` to find `userId`, retrieves the user record from `db.users`, and responds with `data.user`.
* Client `AuthContext` executes `setUser(data.user)` upon receiving a 200 response.

---

### D. Store Initialization vs. Auth Resolution
* `mugenStore.ts` and `mugenPassStore.ts` do **NOT** execute a module-level global initialization that binds permanently to `"guest"`.
* Functions in `mugenStore.ts` (e.g. `getGems(userId)`) and `mugenPassStore.ts` (e.g. `getActivePass(userId)`) are stateless helpers that take `userId` as a parameter when called by React components.
* If `user` is not yet loaded, components pass `userId || 'guest'`. Once `user` is loaded, components re-render with `user.id`.
* The store initialization order is **not** the root cause of unwanted logouts.

---

### E. Explicit Forced Logout & Storage Clearing Code Paths
1. `/src/context/AuthContext.tsx` lines 41–45:
   ```tsx
   } else {
     // Token invalid
     localStorage.removeItem('dice_chess_token');
     setToken(null);
     setUser(null);
   }
   ```
   * *Impact*: If `/api/auth/me` returns a non-200 HTTP status (including temporary server errors or network proxies returning 500/502/503), the stored auth token is removed immediately.
2. `/src/context/AuthContext.tsx` lines 46–49 (Network Failure Catch Block):
   ```tsx
   } catch (err) {
     console.error('Failed to load current user:', err);
   } finally {
     setIsLoading(false);
     }
   ```
   * *Impact*: On network disconnects during PWA launch, `user` remains `null` while `isLoading` becomes `false`, forcing `App.tsx` to display the `AuthModal` even though a valid session token exists in `localStorage`.

---

### F. Call to navigator.storage.persist()
* **NOT FOUND**: `navigator.storage.persist()` is **NOT** called anywhere in the codebase.

---

### G. In-Memory Fallback Pattern Shape
* **Exact Shape in `mugenStore.ts`** (lines 14–18, 63–78, 90–98):
  ```ts
  const gemsMemoryFallback: Record<string, number> = {};

  export function getGems(userId: string): number {
    const key = getGemsKey(userId);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(key);
        if (raw !== null) {
          const parsed = parseInt(raw, 10);
          return isNaN(parsed) ? 0 : Math.max(0, parsed);
        }
      }
    } catch {
      // Silently fall through to memory fallback
    }

    if (typeof gemsMemoryFallback[key] === 'number') {
      return Math.max(0, gemsMemoryFallback[key]);
    }
    return 0;
  }
  ```
* **Pattern Structure**:
  1. A module-scoped dictionary fallback: `const <name>MemoryFallback: Record<string, T> = {};`
  2. Safe `try / catch` blocks wrapping `window.localStorage` reads and writes.
  3. Updates write to `MemoryFallback[key]` first, then attempt `localStorage.setItem`.
  4. Reads attempt `localStorage.getItem` first, falling back to `MemoryFallback[key]` on error or missing key.

---

## PHASE 2 — PLAN

### Root Causes of Unwanted Mobile Re-login
1. **Network Disconnect / Offline Startup Lockout (Supported by Phase 1 Items B, C, E)**:
   When launching the PWA on mobile without an active internet connection (or on intermittent cellular data), `fetch('/api/auth/me')` fails. `AuthContext` catches the error, leaves `user` as `null`, and sets `isLoading = false`. `App.tsx` sees `!user` and renders `AuthModal`, locking out the user until they log in again and overwrite their existing session token.
2. **Lack of Persisted Local User Profile Cache (Supported by Phase 1 Items A, B, C)**:
   While `dice_chess_token` is saved in `localStorage`, the `user` profile object is never saved to `localStorage`. Thus, offline or intermittent app launches cannot resolve the authenticated user locally.
3. **Over-Aggressive Token Eviction on Non-401 Responses (Supported by Phase 1 Item E)**:
   If `/api/auth/me` returns a 500, 502, 503, or rate limit error, `AuthContext` treats it as an invalid token and executes `localStorage.removeItem('dice_chess_token')`. Only an explicit 401 Unauthorized status should invalidate the session.
4. **Missing Storage Persistence Request for PWAs (Supported by Phase 1 Item F)**:
   The browser is not requested to grant persistent storage (`navigator.storage.persist()`), increasing susceptibility to mobile OS eviction under storage pressure.

---

### Proposed Fixes & Alignment with User Intent
1. **Persist User Profile in `localStorage` (`dice_chess_user`)**:
   Upon successful login/registration/me response, cache the `user` object in `localStorage` (`dice_chess_user`) using the safe try/catch in-memory fallback pattern.
2. **Offline-First Session Restoration in `AuthContext`**:
   On app load, if `token` and `dice_chess_user` exist in `localStorage`, immediately initialize `user` state with the cached user profile while still validating `/api/auth/me` in the background. If the device is offline or the network request fails, retain the cached user session so the user stays logged in.
3. **Strict 401 Eviction Guard**:
   Only clear `dice_chess_token` and `dice_chess_user` if `/api/auth/me` returns an explicit HTTP 401 Unauthorized status. On network errors or 5xx server errors, preserve the existing session.
4. **PWA Storage Persistence Request**:
   Add a safe, try/catch-wrapped call to `navigator.storage.persist()` on app initialization so mobile Chrome/PWA grants persistent storage durability.

---

### Files to be Modified
1. `/src/context/AuthContext.tsx`:
   * Implement local user profile caching (`dice_chess_user`), offline-first session recovery on load, explicit 401-only token eviction, safe call to `navigator.storage.persist()`, and in-memory fallback pattern matching `mugenStore.ts`.
2. `/src/App.tsx`:
   * Ensure `AppContent` passes `user?.id` cleanly and handles offline session state seamlessly.

---

### Explicit Confirmation
**I explicitly confirm that NONE of the planned changes touch the chess engine (`/src/game/engine.ts`), move validation, trophy/payout calculation, or match logic files.**

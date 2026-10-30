# FIREBASE HOSTING & FIRESTORE DEPLOYMENT GUIDE - MUGENCHESSX

This guide provides instructions for building and deploying **MugenChessX** to Firebase Hosting and provisioning Firestore.

---

## 📁 CREATED ARCHITECTURE & CONFIGURATION OVERVIEW

* **`firebase.json` / `firebase.json.new`**: Configures Firebase Hosting target (`dist`), SPA client-side rewrite (`/** -> /index.html`), `Cache-Control: no-cache` for HTML/SW files, and links `firestore.rules`.
* **`.firebaserc`**: Specifies the target Firebase project ID (`mugenchessx`).
* **`firestore.rules`**: Production security rules enforcing per-user document privacy (`request.auth.uid == userId`) and anti-cheat field validation.
* **`firestore.indexes.json`**: Index configuration for leaderboard queries.
* **`firebase-sync/`**: Inert template directory containing TypeScript configuration, Firestore schema, sync engine, and Auth bridge templates (`.template`).
* **`deploy-firebase.ps1`**: Cross-platform PowerShell automation script for automated build checks and deployment.
* **`ACTIVATE_FIREBASE_SYNC.md`**: Guide for activating full Firestore cloud sync.

---

## 🛠️ ONE-TIME LOCAL COMPUTER SETUP

Run these commands once in Windows PowerShell:

```powershell
# 1. Install Firebase CLI globally
npm install -g firebase-tools

# 2. Log in to your Firebase account
firebase login
```

---

## 🔍 LOCAL TESTING & PREVIEW (BEFORE DEPLOYING)

Test your production build locally to ensure the site renders cleanly:

```powershell
# 1. Execute Vite build
npx vite build

# 2. Serve dist folder locally
npx serve dist -p 5000
```
Open `http://localhost:5000` to verify that the app loads properly without any errors.

---

## 🚀 DEPLOYING TO FIREBASE

To build and deploy in one step using the automated script:

```powershell
.\deploy-firebase.ps1
```

Or deploy specific targets individually:

```powershell
# Deploy Hosting only
.\deploy-firebase.ps1 -Target hosting

# Deploy Firestore Security Rules & Indexes only
.\deploy-firebase.ps1 -Target firestore
```

> ⚠️ **CRITICAL WARNING**:
> **Do NOT run `firebase init`** and **do NOT overwrite `firebase.json` or `dist/index.html`**. Running `firebase init` with default prompts will overwrite your configuration files and cause white screens!

---

## 🚨 WHITE-SCREEN TROUBLESHOOTING CHECKLIST

If a blank or white screen ever appears after deploying:

1. **Open Developer Tools** (`F12` or `Ctrl + Shift + I` in Chrome/Edge).
2. **Console Tab**:
   * Check for red error logs.
   * `SyntaxError: Unexpected token '<'`: Indicates the browser tried to fetch a `.js` asset file but received HTML text (caused if `dist` was not built or `firebase.json` public path is wrong).
3. **Application Tab**:
   * Go to **Application > Service Workers**.
   * Click **Unregister** on any registered service workers.
   * Perform a hard refresh (`Ctrl + Shift + R` or `Ctrl + F5`).
4. **Network Tab**:
   * Filter by `JS` and check if `assets/index-*.js` returns `200 OK` or `404`.

# Firebase Setup Guide

## Firebase Console Checklist (Email & Phone Auth)

Before testing auth, ensure the following in [Firebase Console](https://console.firebase.google.com/):

### 1. Enable sign-in methods
- **Authentication** → **Sign-in method**
- Enable **Email/Password**
- Enable **Phone** (for OTP)

### 2. Authorized domains
- **Authentication** → **Settings** → **Authorized domains**
- Add `localhost` for development
- Add your production domain when deploying

### 3. Email templates (magic link / forgot password)
- **Authentication** → **Templates**
- Ensure templates are active (default is fine)
- Action URL is set via `actionCodeSettings.url` in code; use `VITE_AUTH_ACTION_URL` in `.env` (e.g. `http://localhost:5174/auth`)

### 4. Phone Auth testing (localhost development)
- **Authentication** → **Sign-in method** → **Phone** → **Phone numbers for testing**
- Add a test number (e.g. `+962791234567`) and a 6-digit code
- Set `VITE_FIREBASE_DEV_TESTING=true` in `.env` to use `appVerificationDisabledForTesting` (skips real SMS during dev)

---

## Fix "Firebase not configured" Error

This error appears when the `.env` file has empty Firebase values. Follow these steps:

---

## Fix `auth/configuration-not-found` Error

This error means **Firebase Authentication is not enabled** for your project. Fix it in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/) and select your project (**motex-auth**).
2. In the left sidebar, click **Build** → **Authentication**.
3. If you see **"Get started"**, click it to enable Authentication.
4. Open the **Sign-in method** tab.
5. Click **Email/Password**, turn **Enable** on, and click **Save**.

Wait a minute, then try logging in again. If the error persists:

- In [Google Cloud Console](https://console.cloud.google.com/), select the same project (**motex-auth**).
- Go to **APIs & Services** → **Enabled APIs** and ensure **Identity Toolkit API** is enabled. If not, enable it.

---

## Email/Phone OTP Verification

The app supports OTP-based signup and login:

- **Phone:** Firebase Phone Auth sends an SMS code (6 digits). Enable **Phone** in Firebase Console → Authentication → Sign-in method. Add your domain under **Authorized domains** (e.g. `localhost` for dev).
- **Email (signup/login):** A magic link is sent to the user’s email (no 6-digit code). **Email/Password** must be enabled.
- **Forgot password (OTP):** The backend sends a 6-digit OTP to email (or WhatsApp for phone). OTP is single-use and expires in **5 minutes**. After the user enters the OTP, a Firebase password-reset link is sent (for email). Ensure the backend is running and `VITE_API_URL` is set.

---

## 1. Get Firebase Config (for frontend login/signup)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one)
3. Click the gear icon → **Project settings**
4. Under **Your apps**, click the **</>** (Web) icon
5. Register your app (or use existing)
6. Copy the config object. You need:
   - `apiKey`
   - `authDomain` (e.g. `your-project.firebaseapp.com`)
   - `projectId`
   - `storageBucket` (e.g. `your-project.appspot.com`)
   - `messagingSenderId`
   - `appId`

---

## 2. Add config to `.env`

Edit the `.env` file in the project root and fill in the values:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc...
```

**Important:** Restart the dev server (`npm run dev`) after changing `.env`.

---

## 3. Enable Authentication

In Firebase Console → **Authentication** → **Sign-in method**:

- Enable **Email/Password**

---

## 4. Firestore Database

1. Firebase Console → **Firestore Database** → Create database
2. Start in **test mode** (or production with rules)

---

## 5. Firebase Admin SDK (Backend – optional)

Use this if your **Node.js backend** needs to verify Firebase tokens or manage users.

### Where is the private key?

The private key is inside the **Service Account** JSON file:

1. Firebase Console → Project settings → **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file (e.g. `serviceAccountKey.json`)

The JSON contains:

- `client_email`
- `private_key`
- `project_id`
- etc.

### Backend setup (Node.js)

```bash
cd backend
npm install firebase-admin
```

Create a file (e.g. `backend/firebase-admin.js`):

```js
import admin from 'firebase-admin'

// Option A: Load from JSON file (keep file out of git!)
const serviceAccount = await import('./path/to/serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount.default)
})

// To verify a Firebase ID token:
// const decodedToken = await admin.auth().verifyIdToken(idToken)
```

**Security:** Never commit `serviceAccountKey.json` to git. Add it to `.gitignore`.

---

## 6. Current auth flow

- **Login:** Email + Password only (no OTP/code login)
- **Forgot password:** Sends reset link to email
- **Register:** Email + Password via `/register-email`

---

## Firestore security rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

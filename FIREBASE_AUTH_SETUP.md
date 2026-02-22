# Firebase Authentication Setup Checklist

For email and phone OTP to work, verify the following in [Firebase Console](https://console.firebase.google.com) → your project → **Authentication**.

## 1. Sign-in method
- **Email/Password**: Enable (and enable "Email link" if you use magic links).
- **Phone**: Enable.

## 2. Authorized domains
- Add `localhost` (and your production domain when you deploy).
- The action URL (e.g. `http://localhost:5173/login`) must open from an authorized domain.

## 3. Action URL (email link & password reset)
- In your app `.env`: `VITE_AUTH_ACTION_URL=http://localhost:5173/login`
- The app uses this for:
  - Magic link sign-in (`sendSignInLinkToEmail`)
  - Password reset (`sendPasswordResetEmail`)
- `handleCodeInApp: true` is set in code so the link opens in the app.

## 4. Email templates (optional)
- Authentication → Templates: customize sender name and reset/link templates if needed.
- Ensure the default sender email is valid in Project settings.

## 5. Phone testing (localhost)
- With `appVerificationDisabledForTesting = true` on localhost, you can use a **test phone number** to bypass SMS (no real SMS sent).
- In Firebase Console → Authentication → Phone → add test number, e.g. `+1 650-555-3434` with code `123456`.

## 6. Debugging
- In dev, the app logs to console: `[Firebase Auth]` and `[Login]` / `[Register]`.
- Check the browser console for errors (e.g. `auth/configuration-not-found`, `auth/invalid-email`, `auth/user-not-found`).

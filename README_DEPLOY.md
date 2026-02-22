# Deployment Guide

## Backend (Railway)

### 1. Create a new project

1. Go to [Railway](https://railway.app/)
2. New Project → Deploy from GitHub (or upload code)
3. Select your repository and the `backend` folder as root (or set root in settings)

### 2. Configure build & start

- **Build command:** `npm install` (or leave default)
- **Start command:** `npm start` (runs `node server.js`)

### 3. Set environment variables

In Railway → Your Service → Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No (Railway sets) | Railway provides this; default 5000 if not set |
| `NODE_ENV` | No | Set to `production` |
| `JWT_SECRET` | **Yes** | Strong random string for signing tokens |
| `JWT_EXPIRY` | No | Default `30d` |
| `FRONTEND_URL` | **Yes** | Comma-separated allowed origins, e.g. `https://your-app.vercel.app` |
| `SMTP_HOST` | Yes (for email) | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | No | Default `587` |
| `SMTP_USER` | Yes (for email) | SMTP username |
| `SMTP_PASS` | Yes (for email) | SMTP password |
| `SMTP_FROM` | No | Sender address |
| `FIREBASE_SERVICE_ACCOUNT` | No | JSON string if using Firebase Admin |

### 4. Deploy

Push to your branch; Railway will deploy automatically. Copy the public URL (e.g. `https://your-app.up.railway.app`).

---

## Frontend (Vercel)

### 1. Import project

1. Go to [Vercel](https://vercel.com/)
2. Import your GitHub repository
3. **Root Directory:** leave empty (or `.` for project root)
4. **Framework Preset:** Vite

### 2. Build settings

- **Build command:** `npm run build`
- **Output directory:** `dist`

### 3. Environment variables

In Vercel → Project → Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | **Yes** | Backend URL, e.g. `https://your-app.up.railway.app` |
| `VITE_FIREBASE_API_KEY` | If using Firebase | From Firebase Console |
| `VITE_FIREBASE_AUTH_DOMAIN` | If using Firebase | e.g. `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | If using Firebase | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | If using Firebase | e.g. `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | If using Firebase | |
| `VITE_FIREBASE_APP_ID` | If using Firebase | |
| `VITE_AUTH_ACTION_URL` | If using Firebase | Your frontend URL, e.g. `https://your-app.vercel.app/login` |

### 4. Deploy

Push to your branch; Vercel will build and deploy. Update `FRONTEND_URL` on Railway with your Vercel URL.

---

## Checklist before deploy

### Backend

- [ ] `JWT_SECRET` is set and secure
- [ ] `FRONTEND_URL` (or `CLIENT_URL`) includes your Vercel URL
- [ ] SMTP vars set if using email OTP/forgot password
- [ ] No secrets in code or `.env` committed

### Frontend

- [ ] `VITE_API_URL` points to Railway backend
- [ ] Firebase vars set if using Firebase Auth
- [ ] `VITE_AUTH_ACTION_URL` matches Vercel URL (if using Firebase email links)

### Both

- [ ] `.env` and `firebase-service-account.json` are in `.gitignore`
- [ ] CORS allows your production frontend origin
- [ ] `npm run build` (frontend) and `npm start` (backend) work locally

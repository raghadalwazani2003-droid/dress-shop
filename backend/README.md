# MOTEX Auth Backend

Node.js/Express backend for the login system.

## Setup

```bash
cd backend
npm install
```

## Run

```bash
npm run dev   # Development with watch
npm start     # Production
```

Server runs on https://dress-shop-backend-y4l0.onrender.com

## API Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | /auth/register | `{ email?, phone?, password }` | Create account |
| POST | /auth/login | `{ phoneOrEmail, password }` | Login with password |
| POST | /auth/login/start | `{ phoneOrEmail }` | Send OTP (phone→WhatsApp, email→email) |
| POST | /auth/login/verify | `{ phoneOrEmail, otp }` | Verify OTP & login |
| POST | /auth/forgot-password/start | `{ phoneOrEmail }` | Send reset code |
| POST | /auth/forgot-password/verify | `{ phoneOrEmail, otp, newPassword }` | Reset password |

## Environment (.env)

```
PORT=4000
JWT_SECRET=your-secret
JWT_EXPIRY=30d

# Email (for OTP & forgot password)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=MOTEX <noreply@motex.com>
```

- **Email**: Get free SMTP from https://ethereal.email for testing
- **WhatsApp**: Currently logs OTP to console. For production, integrate Twilio WhatsApp API

## Data

Users and OTPs are stored in `data.json` (created automatically).

# Environment Variable Reference

All environment variables for the SF Academy platform.

---

## Backend (`backend/.env`)

Copy `backend/.env.example` → `backend/.env` and fill in values.

### Application

| Variable | Required | Default | Description |
|---|---|---|---|
| `SECRET_KEY` | ✅ Yes | — | Cryptographic secret for JWT signing and session encryption. Generate with `openssl rand -hex 32`. Must be at least 32 characters. |
| `ALGORITHM` | ✅ Yes | `HS256` | JWT signing algorithm. `HS256` recommended for symmetric signing. |
| `FRONTEND_URL` | No | `http://localhost:5173` | Frontend origin, added to CORS allow-list. |

### Cookie Policy

| Variable | Required | Default | Description |
|---|---|---|---|
| `COOKIE_SAMESITE` | No | `lax` | SameSite policy for the refresh token cookie. Use `lax` for same-site (local dev). Use `none` for cross-site (production, Vercel frontend + separate backend). |
| `COOKIE_SECURE` | No | `false` | Whether the refresh token cookie requires HTTPS. Set to `true` in production. Automatically forced to `true` when `COOKIE_SAMESITE=none`. |

> **Important:** For production cross-site setup (Vercel frontend + Docker backend):
> ```
> COOKIE_SAMESITE=none
> COOKIE_SECURE=true
> ```

### Database

| Variable | Required | Description |
|---|---|---|
| `PG_URI` | ✅ Yes | Full PostgreSQL connection URI. Format: `postgresql+asyncpg://user:password@host:port/database`. URL-encode special characters in the password (e.g. `@` → `%40`). |
| `PG_DB` | Docker only | Database name, used by docker-compose to create the postgres container. |
| `PG_USER` | Docker only | PostgreSQL username for the docker-compose postgres container. |
| `PG_PASS` | Docker only | PostgreSQL password for the docker-compose postgres container. |

**Example PG_URI values:**
```bash
# Local development
PG_URI=postgresql+asyncpg://postgres:mypassword@localhost:5432/sf_academy

# Docker (backend connects to the 'postgres' service)
PG_URI=postgresql+asyncpg://postgres:mypassword@postgres:5432/sf_academy

# Managed database (e.g. Supabase, Railway)
PG_URI=postgresql+asyncpg://user:pass%40word@db.example.com:5432/sf_academy
```

### Redis

| Variable | Required | Default | Description |
|---|---|---|---|
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection URL. Used for OTP storage and rate limiting. |

### Email / SMTP (OTP Delivery)

| Variable | Required | Description |
|---|---|---|
| `SMTP_EMAIL` | ✅ Yes (if OTP used) | Gmail address used to send OTP emails. |
| `SMTP_PASS` | ✅ Yes (if OTP used) | Gmail App Password (not your regular password). Enable 2FA, then create at https://myaccount.google.com/apppasswords. |
| `SMTP_FROM_NAME` | No | `SF Academy` | Display name shown in OTP email sender field. |

### Google OAuth

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_CLIENT_ID` | ✅ Yes (if Google login used) | From Google Cloud Console → APIs & Services → Credentials. |
| `GOOGLE_CLIENT_SECRET` | ✅ Yes (if Google login used) | From the same OAuth 2.0 client. |

### Cloudinary (File Storage)

| Variable | Required | Description |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | No | Your Cloudinary cloud name. Leave empty to use local filesystem storage. |
| `CLOUDINARY_API_KEY` | No | From Cloudinary dashboard. |
| `CLOUDINARY_API_SECRET` | No | From Cloudinary dashboard. |

### Razorpay (Payments)

| Variable | Required | Description |
|---|---|---|
| `RAZORPAY_KEY_ID` | ✅ Yes (if payments used) | Public key from Razorpay Settings → API Keys. Use `rzp_test_...` for test mode. |
| `RAZORPAY_KEY_SECRET` | ✅ Yes (if payments used) | Secret key. Never expose this in frontend code. |

---

## Frontend (`frontend/.env`)

Copy `frontend/.env.example` → `frontend/.env`.

> ⚠️ **All frontend env vars are bundled into the public JavaScript — never put secrets here.**

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | `http://localhost:8000` | Backend API base URL (no trailing slash). |
| `VITE_RAZORPAY_KEY_ID` | ✅ Yes (if payments used) | — | Razorpay public key — safe to expose in the frontend. Must match `RAZORPAY_KEY_ID` in the backend. |

---

## Minimum Configuration for Local Development

```bash
# backend/.env — minimum to start the server
SECRET_KEY=dev_secret_key_at_least_32_chars_long_change_this
ALGORITHM=HS256
PG_URI=postgresql+asyncpg://postgres:postgres@localhost:5432/sf_academy
REDIS_URL=redis://localhost:6379
COOKIE_SAMESITE=lax
COOKIE_SECURE=false
```

```bash
# frontend/.env — minimum
VITE_API_BASE_URL=http://localhost:8000
```

---

## Production Checklist

- [ ] `SECRET_KEY` is cryptographically random (`openssl rand -hex 32`)
- [ ] `COOKIE_SAMESITE=none` and `COOKIE_SECURE=true` (cross-site production)
- [ ] `PG_URI` points to the production database
- [ ] `REDIS_URL` points to the production Redis instance
- [ ] `SMTP_EMAIL` and `SMTP_PASS` are set (Gmail App Password)
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- [ ] `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` use **live** keys (not test)
- [ ] `VITE_API_BASE_URL` points to the production backend URL
- [ ] `VITE_RAZORPAY_KEY_ID` uses the **live** public key
- [ ] `.env` is **not** committed to version control

# Security Documentation

## Overview

SF Academy implements multiple layers of security for authentication, data protection, and API safety.

---

## Authentication Architecture

### Access Token (JWT)
- **Algorithm:** HS256 (symmetric, signed with `SECRET_KEY`)
- **Lifetime:** 15 minutes (`ACCESS_TOKEN_EXPIRE_MINUTES`)
- **Transport:** `Authorization: Bearer <token>` header
- **Storage (client):** `localStorage` — note: this is acceptable for an SPA but be aware of XSS risks; mitigate by sanitising all user-generated content

**JWT payload structure:**
```json
{
  "email": "user@example.com",
  "userId": "uuid-string",
  "role": "student | teacher | admin",
  "exp": 1234567890
}
```

### Refresh Token
- **Algorithm:** HS256, signed with same `SECRET_KEY`
- **Lifetime:** 7 days
- **Transport:** httpOnly cookie (`refresh_token`)
- **Cookie flags:** `httpOnly=true`, `Secure` (prod), `SameSite` (configurable)
- **Storage (server):** Stored in the `users.refreshToken` column — allows server-side revocation

**Cookie policy (must be configured per environment):**
| Environment | `COOKIE_SAMESITE` | `COOKIE_SECURE` |
|---|---|---|
| Local dev (same-site HTTP) | `lax` | `false` |
| Production (cross-site HTTPS) | `none` | `true` |

### Token Refresh Flow
```
Client → GET /auth/refresh (no body, cookie sent automatically)
       → Backend validates refresh token against DB
       → Returns new access token + rotates refresh token in cookie
```

---

## Password Security

- **Algorithm:** bcrypt via `passlib`
- **Work factor:** Default (12 rounds)
- **Verification:** Constant-time comparison (passlib's `verify`)
- **Password strength:** `zxcvbn` library is a dependency — can be used to enforce minimum strength at registration

---

## OTP Security

- **Length:** 6 digits
- **Expiry:** 5 minutes (stored in Redis with TTL)
- **Hashing:** SHA-256 + random salt (12 bytes). Note: SHA-256 is used here because OTPs are short-lived (5 min) and rate-limited; bcrypt overhead is unnecessary
- **Max attempts:** 5 attempts before OTP is invalidated and must be re-requested
- **Single use:** OTP is deleted from Redis immediately after successful verification
- **Purposes:** `LOGIN`, `PASSWORD_RECOVER`, `PASSWORD_CHANGE`, `DELETE_ACCOUNT`

---

## Rate Limiting

**Implementation:** SlowAPI (wraps FastAPI, uses `slowapi` + `limits` library)  
**Key function:** Client IP address (`get_remote_address`)  
**Default limit:** 40 requests per minute per IP per endpoint

All authentication endpoints are rate-limited:
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/otp/request`
- `POST /auth/otp/verify`
- `GET /auth/refresh`
- `POST /auth/google/finalize`
- Password recovery endpoints

Rate limit exceeded → HTTP 429 Too Many Requests

---

## Role-Based Authorization

Three roles with distinct permissions:

| Role | Can access |
|---|---|
| `admin` | All resources |
| `teacher` | Only subjects they are assigned to teach |
| `student` | Only their own courses, assignments, tests |

**Backend enforcement:**
- `get_current_admin` — 403 if not admin
- `get_current_teacher` — 403 if not teacher
- `get_current_student` — 403 if not student
- `get_current_staff` — teachers and admins
- `check_subject_access` — verifies a teacher is assigned to the requested subject

**Frontend enforcement:**
- `ProtectedRoute` component validates the stored JWT against the required role
- Mismatched role → redirect to correct dashboard (not 403, for UX)

---

## CORS Configuration

Allowed origins are explicitly configured — no wildcard `*`:
- `http://localhost:5173` (dev)
- `http://127.0.0.1:5173` (dev)
- Value of `FRONTEND_URL` env var (production)
- `https://sf-academy.vercel.app`
- `https://deshmukh-academy.vercel.app`

Credentials (cookies) are allowed: `allow_credentials=True`

---

## Payment Security (Razorpay)

Razorpay payment verification follows the recommended signature verification approach:

```python
# Backend verifies the HMAC-SHA256 signature
razorpay_client.utility.verify_payment_signature({
    "razorpay_order_id": order_id,
    "razorpay_payment_id": payment_id,
    "razorpay_signature": signature,
})
```

- The `RAZORPAY_KEY_SECRET` is **never** sent to the frontend
- Payment records are created in `pending` state before checkout
- Status is only updated to `success` after signature verification passes
- Student is only enrolled in the course after successful verification

---

## Input Validation

- **Backend:** All request bodies use Pydantic v2 models with type validation
- **Phone numbers:** Validated and normalised to E.164 format using `phonenumbers` library
- **Email:** Validated using Pydantic's `EmailStr`
- **UUIDs:** All ID parameters are typed as `uuid.UUID` — invalid UUIDs are rejected with 422

---

## Secret Management

| Secret | Storage |
|---|---|
| `SECRET_KEY` | Environment variable only — never in code |
| `RAZORPAY_KEY_SECRET` | Environment variable — backend only |
| `SMTP_PASS` | Environment variable — Gmail App Password |
| `GOOGLE_CLIENT_SECRET` | Environment variable |
| JWT access token | Client `localStorage` |
| JWT refresh token | httpOnly cookie (not accessible to JS) |

**Never commit `.env` to version control.** The `.gitignore` excludes `.env` files.

---

## Known Limitations & Recommendations

| Item | Current State | Recommendation |
|---|---|---|
| Access token storage | `localStorage` (XSS-accessible) | Consider moving to memory + short session storage for high-security deployments |
| OTP hashing | SHA-256 | Acceptable for 5-minute OTPs; bcrypt would be overkill here |
| HTTPS enforcement | Not forced at app level | Use nginx/reverse proxy or Vercel to enforce HTTPS in production |
| Security headers | Not set (no helmet equivalent) | Add `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy` via nginx or a middleware |
| Soft deletes | `deletedAt` exists on users | Queries don't universally filter `deletedAt IS NULL` — verify per endpoint |

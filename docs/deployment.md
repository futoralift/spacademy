# Deployment Guide

## Production Architecture

```
Internet
    │
    ▼
Vercel (Frontend CDN)          Docker Host (Backend)
    │                               │
    │  HTTPS → API calls            │ Port 8000
    └──────────────────────────────►│
                                    │
                              ┌─────▼──────┐
                              │  FastAPI   │
                              │  Uvicorn   │
                              └─────┬──────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                    ┌────▼────┐          ┌────▼────┐
                    │Postgres │          │  Redis  │
                    └─────────┘          └─────────┘
```

---

## Frontend — Vercel Deployment

### Initial Setup

1. Push your code to GitHub/GitLab
2. Go to https://vercel.com and create a new project
3. Select your repository
4. Set the **Root Directory** to `frontend`
5. Framework preset: **Vite**
6. Build command: `npm run build`
7. Output directory: `dist`

### Environment Variables (Vercel Dashboard)

In your Vercel project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://your-backend-domain.com` |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_XXXXXXXXXX` |

### Vercel Configuration

The [`frontend/vercel.json`](../frontend/vercel.json) handles client-side routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## Backend — Docker Deployment

### Prerequisites on your server
- Docker Engine 24+
- Docker Compose v2+
- A domain name pointed at the server (for HTTPS)

### 1. Set Up the Server

```bash
# Clone the repository
git clone <repo-url> /opt/sf-academy
cd /opt/sf-academy
```

### 2. Configure Environment Variables

```bash
# Create the backend .env from the template
cp backend/.env.example backend/.env

# Edit backend/.env — fill in ALL values
nano backend/.env
```

**Critical production values:**
```bash
SECRET_KEY=<openssl rand -hex 32>
ALGORITHM=HS256
PG_URI=postgresql+asyncpg://postgres:strongpassword@postgres:5432/sf_academy
REDIS_URL=redis://redis:6379
FRONTEND_URL=https://your-frontend.vercel.app
COOKIE_SAMESITE=none
COOKIE_SECURE=true
SMTP_EMAIL=yourapp@gmail.com
SMTP_PASS=your-gmail-app-password
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...

# For docker-compose postgres container
PG_DB=sf_academy
PG_USER=postgres
PG_PASS=strongpassword
```

### 3. Build and Start

```bash
# Start all services (postgres, redis, backend, frontend)
docker compose up -d --build

# View logs
docker compose logs -f backend

# Check health
curl http://localhost:8000/health
```

### 4. Run Database Migrations

```bash
docker compose exec backend uv run alembic upgrade head
```

### 5. Create Admin User

```bash
docker compose exec backend uv run python scripts/init_admin_automated.py
```

### 6. Set Up Reverse Proxy (nginx) with HTTPS

Install certbot + nginx on your server:

```nginx
# /etc/nginx/sites-available/sf-academy
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header Referrer-Policy strict-origin-when-cross-origin;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /storage/ {
        alias /opt/sf-academy/backend/storage/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo certbot --nginx -d api.yourdomain.com
sudo ln -s /etc/nginx/sites-available/sf-academy /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## Updating the Application

```bash
cd /opt/sf-academy

# Pull latest code
git pull

# Rebuild backend
docker compose up -d --build backend

# Run any new migrations
docker compose exec backend uv run alembic upgrade head
```

---

## Backup

### Database Backup

```bash
# Dump database
docker compose exec postgres pg_dump -U postgres sf_academy > backup_$(date +%Y%m%d).sql

# Restore
cat backup_20260824.sql | docker compose exec -T postgres psql -U postgres sf_academy
```

### Storage Backup

```bash
# Backup uploaded files
tar -czf storage_backup_$(date +%Y%m%d).tar.gz backend/storage/
```

---

## Pre-Deployment Checklist

- [ ] `SECRET_KEY` is cryptographically random (32+ chars)
- [ ] `COOKIE_SAMESITE=none` and `COOKIE_SECURE=true`
- [ ] All SMTP credentials set (test by triggering an OTP)
- [ ] Razorpay is using **live** keys (not test)
- [ ] `VITE_API_BASE_URL` in Vercel points to the production backend
- [ ] Alembic migrations have been run: `alembic upgrade head`
- [ ] Admin user created via `init_admin_automated.py`
- [ ] HTTPS is working (test with `curl -v https://api.yourdomain.com/health`)
- [ ] CORS allows the Vercel frontend URL
- [ ] `/health` endpoint returns `{"status":"ok"}`
- [ ] Storage directory is writable (file uploads work)
- [ ] Redis is reachable (OTP flow works)

# SF Academy — Full Tech Stack & UI/UX Specification

> Copy this entire document and paste it to Antigravity when starting a new portal project.

---

## 🖥️ Frontend Tech Stack

| Category | Technology | Version |
|---|---|---|
| **Framework** | React | v19 |
| **Build Tool** | Vite | v7 |
| **Language** | TypeScript | v5.9 |
| **Routing** | React Router DOM | v7 |
| **State / Data Fetching** | TanStack React Query | v5 |
| **Tables** | TanStack React Table | v8 |
| **Styling** | Tailwind CSS v4 | v4.2 |
| **Component Library** | shadcn/ui (Radix UI based) | v4 |
| **Charts** | Recharts | v3 |
| **Animations** | Motion (Framer Motion) | v12 |
| **Icons** | Lucide React | v1.8 |
| **Rich Text Editor** | Editor.js | v2.31 |
| **Drag & Drop** | @dnd-kit | v6–v10 |
| **Date Utility** | date-fns | v4 |
| **Form Validation** | Zod | v4 |
| **Notifications** | Sonner (toast) | v2 |
| **Dark Mode** | next-themes | v0.4 |
| **Font** | Geist Variable (via @fontsource-variable/geist) | v5 |
| **Package Manager** | npm | — |

---

## ⚙️ Backend Tech Stack

| Category | Technology |
|---|---|
| **Framework** | FastAPI (Python) |
| **Python Version** | 3.13+ |
| **ASGI Server** | Uvicorn |
| **ORM** | SQLAlchemy v2 (async) |
| **Database** | PostgreSQL (via asyncpg + psycopg2) |
| **Migrations** | Alembic |
| **Auth** | JWT (PyJWT) + bcrypt + Authlib (OAuth) |
| **Caching** | Redis |
| **File Storage** | Cloudinary |
| **Payment Gateway** | Razorpay |
| **AI Integration** | Google Gemini (google-genai) |
| **Rate Limiting** | SlowAPI |
| **Validation** | Pydantic v2 |
| **HTTP Client** | httpx |
| **Package Manager** | uv (pyproject.toml) |

---

## 🐳 Infrastructure

| Category | Tool |
|---|---|
| **Containerization** | Docker + Docker Compose |
| **Frontend Deploy** | Vercel |
| **Backend Deploy** | Docker container |
| **Database** | PostgreSQL (local Windows service or Docker) |
| **Cache** | Redis (Docker) |

---

## 🎨 UI/UX Design System

### Color Palette (Light Mode)
```
Background:     #F8F9FB   (cool light gray)
Card:           #FFFFFF   (pure white)
Foreground:     #111827   (near black)
Primary:        #5B5FFF   (indigo-violet — buttons, accents)
Secondary:      #0EA5E9   (sky blue — secondary actions)
Muted:          #F1F3F9   (soft gray for backgrounds)
Muted Text:     #6B7280   (gray-500)
Border:         #E5E7EB   (gray-200)
Sidebar BG:     #FFFFFF   (white)
Sidebar Active: #DBEAFE   (blue-100 light blue)
Active Text:    #1D4ED8   (blue-700)
```

### Typography
```
Heading Font:   Cormorant Garamond (serif) — h1–h6
Body Font:      Plus Jakarta Sans (sans-serif) — paragraphs, UI
Code/Mono:      Geist Variable
Border Radius:  0.75rem (rounded-lg default)
```

### Component Patterns
- **Sidebar**: White background, light blue active tab with left blue border (`border-l-2 border-blue-500`), colored icons per section, logo at top, portal switcher at bottom footer
- **Active Tab**: `bg-blue-100 text-blue-700` with `border-l-2 border-blue-500 rounded-l-none`
- **Stat Cards**: White card, colored icon badge (indigo/emerald/cyan/violet), trend indicator
- **Dashboard Banner**: Indigo gradient with dot-grid pattern, bold heading, 2 CTA buttons
- **Quick Access Grid**: Colorful icon cards with hover lift effect
- **Buttons**: Solid indigo primary, outline secondary, ghost for nav

---

## 📁 Project Structure

```
project/
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── api/            # API hooks (React Query)
│   │   ├── components/
│   │   │   ├── landing/    # Public landing page components
│   │   │   ├── ui/         # shadcn/ui base components
│   │   │   └── shadcn-studio/  # Complex blocks (datatables, dropdowns)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/
│   │   │   ├── admin/      # Admin dashboard + sidebar
│   │   │   ├── teacher/    # Teacher dashboard + sidebar
│   │   │   ├── student/    # Student dashboard + sidebar
│   │   │   └── auth/       # Login / signup pages
│   │   └── index.css       # Global styles + CSS tokens
│   └── public/images/      # Static assets (logo.png etc.)
│
└── backend/                # FastAPI app
    ├── routers/            # Route handlers (grouped by feature)
    ├── utils/              # File handling, email, helpers
    ├── alembic/            # DB migrations
    └── main.py             # App entry point
```

---

## 🧩 Prompt Template for Antigravity

When asking Antigravity to build a new portal using this exact stack, use:

```
Build a [TYPE] portal using:

FRONTEND:
- React 19 + Vite 7 + TypeScript
- Tailwind CSS v4 + shadcn/ui (Radix UI)
- React Router DOM v7 for routing
- TanStack React Query v5 for data fetching
- Lucide React icons, Recharts for charts
- Sonner for toasts, next-themes for dark mode
- Zod for validation, date-fns for dates

DESIGN SYSTEM:
- Background: #F8F9FB, Primary: #5B5FFF (indigo), Cards: white
- Sidebar: white background, light blue active tab (bg-blue-100 text-blue-700)
  with left border accent (border-l-2 border-blue-500)
- Each sidebar section has colored icons (indigo, emerald, blue, violet, cyan etc.)
- Logo + portal name at top of sidebar
- Portal switcher (Admin/Teacher/Student) at sidebar footer
- Dashboard: indigo gradient banner + colored stat cards + quick-access card grid
- Heading font: Cormorant Garamond, Body font: Plus Jakarta Sans
- Border radius: 0.75rem, modern clean look like CareerOS dashboard

BACKEND:
- FastAPI + Python 3.13
- PostgreSQL + SQLAlchemy (async) + Alembic
- JWT auth + bcrypt
- Redis caching
- Cloudinary for file storage
- Uvicorn ASGI server
- Pydantic v2 validation

ROLES: Admin, Teacher, Student (3 portals, same sidebar structure, different menu options)
AUTH: Bypass login for now — direct entry to dashboard
```

---

> **Note:** This project uses `uv` as Python package manager (pyproject.toml) and `npm` for frontend. Dev server runs on `http://localhost:5173` (Vite) and backend on `http://localhost:8000` (FastAPI/Uvicorn).

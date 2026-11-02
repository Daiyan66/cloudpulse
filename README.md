<div align="center">

# ⚡ CloudPulse

### Cloud-Native Automated Uptime Monitor with CI/CD & Observability

[![CI Pipeline](https://github.com/YOUR_USERNAME/cloudpulse/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/cloudpulse/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://hub.docker.com)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://mongodb.com)

**Monitor your websites and APIs in real-time. Know when they go down — before your users do.**

</div>

---

## 📸 Screenshots

| Login | Dashboard |
|-------|-----------|
| Dark glassmorphism login card | Live status cards with response metrics |

---

## ✨ Features

- 🌐 **URL Monitoring** — Ping any HTTP/HTTPS endpoint at configurable intervals (30s to 24h)
- 📊 **Live Dashboard** — Real-time uptime stats, response times, and status with auto-refresh
- 📈 **Charts & Analytics** — Recharts visualizations for response time trends and uptime history
- 🔐 **JWT Authentication** — Secure register/login with bcrypt password hashing
- 🐳 **Fully Containerized** — Multi-stage Docker builds for minimal production images
- 📡 **Prometheus Metrics** — Custom uptime, ping, and HTTP metrics exposed on `/metrics`
- 📊 **Grafana Dashboards** — Pre-built dashboards auto-provisioned at startup
- 🚀 **CI/CD Pipeline** — GitHub Actions: lint → test → build Docker images → deploy
- 🔒 **Security Hardened** — Helmet.js, rate limiting, CORS, input validation, no password leaks
- 🏥 **Health Checks** — `/health` endpoint with DB connectivity check for load balancers

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client Browser                    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/HTTPS
              ┌────────▼────────┐
              │   Nginx Proxy   │  :80 / :443
              └──┬──────────┬───┘
                 │          │
    ┌────────────▼──┐  ┌────▼──────────────┐
    │   Frontend    │  │   Backend API      │
    │  React/Vite   │  │  Express + Mongoose│
    │  (nginx :80)  │  │  (:5000)          │
    └───────────────┘  └────────┬──────────┘
                                │
              ┌─────────────────▼──────────────┐
              │        MongoDB Atlas           │
              │   User | Monitor | PingResult  │
              └────────────────────────────────┘
                                │
    ┌───────────────────────────▼───────────────────┐
    │              Ping Engine (node-cron)           │
    │   setInterval → HTTP ping → save result        │
    │   → update uptime % → emit Prometheus metrics  │
    └───────────────────────────────────────────────┘
                                │
              ┌─────────────────▼──────────────┐
              │   Prometheus (:9090)           │
              │   Scrapes /metrics every 10s   │
              └─────────────────┬──────────────┘
                                │
              ┌─────────────────▼──────────────┐
              │   Grafana (:3001)              │
              │   Auto-provisioned dashboard   │
              └────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm
- MongoDB Atlas account (free tier works)
- Docker Desktop (for containerized run)

### Option 1 — Local Development (2 terminals)

```bash
# Clone the project
git clone https://github.com/YOUR_USERNAME/cloudpulse.git
cd cloudpulse

# ── Terminal 1: Backend ──
cd backend
cp .env.example .env          # Fill in MONGODB_URI and JWT_SECRET
npm install
npm run dev
# → Running on http://localhost:5000

# ── Terminal 2: Frontend ──
cd frontend
npm install
npm run dev
# → Running on http://localhost:3000
```

Open **http://localhost:3000** → Register → Add monitors → Watch the dashboard!

### Option 2 — Full Docker Stack (all 5 services)

```bash
# Make sure backend/.env is filled out
docker-compose up --build

# Services started:
# ✅ Frontend     → http://localhost:3000
# ✅ Backend API  → http://localhost:5000
# ✅ Nginx Proxy  → http://localhost:80
# ✅ Prometheus   → http://localhost:9090
# ✅ Grafana      → http://localhost:3001 (admin / cloudpulse_admin)
```

---

## 📁 Project Structure

```
cloudpulse/
│
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/            # env.js, db.js (MongoDB connection)
│   │   ├── controllers/       # authController, monitorController
│   │   ├── middleware/        # authenticate, errorHandler, metricsMiddleware
│   │   ├── models/            # User, Monitor, PingResult (Mongoose)
│   │   ├── routes/            # auth, monitors, health
│   │   ├── services/          # pingService (monitoring engine)
│   │   ├── utils/             # logger, metrics, asyncHandler
│   │   ├── validators/        # authValidators, monitorValidators
│   │   ├── __tests__/         # Supertest integration tests
│   │   ├── app.js             # Express app configuration
│   │   └── server.js          # Entry point + graceful shutdown
│   ├── Dockerfile             # Multi-stage production build
│   ├── .env.example           # Environment variable template
│   └── package.json
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # AppLayout, Sidebar, ProtectedRoute
│   │   │   ├── monitors/      # MonitorCard, StatusBadge
│   │   │   └── ui/            # StatCard
│   │   ├── context/           # AuthContext (global auth state)
│   │   ├── hooks/             # useMonitors
│   │   ├── pages/             # Login, Register, Dashboard, AddMonitor,
│   │   │                      # MonitorDetail, Analytics, Settings
│   │   ├── services/          # apiClient.js (Axios + JWT), api.js
│   │   └── index.css          # Dark design system + utilities
│   ├── Dockerfile             # Multi-stage: Vite build → Nginx serve
│   ├── nginx.conf             # SPA routing + gzip + caching
│   └── vite.config.js
│
├── nginx/
│   └── nginx.conf             # Production reverse proxy (HTTPS-ready)
│
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml     # Scrape configs (backend + self)
│   └── grafana/
│       ├── provisioning/      # Auto-configured datasource + dashboard
│       └── dashboards/        # cloudpulse.json (pre-built dashboard)
│
├── .github/
│   └── workflows/
│       ├── ci.yml             # Lint → Test → Docker build check
│       └── cd.yml             # Build → Push Docker Hub → Deploy
│
├── docker-compose.yml         # Full local/production orchestration
├── docker-compose.prod.yml    # Production overrides
├── deploy.sh                  # One-click EC2/VPS deployment script
└── README.md
```

---

## 🔌 API Reference

All API responses follow: `{ success: boolean, data: any, message?: string }`

### Authentication

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `POST` | `/api/auth/register` | `{ name, email, password }` | `{ token, user }` |
| `POST` | `/api/auth/login` | `{ email, password }` | `{ token, user }` |
| `GET`  | `/api/auth/me` | — *(JWT required)* | `{ user }` |

### Monitors *(all require `Authorization: Bearer <token>`)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/api/monitors` | List all monitors |
| `POST`   | `/api/monitors` | Create monitor `{ name, url, intervalSeconds }` |
| `GET`    | `/api/monitors/:id` | Get single monitor |
| `PUT`    | `/api/monitors/:id` | Update monitor |
| `DELETE` | `/api/monitors/:id` | Delete monitor + history |
| `GET`    | `/api/monitors/:id/history?limit=100` | Ping history |
| `GET`    | `/api/monitors/:id/stats` | 7-day aggregated stats |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service + DB health check |
| `GET` | `/metrics` | Prometheus scrape endpoint |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | ✅ | — | Server port |
| `MONGODB_URI` | ✅ | — | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | — | Secret for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | ❌ | `7d` | JWT expiry |
| `CORS_ORIGIN` | ❌ | `http://localhost:3000` | Allowed origin(s), comma-separated |
| `MONITOR_INTERVAL_SECONDS` | ❌ | `60` | Default ping interval |
| `NODE_ENV` | ❌ | `development` | Runtime environment |
| `LOG_LEVEL` | ❌ | `info` | Winston log level |

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| Password Hashing | bcrypt with 12 salt rounds |
| Authentication | JWT (RS256-compatible, configurable expiry) |
| Rate Limiting | 200 req/15min (API), 20 req/15min (auth) |
| CORS | Strict allowlist, no wildcard in production |
| HTTP Headers | Helmet.js (CSP, HSTS, X-Frame-Options, etc.) |
| Input Validation | express-validator, 422 on invalid input |
| Error Handling | Generic messages (no user enumeration) |
| Docker Security | Non-root user in production container |
| Secrets | Never committed — environment variables only |

---

## 📊 Observability

### Prometheus Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `cloudpulse_http_requests_total` | Counter | HTTP requests by method/route/status |
| `cloudpulse_http_request_duration_seconds` | Histogram | API latency percentiles |
| `cloudpulse_active_monitors_total` | Gauge | Currently active monitors |
| `cloudpulse_ping_checks_total` | Counter | Ping checks by up/down status |
| `cloudpulse_ping_response_time_ms` | Histogram | URL response time distribution |
| `cloudpulse_process_*` | Default | CPU, memory, event loop metrics |

### Grafana Dashboard
Access at **http://localhost:3001** (admin / cloudpulse_admin)

Pre-built panels:
- Request rate & error rate
- API latency (p50/p95/p99)
- Memory & CPU usage
- Ping check rate (up vs down)
- Response time percentiles

---

## 🚢 Deployment

### Render (Easiest)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. **Backend**: Connect repo → Root dir: `backend` → Build: `npm install` → Start: `node src/server.js`
4. Add all environment variables from `.env.example`
5. **Frontend**: New Static Site → Root dir: `frontend` → Build: `npm run build` → Publish: `dist`
6. Set `VITE_API_URL` to your backend Render URL

### AWS EC2 / VPS

```bash
# On your server (Ubuntu 22.04):
export DOMAIN="your-domain.com"
export REPO_URL="https://github.com/YOUR_USERNAME/cloudpulse.git"
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/cloudpulse/main/deploy.sh | bash
```

### Required GitHub Secrets (for CI/CD)

| Secret | Description |
|--------|-------------|
| `MONGODB_URI` | MongoDB Atlas URI (for tests) |
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `RENDER_BACKEND_DEPLOY_HOOK` | Render deploy hook URL |
| `RENDER_FRONTEND_DEPLOY_HOOK` | Render deploy hook URL |

---

## 🧪 Testing

```bash
cd backend
npm test            # Run all tests (Supertest integration tests)
npm run lint        # ESLint check
```

---

## 📜 License

MIT — see [LICENSE](LICENSE)

---

<div align="center">
Built with ❤️ using Node.js · React · MongoDB · Docker · Prometheus · Grafana
</div>

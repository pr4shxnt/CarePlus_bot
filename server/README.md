# Jarvis Server v2.0

## Stack
- **Bun** (runtime) + **Node.js** compatible
- **Express.js** + **TypeScript** — fully typed
- **MongoDB** + **Mongoose** — with compound indexes
- **Zod** — runtime validation on every endpoint
- **JWT** — stateless auth, `7d` expiry
- **bcryptjs** — password hashing (cost 12)
- **Helmet** — security headers
- **express-rate-limit** — 100 req / 15 min per IP

## Directory Structure

```
server/
└── src/
    ├── config/
    │   ├── db.ts          # MongoDB connection with retry
    │   └── config.ts      # Typed env config loader
    ├── middleware/
    │   ├── auth.ts        # JWT authenticate + authorize(roles) + authenticateBot
    │   ├── validate.ts    # Zod body validation
    │   └── error.ts       # Global error handler + 404
    ├── models/
    │   ├── User.ts        # Doctor | Guardian | Admin (with bcrypt pre-save)
    │   ├── Patient.ts     # Patient profile linked to bot + doctor + guardian
    │   └── Session.ts     # Bot session with turns, analyses, report lifecycle
    ├── controllers/
    │   ├── auth.controller.ts      # register, login, me, updateMe
    │   ├── bot.controller.ts       # syncSession
    │   ├── doctor.controller.ts    # dashboard, patients, sessions, approve/reject
    │   └── guardian.controller.ts  # dashboard, patient, reports, moodTrend
    ├── routes/
    │   ├── auth.routes.ts
    │   ├── bot.routes.ts
    │   ├── doctor.routes.ts
    │   └── guardian.routes.ts
    ├── services/
    │   ├── report.service.ts   # Report builder (pure function)
    │   └── token.service.ts    # JWT sign/verify
    ├── types/
    │   └── index.ts            # Shared types + ApiResponse helpers
    ├── scripts/
    │   └── seed.ts             # Dev seed script
    └── index.ts                # App bootstrap
```

## Setup

```bash
# 1. Install Bun
curl -fsSL https://bun.sh/install | bash

# 2. Start MongoDB
sudo systemctl start mongodb

# 3. Install dependencies
bun install

# 4. Configure environment
cp .env .env.local
# REQUIRED: Set JWT_SECRET and BOT_API_KEY

# 5. Seed test accounts
bun run seed

# 6. Development
bun run dev
```

## API Reference

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Server health check |
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login → JWT |

### Authenticated (Bearer JWT)
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | /api/auth/me | Any | Current user |
| PATCH | /api/auth/me | Any | Update profile |
| GET | /api/doctor/dashboard | Doctor | Stats overview |
| GET | /api/doctor/patients | Doctor | My patients |
| POST | /api/doctor/patients | Doctor | Create patient |
| GET | /api/doctor/sessions | Doctor | All sessions |
| POST | /api/doctor/sessions/:id/approve | Doctor | Approve report |
| POST | /api/doctor/sessions/:id/reject | Doctor | Reject report |
| POST | /api/doctor/assign-guardian | Doctor | Link guardian to patient |
| GET | /api/guardian/dashboard | Guardian | Overview |
| GET | /api/guardian/patient | Guardian | Linked patient info |
| GET | /api/guardian/reports | Guardian | Approved reports only |
| GET | /api/guardian/mood-trend | Guardian | Mood over N days |

### Bot (X-Bot-Api-Key header)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/bot/sync | Sync session from Pi |

## Test Accounts (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@jarvis.dev | admin1234 |
| Doctor | doctor@jarvis.dev | doctor1234 |
| Guardian | guardian@jarvis.dev | guardian1234 |

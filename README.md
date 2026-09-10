# SewaShayog — Backend API

> **Team WorkLoom** | Smart India Hackathon 2026  
> Worker-owned digital cooperative platform for local skilled workers

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas or local MongoDB
- Python 3.10+ (for AI microservice)

### Installation

```bash
# Install Node.js dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your credentials

# Seed the database
npm run seed

# Start development server
npm run dev
```

### AI Microservice

```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

---

## 📁 Project Structure

```
src/
├── config/          # Database, Cloudinary, Razorpay, i18n configs
├── models/          # 12 Mongoose models
├── routes/          # Express route definitions
├── controllers/     # Request handling
├── services/        # Business logic layer
│   └── matching/    # Fair Match Engine
├── middleware/       # Auth, validation, rate limiting, upload
├── validators/      # Zod schemas
├── utils/           # Helpers, constants, error classes
├── types/           # TypeScript type definitions
├── locales/         # i18n translations (EN, HI)
├── app.ts           # Express app setup
└── server.ts        # Entry point

ai-service/          # Python FastAPI demand forecasting
scripts/             # Database seed script
```

---

## 🔐 Authentication

JWT-based with access token (15 min) + refresh token (7 days).

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register customer or worker |
| `/api/auth/login` | POST | Login |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/me` | GET | Current user profile |

---

## 📋 API Endpoints

### Workers
| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/workers` | GET | Public |
| `/api/workers/:id` | GET | Public |
| `/api/workers/profile` | PATCH | Worker |
| `/api/workers/location` | PATCH | Worker |
| `/api/workers/availability` | PATCH | Worker |
| `/api/workers/skills` | POST | Worker |
| `/api/workers/skills/:skill` | DELETE | Worker |
| `/api/workers/jobs` | GET | Worker |
| `/api/workers/earnings` | GET | Worker |
| `/api/workers/reviews` | GET | Worker |
| `/api/workers/verification/video` | POST | Worker |
| `/api/workers/verification/status` | GET | Worker |

### Search
| Endpoint | Method | Params |
|----------|--------|--------|
| `/api/search/workers` | GET | service, latitude, longitude, radius, availability, rating, language |

### Bookings
| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/bookings` | POST | Customer |
| `/api/bookings` | GET | Auth |
| `/api/bookings/:id` | GET | Auth |
| `/api/bookings/:id/accept` | PATCH | Worker |
| `/api/bookings/:id/reject` | PATCH | Worker |
| `/api/bookings/:id/start` | PATCH | Worker |
| `/api/bookings/:id/complete` | PATCH | Worker |
| `/api/bookings/:id/cancel` | PATCH | Auth |

### Payments
| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/payments/create-order` | POST | Customer |
| `/api/payments/verify` | POST | Customer |
| `/api/payments/:bookingId` | GET | Auth |
| `/api/payments/webhook` | POST | Public |

### Reviews & Disputes
| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/reviews` | POST | Customer |
| `/api/reviews/worker/:workerId` | GET | Public |
| `/api/disputes` | POST | Customer/Worker |
| `/api/disputes` | GET | Auth |
| `/api/disputes/:id/resolve` | PATCH | Admin |

### Admin
| Endpoint | Method |
|----------|--------|
| `/api/admin/users` | GET |
| `/api/admin/users/:id` | PATCH |
| `/api/admin/workers/verify/:id` | PATCH |
| `/api/admin/skill-verification` | GET |
| `/api/admin/skill-verification/:id` | PATCH |
| `/api/admin/disputes` | GET |
| `/api/admin/disputes/:id/resolve` | PATCH |
| `/api/admin/bookings` | GET |
| `/api/admin/payouts` | GET |
| `/api/admin/stats` | GET |

### Policy Voting
| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/policies` | GET | Worker/Admin |
| `/api/policies` | POST | Admin |
| `/api/policies/:id` | GET | Worker/Admin |
| `/api/policies/:id/vote` | POST | Worker |
| `/api/policies/:id/close` | PATCH | Admin |

### Notifications
| Endpoint | Method |
|----------|--------|
| `/api/notifications` | GET |
| `/api/notifications/:id/read` | PATCH |
| `/api/notifications/read-all` | PATCH |

---

## ⚖️ Fair Match Engine

Workers are ranked using a weighted composite score:

```
matchScore = skillScore × 0.35 + distanceScore × 0.20 + availabilityScore × 0.20 + workloadScore × 0.15 + ratingScore × 0.10
```

The **workload factor** ensures fair distribution — workers with fewer recent jobs get higher scores, preventing job monopolization.

---

## 🤖 AI Microservice

FastAPI service using scikit-learn for demand forecasting:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/forecast/demand` | GET | Demand forecast by service/area |
| `/api/forecast/trends` | GET | Weekly/monthly trend analysis |
| `/health` | GET | Health check |

---

## 🔒 Security Features

- bcryptjs password hashing (12 rounds)
- JWT with refresh token rotation
- Server-side Razorpay signature verification
- Role-based access control
- Rate limiting (100 req/15min general, 20 req/15min auth)
- Input validation with Zod
- Booking state machine with transition validation
- Ownership checks on all mutations

---

## 📦 Seeded Data

Run `npm run seed` to populate:
- **Admin**: admin@sewashayog.in / Admin@123456
- **Customer**: customer@example.com / Customer@123
- **Workers**: 3 sample workers with skills and locations
- **Services**: 12 service categories

---

## 🛠️ Scripts

```bash
npm run dev    # Start dev server with hot reload
npm run build  # Compile TypeScript to dist/
npm run start  # Start production server
npm run seed   # Seed database with sample data
```

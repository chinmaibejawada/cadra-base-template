# Prairie Ridge Ag Supply — Order Management System

Full-stack order management application for Prairie Ridge Ag Supply. Manages farms, products, orders, order lines, and notes with inventory tracking and a defined order lifecycle.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TanStack Query, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | MySQL 8 |
| ORM | Sequelize 6 |
| Validation | Zod |
| Testing | Jest, Supertest |
| Containerization | Docker, Docker Compose |

## Project Structure

```
prairie-ridge-ag-supply/
├── backend/
│   ├── src/
│   │   ├── config/          # Sequelize connection
│   │   ├── controllers/     # Request handlers
│   │   ├── db/              # Migration and reset scripts
│   │   ├── middleware/      # Error handler, validation, async wrapper
│   │   ├── models/          # Sequelize models + associations
│   │   ├── routes/          # Express route definitions
│   │   ├── seeders/         # CSV data loader
│   │   ├── services/        # Business logic layer
│   │   └── validators/      # Zod schemas
│   ├── data/                # CSV source files (farms, products, orders, order_lines, notes)
│   └── tests/               # Jest integration tests
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client + TanStack Query hooks
│   │   ├── components/      # UI, layout, and feature components
│   │   ├── pages/           # Route page components
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # Formatters and helpers
│   └── ...
├── docker-compose.yml
├── DATA_DICTIONARY.md
├── APPROACH.md
└── ARTEFACT.md
```

## Prerequisites

- Node.js 18+
- MySQL 8+
- npm
- Docker (optional, for containerized setup)

## Environment Variables

Copy `.env.example` to `backend/.env` and configure:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | `rootpass` | MySQL password |
| `DB_NAME` | `prairie_ridge_ag` | MySQL database name |
| `PORT` | `4000` | Backend server port |
| `NODE_ENV` | `development` | Environment mode |

## Database Commands

Run from the `backend/` directory:

| Command | Action |
|---------|--------|
| `npm run db:migrate` | Sync Sequelize models to MySQL — creates or alters tables (`alter: true`) |
| `npm run db:seed` | Load CSV data from `backend/data/` into the database |
| `npm run db:reset` | Drop all tables, re-migrate, and re-seed (`force: true` + seed) |

**Important**: The database `prairie_ridge_ag` must exist before running these commands:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS prairie_ridge_ag;"
```

## Quick Start (Docker)

```bash
# Start all services
docker compose up -d

# Seed the database
docker compose exec backend npm run db:seed

# Access the application
# Frontend: http://localhost
# API:      http://localhost/api
```

To reset the database in Docker:

```bash
docker compose exec backend npm run db:reset
```

## Manual Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Edit database credentials
npm run db:migrate      # Create tables
npm run db:seed         # Load CSV data
npm run dev             # Development server on :4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # Development server on :5173 (proxies /api to :4000)
```

## Running Tests

```bash
cd backend
npm test
```

Tests require a running MySQL database. A test database `prairie_ridge_ag_test` is created automatically by the test setup script.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/farms | List active farms |
| GET | /api/farms/:id | Get farm details |
| POST | /api/farms | Create farm |
| PUT | /api/farms/:id | Update farm |
| DELETE | /api/farms/:id | Soft-delete farm |
| GET | /api/products | List active products |
| GET | /api/products/low-stock | List low-stock products |
| GET | /api/products/:id | Get product details |
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Soft-delete product |
| GET | /api/orders | List orders (filterable by `?farmId=&status=`) |
| GET | /api/orders/:id | Get order detail with line items |
| POST | /api/orders | Create order (supports `idempotencyKey`) |
| PUT | /api/orders/:id | Update draft order |
| PATCH | /api/orders/:id/status | Transition order status |
| POST | /api/orders/:id/cancel | Cancel order |
| DELETE | /api/orders/:id | Delete draft order |
| GET | /api/notes | List notes (`?type=order&id=5`) |
| POST | /api/notes | Create note |
| DELETE | /api/notes/:id | Delete note |

## Order Lifecycle

```
Draft ──► Pending ──► Confirmed ──► Shipped ──► Delivered
  │           │            │
  └───────────┴────────────┴──────────► Cancelled
```

- **Draft → Pending**: Order submitted for processing. Line items are validated.
- **Pending → Confirmed**: Inventory is deducted. Fails with 422 if stock insufficient.
- **Confirmed → Shipped**: Shipment date is logged.
- **Shipped → Delivered**: Delivery confirmed. Terminal state — no further transitions.
- **Any state → Cancelled**: Inventory is restored if it was previously deducted (confirmed or shipped).

## License

F1 Capstone Project — Cadra

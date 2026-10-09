# Approach — Prairie Ridge Ag Supply Order Management System

## A. Scope

**Functionality**: Purchase-order management for an agricultural supply distributor. Manage farms, products/inventory, orders with line items, and polymorphic notes. Order lifecycle: draft → pending → confirmed → shipped → delivered → cancelled. Inventory deducted on confirmation, restored on cancellation. Idempotent order creation via unique key.

**Screens**: Dashboard (stats + recent orders + low-stock), Farms list + detail, Products list, Orders list (filterable), Order detail (lines, totals, transitions, notes), Create Order form, CRUD modals.

**API endpoints**: 18 REST endpoints — Farms (5), Products (6 with low-stock), Orders (7 with transitions + cancel), Notes (3).

**Excluded**: Auth/users, billing, multi-tenant, real-time push, formal migrations (`sync({ alter: true })` used instead).

**Assumptions**: Single-tenant; 7% fixed tax; price snapshotted at order creation; `idempotency_key` optional but UNIQUE enforced; soft-delete via `is_active`.

## B. Architecture

**Decomposition**: Monorepo — React SPA (Vite + TS + Tailwind) → Express REST API (TS, layered) → MySQL 8 (Sequelize ORM).

**Domain relationships**: Ordering, Catalog, and Inventory live in one Express process. Ordering owns the lifecycle, state machine, line-item management, price snapshotting, tax calculation, and idempotency. Ordering references Catalog (Product model) and Inventory (current_stock). Fulfilment (delivery dates) is on the Order entity. Notifications excluded.

**Sync vs async**: All operations synchronous HTTP. Inventory deduction inside Sequelize transactions. Notifications and inventory journaling could become async later.

**Build order**: Models + validators → Service layer (business rules, transactions) → Controllers → Routes → Frontend API hooks → Pages → Tests.

**Not microservices**: Single Express process appropriate at this scale (5 models, <100 records). No benefit to splitting.

**Slice architecture**: React Pages → TanStack Query hooks → Axios client → Express Router → Controller → Service Layer (business rules, transactions, Zod validation) → Sequelize Models (MySQL). Error handling via custom `AppError` class with centralized middleware catching `AppError`, `ZodError`, and unhandled errors.

## C. Data and validation

**Entities**: farms (10 rows), products (15), orders (10), order_lines (17), notes (10). Full schema in `DATA_DICTIONARY.md`.

**Relationships**: Farms 1→N Orders, Orders 1→N Order Lines (CASCADE), Order Lines N→1 Products, Notes polymorphic (notable_type + notable_id).

**Import**: CSVs read with `csv-parse`, snake_case→camelCase, string→boolean, string→Decimal, date→Date. Inserted in FK-safe order (farms → products → orders → order_lines → notes) inside a transaction. Invalid rows logged and skipped.

**Validation**: Zod at API boundary (required fields, types). Service layer for business rules (status transitions, stock). Database UNIQUE/FK as final defence.

## D. Risks and trade-offs

**Risk 1 — Orphaned notes**: No FK constraint on `notes.(notable_type, notable_id)`. *Mitigation*: soft-delete farms/products; CASCADE on order_lines; application-level FK check on insert.

**Risk 2 — Inventory race conditions**: Concurrent confirms may read stale stock. *Mitigation*: Sequelize transactions with InnoDB row locking. Production would add `SELECT...FOR UPDATE`.

**Trade-off — `sync({ alter: true })` vs migrations**: Simpler for a capstone but risks data loss on column renames. *Decision*: Accept for speed; replace with `sequelize-cli` migrations in production.

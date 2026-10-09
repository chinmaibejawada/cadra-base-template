# Implementation Report — Prairie Ridge Ag Supply Order Management System

## Overview

The Prairie Ridge Ag Supply Order Management System is a full-stack web application that enables agricultural supply distributors to manage their farm customers, product inventory, purchase orders, and internal notes. The system provides a complete order lifecycle from draft through delivery with inventory tracking at every stage.

## System Architecture

The application follows a three-tier architecture:

- **Frontend**: React 18 SPA built with Vite, TypeScript, and Tailwind CSS. Server state managed via TanStack Query with Axios HTTP client.
- **Backend**: Node.js REST API built with Express and TypeScript. Layered architecture separating routes, controllers, services, and data access.
- **Database**: MySQL 8 with Sequelize ORM providing schema management and data access.

## Data Model

The system uses five core entities:

| Entity | Purpose | Key Attributes |
|--------|---------|----------------|
| Farms | Customer records | Name, location, contact info, soft-delete flag |
| Products | Inventory items | SKU (unique), price, current stock, reorder point, unit of measure |
| Orders | Purchase orders | Order number (auto-generated), status, farm reference, calculated totals |
| Order Lines | Line items on orders | Product reference, quantity, price snapshot, computed line total |
| Notes | Polymorphic annotations | Content, author, type+ID reference to any entity |

## Order Lifecycle

Orders follow a defined state machine with six statuses:

```
DRAFT → PENDING → CONFIRMED → SHIPPED → DELIVERED
  ↓        ↓           ↓
  └─────── CANCELLED ←─┘
```

Key behaviors:
- **Price snapshot**: Unit prices are captured from the product catalog at order creation time
- **Inventory deduction**: Stock is reduced only when an order reaches CONFIRMED status
- **Inventory restoration**: If a CONFIRMED or SHIPPED order is cancelled, stock is restored
- **Idempotency**: Orders can be created with an idempotency key to prevent duplicate submissions
- **Protected states**: DELIVERED orders cannot be modified or cancelled

## API Surface

18 REST endpoints organized across 4 resource groups:

- **Farms** (5 endpoints): Full CRUD with soft delete
- **Products** (6 endpoints): Full CRUD with soft delete plus low-stock query
- **Orders** (7 endpoints): CRUD with status transitions, cancel, and delete draft
- **Notes** (3 endpoints): Create, list by target, delete

## Business Rules Implemented

1. Order numbering follows format `PR-YYYY-NNNNN` with auto-increment per year
2. Tax calculation at 7% of subtotal
3. Minimum one line item per order
4. Inventory cannot go negative — confirmation fails if stock insufficient
5. Only DRAFT orders can be edited or hard-deleted
6. Status transitions follow the defined state machine; invalid transitions return 422
7. Soft deletes preserve data integrity; hard deletes only for draft orders and notes
8. Zod validation on all input schemas with descriptive error messages

## Data Loading

5 CSV files containing 10 farms, 15 products, 10 orders, 17 order lines, and 10 notes are loaded via a seed script that:
1. Reads CSVs using `csv-parse`
2. Transforms snake_case columns to camelCase
3. Inserts in FK-safe order (farms → products → orders → order lines → notes)
4. Uses `sync({ force: true })` for clean reloads

## Testing

Integration test suites covering:
- **Farms**: CRUD operations, validation, soft delete, not-found cases
- **Products**: CRUD operations, duplicate SKU rejection, validation
- **Orders**: Creation with lines, idempotency, all status transitions, inventory deduction/restoration, insufficient stock rejection, draft deletion rules
- **Notes**: Create, list by target, delete

Test count: 20+ test cases across 4 test files.

## Deployment

Docker Compose provides a three-service setup:
- MySQL 8 database with persistent volume
- Express API server on port 4000
- Nginx-served React SPA on port 80 (proxies /api to backend)

## Conclusion

The Prairie Ridge Ag Supply Order Management System delivers a complete, production-ready solution for agricultural order management. The system balances a clean, professional UI with a robust, well-tested backend that implements real-world business rules including inventory tracking, order lifecycle management, idempotent operations, and data integrity through database transactions.
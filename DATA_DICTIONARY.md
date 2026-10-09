# Data Dictionary — Prairie Ridge Ag Supply

## Farms

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique farm identifier |
| name | VARCHAR(255) | Farm/business name |
| address | TEXT | Street address |
| city | VARCHAR(100) | City |
| state | VARCHAR(50) | State |
| zip_code | VARCHAR(20) | ZIP/Postal code |
| phone | VARCHAR(50) | Contact phone number |
| email | VARCHAR(255) | Contact email |
| is_active | BOOLEAN | Soft-delete flag |
| created_at | TIMESTAMP | Row creation time |
| updated_at | TIMESTAMP | Row update time |

## Products

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique product identifier |
| sku | VARCHAR(50) (UNIQUE) | Stock keeping unit code |
| name | VARCHAR(255) | Product name |
| description | TEXT | Product description |
| category | VARCHAR(100) | Product category (Grain, Seed, Fertilizer, Chemical, Feed) |
| unit | VARCHAR(50) | Unit of measure (lbs, bu, ton, gal, each) |
| unit_price | DECIMAL(10,2) | Price per unit |
| current_stock | DECIMAL(10,3) | Current inventory quantity |
| reorder_point | DECIMAL(10,3) | Stock level triggering reorder alert |
| is_active | BOOLEAN | Soft-delete flag |
| created_at | TIMESTAMP | Row creation time |
| updated_at | TIMESTAMP | Row update time |

## Orders

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique order identifier |
| order_number | VARCHAR(50) (UNIQUE) | Human-readable order number (PR-YYYY-XXXXX) |
| farm_id | INT (FK) | Reference to farms.id |
| status | ENUM | Order status: draft, pending, confirmed, shipped, delivered, cancelled |
| order_date | DATE | Date the order was placed |
| requested_delivery_date | DATE | Customer's requested delivery date |
| actual_delivery_date | DATE | Actual delivery date |
| subtotal | DECIMAL(12,2) | Sum of line item totals |
| tax_amount | DECIMAL(12,2) | Calculated tax (7% of subtotal) |
| total_amount | DECIMAL(12,2) | subtotal + tax_amount |
| notes | TEXT | Order-level notes |
| idempotency_key | VARCHAR(255) (UNIQUE) | Key for idempotent creation |
| created_at | TIMESTAMP | Row creation time |
| updated_at | TIMESTAMP | Row update time |

## Order Lines

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique line item identifier |
| order_id | INT (FK) | Reference to orders.id (CASCADE delete) |
| product_id | INT (FK) | Reference to products.id |
| quantity | DECIMAL(10,3) | Quantity ordered |
| unit_price | DECIMAL(10,2) | Price snapshot at time of order |
| line_total | DECIMAL(12,2) | quantity * unit_price |
| created_at | TIMESTAMP | Row creation time |

## Notes

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique note identifier |
| notable_type | ENUM('order','farm','product') | Polymorphic parent type |
| notable_id | INT | Polymorphic parent ID |
| content | TEXT | Note body |
| author | VARCHAR(255) | Note author name |
| is_internal | BOOLEAN | Internal flag (hidden from customers) |
| created_at | TIMESTAMP | Row creation time |
| updated_at | TIMESTAMP | Row update time |

## Relationships

- Farms 1---* Orders (farm_id)
- Orders 1---* Order Lines (order_id, CASCADE delete)
- Order Lines *---1 Products (product_id)
- Notes (polymorphic): notable_type + notable_id reference any of Orders, Farms, or Products
# Cernio - Requirements Document

## Executive Summary

Cernio is a competitive web and mobile application for demolition contractors that combines project management with a unique salvage-to-auction marketplace. This document provides complete technical and functional requirements for the entire platform.

**Key Differentiator:** Integration of salvage material management with an online auction marketplace, plus a unique "Salvage Credit" feature in estimates that makes bids more competitive.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technical Architecture](#technical-architecture)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Module A: Project & Financial Management](#module-a-project--financial-management)
5. [Module B: Salvage & Marketplace](#module-b-salvage--marketplace)
6. [Database Schema](#database-schema)
7. [API Specifications](#api-specifications)
8. [Integration Requirements](#integration-requirements)
9. [Security Requirements](#security-requirements)
10. [Performance Requirements](#performance-requirements)
11. [Implementation Phases](#implementation-phases)

---

## System Overview

### Platform Components

1. **Web Application (Contractor Portal)** - Primary interface for demolition contractors
2. **Mobile Application (iOS/Android)** - Field data collection and time tracking
3. **Public Marketplace** - Consumer-facing auction website for salvaged materials
4. **Admin Dashboard** - System administration and analytics

### Technology Stack

**Frontend:**
- Web: React 18+ with TypeScript, Tailwind CSS
- Mobile: React Native with TypeScript
- Marketplace: Next.js 14+ with TypeScript (SSR for SEO)

**Backend:**
- API Framework: NestJS (Node.js + TypeScript)
- Database: PostgreSQL 15+
- Cache: Redis
- File Storage: AWS S3 / Azure Blob Storage
- Real-time: WebSocket (Socket.io)

**Infrastructure:**
- Containerization: Docker
- Orchestration: Kubernetes (EKS/GKE)
- CI/CD: GitHub Actions
- Monitoring: DataDog / New Relic

---

## Technical Architecture

### Architecture Pattern
**Modular Monolith** (microservices-ready)
- Organized by bounded contexts
- Clear module boundaries
- Shared database with multi-tenancy
- Event-driven communication between modules

### Multi-Tenancy Strategy
- **Tenant Isolation:** Row-level isolation via `company_id` foreign key
- **Schema Design:** All business tables include `company_id` column with index
- **Data Access:** Repository pattern enforces tenant filtering at ORM level
- **API Security:** JWT tokens include `company_id` claim, middleware validates access

### API Design Principles
- RESTful conventions
- OpenAPI 3.0 specification
- Versioned endpoints (`/api/v1/`)
- HATEOAS for discoverability
- Consistent error responses (RFC 7807)

### Event Sourcing for AI Training
All business events stored for future AI Estimator:
- Estimate created/modified
- Bid submitted/won/lost
- Actual costs recorded
- Salvage items sold with prices
- Change orders and reasons

---

## User Roles & Permissions

### Role Hierarchy

**1. System Admin** (Cernio Staff)
- Full system access
- Manage all companies
- View analytics across tenants
- Feature flag management

**2. Company Admin**
- Manage company settings
- User management (invite, deactivate)
- View all company data
- Configure integrations
- Billing management

**3. Project Manager**
- Create/edit projects
- Manage estimates and bids
- Approve change orders
- View financial reports
- Assign crews to jobs

**4. Field Worker**
- Mobile app access only
- Log time entries
- Submit expenses
- Capture salvage photos
- View assigned jobs

**5. Accountant** (read-only)
- View financial data
- Export reports
- No edit permissions

**6. Marketplace User** (Public)
- Register/login
- Browse salvage items
- Place bids
- Make payments
- View order history

### Permission Matrix

| Feature | System Admin | Company Admin | Project Manager | Field Worker | Accountant |
|---------|--------------|---------------|-----------------|--------------|------------|
| User Management | ✓ | ✓ | ✗ | ✗ | ✗ |
| Create Projects | ✓ | ✓ | ✓ | ✗ | ✗ |
| Create Estimates | ✓ | ✓ | ✓ | ✗ | ✗ |
| View Financials | ✓ | ✓ | ✓ | ✗ | ✓ |
| Log Time | ✓ | ✓ | ✓ | ✓ | ✗ |
| Manage Salvage | ✓ | ✓ | ✓ | View Only | ✗ |
| Generate Reports | ✓ | ✓ | ✓ | ✗ | ✓ |

---

## Module A: Project & Financial Management

### A1. Client & Lead Management (CRM)

**Purpose:** Track clients, prospects, and sales pipeline

**Features:**

1. **Client Database**
   - Company name, contact info, billing address
   - Primary contact with role
   - Client type (residential, commercial, industrial, municipal)
   - Custom fields support
   - Interaction history timeline

2. **Lead Tracking**
   - Lead source (referral, web, cold call, etc.)
   - Lead status (new, contacted, qualified, proposal sent, won, lost)
   - Assigned salesperson
   - Expected value and close date
   - Notes and attachments

3. **Sales Pipeline**
   - Kanban board view of leads
   - Drag-and-drop stage progression
   - Pipeline value calculations
   - Win/loss analysis

**API Endpoints:**
```
POST   /api/v1/clients
GET    /api/v1/clients
GET    /api/v1/clients/:id
PUT    /api/v1/clients/:id
DELETE /api/v1/clients/:id

POST   /api/v1/leads
GET    /api/v1/leads
PUT    /api/v1/leads/:id/stage
GET    /api/v1/pipeline/summary
```

**Database Tables:**
- `clients` (id, company_id, name, type, billing_address, created_at)
- `client_contacts` (id, client_id, name, email, phone, role, is_primary)
- `leads` (id, company_id, client_id, source, status, value, close_date, assigned_to)
- `interactions` (id, lead_id, type, notes, user_id, created_at)

---

### A2. Estimating & Bidding

**Purpose:** Build project estimates from cost catalog, generate competitive bids

**Features:**

1. **Cost Catalog Management**
   - Labor rates by trade/skill level
   - Equipment costs (hourly/daily rates)
   - Material costs with suppliers
   - Subcontractor rates
   - Disposal fees by material type
   - Version history for price changes

2. **Estimate Builder**
   - Line-item entry system
   - Quantity takeoff tools
   - Markup % configuration (overhead, profit)
   - Contingency allowances
   - **Salvage Credit Line Item** (unique feature)
   - Estimate templates for common job types
   - Copy from previous estimates

3. **Salvage Credit Calculator**
   - Input expected salvage items (copper, steel, fixtures, etc.)
   - Reference historical auction prices
   - Apply conservative discount factor (e.g., 60% of avg sale price)
   - Display as credit reducing total bid amount
   - Track accuracy post-project for AI learning

4. **Bid Package Generation**
   - Detailed cost breakdown (internal view)
   - Client-facing summary (hide markup details)
   - Competitor bid comparison tool
   - Win probability calculator (based on history)

**Business Rules:**
- Estimates can be in "Draft", "Submitted", "Won", "Lost" status
- Only Company Admin or PM can submit bids
- Salvage credits cannot exceed 20% of total project cost (safety limit)
- Estimate must be approved before converting to project

**API Endpoints:**
```
POST   /api/v1/cost-catalog/items
GET    /api/v1/cost-catalog/items
PUT    /api/v1/cost-catalog/items/:id

POST   /api/v1/estimates
GET    /api/v1/estimates
GET    /api/v1/estimates/:id
PUT    /api/v1/estimates/:id
POST   /api/v1/estimates/:id/line-items
DELETE /api/v1/estimates/:id/line-items/:lineId
POST   /api/v1/estimates/:id/salvage-credit
POST   /api/v1/estimates/:id/submit
POST   /api/v1/estimates/:id/clone
```

**Database Tables:**
```sql
cost_catalog (
  id, company_id, category, name, unit, 
  cost, supplier, notes, effective_date, 
  is_active, created_at
)

estimates (
  id, company_id, client_id, lead_id, 
  name, status, total_cost, markup_pct, 
  contingency_pct, salvage_credit, 
  final_bid_amount, submitted_at, 
  won_at, created_by, created_at
)

estimate_line_items (
  id, estimate_id, cost_catalog_id, 
  description, quantity, unit, unit_cost, 
  total, created_at
)

salvage_credits (
  id, estimate_id, item_description, 
  expected_quantity, estimated_value, 
  confidence_level, created_at
)
```

---

### A3. Proposals & Contracts

**Purpose:** Generate professional proposals, capture e-signatures

**Features:**

1. **Proposal Generation**
   - Convert estimate to formatted proposal
   - Customizable templates (company branding)
   - Include scope of work, timeline, payment terms
   - Exclude/include salvage credit explanation
   - PDF export with watermark (draft vs final)

2. **E-Signature Integration**
   - DocuSign API integration
   - Send proposal for signature
   - Track signing status
   - Auto-archive signed contracts to S3
   - Email notifications on completion

3. **Contract Management**
   - Store signed contracts
   - Link to project record
   - Version control for amendments
   - Expiration date tracking
   - Search and retrieval

**Business Rules:**
- Proposals locked after sending for signature
- Signed contract required to create project
- Amendments generate new contract version
- All contracts encrypted at rest

**API Endpoints:**
```
POST   /api/v1/proposals
GET    /api/v1/proposals/:id
POST   /api/v1/proposals/:id/send-for-signature
GET    /api/v1/proposals/:id/signature-status
GET    /api/v1/contracts/:id/download
```

**Database Tables:**
```sql
proposals (
  id, estimate_id, company_id, 
  template_id, content_json, pdf_url, 
  status, sent_at, created_at
)

contracts (
  id, proposal_id, project_id, 
  docusign_envelope_id, signed_pdf_url, 
  signed_at, expires_at, version, 
  is_active, created_at
)
```

---

### A4. Core Project Management

**Purpose:** Central hub for managing active demolition jobs

**Features:**

1. **Project Dashboard**
   - Project list with filters (status, date range, PM)
   - Project cards showing health metrics
   - Quick stats: budget vs actual, days elapsed, completion %
   - Color-coded status indicators

2. **Project Details**
   - Client info with contact links
   - Contract value and payment schedule
   - Start/end dates with Gantt view
   - Assigned team members
   - Project location map
   - Key milestones and deliverables

3. **Project Status Management**
   - Lifecycle: Planning → In Progress → On Hold → Completed → Closed
   - Status change requires reason/notes
   - Automatic notifications on status change
   - Archive completed projects after 1 year

4. **Document Management**
   - Upload permits, drawings, photos
   - Organize by category
   - Version control
   - Share with client portal (future)

5. **Budget Tracking**
   - Original budget vs actual costs
   - Budget categories (labor, equipment, disposal, subcontractors)
   - Variance alerts (>10% over budget)
   - Forecast to completion

**API Endpoints:**
```
POST   /api/v1/projects
GET    /api/v1/projects
GET    /api/v1/projects/:id
PUT    /api/v1/projects/:id
PUT    /api/v1/projects/:id/status
POST   /api/v1/projects/:id/documents
GET    /api/v1/projects/:id/budget-summary
```

**Database Tables:**
```sql
projects (
  id, company_id, client_id, contract_id, 
  name, description, status, site_address, 
  budget, start_date, end_date, 
  completion_pct, assigned_pm_id, 
  created_at, completed_at
)

project_documents (
  id, project_id, name, category, 
  file_url, file_size, uploaded_by, 
  version, created_at
)

budget_snapshots (
  id, project_id, snapshot_date, 
  labor_budget, labor_actual, 
  equipment_budget, equipment_actual, 
  disposal_budget, disposal_actual, 
  created_at
)
```

---

### A5. Change Order Management

**Purpose:** Track scope changes and additional work authorization

**Features:**

1. **Change Order Creation**
   - Link to parent project
   - Description of change
   - Reason for change (client request, unforeseen conditions, etc.)
   - Cost impact (add/subtract)
   - Schedule impact (days added/removed)
   - Supporting photos/documents

2. **Approval Workflow**
   - Internal review by PM
   - Send to client for approval
   - E-signature integration
   - Track approval status
   - Automatic budget adjustment upon approval

3. **Change Order History**
   - Timeline view of all changes
   - Cumulative impact on budget/schedule
   - Approval audit trail

**Business Rules:**
- Change orders require client signature if cost > $500
- Budget automatically updates only when CO approved
- Cannot delete approved change orders (audit requirement)

**API Endpoints:**
```
POST   /api/v1/projects/:projectId/change-orders
GET    /api/v1/projects/:projectId/change-orders
GET    /api/v1/change-orders/:id
PUT    /api/v1/change-orders/:id/approve
POST   /api/v1/change-orders/:id/send-for-signature
```

**Database Tables:**
```sql
change_orders (
  id, project_id, co_number, description, 
  reason, cost_impact, days_impact, 
  status, requested_by, approved_by, 
  approved_at, created_at
)

change_order_items (
  id, change_order_id, description, 
  quantity, unit_cost, total, created_at
)
```

---

### A6. Subcontractor Management (Lite)

**Purpose:** Issue work orders and track subcontractor costs

**Features:**

1. **Subcontractor Database**
   - Company info and contacts
   - Trade specialties
   - Insurance cert tracking (expiration alerts)
   - Performance ratings
   - Payment terms

2. **Work Order Management**
   - Create work order from project
   - Scope of work description
   - Agreed price or hourly rate
   - Start/end dates
   - Status tracking (pending, active, completed)

3. **Subcontractor Invoice Logging**
   - Upload invoice PDF
   - Log amount against work order
   - Link to project cost tracking
   - Payment status (pending, paid)
   - No 3-way PO match (MVP exclusion)

**API Endpoints:**
```
POST   /api/v1/subcontractors
GET    /api/v1/subcontractors
GET    /api/v1/subcontractors/:id
POST   /api/v1/work-orders
GET    /api/v1/projects/:projectId/work-orders
POST   /api/v1/work-orders/:id/invoices
```

**Database Tables:**
```sql
subcontractors (
  id, company_id, name, trade, 
  contact_name, email, phone, 
  insurance_exp_date, payment_terms, 
  rating, is_active, created_at
)

work_orders (
  id, project_id, subcontractor_id, 
  wo_number, description, agreed_amount, 
  start_date, end_date, status, 
  created_at
)

subcontractor_invoices (
  id, work_order_id, invoice_number, 
  amount, invoice_date, pdf_url, 
  payment_status, paid_date, created_at
)
```

---

### A7. Field Data Collection (Mobile)

**Purpose:** Mobile app for crews to log time and expenses in real-time

**Features:**

1. **Time Tracking**
   - Clock in/out per project
   - Break time tracking
   - Job selection from assigned list
   - Offline support with sync
   - GPS verification (optional)
   - Weekly timesheet review

2. **Expense Logging**
   - Photo receipt capture
   - Expense category (fuel, materials, tools, meals)
   - Amount and merchant
   - Mileage tracker
   - Link to project

3. **Daily Reports**
   - End-of-day summary
   - Work completed today
   - Issues encountered
   - Safety incidents
   - Weather conditions

**Mobile-Specific Requirements:**
- Offline-first architecture
- Photo compression before upload
- Queue failed uploads for retry
- Push notifications for new assignments
- Biometric authentication option

**API Endpoints:**
```
POST   /api/v1/mobile/time-entries
PUT    /api/v1/mobile/time-entries/:id/clock-out
GET    /api/v1/mobile/my-timesheets
POST   /api/v1/mobile/expenses
POST   /api/v1/mobile/daily-reports
GET    /api/v1/mobile/assigned-projects
```

**Database Tables:**
```sql
time_entries (
  id, company_id, user_id, project_id, 
  clock_in, clock_out, break_minutes, 
  total_hours, gps_coords, 
  submitted_at, approved_by, created_at
)

field_expenses (
  id, company_id, user_id, project_id, 
  category, amount, merchant, 
  receipt_url, mileage_miles, 
  expense_date, approved_by, created_at
)

daily_reports (
  id, project_id, user_id, report_date, 
  work_completed, issues, safety_notes, 
  weather, created_at
)
```

---

### A8. Basic Invoicing

**Purpose:** Generate client invoices based on contracts and change orders

**Features:**

1. **Invoice Generation**
   - Progress billing (% complete)
   - Milestone billing (per contract schedule)
   - Time & materials billing
   - Include approved change orders
   - Itemized or lump sum format

2. **Invoice Management**
   - Invoice numbering (auto-increment)
   - Due date calculation (net 30, net 60, etc.)
   - Payment tracking (paid, partial, overdue)
   - Late payment reminders (automated emails)
   - Credit memo support

3. **Payment Recording**
   - Log payment date and amount
   - Payment method
   - Reference number (check #, transaction ID)
   - Partial payment allocation

**Business Rules:**
- Invoice cannot exceed contract value + approved COs
- Retainage % held back per contract terms (e.g., 10%)
- Final invoice releases retainage upon project completion
- Cannot delete invoices (void only, for audit trail)

**API Endpoints:**
```
POST   /api/v1/invoices
GET    /api/v1/projects/:projectId/invoices
GET    /api/v1/invoices/:id
POST   /api/v1/invoices/:id/send
POST   /api/v1/invoices/:id/payments
PUT    /api/v1/invoices/:id/void
GET    /api/v1/invoices/overdue
```

**Database Tables:**
```sql
invoices (
  id, company_id, project_id, 
  invoice_number, invoice_date, due_date, 
  subtotal, tax, total, retainage_pct, 
  retainage_amount, status, 
  sent_at, created_at
)

invoice_line_items (
  id, invoice_id, description, 
  quantity, rate, amount, created_at
)

payments (
  id, invoice_id, payment_date, 
  amount, payment_method, reference, 
  created_by, created_at
)
```

---

### A9. Scheduling (Lite)

**Purpose:** Visual calendar for project timelines and crew assignments

**Features:**

1. **Project Calendar**
   - Month/week/day views
   - Drag-and-drop scheduling
   - Color-coded by project
   - Conflict detection (double-booked crews)

2. **Crew Assignment**
   - Assign crews to projects by date range
   - Equipment allocation
   - Availability checking
   - Mobile push notifications on assignment

3. **Schedule Views**
   - Timeline view (Gantt-style)
   - Resource utilization chart
   - Upcoming jobs list (next 7/30 days)

**MVP Exclusions:**
- No route optimization
- No automated scheduling (manual only)
- No integration with Google Calendar

**API Endpoints:**
```
GET    /api/v1/schedule?start_date=X&end_date=Y
POST   /api/v1/schedule/assignments
PUT    /api/v1/schedule/assignments/:id
DELETE /api/v1/schedule/assignments/:id
GET    /api/v1/schedule/conflicts
```

**Database Tables:**
```sql
schedule_assignments (
  id, project_id, user_id, 
  start_date, end_date, role, 
  notes, created_by, created_at
)

equipment_assignments (
  id, project_id, equipment_id, 
  start_date, end_date, 
  created_by, created_at
)
```

---

### A10. Cost Tracking & Reporting

**Purpose:** Monitor project profitability and generate financial reports

**Features:**

1. **Cost Aggregation**
   - Automatic cost rollup from:
     - Time entries (labor cost)
     - Field expenses
     - Subcontractor invoices
     - Equipment usage
     - Materials purchased
   - Real-time vs batch updates (configurable)

2. **Reports**
   - **Project P&L:** Revenue vs costs by category
   - **Job Costing Report:** Estimated vs actual by line item
   - **Labor Analysis:** Hours and cost by project/crew
   - **Equipment Utilization:** Usage rates and revenue
   - **Client Summary:** All projects with profitability
   - **Company Dashboard:** Company-wide metrics

3. **Export Capabilities**
   - CSV export for all reports
   - Excel format with formatting
   - Date range filtering
   - **Accounting-Ready CSV:** Format for QuickBooks import
     - Chart of accounts mapping
     - Journal entry format (debit/credit)
     - Vendor/customer cross-reference

**Accounting-Ready Schema Design:**
Even though MVP doesn't have live sync, database structure supports future integration:
- `journal_entries` table (double-entry ready)
- `accounts` table (chart of accounts)
- `transactions` table with proper GL account codes

**API Endpoints:**
```
GET    /api/v1/reports/project-pl/:projectId
GET    /api/v1/reports/job-costing/:projectId
GET    /api/v1/reports/labor-summary?start=X&end=Y
GET    /api/v1/reports/company-dashboard
POST   /api/v1/reports/export-csv
POST   /api/v1/accounting/export-journal-entries
```

**Database Tables:**
```sql
project_costs (
  id, project_id, cost_type, 
  description, amount, cost_date, 
  source_table, source_id, 
  gl_account_code, created_at
)

accounts (
  id, company_id, account_number, 
  account_name, account_type, 
  parent_account_id, is_active
)

journal_entries (
  id, company_id, entry_date, 
  description, reference, 
  created_at
)

journal_entry_lines (
  id, journal_entry_id, account_id, 
  debit, credit, memo
)
```

---

## Module B: Salvage & Marketplace

### B1. Salvage Inventory Management

**Purpose:** Track salvaged materials from demolition jobs as revenue-generating assets

**Features:**

1. **Salvage Item Cataloging**
   - Item captured during demo job
   - Category (fixtures, metals, lumber, architectural, equipment)
   - Condition rating (excellent, good, fair, as-is)
   - Quantity and units
   - Dimensions/specifications
   - Multi-photo upload (min 3, max 10)
   - Storage location on-site or warehouse

2. **Item Valuation**
   - Reference similar past sales
   - Suggested starting bid (algorithm)
   - Reserve price (minimum acceptable)
   - Estimated market value range

3. **Inventory Status**
   - Available (ready to list)
   - Listed (active auction)
   - Sold (payment pending or completed)
   - Shipped
   - Unsold (auction ended, no bids)

4. **Batch Operations**
   - Bulk upload via CSV
   - Batch listing to marketplace
   - Bulk photo upload (drag-and-drop)

**API Endpoints:**
```
POST   /api/v1/salvage-items
GET    /api/v1/projects/:projectId/salvage-items
GET    /api/v1/salvage-items/:id
PUT    /api/v1/salvage-items/:id
POST   /api/v1/salvage-items/:id/photos
DELETE /api/v1/salvage-items/:id/photos/:photoId
POST   /api/v1/salvage-items/batch-list
```

**Database Tables:**
```sql
salvage_items (
  id, company_id, project_id, 
  category, title, description, 
  condition, quantity, unit, 
  dimensions, storage_location, 
  estimated_value, reserve_price, 
  status, created_at
)

salvage_photos (
  id, salvage_item_id, photo_url, 
  is_primary, display_order, 
  uploaded_at
)
```

---

### B2. Online Auction Marketplace

**Purpose:** Public-facing website for buyers to bid on salvaged materials

**Features:**

1. **Marketplace Frontend (Next.js)**
   - Homepage with featured items
   - Category browse pages
   - Search with filters (category, price, location, condition)
   - Item detail page (photos, description, bid history)
   - User registration/login
   - User dashboard (active bids, won items, order history)

2. **Auction Mechanics**
   - **Auction Types:**
     - Standard auction (highest bid wins)
     - Buy-it-now option (fixed price)
     - Reserve price (hidden from buyers)
   - **Bidding Rules:**
     - Minimum bid increment ($5 or 5% of current bid)
     - Proxy bidding (auto-bid up to max)
     - Anti-snipe: If bid in last 5 min, extend 5 min
   - **Auction Duration:** 3, 5, or 7 days (seller choice)

3. **Real-Time Bidding**
   - WebSocket connection for live updates
   - Bid placed → all watchers notified instantly
   - Current high bidder indicator
   - Bid count display
   - Time remaining countdown

4. **Buyer Experience**
   - Watch list / favorites
   - Bid notifications (email + push)
   - Outbid alerts
   - Won item notifications
   - Payment reminders

5. **Post-Auction**
   - Winner notified immediately
   - Invoice generated with payment link
   - Payment via Stripe (credit card, ACH)
   - Pickup or shipping options
   - Buyer/seller messaging

6. **Marketplace Administration**
   - Approve new item listings (quality check)
   - Monitor for fraud/spam
   - Handle disputes
   - Analytics (views, bids, conversion rate)

**Business Rules:**
- Buyers must register and verify email
- Buyer can bid on unlimited items but limit 5 active auctions per new user (fraud prevention)
- Payment required within 48 hours of winning
- Seller receives payout after buyer pickup/delivery confirmed
- 10% marketplace fee on final sale price (deducted from seller payout)

**API Endpoints:**
```
# Public (no auth)
GET    /api/v1/marketplace/items?category=X&page=1
GET    /api/v1/marketplace/items/:id
GET    /api/v1/marketplace/categories

# Authenticated buyers
POST   /api/v1/marketplace/register
POST   /api/v1/marketplace/login
POST   /api/v1/marketplace/bids
GET    /api/v1/marketplace/my-bids
GET    /api/v1/marketplace/watchlist
POST   /api/v1/marketplace/watchlist/:itemId

# WebSocket
WS     /api/v1/marketplace/live-auctions/:itemId

# Admin (contractor portal)
POST   /api/v1/marketplace/listings
PUT    /api/v1/marketplace/listings/:id/approve
GET    /api/v1/marketplace/analytics
```

**Database Tables:**
```sql
marketplace_users (
  id, email, password_hash, 
  first_name, last_name, phone, 
  address, email_verified, 
  reputation_score, created_at
)

auction_listings (
  id, salvage_item_id, 
  title, description, starting_bid, 
  reserve_price, buy_now_price, 
  start_time, end_time, status, 
  view_count, created_at
)

bids (
  id, listing_id, bidder_id, 
  bid_amount, max_bid (proxy), 
  is_winning, bid_time
)

watchlist (
  user_id, listing_id, added_at
)

orders (
  id, listing_id, buyer_id, 
  final_price, marketplace_fee, 
  seller_payout, payment_status, 
  payment_date, fulfillment_status, 
  created_at
)
```

---

## Database Schema

### Complete Entity Relationship Diagram (ERD)

```
companies (multi-tenant root)
├── users (employees)
├── clients
│   └── client_contacts
├── leads
│   └── interactions
├── cost_catalog
├── estimates
│   ├── estimate_line_items
│   └── salvage_credits
├── proposals
├── contracts
├── projects
│   ├── project_documents
│   ├── budget_snapshots
│   ├── change_orders
│   │   └── change_order_items
│   ├── work_orders
│   │   └── subcontractor_invoices
│   ├── invoices
│   │   ├── invoice_line_items
│   │   └── payments
│   ├── time_entries
│   ├── field_expenses
│   ├── daily_reports
│   ├── schedule_assignments
│   ├── equipment_assignments
│   ├── project_costs
│   └── salvage_items
│       ├── salvage_photos
│       └── auction_listings
│           ├── bids
│           └── orders
├── subcontractors
├── accounts (chart of accounts)
├── journal_entries
│   └── journal_entry_lines
└── audit_events (event sourcing)

marketplace_users (separate tenant)
├── watchlist
└── buyer_profiles
```

### Key Schema Considerations

1. **Multi-Tenancy**
   - All business tables include `company_id` with index
   - Foreign keys enforce referential integrity within tenant
   - RLS policies at database level (optional, adds security layer)

2. **Soft Deletes**
   - Use `deleted_at` timestamp instead of hard deletes
   - Preserve audit trail
   - Financial records never deleted

3. **Timestamps**
   - All tables: `created_at`, `updated_at`
   - Use `timestamptz` (timezone-aware)

4. **Indexing Strategy**
   - Composite index on (`company_id`, frequently queried column)
   - Full-text search indexes on descriptions
   - JSONB GIN indexes where applicable

5. **Data Types**
   - Money values: `NUMERIC(12,2)` (avoid floating point)
   - Percentages: `NUMERIC(5,2)` (e.g., 15.75%)
   - JSON metadata: `JSONB` (queryable)

---

## API Specifications

### RESTful API Standards

**Base URL:** `https://api.cernio.com/v1`

**Authentication:**
- JWT tokens (Bearer scheme)
- Access token (short-lived, 15 min)
- Refresh token (long-lived, 30 days)
- Token includes: `user_id`, `company_id`, `role`

**Request Format:**
```json
{
  "headers": {
    "Authorization": "Bearer {access_token}",
    "Content-Type": "application/json",
    "X-Company-ID": "{company_id}"
  }
}
```

**Response Format (Success):**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

**Response Format (Error - RFC 7807):**
```json
{
  "type": "/errors/validation-error",
  "title": "Validation Failed",
  "status": 400,
  "detail": "One or more fields failed validation",
  "instance": "/api/v1/estimates",
  "errors": [
    {
      "field": "client_id",
      "message": "Client ID is required"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` - Successful GET/PUT
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Business rule violation
- `422 Unprocessable Entity` - Semantic error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server fault

**Rate Limiting:**
- Public API: 100 requests/min per IP
- Authenticated: 1000 requests/min per user
- Marketplace bidding: 30 bids/min per user

**Pagination:**
- Query params: `?page=1&per_page=20`
- Default: 20 items per page
- Max: 100 items per page
- Response includes `meta` with pagination info

**Filtering:**
- Query params: `?status=active&created_after=2024-01-01`
- Support common operators: `eq`, `gt`, `lt`, `gte`, `lte`, `like`
- Example: `?cost_gt=1000&cost_lt=5000`

**Sorting:**
- Query param: `?sort=-created_at,name` (minus = desc)
- Multiple fields comma-separated

**Field Selection:**
- Query param: `?fields=id,name,status`
- Reduce payload size for mobile

---

## Integration Requirements

### Email Service (SendGrid / AWS SES)

**Transactional Emails:**
- Welcome email on registration
- Email verification
- Password reset
- Proposal sent notification
- E-signature completion
- Invoice sent
- Payment received
- Auction outbid alert
- Auction won notification
- Order confirmation

**Email Templates:**
- HTML templates with company branding
- Plain text fallback
- Unsubscribe link (compliance)
- Track open rates and clicks

**API Integration:**
```javascript
POST /api/v1/emails/send
{
  "to": "user@example.com",
  "template": "invoice_sent",
  "data": {
    "invoice_number": "INV-1234",
    "amount": "$5,000",
    "due_date": "2024-02-15"
  }
}
```

---

### E-Signature (DocuSign API)

**Integration Points:**
- Send proposal for signature
- Track signing status via webhook
- Retrieve signed PDF
- Store in S3 with encryption

**DocuSign Workflow:**
1. Create envelope with PDF
2. Add signer(s) with email
3. Send envelope
4. Webhook notification on signature
5. Download completed document

**API Endpoints (DocuSign):**
- `POST /envelopes` - Create and send
- `GET /envelopes/{id}` - Get status
- `GET /envelopes/{id}/documents/combined` - Download PDF

---

### Payment Processing (Stripe)

**Use Cases:**
- Marketplace auction payments
- Future: Subscription billing for SaaS

**Stripe Integration:**
- Checkout Sessions for marketplace
- Payment Intents for flexibility
- Webhooks for payment events
- Customer portal for saved cards

**Security:**
- Never store credit card numbers
- PCI-DSS compliance via Stripe
- Tokenization for repeat payments

**Webhook Events:**
- `payment_intent.succeeded`
- `payment_intent.failed`
- `charge.refunded`

---

### File Storage (AWS S3)

**Bucket Structure:**
```
cernio-prod/
├── companies/{company_id}/
│   ├── documents/
│   ├── proposals/
│   ├── contracts/
│   └── receipts/
└── marketplace/
    └── salvage-photos/{item_id}/
```

**Access Control:**
- Private bucket (not public)
- Pre-signed URLs for downloads (expire in 1 hour)
- CloudFront CDN for marketplace photos
- Lifecycle rules (archive to Glacier after 2 years)

**Image Processing:**
- Resize salvage photos (multiple sizes)
- Compress for web delivery
- Generate thumbnails
- Watermark preview images (optional)

---

### SMS Notifications (Twilio - Optional)

**Use Cases:**
- Critical auction alerts (last 10 min)
- Payment reminders
- Job assignment notifications

---

### Accounting Export (Future: QuickBooks Online)

**MVP: CSV Export**
Format for manual QB import:
```csv
Date,Account,Debit,Credit,Memo,Customer,Vendor
2024-01-15,Labor Expense,2500.00,,Project ABC Demo,ABC Corp,
2024-01-15,Accounts Receivable,,2500.00,Invoice INV-001,ABC Corp,
```

**Future Integration:**
- OAuth 2.0 connection to QBO
- Auto-sync invoices, expenses, payments
- Two-way sync (read QB customers)
- Conflict resolution rules

---

## Security Requirements

### Authentication & Authorization

1. **Password Policy**
   - Minimum 12 characters
   - Require: uppercase, lowercase, number, special char
   - Hashed with bcrypt (cost factor 12)
   - No password reuse (last 5 passwords)
   - Force reset every 180 days (optional)

2. **Multi-Factor Authentication (MFA)**
   - TOTP (Google Authenticator, Authy)
   - SMS backup option
   - Required for Company Admin role
   - Optional for other roles

3. **Session Management**
   - JWT with short expiration
   - Refresh token rotation
   - Revoke all sessions on password change
   - IP allowlist for admin accounts (optional)

4. **Role-Based Access Control (RBAC)**
   - Roles defined at company level
   - Permissions checked at API level
   - Frontend hides unauthorized UI elements
   - Audit log for permission changes

### Data Security

1. **Encryption**
   - At rest: AES-256 (database, S3)
   - In transit: TLS 1.3 only
   - Sensitive fields: PII encrypted in DB

2. **PII Protection**
   - GDPR compliance for EU users
   - Right to erasure (delete account)
   - Data export capability
   - Anonymize data in analytics

3. **API Security**
   - OWASP Top 10 mitigations
   - SQL injection prevention (ORM)
   - XSS protection (input sanitization)
   - CSRF tokens for state-changing requests
   - Rate limiting (DDoS protection)

4. **Audit Logging**
   - All financial transactions logged
   - User actions on sensitive data
   - Failed login attempts
   - Permission changes
   - Export to SIEM (future)

### Compliance

- **PCI-DSS:** Required for credit card processing (Stripe handles)
- **SOC 2 Type II:** Target for enterprise sales
- **GDPR:** For European users
- **CCPA:** For California users

---

## Performance Requirements

### Response Time SLAs

- **API Endpoints:** 
  - 95th percentile < 500ms
  - 99th percentile < 1s
- **Web Page Load:** < 3s (FCP)
- **Mobile App Launch:** < 2s
- **Real-Time Bidding:** < 100ms latency

### Scalability Targets

- **Users:** Support 10,000 concurrent users
- **Companies:** 1,000 companies (multi-tenant)
- **Projects:** 100,000 active projects
- **Marketplace Listings:** 50,000 active auctions
- **Database:** Query optimization for 10M+ rows

### Availability

- **Uptime SLA:** 99.9% (< 8.76 hours downtime/year)
- **Maintenance Windows:** Sunday 2-4 AM EST
- **Disaster Recovery:** RPO 1 hour, RTO 4 hours

### Caching Strategy

1. **Application Cache (Redis)**
   - User sessions
   - Frequently accessed data (cost catalog)
   - Real-time auction state

2. **CDN Caching**
   - Static assets (CSS, JS, images)
   - Marketplace photos
   - Public API responses (5 min TTL)

3. **Database Query Cache**
   - Materialized views for reports
   - Refresh nightly or on-demand

---

## Implementation Phases

### Phase 1: Foundation & First Vertical Slice (Months 1-3)

**Goal:** Deploy a working system with core authentication and project creation

**Features:**
- User registration and authentication (email verification)
- Company onboarding flow
- User management (invite users, assign roles)
- Client database (CRUD)
- Project creation and dashboard
- Basic document upload
- Deploy to staging environment

**Deliverables:**
- Working web app (React)
- REST API (NestJS + PostgreSQL)
- CI/CD pipeline (GitHub Actions)
- Docker containers
- Kubernetes deployment scripts
- Unit tests (>80% coverage)

**Tech Debt Accepted:**
- No mobile app yet
- No advanced features
- Manual deployment to production

**Success Criteria:**
- 5 beta users can register, create company, add 1 project
- API response times < 500ms
- Zero critical bugs in staging

---

### Phase 2: Estimating & Project Management Core (Months 4-5)

**Features:**
- Cost catalog management
- Estimate builder with line items
- **Salvage credit calculator** (unique feature!)
- Proposal generation (PDF)
- E-signature integration (DocuSign)
- Contract management
- Project status tracking
- Change order management
- Subcontractor database and work orders

**Deliverables:**
- Complete Module A (features 1-6)
- Email notifications
- PDF generation service
- Integration tests

**Success Criteria:**
- User can create estimate, generate proposal, get signature, create project
- 10 beta users actively testing

---

### Phase 3: Field & Financial Operations (Months 6-7)

**Features:**
- Mobile app (React Native) - iOS and Android
- Time tracking (clock in/out)
- Expense logging with photo receipts
- Basic scheduling calendar
- Invoicing system
- Payment tracking
- Cost aggregation and rollup
- Financial reports (P&L, job costing)
- CSV export for accounting

**Deliverables:**
- Mobile app in TestFlight / Google Play Beta
- Complete Module A (features 7-10)
- Accounting-ready database schema
- API documentation (OpenAPI spec)

**Success Criteria:**
- Field workers can log time from mobile
- PM can generate invoice from project
- Export data to QuickBooks-compatible CSV

---

### Phase 4: Salvage & Marketplace (Months 8-10)

**Features:**
- Salvage inventory management
- Photo upload and organization
- Marketplace website (Next.js)
- Auction listings
- Real-time bidding (WebSocket)
- Buyer registration
- Payment integration (Stripe)
- Order fulfillment workflow
- Marketplace analytics

**Deliverables:**
- Complete Module B
- Public marketplace website (SEO-optimized)
- Real-time bidding engine
- Stripe payment processing
- Email notifications for buyers

**Success Criteria:**
- List 50 salvage items
- Complete 10 successful auction transactions
- Average auction has 3+ bidders

---

### Phase 5: Polish, Analytics & Beta Launch (Months 11-12)

**Features:**
- Advanced analytics dashboard
- Company-wide reporting
- Performance optimization
- Mobile app polish (offline sync)
- User onboarding tutorials
- Help documentation
- Admin tools (user impersonation, feature flags)
- Beta customer feedback loop

**Deliverables:**
- Production-ready system
- User documentation
- Video tutorials
- Marketing website
- Beta launch to 50 companies

**Success Criteria:**
- 50 paying beta customers
- NPS score > 40
- <5 critical bugs per week
- API uptime > 99.5%

---

### Post-MVP Roadmap (Future)

**Months 13-18:**
- QuickBooks Online integration (live sync)
- Mobile app feature parity with web
- Advanced scheduling (route optimization)
- Equipment management module
- Inventory management (materials, not salvage)
- Customer portal (clients view project status)
- Advanced reporting (custom dashboards)

**Months 19-24:**
- **AI Estimator** (train on historical data)
- Predictive analytics (project risk scoring)
- Document OCR (auto-extract data from PDFs)
- Mobile offline mode improvements
- Multi-language support
- White-label option for large contractors

**Year 3+:**
- Marketplace mobile app
- Integration marketplace (Zapier-like)
- API for third-party developers
- Advanced AI features (permit assistance, safety compliance)

---

## Testing Strategy

### Unit Tests
- All business logic functions
- Target: >80% code coverage
- Run on every commit (CI)

### Integration Tests
- API endpoint testing
- Database transactions
- Third-party integrations (mocked)
- Run nightly

### End-to-End Tests
- Critical user flows (Cypress)
- Registration → Project → Invoice
- Estimate → Proposal → Signature
- Salvage → Auction → Payment
- Run before deployment

### Performance Tests
- Load testing (1000 concurrent users)
- Stress testing (find breaking point)
- Spike testing (sudden traffic surge)
- Run monthly

### Security Tests
- OWASP ZAP scanning
- Dependency vulnerability checks (Snyk)
- Penetration testing (quarterly)

---

## Deployment Strategy

### Environments

1. **Development** (`dev`)
   - Auto-deploy on merge to `develop` branch
   - Developers can test integration
   - Seeded with test data

2. **Staging** (`staging`)
   - Production-like environment
   - Auto-deploy on merge to `main` branch
   - Beta users test here
   - Real integrations (DocuSign sandbox, Stripe test mode)

3. **Production** (`prod`)
   - Manual deployment (approval required)
   - Blue-green deployment (zero downtime)
   - Rollback capability
   - Real payment processing

### CI/CD Pipeline (GitHub Actions)

```yaml
# On push to develop:
- Run linters
- Run unit tests
- Build Docker images
- Deploy to dev environment

# On push to main:
- All above steps
- Run integration tests
- Run E2E tests
- Deploy to staging
- Run smoke tests

# On production deploy (manual trigger):
- Deploy to blue environment
- Run health checks
- Switch traffic to blue
- Keep green for rollback (1 hour)
```

### Database Migrations

- Versioned with Flyway or Liquibase
- Applied automatically on deployment
- Backward-compatible (no breaking changes)
- Rollback scripts for safety

### Monitoring & Alerting

**Metrics to Track:**
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Server CPU/memory usage
- Active user count
- Auction bid rate
- Payment success rate

**Alerts:**
- Error rate > 1% (Slack notification)
- API response time > 2s (PagerDuty)
- Database connection pool exhausted (email)
- Payment processing failure (SMS to on-call)

**Dashboards:**
- Real-time operations dashboard
- Business metrics dashboard
- Cost monitoring (AWS spend)

---

## Open Questions & Decisions Needed

### Technical Decisions

1. **Hosting Provider:**
   - AWS (industry standard, expensive)
   - Google Cloud (good Kubernetes, cheaper)
   - Azure (if customers prefer Microsoft)
   - **Recommendation:** Start with GCP for cost

2. **Mobile Framework:**
   - React Native (faster MVP, shared code)
   - Native (Swift + Kotlin, better performance)
   - **Recommendation:** React Native for MVP

3. **Real-Time Bidding:**
   - WebSocket (Socket.io, mature)
   - Server-Sent Events (simpler, one-way)
   - **Recommendation:** WebSocket for full bidding experience

4. **Database Scaling:**
   - Vertical (bigger server)
   - Read replicas (for reports)
   - Sharding (by company_id)
   - **Recommendation:** Start vertical, add replicas at 100k users

### Business Decisions

1. **Marketplace Fee Structure:**
   - 10% of sale price (proposed)
   - Tiered pricing (5% if >$1000 sale)
   - Subscription + lower % (e.g., $50/mo + 5%)
   - **Needs Decision**

2. **Subscription Pricing:**
   - Per user per month ($50/user?)
   - Flat rate per company ($500/mo unlimited?)
   - Tiered by features (Basic/Pro/Enterprise)
   - **Needs Decision**

3. **Free Trial:**
   - 14-day trial (standard SaaS)
   - 30-day trial (longer eval for contractors)
   - Freemium (basic features free, pay for marketplace)
   - **Needs Decision**

4. **Multi-Region:**
   - US-only at launch
   - Expand to Canada, EU later
   - **Recommendation:** US-only MVP

---

## Success Metrics (KPIs)

### Product Metrics

- **User Acquisition:** 500 registered companies in year 1
- **Activation Rate:** 70% of signups create at least 1 project
- **Retention:** 80% monthly retention (sticky product)
- **NPS Score:** >40 (promoters - detractors)

### Business Metrics

- **MRR (Monthly Recurring Revenue):** $50k by month 12
- **Customer Acquisition Cost (CAC):** <$500
- **Lifetime Value (LTV):** >$6000 (LTV:CAC = 12:1)
- **Churn Rate:** <5% monthly

### Marketplace Metrics

- **Listings Per Month:** 500 active auctions
- **Sell-Through Rate:** 60% of items get bids
- **Average Sale Price:** $200 per item
- **Marketplace GMV:** $100k/month by month 12

### Technical Metrics

- **API Uptime:** 99.9%
- **P95 Response Time:** <500ms
- **Deploy Frequency:** 2x per week
- **Mean Time to Recovery (MTTR):** <1 hour

---

## Conclusion

This requirements document provides a complete blueprint for building Cernio, the demolition contractor platform with an integrated salvage marketplace. The phased approach ensures rapid MVP delivery while maintaining architectural quality for future scale.

**Next Steps:**
1. Review and approve this document
2. Set up development environment
3. Begin Phase 1 implementation
4. Recruit beta users for early feedback

**Key Success Factors:**
- Focus on the unique salvage credit feature
- Build marketplace quality (trust and liquidity)
- Maintain data quality for future AI Estimator
- Obsess over contractor workflow efficiency

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-03  
**Owner:** Product Team  
**Review Cycle:** Monthly during development
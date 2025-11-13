# Cernio Implementation Plan & TODO List

**Project Start:** 2025-11-03
**Target MVP Launch:** 2026-06-01 (7 months)
**Current Phase:** Phase 1 - Sprint 1-4 + Inventory COMPLETED ✅ | Working on Sprint 5 (Document Upload) & Sprint 2 (User Management)

---

## Phase 0: Project Setup & Infrastructure (Week 1-2)

### Development Environment Setup
- [x] Install Node.js 20+ LTS
- [x] Install PostgreSQL 15+ locally
- [x] Install pgAdmin for database management
- [ ] Install Redis locally (Phase 1)
- [ ] Install Docker Desktop (Phase 1)
- [ ] Set up VS Code with extensions (ESLint, Prettier, GitLens)
- [x] Configure Git (name, email, SSH keys)
- [x] Clone repository locally
- [x] Create `.env.example` file with all required variables

### Repository & CI/CD Setup
- [x] Initialize monorepo structure (npm workspaces)
- [x] Set up Git branching strategy (main branch)
- [x] Configure GitHub Actions workflows
  - [x] Lint and test on PR
  - [x] Auto-deploy templates created (requires hosting setup)
- [ ] Set up branch protection rules (require PR reviews)
- [ ] Configure Dependabot for dependency updates

### Backend Foundation
- [x] Initialize NestJS project
- [x] Configure TypeScript (strict mode)
- [x] Set up database connection (Prisma)
- [x] Create database migration system
- [x] Create Prisma service and module
- [ ] Set up Winston logging
- [x] Configure environment variables with validation
- [x] Create health check endpoint (`/api/v1/health`)

### Frontend Foundation
- [x] Initialize React project with Vite
- [x] Configure TypeScript (strict mode)
- [x] Set up Tailwind CSS
- [ ] Install Radix UI primitives
- [x] Configure routing (React Router v6)
- [x] Set up Axios for API calls
- [ ] Implement error boundary
- [x] Create basic layout components (Header, Layout)

### Database Schema - Core Tables
- [x] Create `companies` table
- [x] Create `users` table with role enum
- [x] Create `sessions` table (for JWT refresh tokens)
- [x] Create `audit_events` table (event sourcing)
- [x] Create migration: Add indexes on `company_id`
- [x] Seed script for development data

### DevOps Infrastructure
- [ ] Set up GCP/AWS account
- [ ] Configure Kubernetes cluster (GKE/EKS)
- [ ] Set up container registry
- [ ] Configure staging environment
- [ ] Set up S3/Cloud Storage bucket
- [ ] Configure Redis cluster
- [ ] Set up CloudFlare CDN
- [ ] Configure monitoring (DataDog/New Relic trial)

### Third-Party Service Accounts
- [ ] Create SendGrid account (email)
- [ ] Create Stripe account (test mode)
- [ ] Create DocuSign developer account
- [ ] Generate API keys for all services
- [ ] Store keys in secret manager (GCP Secret Manager / AWS Secrets Manager)

**Phase 0 Completion Criteria:**
- [x] Developer can run `npm run dev` and see working application at localhost
- [x] Database migrations run successfully
- [x] Frontend successfully communicates with backend API
- [x] Backend successfully connects to PostgreSQL database
- [x] Test data can be viewed in pgAdmin
- [x] CI pipeline configured (requires hosting setup to deploy)
- [ ] Can deploy to staging environment (requires hosting account)

---

## Phase 1: Authentication & First Vertical Slice (Months 1-3)

### Sprint 1: Authentication System (Weeks 1-2) ✅ MOSTLY COMPLETE

#### Backend - Auth Module
- [x] Create `auth` module in NestJS
- [x] Implement POST `/api/v1/auth/register` endpoint
  - [x] Email validation (unique check via GET `/api/v1/auth/check-email`)
  - [x] Password hashing with bcrypt
  - [x] Create company record (first user = admin)
  - [ ] Send verification email (requires email service)
- [x] Implement POST `/api/v1/auth/login` endpoint
  - [x] Validate credentials
  - [x] Generate JWT access token (15 min expiry)
  - [x] Generate refresh token (30 days, store in DB)
  - [x] Return tokens + user profile
- [x] Implement POST `/api/v1/auth/refresh` endpoint
- [x] Implement POST `/api/v1/auth/logout` endpoint
- [ ] Implement POST `/api/v1/auth/forgot-password` endpoint
- [ ] Implement POST `/api/v1/auth/reset-password` endpoint
- [x] Create `AuthGuard` for protected routes (JwtAuthGuard)
- [x] Create `RolesGuard` for RBAC
- [x] Implement GET `/api/v1/auth/me` endpoint (current user profile)
- [x] Write unit tests for auth service (>80% coverage)
- [x] Write integration tests for auth endpoints

#### Frontend - Auth Pages
- [x] Create `/register` page
  - [x] Form: company name, user name, email, password
  - [x] Client-side validation (Zod schema)
  - [x] Display error messages
  - [x] Password strength checker component
  - [ ] Redirect to email verification notice (skipped - no email yet)
- [x] Create `/login` page
  - [x] Form: email, password
  - [ ] "Forgot password?" link (UI not added yet)
  - [x] Store JWT in memory + refresh token handling
  - [x] Redirect to dashboard on success
- [ ] Create `/forgot-password` page
- [ ] Create `/reset-password/:token` page
- [x] Create auth state management with Zustand
  - [x] Current user state
  - [x] Login/logout functions
  - [x] Token refresh logic (automatic via axios interceptors)
- [x] Create `PrivateRoute` component (redirect to login if not authenticated)
- [x] Implement automatic token refresh (when access token expires)

#### Email Service
- [ ] Integrate SendGrid
- [ ] Create email templates
  - [ ] Welcome email
  - [ ] Email verification
  - [ ] Password reset
- [ ] Implement email queue (Bull with Redis)

**Sprint 1 Deliverable:** ✅ Users can register, login, logout (email verification deferred)

---

### Sprint 2: User Management (Weeks 3-4)

#### Backend - Users Module
- [ ] Create GET `/api/v1/users/me` (current user profile)
- [ ] Create GET `/api/v1/users` (list company users, admin only)
- [ ] Create POST `/api/v1/users/invite` (send invite email)
- [ ] Create PUT `/api/v1/users/:id` (update user)
- [ ] Create DELETE `/api/v1/users/:id` (soft delete, deactivate)
- [ ] Create PUT `/api/v1/users/:id/role` (change role, admin only)
- [ ] Implement email invitations (generate invite token)
- [ ] Create POST `/api/v1/auth/accept-invite/:token` (new user onboarding)

#### Frontend - User Management UI
- [ ] Create `/settings/users` page (admin only)
- [ ] Display user list in table
  - [ ] Show: name, email, role, status, last login
  - [ ] Actions: Edit role, Deactivate, Resend invite
- [ ] Create "Invite User" modal
  - [ ] Form: email, role selection
  - [ ] Send invite
- [ ] Create `/profile` page (edit own profile)
  - [ ] Form: name, email, phone, password change
- [ ] Implement role-based UI hiding (hide admin features from non-admins)

**Sprint 2 Deliverable:** Admin can invite users, assign roles, manage team

---

### Sprint 3: Client Management (Weeks 5-6) ✅ COMPLETE

#### Backend - Clients Module
- [x] Create database tables: `clients`, `client_contacts`
- [x] Create POST `/api/v1/clients` endpoint
- [x] Create GET `/api/v1/clients` endpoint (full list, no pagination yet)
- [x] Create GET `/api/v1/clients/:id` endpoint
- [x] Create PUT `/api/v1/clients/:id` endpoint
- [x] Create DELETE `/api/v1/clients/:id` endpoint (soft delete)
- [x] Contacts included in client CRUD (nested within client operations)
- [x] Enforce multi-tenancy (all queries filter by `company_id`)
- [x] Write unit tests (comprehensive coverage)

#### Frontend - Client Management UI
- [x] Create `/clients` page
  - [x] Client list in table format
  - [x] Table columns: Name, Type, Primary Contact, Email, Phone, Actions
  - [x] Delete action with confirmation
  - [x] Empty state when no clients
  - [ ] Search/filter (not implemented yet)
  - [ ] Pagination controls (not needed yet - full list)
- [x] Create `/clients/new` page
  - [x] Form: Name, Type, Address (street1, street2, city, state, postal, country)
  - [x] Multiple contacts with primary designation
  - [x] Validation with Zod
  - [x] Image URL support for client and contacts
- [x] Create `/clients/:id` detail page
  - [x] Display client info (name, type, address)
  - [x] List all contacts with details
  - [x] Edit and Delete buttons
  - [x] Loading and error states
- [x] Create `/clients/:id/edit` page (full edit form)
- [x] International-friendly address fields

**Sprint 3 Deliverable:** ✅ Users can manage client database with full CRUD

---

### Sprint 4: Project Creation & Dashboard (Weeks 7-9) ✅ COMPLETE

#### Backend - Projects Module
- [x] Create `projects` table with all fields
- [x] Create POST `/api/v1/projects` endpoint
  - [x] Validate required fields
  - [x] Link to client_id
  - [x] Default status = "PLANNED"
  - [ ] Assign PM field exists but not implemented in UI yet
- [x] Create GET `/api/v1/projects` endpoint
  - [x] Returns all projects with client info
  - [ ] Filter by status, date range (not implemented yet)
  - [ ] Pagination and sorting (not needed yet)
- [x] Create GET `/api/v1/projects/:id` endpoint
- [x] Create PATCH `/api/v1/projects/:id` endpoint
- [ ] Create PUT `/api/v1/projects/:id/status` endpoint (status changes via PATCH)
  - [ ] Validate status transitions (basic validation exists)
  - [ ] Log to audit_events (not implemented yet)
- [ ] Create GET `/api/v1/dashboard/summary` endpoint (basic dashboard exists)
- [x] Write unit tests (comprehensive coverage)
- [x] Enforce multi-tenancy (all queries filter by `company_id`)

#### Frontend - Project Dashboard
- [x] Create `/dashboard` page (home after login)
  - [x] Quick action cards: Manage Clients, Manage Projects
  - [ ] Summary cards: Active Projects, Estimates Pending, Revenue MTD (simplified version)
  - [ ] Recent projects list (not implemented yet)
- [x] Create `/projects` page
  - [x] Project list in table format
  - [x] Status badges (color-coded: PLANNED, ACTIVE, ON_HOLD, COMPLETED, CANCELLED)
  - [x] Table: Name, Client, Status, Budget, Start Date, Actions
  - [x] Delete action with confirmation
  - [x] Empty state when no projects
  - [ ] Filters (not implemented yet)
- [x] Create `/projects/new` page
  - [x] Form: Name, Client (dropdown), Description, Status
  - [x] Location fields (street1, street2, city, state, postal, country)
  - [x] Timeline: Start Date, Estimated Completion, Actual Completion
  - [x] Budget: Estimated Budget, Actual Cost
  - [x] Image URL support
  - [x] Validation with Zod
- [x] Create `/projects/:id` detail page
  - [x] Project header (name, status)
  - [x] Display all project info (location, timeline, budget, client)
  - [x] Edit and Delete buttons
  - [x] Loading and error states
  - [ ] Tabs: Overview, Budget, Documents, Team, Activity (simplified - single view)
- [x] Create `/projects/:id/edit` page (full edit form)

**Sprint 4 Deliverable:** ✅ Complete vertical slice - User can register → create company → add client → create project

---

### Inventory Management Module (Added) ✅ COMPLETE

#### Backend - Inventory Module
- [x] Create database tables: `inventory_items`, `inventory_photos`
- [x] Support three inventory types: MATERIAL, TOOL, SALVAGE
- [x] Create POST `/api/v1/inventory` endpoint
  - [x] Type-specific fields (material, tool, salvage attributes)
  - [x] Optional project association
- [x] Create GET `/api/v1/inventory` endpoint
  - [x] Filter by type, status, projectId
  - [x] Returns all items for company
- [x] Create GET `/api/v1/inventory/:id` endpoint
- [x] Create PATCH `/api/v1/inventory/:id` endpoint
- [x] Create DELETE `/api/v1/inventory/:id` endpoint
- [x] Photo support with display ordering
- [x] Status enums for each type
- [x] Enforce multi-tenancy (all queries filter by `company_id`)
- [x] Write unit tests (comprehensive coverage)

**Inventory Module Deliverable:** ✅ Full CRUD for materials, tools, and salvage items

---

### Sprint 5: Document Upload & Polish (Weeks 10-12)

#### Backend - Document Storage
- [ ] Integrate AWS S3 (or GCS)
- [ ] Create `project_documents` table
- [ ] Create POST `/api/v1/projects/:id/documents` endpoint
  - [ ] Upload file to S3
  - [ ] Store metadata in DB
  - [ ] Generate pre-signed URL for download
- [ ] Create GET `/api/v1/projects/:id/documents` endpoint
- [ ] Create DELETE `/api/v1/projects/:id/documents/:docId` endpoint
- [ ] Implement file type validation (PDF, images, Excel)
- [ ] Implement file size limit (10MB per file)

#### Frontend - Document Management
- [ ] Create Documents tab in project detail
  - [ ] Upload button (drag-and-drop support)
  - [ ] Document list with preview thumbnails
  - [ ] Download link (opens pre-signed URL)
  - [ ] Delete with confirmation
- [ ] Implement progress bar for uploads
- [ ] Show upload errors (file too large, wrong type)

#### Polish & UX Improvements
- [ ] Add loading spinners for all async operations
- [ ] Implement toast notifications (success, error)
- [ ] Add form validation error styling
- [ ] Implement responsive design (mobile-friendly)
- [ ] Add keyboard shortcuts (Cmd+K for search)
- [ ] Create empty states (no clients yet, no projects yet)
- [ ] Add tooltips to icons
- [ ] Improve error messages (user-friendly text)

#### Testing & Deployment
- [ ] Write E2E tests for full user journey (Cypress)
  - [ ] Register → Login → Create Client → Create Project → Upload Doc
- [ ] Load testing (simulate 100 concurrent users)
- [ ] Deploy to staging environment
- [ ] Beta testing with 5 users
- [ ] Fix bugs from beta feedback

**Phase 1 Completion Criteria:**
- ✅ 5 beta users successfully complete full workflow
- ✅ All tests passing (unit, integration, E2E)
- ✅ API response times <500ms (p95)
- ✅ Zero critical bugs
- ✅ Documentation complete (API docs, user guide)

---

## Phase 2: Estimating & Proposals (Months 4-5)

### Sprint 6: Cost Catalog (Weeks 13-14)
- [ ] Create `cost_catalog` table
- [ ] Create CRUD API endpoints for cost items
- [ ] Create `/settings/cost-catalog` page
- [ ] Implement CSV import for bulk catalog setup
- [ ] Add cost item categories (labor, equipment, disposal, etc.)

### Sprint 7: Estimate Builder (Weeks 15-17)
- [ ] Create `estimates`, `estimate_line_items`, `salvage_credits` tables
- [ ] Create estimate builder API endpoints
- [ ] Create `/estimates/new` page with line-item editor
- [ ] Implement salvage credit calculator (unique feature!)
- [ ] Create estimate templates
- [ ] Add ability to clone from previous estimate

### Sprint 8: Proposals & E-Signature (Weeks 18-20)
- [ ] Create `proposals`, `contracts` tables
- [ ] Integrate DocuSign API
- [ ] Create proposal PDF generation service
- [ ] Create proposal sending workflow
- [ ] Implement signature tracking with webhooks
- [ ] Create signed contract storage and retrieval

**Phase 2 Completion Criteria:**
- ✅ User can create estimate → generate proposal → send for signature → receive signed contract

---

## Phase 3: Field Operations & Mobile (Months 6-7)

### Sprint 9: Mobile App Foundation (Weeks 21-23)
- [ ] Initialize React Native project (Expo)
- [ ] Set up navigation (React Navigation)
- [ ] Implement authentication flow (login)
- [ ] Create dashboard (assigned projects list)
- [ ] Implement offline storage (AsyncStorage)
- [ ] Test on iOS and Android devices

### Sprint 10: Time Tracking Mobile (Weeks 24-25)
- [ ] Create `time_entries` table
- [ ] Create time tracking API endpoints
- [ ] Build clock in/out UI in mobile app
- [ ] Implement break tracking
- [ ] Add GPS location capture
- [ ] Create timesheet review screen

### Sprint 11: Expense Logging Mobile (Weeks 26-27)
- [ ] Create `field_expenses` table
- [ ] Create expense API endpoints
- [ ] Build expense entry form in mobile app
- [ ] Implement camera for receipt photos
- [ ] Add mileage tracker
- [ ] Create expense approval workflow (web)

### Sprint 12: Invoicing & Financials (Weeks 28-30)
- [ ] Create `invoices`, `invoice_line_items`, `payments` tables
- [ ] Create invoicing API endpoints
- [ ] Build invoice generation UI (web)
- [ ] Implement PDF invoice generation
- [ ] Create payment recording UI
- [ ] Build financial reports (P&L, job costing)
- [ ] Implement CSV export for accounting

**Phase 3 Completion Criteria:**
- ✅ Mobile app in TestFlight/Google Play Beta
- ✅ Field workers can track time and expenses
- ✅ PM can generate and send invoices
- ✅ Export accounting data to CSV

---

## Phase 4: Salvage & Marketplace (Months 8-10)

### Sprint 13: Salvage Inventory (Weeks 31-33)
- [ ] Create `salvage_items`, `salvage_photos` tables
- [ ] Create salvage inventory API endpoints
- [ ] Build salvage item creation UI
- [ ] Implement multi-photo upload
- [ ] Add item categorization
- [ ] Create salvage inventory list view

### Sprint 14: Marketplace Frontend (Weeks 34-37)
- [ ] Initialize Next.js project for marketplace
- [ ] Design marketplace homepage
- [ ] Create category browse pages
- [ ] Build item detail page with image gallery
- [ ] Implement search and filtering
- [ ] Create user registration/login for buyers

### Sprint 15: Auction Engine (Weeks 38-40)
- [ ] Create `auction_listings`, `bids`, `orders` tables
- [ ] Implement auction creation from salvage items
- [ ] Build real-time bidding with WebSocket
- [ ] Create bid validation logic (min increment, proxy bidding)
- [ ] Implement anti-snipe (extend auction)
- [ ] Build auction end notification system

### Sprint 16: Payments & Fulfillment (Weeks 41-43)
- [ ] Integrate Stripe Checkout
- [ ] Implement payment webhooks
- [ ] Create order confirmation emails
- [ ] Build seller payout logic (marketplace fee deduction)
- [ ] Create order management UI (contractor portal)
- [ ] Build buyer order history page

**Phase 4 Completion Criteria:**
- ✅ Marketplace website live and public
- ✅ Complete 10 successful auction transactions
- ✅ Payment processing working (Stripe)
- ✅ Seller receives payout after fulfillment

---

## Phase 5: Polish & Beta Launch (Months 11-12)

### Sprint 17: Analytics & Reporting (Weeks 44-46)
- [ ] Build company dashboard with KPIs
- [ ] Create marketplace analytics (GMV, sell-through rate)
- [ ] Implement custom report builder
- [ ] Add data export (all reports)
- [ ] Create email reports (weekly summary)

### Sprint 18: Admin Tools (Weeks 47-48)
- [ ] Build system admin dashboard
- [ ] Implement user impersonation
- [ ] Create feature flags system
- [ ] Add logging viewer
- [ ] Build customer support tools

### Sprint 19: Documentation & Onboarding (Weeks 49-50)
- [ ] Write user documentation (help center)
- [ ] Create video tutorials
- [ ] Build in-app onboarding tour
- [ ] Create API documentation (Swagger UI)
- [ ] Write developer guides for integrations

### Sprint 20: Final Testing & Launch Prep (Weeks 51-52)
- [ ] Comprehensive security audit
- [ ] Load testing (simulate 1000 concurrent users)
- [ ] Penetration testing
- [ ] Fix all critical bugs
- [ ] Deploy to production
- [ ] Beta launch to 50 companies

**Phase 5 Completion Criteria:**
- ✅ 50 beta customers onboarded
- ✅ Zero critical bugs
- ✅ 99.9% uptime achieved
- ✅ NPS score >40

---

## Ongoing Tasks (Every Sprint)

### Code Quality
- [ ] Code review all PRs (require 1 approval)
- [ ] Maintain >80% test coverage
- [ ] Run linter on pre-commit hook
- [ ] Update dependencies weekly
- [ ] Refactor technical debt (allocate 20% of sprint)

### DevOps
- [ ] Monitor error rates (Sentry alerts)
- [ ] Review API performance metrics
- [ ] Optimize slow database queries
- [ ] Update deployment runbook
- [ ] Conduct weekly staging deployments

### Product Management
- [ ] Weekly demo to stakeholders
- [ ] Collect beta user feedback
- [ ] Prioritize backlog items
- [ ] Update product roadmap
- [ ] Review KPI dashboard

---

## Backlog (Post-MVP)

### High Priority
- [ ] QuickBooks Online integration (live sync)
- [ ] Mobile app offline sync improvements
- [ ] Advanced scheduling (route optimization)
- [ ] Customer portal (clients view project status)
- [ ] Equipment management module

### Medium Priority
- [ ] Multi-factor authentication (MFA)
- [ ] SSO integration (Google, Microsoft)
- [ ] White-label option
- [ ] Multi-language support (Spanish)
- [ ] Advanced permissions (custom roles)

### Low Priority / Nice-to-Have
- [ ] Dark mode
- [ ] Mobile app for marketplace buyers
- [ ] Integration marketplace (Zapier-like)
- [ ] Voice commands (Alexa/Google Home)
- [ ] AR tool for space measurement

### AI Features (Year 2)
- [ ] AI Estimator (train on historical data)
- [ ] Predictive analytics (project risk scoring)
- [ ] Document OCR (auto-extract data from PDFs)
- [ ] Chatbot for customer support
- [ ] Automated bid optimization

---

## Notes & Conventions

### Git Commit Messages
Use conventional commits format:
```
feat: Add user invitation feature
fix: Resolve login token expiration bug
docs: Update API documentation
test: Add unit tests for auth service
chore: Upgrade React to v18
```

### Branch Naming
```
feature/user-management
bugfix/login-token-expiration
hotfix/production-db-connection
```

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests passing
- [ ] Documentation updated
```

---

**Last Updated:** 2025-11-13 (Phase 1 - Sprint 1-4 + Inventory COMPLETED ✅)
**Document Owner:** Development Team
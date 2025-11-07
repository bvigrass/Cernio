# Cernio Implementation Plan & TODO List

**Project Start:** 2025-11-03
**Target MVP Launch:** 2026-06-01 (7 months)
**Current Phase:** Phase 0 - COMPLETED ✅ | Ready for Phase 1

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

### Sprint 1: Authentication System (Weeks 1-2)

#### Backend - Auth Module
- [ ] Create `auth` module in NestJS
- [ ] Implement POST `/api/v1/auth/register` endpoint
  - [ ] Email validation (unique check)
  - [ ] Password hashing with bcrypt
  - [ ] Create company record (first user = admin)
  - [ ] Send verification email
- [ ] Implement POST `/api/v1/auth/login` endpoint
  - [ ] Validate credentials
  - [ ] Generate JWT access token (15 min expiry)
  - [ ] Generate refresh token (30 days, store in DB)
  - [ ] Return tokens + user profile
- [ ] Implement POST `/api/v1/auth/refresh` endpoint
- [ ] Implement POST `/api/v1/auth/logout` endpoint
- [ ] Implement POST `/api/v1/auth/forgot-password` endpoint
- [ ] Implement POST `/api/v1/auth/reset-password` endpoint
- [ ] Create `AuthGuard` for protected routes
- [ ] Create `RolesGuard` for RBAC
- [ ] Write unit tests for auth service (>80% coverage)

#### Frontend - Auth Pages
- [ ] Create `/register` page
  - [ ] Form: company name, user name, email, password
  - [ ] Client-side validation (Zod schema)
  - [ ] Display error messages
  - [ ] Redirect to email verification notice
- [ ] Create `/login` page
  - [ ] Form: email, password
  - [ ] "Forgot password?" link
  - [ ] Store JWT in memory + refresh token in httpOnly cookie
  - [ ] Redirect to dashboard on success
- [ ] Create `/forgot-password` page
- [ ] Create `/reset-password/:token` page
- [ ] Create `AuthContext` with React Context API
  - [ ] Current user state
  - [ ] Login/logout functions
  - [ ] Token refresh logic
- [ ] Create `PrivateRoute` component (redirect to login if not authenticated)
- [ ] Implement automatic token refresh (when access token expires)

#### Email Service
- [ ] Integrate SendGrid
- [ ] Create email templates
  - [ ] Welcome email
  - [ ] Email verification
  - [ ] Password reset
- [ ] Implement email queue (Bull with Redis)

**Sprint 1 Deliverable:** Users can register, verify email, login, logout

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

### Sprint 3: Client Management (Weeks 5-6)

#### Backend - Clients Module
- [ ] Create database tables: `clients`, `client_contacts`
- [ ] Create POST `/api/v1/clients` endpoint
- [ ] Create GET `/api/v1/clients` endpoint (with pagination, search)
- [ ] Create GET `/api/v1/clients/:id` endpoint
- [ ] Create PUT `/api/v1/clients/:id` endpoint
- [ ] Create DELETE `/api/v1/clients/:id` endpoint (soft delete)
- [ ] Create POST `/api/v1/clients/:id/contacts` (add contact)
- [ ] Create PUT `/api/v1/clients/:id/contacts/:contactId` (edit contact)
- [ ] Enforce multi-tenancy (all queries filter by `company_id`)
- [ ] Write integration tests

#### Frontend - Client Management UI
- [ ] Create `/clients` page
  - [ ] Client list with search/filter
  - [ ] Table columns: Name, Type, Primary Contact, Phone, Actions
  - [ ] Pagination controls
- [ ] Create "Add Client" button → modal
  - [ ] Form: Name, Type, Billing Address, Primary Contact
  - [ ] Validation with Zod
- [ ] Create `/clients/:id` detail page
  - [ ] Display client info
  - [ ] List contacts (add, edit, delete)
  - [ ] Interaction history timeline (empty for now)
- [ ] Create edit client modal

**Sprint 3 Deliverable:** Users can manage client database

---

### Sprint 4: Project Creation & Dashboard (Weeks 7-9)

#### Backend - Projects Module
- [ ] Create `projects` table with all fields
- [ ] Create POST `/api/v1/projects` endpoint
  - [ ] Validate required fields
  - [ ] Link to client_id
  - [ ] Set status = "Planning"
  - [ ] Assign PM (user_id)
- [ ] Create GET `/api/v1/projects` endpoint
  - [ ] Filter by status, PM, date range
  - [ ] Pagination and sorting
- [ ] Create GET `/api/v1/projects/:id` endpoint
- [ ] Create PUT `/api/v1/projects/:id` endpoint
- [ ] Create PUT `/api/v1/projects/:id/status` endpoint
  - [ ] Validate status transitions
  - [ ] Log to audit_events
- [ ] Create GET `/api/v1/dashboard/summary` endpoint
  - [ ] Active projects count
  - [ ] Projects by status
  - [ ] Upcoming milestones
- [ ] Write tests

#### Frontend - Project Dashboard
- [ ] Create `/dashboard` page (home after login)
  - [ ] Summary cards: Active Projects, Estimates Pending, Revenue MTD
  - [ ] Recent projects list
  - [ ] Quick actions: New Project, New Estimate
- [ ] Create `/projects` page
  - [ ] Project list with filters
  - [ ] Status badges (color-coded)
  - [ ] Table: Name, Client, Status, Budget, Start Date, PM, Actions
- [ ] Create "New Project" modal
  - [ ] Form: Name, Client (dropdown), Site Address, Start/End Date, Budget, Assigned PM
  - [ ] Save and redirect to project detail
- [ ] Create `/projects/:id` detail page
  - [ ] Project header (name, client, status)
  - [ ] Tabs: Overview, Budget, Documents, Team, Activity
  - [ ] Overview tab: Basic info, status change dropdown
- [ ] Implement status change with confirmation modal

**Sprint 4 Deliverable:** Complete vertical slice - User can register → create company → add client → create project

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

**Last Updated:** 2025-11-03 (Phase 0 COMPLETED ✅)
**Document Owner:** Development Team
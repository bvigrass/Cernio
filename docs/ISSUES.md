# Open Issues & Decisions Needed

**Last Updated:** 2025-11-03 (Phase 0 COMPLETED - 3 architectural decisions resolved)
**Status Key:** 🔴 Blocker | 🟡 Important | 🟢 Nice-to-have | ✅ Resolved

---

## Technical Architecture Decisions

### TA-001: Hosting Provider Selection 🟡
**Status:** Open  
**Decision Needed By:** Week 1  
**Impact:** Infrastructure costs, deployment complexity

**Options:**
1. **AWS** (Amazon Web Services)
   - ✅ Industry standard, most mature
   - ✅ Best documentation
   - ❌ Most expensive
   - ❌ Complex pricing

2. **GCP** (Google Cloud Platform)
   - ✅ Better Kubernetes (GKE)
   - ✅ 20-30% cheaper than AWS
   - ✅ Good ML/AI tools (future AI Estimator)
   - ❌ Smaller ecosystem

3. **Azure** (Microsoft)
   - ✅ Good if customers use Microsoft stack
   - ✅ Strong enterprise sales channel
   - ❌ Less popular for startups
   
**Recommendation:** Start with GCP for cost savings, easier Kubernetes. Can migrate later if needed.

**Action Items:**
- [ ] Create cost estimate spreadsheet for all 3 providers
- [ ] Verify GCP has all required services (Kubernetes, Storage, Redis)
- [ ] Decision by: 2025-11-10

---

### TA-002: Monorepo vs Multi-Repo ✅
**Status:** RESOLVED
**Decision:** Monorepo with npm workspaces
**Date:** 2025-11-03
**Rationale:** Using native npm workspaces for simplicity. Provides code sharing benefits without additional tooling complexity. Can migrate to Nx/Turborepo later if build performance becomes an issue.

---

### TA-003: ORM Choice (TypeORM vs Prisma) ✅
**Status:** RESOLVED
**Decision:** Prisma
**Date:** 2025-11-03
**Rationale:** Excellent TypeScript support and type safety. Simpler migration workflow perfect for rapid MVP development. Schema-first approach similar to Entity Framework from .NET. Generated Prisma Client provides full type safety across the application. Migration system is production-ready.

---

### TA-004: State Management (React) ✅
**Status:** RESOLVED
**Decision:** Zustand
**Date:** 2025-11-03
**Rationale:** Lightweight with minimal boilerplate, perfect for MVP. Good performance without the complexity of Redux. Easy to migrate to Redux Toolkit later if application complexity demands it.

---

### TA-005: Mobile Framework Choice 🔴
**Status:** Open  
**Decision Needed By:** Phase 3 start (Month 6)  
**Impact:** Development speed, app performance, team hiring

**Options:**
1. **React Native**
   - ✅ Share code with web (React components)
   - ✅ Single team (JavaScript developers)
   - ✅ Faster MVP
   - ❌ Performance limitations
   - ❌ Native module complexity

2. **Flutter**
   - ✅ Excellent performance
   - ✅ Beautiful UI out-of-box
   - ❌ New language (Dart)
   - ❌ Separate team needed

3. **Native** (Swift + Kotlin)
   - ✅ Best performance
   - ✅ Full platform access
   - ❌ 2 separate codebases
   - ❌ 2x development time
   - ❌ Need iOS and Android developers

**Recommendation:** React Native for MVP. Can rebuild native later if performance becomes issue.

**Action Items:**
- [ ] Validate React Native can handle offline sync requirements
- [ ] Test camera integration for receipt/photo capture
- [ ] Decision by: 2026-03-01

---

### TA-006: Real-Time Communication (WebSocket Library) 🟡
**Status:** Open  
**Decision Needed By:** Phase 4 (marketplace development)  
**Impact:** Auction bidding experience

**Options:**
1. **Socket.io**
   - ✅ Most popular
   - ✅ Automatic reconnection
   - ✅ Room/namespace support
   - ❌ Larger bundle size

2. **WS** (native WebSocket)
   - ✅ Lightweight
   - ✅ Standard protocol
   - ❌ Need to handle reconnection manually
   - ❌ No rooms/namespaces

**Recommendation:** Socket.io for better DX and built-in features.

**Action Items:**
- [ ] Prototype bidding with Socket.io
- [ ] Load test (100 simultaneous bidders)
- [ ] Decision by: 2026-05-01

---

## Business Model Decisions

### BM-001: SaaS Pricing Model 🔴
**Status:** Open  
**Decision Needed By:** Before Beta Launch (Month 11)  
**Impact:** Revenue, customer acquisition

**Options:**
1. **Per-User Pricing**
   - Example: $49/user/month
   - ✅ Scales with company size
   - ✅ Easy to understand
   - ❌ Discourages adding users

2. **Flat Rate Per Company**
   - Example: $499/month unlimited users
   - ✅ Predictable for customers
   - ✅ Encourages full team adoption
   - ❌ Less revenue from large companies

3. **Tiered Plans**
   - Basic: $199/mo (5 users, 50 projects)
   - Pro: $499/mo (25 users, unlimited projects)
   - Enterprise: Custom (unlimited, white-label)
   - ✅ Captures different customer segments
   - ❌ Complexity in managing tiers

**Recommendation:** Start with flat rate ($499/mo unlimited) for simplicity. Add tiers later based on customer feedback.

**Action Items:**
- [ ] Survey 20 demolition contractors on pricing sensitivity
- [ ] Analyze competitor pricing (Knowify, Procore, etc.)
- [ ] Build pricing calculator for different scenarios
- [ ] Decision by: 2026-07-01

---

### BM-002: Marketplace Fee Structure 🔴
**Status:** Open  
**Decision Needed By:** Before Marketplace Launch (Month 8)  
**Impact:** Marketplace adoption, revenue

**Options:**
1. **Flat Percentage** (e.g., 10% of sale price)
   - ✅ Simple
   - ✅ Aligns incentives
   - ❌ May discourage high-value items

2. **Tiered Percentage**
   - 10% for sales <$500
   - 7% for sales $500-$2000
   - 5% for sales >$2000
   - ✅ Encourages larger listings
   - ❌ More complex

3. **Subscription + Lower %**
   - $50/month + 5% fee
   - ✅ Recurring revenue
   - ❌ Barrier to entry for new sellers

**Recommendation:** Start with flat 10%, monitor seller behavior, adjust if needed.

**Action Items:**
- [ ] Research eBay, Facebook Marketplace, Chairish fee structures
- [ ] Calculate breakeven fee % based on infrastructure costs
- [ ] Decision by: 2026-04-01

---

### BM-003: Free Trial Duration 🟡
**Status:** Open  
**Decision Needed By:** Before Beta Launch  
**Impact:** Conversion rate, sales cycle

**Options:**
1. **14-Day Trial**
   - ✅ Standard SaaS practice
   - ✅ Creates urgency
   - ❌ May not be enough time to evaluate (contractors are busy)

2. **30-Day Trial**
   - ✅ More time to test full workflow
   - ✅ Can complete 1-2 small projects
   - ❌ Less urgency to convert

3. **Freemium** (forever free basic tier)
   - Free: 3 projects, 2 users
   - Paid: Unlimited
   - ✅ No friction to start
   - ✅ Land-and-expand model
   - ❌ Support costs for free users

**Recommendation:** 30-day trial. Demolition contractors have longer eval cycles than typical SaaS.

**Action Items:**
- [ ] A/B test 14-day vs 30-day during beta
- [ ] Track time-to-activation (days to first value)
- [ ] Decision by: 2026-07-01

---

### BM-004: Multi-Region Expansion Strategy 🟢
**Status:** Open (deferred)  
**Decision Needed By:** Year 2  
**Impact:** Market size, compliance complexity

**Options:**
1. **US-Only at Launch**
   - ✅ Focus on single market
   - ✅ Simpler compliance
   - ❌ Limits TAM (total addressable market)

2. **North America** (US + Canada)
   - ✅ Similar markets
   - ❌ Different tax laws, currencies

3. **Global from Day 1**
   - ✅ Maximum TAM
   - ❌ Localization costs
   - ❌ GDPR, data residency complexity

**Recommendation:** US-only for MVP. Expand to Canada in Year 2 if demand exists.

**Action Items:**
- [ ] Monitor inbound interest from international users
- [ ] Decision by: 2027-01-01

---

## Feature Scope Decisions

### FS-001: Mobile App Offline Mode Complexity 🟡
**Status:** Open  
**Decision Needed By:** Phase 3 start  
**Impact:** Development time, user experience

**Requirements:**
- Field workers need to log time without internet
- Need to capture photos in remote locations
- Must sync when connection restored

**Options:**
1. **Simple Queue** (failed requests retry on reconnect)
   - ✅ Easy to implement
   - ❌ No local data persistence
   - ❌ Lose data if app crashes

2. **Full Offline-First** (local DB with sync)
   - Tools: WatermelonDB, PouchDB
   - ✅ True offline capability
   - ✅ View historical data offline
   - ❌ Complex conflict resolution
   - ❌ Adds 2-3 weeks development

**Recommendation:** Start with simple queue. Add full offline in v2 if user feedback demands it.

**Action Items:**
- [ ] Survey field workers on typical connection issues
- [ ] Prototype simple queue approach
- [ ] Decision by: 2026-03-01

---

### FS-002: Advanced Scheduling Features 🟢
**Status:** Open (deferred to post-MVP)  
**Decision Needed By:** TBD  
**Impact:** Competitive differentiation

**Potential Features:**
- Route optimization (minimize drive time)
- Resource leveling (balance crew utilization)
- Drag-and-drop Gantt chart
- Equipment availability checking
- Automated scheduling (AI-powered)

**Recommendation:** MVP has basic calendar only. Add advanced features based on user requests.

**Action Items:**
- [ ] Collect user feedback during beta on scheduling pain points
- [ ] Prioritize based on frequency of requests

---

### FS-003: Customer Portal (Client Self-Service) 🟢
**Status:** Open (deferred to post-MVP)  
**Decision Needed By:** TBD  
**Impact:** Customer satisfaction, support load reduction

**Potential Features:**
- Clients log in to view project status
- See photos from field
- Approve change orders online
- View/download invoices
- Make payments

**Recommendation:** Defer to post-MVP. Focus on contractor experience first.

**Action Items:**
- [ ] Add to backlog for Year 2
- [ ] Prioritize if multiple customers request it

---

## Data & Security Decisions

### DS-001: PII Encryption Strategy 🟡
**Status:** Open  
**Decision Needed By:** Before production launch  
**Impact:** Compliance, performance

**Fields Requiring Extra Protection:**
- SSNs (if stored for subcontractors)
- Bank account numbers
- Driver's licenses

**Options:**
1. **Application-Level Encryption**
   - Encrypt before writing to DB
   - ✅ Most secure
   - ❌ Can't query encrypted fields
   - ❌ Performance overhead

2. **Database-Level Encryption** (PostgreSQL TDE)
   - ✅ Transparent to application
   - ✅ Can still query
   - ❌ Less granular control

3. **Tokenization** (use Stripe, Plaid for sensitive data)
   - ✅ Don't store sensitive data at all
   - ✅ Simplest compliance
   - ❌ Dependent on third parties

**Recommendation:** Use tokenization where possible. Application-level encryption for data we must store.

**Action Items:**
- [ ] Identify all PII fields in schema
- [ ] Choose encryption library (crypto-js, node-forge)
- [ ] Implement and test before production
- [ ] Decision by: 2026-07-01

---

### DS-002: GDPR Compliance Requirements 🟢
**Status:** Open (low priority for US-only MVP)  
**Decision Needed By:** If/when expanding to EU  
**Impact:** Legal compliance, architecture changes

**Requirements if serving EU users:**
- Right to erasure (delete user data)
- Right to data portability (export all data)
- Cookie consent banners
- Data processing agreements
- Data residency (store EU data in EU)

**Recommendation:** Defer until EU expansion planned. Design schema to support deletion from day 1.

**Action Items:**
- [ ] Ensure all tables support soft deletes
- [ ] Build data export API (useful for all users, not just GDPR)
- [ ] Add to backlog for EU expansion

---

## Third-Party Integration Decisions

### TI-001: Email Service Provider 🟡
**Status:** Open  
**Decision Needed By:** Week 1  
**Impact:** Email deliverability, cost

**Options:**
1. **SendGrid** (Twilio)
   - ✅ Great deliverability
   - ✅ Good templates
   - ✅ Free tier: 100 emails/day
   - Pricing: $15/mo for 40k emails

2. **AWS SES**
   - ✅ Cheapest ($0.10 per 1000 emails)
   - ✅ Reliable
   - ❌ More complex setup
   - ❌ No template designer

3. **Mailgun**
   - ✅ Developer-friendly API
   - ✅ Good analytics
   - Pricing: $35/mo for 50k emails

**Recommendation:** SendGrid for MVP (good DX, free tier). Switch to SES if costs become issue.

**Action Items:**
- [ ] Create SendGrid account
- [ ] Build email templates
- [ ] Test deliverability
- [ ] Decision by: 2025-11-10

---

### TI-002: Payment Processor Choice 🟡
**Status:** Open  
**Decision Needed By:** Before marketplace launch (Month 8)  
**Impact:** Payment fees, developer experience

**Options:**
1. **Stripe**
   - ✅ Best DX
   - ✅ Excellent documentation
   - ✅ Built-in fraud protection
   - Fee: 2.9% + $0.30 per transaction
   - ✅ Supports marketplace payouts (Stripe Connect)

2. **PayPal/Braintree**
   - ✅ Widely recognized brand
   - Fee: 2.9% + $0.30
   - ❌ More complex API
   - ❌ Less developer-friendly

3. **Square**
   - ✅ Good for in-person payments (future?)
   - Fee: 2.9% + $0.30 online
   - ❌ Less suited for marketplace

**Recommendation:** Stripe for marketplace. Stripe Connect for seller payouts.

**Action Items:**
- [ ] Create Stripe test account
- [ ] Prototype checkout flow
- [ ] Test payout workflow
- [ ] Decision by: 2026-04-01

---

### TI-003: E-Signature Provider 🟡
**Status:** Open  
**Decision Needed By:** Phase 2 (Month 4)  
**Impact:** User experience, cost

**Options:**
1. **DocuSign**
   - ✅ Industry leader
   - ✅ Best legal standing
   - ❌ Most expensive ($10 per envelope)
   - ✅ Best API

2. **HelloSign** (Dropbox)
   - ✅ Good DX
   - ✅ Cheaper ($15/mo for 150 docs)
   - ❌ Less well-known

3. **PandaDoc**
   - ✅ Includes proposal builder
   - ✅ All-in-one solution
   - ❌ More expensive
   - ❌ Less flexible

**Recommendation:** DocuSign for credibility with enterprise customers. Negotiate volume discount.

**Action Items:**
- [ ] Create DocuSign developer account
- [ ] Prototype envelope creation
- [ ] Test webhook reliability
- [ ] Get pricing quote for volume discount
- [ ] Decision by: 2026-01-01

---

## Performance & Scalability

### PS-001: Database Scaling Strategy 🟢
**Status:** Open (monitor during beta)  
**Decision Needed By:** When DB becomes bottleneck  
**Impact:** Application performance, costs

**Current Plan:** Single PostgreSQL instance (vertical scaling)

**Future Options:**
1. **Read Replicas** (for reporting queries)
   - ✅ Offload heavy reports
   - ✅ Easy to implement
   - ❌ Adds latency (replication lag)

2. **Sharding** (by company_id)
   - ✅ Horizontal scaling
   - ❌ Complex application changes
   - ❌ Cross-shard queries difficult

3. **Caching Layer** (Redis)
   - ✅ Reduce DB load
   - ✅ Fast for frequently-accessed data
   - ❌ Cache invalidation complexity

**Recommendation:** Start with single instance. Add read replicas for reports when needed (>100k users).

**Action Items:**
- [ ] Monitor query performance in production
- [ ] Set alert for slow queries (>1s)
- [ ] Implement caching for cost catalog, user sessions

---

### PS-002: File Storage Optimization 🟢
**Status:** Open (monitor costs)  
**Decision Needed By:** When storage costs exceed $500/mo  
**Impact:** Infrastructure costs

**Current Plan:** Store all files in S3 Standard

**Optimizations:**
1. **Lifecycle Policies**
   - Move old documents to S3 Glacier after 2 years
   - Saves 80% on storage costs

2. **Image Optimization**
   - Compress uploaded photos (reduce size by 50-70%)
   - Generate thumbnails for marketplace

3. **CDN for Marketplace Photos**
   - CloudFront distribution
   - Faster load times globally
   - Reduces S3 egress costs

**Recommendation:** Implement image optimization from day 1. Add lifecycle policies and CDN when costs warrant.

**Action Items:**
- [ ] Research image optimization libraries (sharp, imagemagick)
- [ ] Implement compression on upload
- [ ] Set up S3 lifecycle policy (defer to S3 Glacier after 730 days)

---

## Open Technical Questions

### TQ-001: Multi-Tenancy Implementation Details 🔴
**Status:** Open  
**Decision Needed By:** Week 2  
**Impact:** Data isolation, security

**Questions:**
1. Should we use Row-Level Security (RLS) in PostgreSQL?
   - Pro: Extra security layer
   - Con: Performance overhead, complexity

2. How to handle company_id in all queries?
   - Option A: ORM middleware (automatic)
   - Option B: Explicit in every query (safer but verbose)

**Recommendation:** Use ORM middleware to automatically inject company_id filter. Add RLS as extra security layer.

**Action Items:**
- [ ] Prototype RLS with Prisma
- [ ] Measure performance impact
- [ ] Write documentation for developers
- [ ] Decision by: 2025-11-17

---

### TQ-002: API Rate Limiting Strategy 🟡
**Status:** Open  
**Decision Needed By:** Before production  
**Impact:** DDoS protection, fair usage

**Questions:**
1. What rate limits to set?
   - Public API: 100 req/min per IP?
   - Authenticated: 1000 req/min per user?
   - Marketplace bidding: 30 bids/min per user?

2. How to communicate limits to clients?
   - HTTP headers (X-RateLimit-Remaining)?
   - Error messages?

**Recommendation:** Start conservative, relax based on usage patterns. Use Redis for distributed rate limiting.

**Action Items:**
- [ ] Implement rate limiting middleware (express-rate-limit)
- [ ] Add rate limit headers to API responses
- [ ] Document limits in API docs
- [ ] Decision by: 2026-06-01

---

## Deferred Questions (Post-MVP)

### DQ-001: AI Estimator Training Data Requirements
- What data fields needed for ML model?
- How much historical data required (100 projects? 1000?)
- Accuracy targets?

### DQ-002: White-Label Customization Scope
- Logo replacement only?
- Full color scheme customization?
- Custom domain support?

### DQ-003: API for Third-Party Developers
- REST only or GraphQL too?
- Rate limits for partners?
- SDK in multiple languages?

---

## Decision Log (Resolved Issues)

### ✅ RESOLVED: Programming Language Choice
**Decision:** TypeScript for entire stack
**Date:** 2025-11-03
**Rationale:** Type safety, shared types between frontend/backend, better developer experience

### ✅ RESOLVED: Frontend Framework
**Decision:** React (not Vue or Angular)
**Date:** 2025-11-03
**Rationale:** Largest ecosystem, easier hiring, can reuse for React Native mobile

### ✅ RESOLVED: Backend Framework
**Decision:** NestJS (not Express, Fastify, or Koa)
**Date:** 2025-11-03
**Rationale:** Opinionated structure, TypeScript-native, great for teams, built-in modules

### ✅ RESOLVED: Database Choice
**Decision:** PostgreSQL (not MySQL, MongoDB)
**Date:** 2025-11-03
**Rationale:** Relational data model fits well, JSONB for flexibility, excellent JSON support

### ✅ RESOLVED: TA-002 - Monorepo vs Multi-Repo
**Decision:** Monorepo with npm workspaces
**Date:** 2025-11-03
**Rationale:** Using native npm workspaces for simplicity. Provides code sharing benefits (types, utils) without additional tooling complexity. Can migrate to Nx/Turborepo later if build performance becomes an issue.

### ✅ RESOLVED: TA-004 - State Management (React)
**Decision:** Zustand
**Date:** 2025-11-03
**Rationale:** Lightweight with minimal boilerplate, perfect for MVP. Good performance without the complexity of Redux. Easy to migrate to Redux Toolkit later if application complexity demands it.

### ✅ RESOLVED: TA-003 - ORM Choice (TypeORM vs Prisma)
**Decision:** Prisma
**Date:** 2025-11-03
**Rationale:** Excellent TypeScript support and type safety. Simpler migration workflow perfect for rapid MVP development. Schema-first approach similar to Entity Framework from .NET. Generated Prisma Client provides full type safety across the application. Migration system is production-ready. User has .NET background and Prisma's approach is more familiar.

---

## How to Use This Document

**For New Issues:**
1. Add to appropriate section (Technical, Business, Feature, etc.)
2. Use template: Status, Decision Date, Impact, Options, Recommendation, Action Items
3. Assign priority (🔴 Blocker, 🟡 Important, 🟢 Nice-to-have)

**For Resolving Issues:**
1. Move to "Decision Log" section at bottom
2. Mark with ✅
3. Document decision and rationale

**Review Cadence:**
- Weekly: Review blockers (🔴)
- Bi-weekly: Review important items (🟡)
- Monthly: Review nice-to-haves (🟢)

---

**Document Owner:** Product & Engineering Leadership
**Decisions Resolved:** 7 total (4 foundational + 3 architectural)
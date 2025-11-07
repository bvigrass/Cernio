# Cernio

> **Demolition contractor platform with integrated salvage marketplace**

## Overview

Cernio is a comprehensive web and mobile application designed for demolition contractors that combines project management with a unique salvage-to-auction marketplace. The platform helps contractors manage projects, estimate costs with salvage credits, and sell reclaimed materials through an online auction system.

### Key Features

- **Project & Financial Management** - Track projects, estimates, contracts, and financials
- **Salvage Credit Estimator** - Unique feature that reduces bid amounts based on expected salvage value
- **Field Operations** - Mobile app for time tracking and expense logging
- **Online Marketplace** - Real-time auction system for selling salvaged materials
- **Multi-Tenant SaaS** - Each company has isolated data and users

## Tech Stack

### Frontend
- **Web:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Mobile:** React Native (Phase 3)
- **Marketplace:** Next.js (Phase 4)

### Backend
- **Framework:** NestJS (Node.js + TypeScript)
- **Database:** PostgreSQL 15+
- **Cache:** Redis
- **Authentication:** JWT with Passport
- **File Storage:** AWS S3 / Azure Blob Storage
- **Real-Time:** Socket.io

### Infrastructure
- **Containerization:** Docker
- **Orchestration:** Kubernetes
- **CI/CD:** GitHub Actions
- **Monitoring:** DataDog / New Relic

## Quick Start

### Prerequisites

- Node.js 20+ LTS
- PostgreSQL 15+ (for Phase 1+)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/cernio.git
   cd cernio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development servers:
   ```bash
   npm run dev
   ```

4. Open your browser:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api/v1

For detailed setup instructions, see [SETUP.md](./SETUP.md).

## Project Structure

```
cernio/
├── apps/
│   ├── backend/        # NestJS API server
│   └── web/            # React web application
├── packages/
│   ├── types/          # Shared TypeScript types
│   └── utils/          # Shared utility functions
└── docs/               # Documentation
    ├── REQUIREMENTS.md # Complete project requirements
    ├── TODO.md         # Implementation roadmap
    └── ISSUES.md       # Technical decisions
```

## Documentation

- **[SETUP.md](./SETUP.md)** - Development environment setup guide
- **[REQUIREMENTS.md](./docs/REQUIREMENTS.md)** - Complete functional and technical requirements
- **[TODO.md](./docs/TODO.md)** - Detailed implementation plan and task list
- **[ISSUES.md](./docs/ISSUES.md)** - Open issues and technical decisions

## Development

### Available Scripts

```bash
# Development
npm run dev              # Run both backend and frontend
npm run dev:backend      # Run backend only
npm run dev:web          # Run frontend only

# Build
npm run build            # Build all projects

# Testing
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:cov         # Generate coverage report

# Code Quality
npm run lint             # Lint all projects
npm run format           # Format code with Prettier
```

### Git Workflow

We use conventional commits and a standard branching strategy:

```bash
# Branch naming
feature/user-authentication
bugfix/login-validation
hotfix/security-patch

# Commit messages
feat: Add user registration endpoint
fix: Resolve JWT token expiration issue
docs: Update API documentation
test: Add unit tests for auth service
```

## Implementation Phases

### Phase 0: Foundation ✅ (Current)
- Project setup and infrastructure
- Monorepo structure
- Basic backend and frontend

### Phase 1: Authentication (Months 1-3)
- User registration and login
- User management
- Client database
- Project creation

### Phase 2: Estimating & Proposals (Months 4-5)
- Cost catalog
- Estimate builder with salvage credits
- Proposal generation
- E-signature integration

### Phase 3: Field Operations (Months 6-7)
- Mobile app (React Native)
- Time tracking
- Expense logging
- Invoicing

### Phase 4: Marketplace (Months 8-10)
- Salvage inventory
- Auction system
- Real-time bidding
- Payment processing

### Phase 5: Polish & Launch (Months 11-12)
- Analytics dashboard
- Performance optimization
- Beta testing
- Production deployment

## Contributing

This is a private project. For team members:

1. Create a feature branch from `develop`
2. Make your changes with tests
3. Submit a PR with description
4. Wait for code review approval
5. Merge to `develop` after approval

## API Documentation

API documentation is automatically generated and available at:

- Development: http://localhost:3000/api/docs
- Staging: https://staging-api.cernio.com/api/docs

## Testing

```bash
# Backend tests
npm run test --workspace=apps/backend

# Frontend tests
npm run test --workspace=apps/web

# E2E tests (coming in Phase 1)
npm run test:e2e
```

## Deployment

Deployment is automated via GitHub Actions:

- **Development:** Auto-deploy on merge to `develop` branch
- **Staging:** Auto-deploy on merge to `main` branch
- **Production:** Manual deployment with approval

See `.github/workflows/` for CI/CD configuration.

## Environment Variables

Copy `.env.example` files and update with your values:

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Web
cp apps/web/.env.example apps/web/.env
```

See [SETUP.md](./SETUP.md) for detailed configuration.

## License

Proprietary - All rights reserved

## Support

For issues and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation in `/docs`

---

**Status:** Phase 0 Complete - Ready for Phase 1
**Version:** 0.1.0
**Last Updated:** 2025-11-03

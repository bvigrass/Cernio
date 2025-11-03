# Database Setup Guide

## Prerequisites

### Install PostgreSQL

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Run installer, use default settings
3. Remember your postgres password
4. Default port: 5432

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql-15 postgresql-contrib
sudo systemctl start postgresql
```

---

## Quick Start

### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE cernio_dev;

# Exit
\q
```

### 2. Configure Environment

Update `apps/backend/.env`:
```env
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/cernio_dev"
```

### 3. Run Migrations

```bash
cd apps/backend
npm run prisma:migrate
```

This will:
- Create all tables
- Apply indexes
- Set up relations

### 4. Seed Test Data

```bash
npm run prisma:seed
```

This creates:
- 1 test company: "Demo Demolition Co."
- 3 test users with different roles

**Test Credentials:**
- Admin: `admin@demo.com` / `password123`
- PM: `pm@demo.com` / `password123`
- Worker: `worker@demo.com` / `password123`

---

## Prisma Commands

### Development

```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create and apply migration
npm run prisma:migrate

# Open Prisma Studio (GUI database browser)
npm run prisma:studio

# Reset database (⚠️ deletes all data)
npm run db:reset
```

### Production

```bash
# Deploy migrations (production)
npm run prisma:migrate:deploy
```

---

## Schema Overview

### Core Tables (Phase 0)

#### `companies`
- Multi-tenant parent entity
- Each company is isolated

#### `users`
- Belongs to a company
- Roles: SYSTEM_ADMIN, COMPANY_ADMIN, PROJECT_MANAGER, FIELD_WORKER, ACCOUNTANT
- Password hashed with bcrypt

#### `sessions`
- Stores refresh tokens
- Links to user
- Has expiration

#### `audit_events`
- Event sourcing for compliance
- Tracks all changes
- Stores before/after data as JSON

---

## Common Tasks

### Add a New Model

1. Edit `prisma/schema.prisma`
```prisma
model Project {
  id        String   @id @default(cuid())
  name      String
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])

  @@map("projects")
}
```

2. Add relation to Company
```prisma
model Company {
  // ... existing fields
  projects Project[]
}
```

3. Create migration
```bash
npm run prisma:migrate
# Enter migration name: "add_projects_table"
```

4. Prisma Client auto-updates
```typescript
// Now available:
await prisma.project.create({ ... })
```

### Query with Prisma

```typescript
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Find all users in a company
  async findAll(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
      include: { company: true },
    });
  }

  // Create user
  async create(data: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        ...data,
        password: await bcrypt.hash(data.password, 10),
      },
    });
  }
}
```

---

## Troubleshooting

### Can't connect to database
```bash
# Check PostgreSQL is running
# Windows:
services.msc  # Look for "postgresql-x64-15"

# macOS:
brew services list

# Linux:
sudo systemctl status postgresql
```

### Migration failed
```bash
# Reset and try again
npm run db:reset
npm run prisma:migrate
```

### Prisma Client out of sync
```bash
# Regenerate client
npm run prisma:generate
```

### Clear all data (development)
```bash
npm run db:reset
npm run prisma:seed
```

---

## Production Checklist

Before deploying to production:

- [ ] Use strong DATABASE_URL credentials
- [ ] Enable SSL in connection string (`?sslmode=require`)
- [ ] Set up automated backups
- [ ] Configure connection pooling (PgBouncer)
- [ ] Enable query logging for slow queries
- [ ] Set up database monitoring
- [ ] Test migration rollback procedure
- [ ] Document disaster recovery plan

---

## Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [NestJS + Prisma](https://docs.nestjs.com/recipes/prisma)

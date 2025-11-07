import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.auditEvent.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // Create test company
  const company = await prisma.company.create({
    data: {
      name: 'Demo Demolition Co.',
    },
  });
  console.log(`✅ Created company: ${company.name}`);

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // System Admin (SuperAdmin - you)
  const systemAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@cernio.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SYSTEM_ADMIN,
      companyId: company.id, // Still needs a company reference for schema consistency
    },
  });
  console.log(`✅ Created system admin: ${systemAdmin.email}`);

  // Company Admin (Tenant Admin)
  const companyAdmin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: hashedPassword,
      firstName: 'Company',
      lastName: 'Admin',
      role: UserRole.COMPANY_ADMIN,
      companyId: company.id,
    },
  });
  console.log(`✅ Created company admin: ${companyAdmin.email}`);

  // Regular User
  const regularUser = await prisma.user.create({
    data: {
      email: 'user@demo.com',
      password: hashedPassword,
      firstName: 'Regular',
      lastName: 'User',
      role: UserRole.USER,
      companyId: company.id,
    },
  });
  console.log(`✅ Created regular user: ${regularUser.email}`);

  console.log('✨ Seeding completed!');
  console.log('');
  console.log('Test credentials (all passwords: password123):');
  console.log('  SuperAdmin:     superadmin@cernio.com / password123');
  console.log('  Company Admin:  admin@demo.com / password123');
  console.log('  Regular User:   user@demo.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

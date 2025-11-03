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

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.COMPANY_ADMIN,
      companyId: company.id,
    },
  });
  console.log(`✅ Created admin user: ${adminUser.email}`);

  const pmUser = await prisma.user.create({
    data: {
      email: 'pm@demo.com',
      password: hashedPassword,
      firstName: 'Project',
      lastName: 'Manager',
      role: UserRole.PROJECT_MANAGER,
      companyId: company.id,
    },
  });
  console.log(`✅ Created PM user: ${pmUser.email}`);

  const fieldWorker = await prisma.user.create({
    data: {
      email: 'worker@demo.com',
      password: hashedPassword,
      firstName: 'Field',
      lastName: 'Worker',
      role: UserRole.FIELD_WORKER,
      companyId: company.id,
    },
  });
  console.log(`✅ Created field worker: ${fieldWorker.email}`);

  console.log('✨ Seeding completed!');
  console.log('');
  console.log('Test credentials:');
  console.log('  Admin:   admin@demo.com / password123');
  console.log('  PM:      pm@demo.com / password123');
  console.log('  Worker:  worker@demo.com / password123');
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

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let prisma: PrismaClient;

/**
 * Setup test database before running integration tests
 * Creates a fresh database with the schema applied
 */
export async function setupTestDatabase(): Promise<PrismaClient> {
  // Set test database URL
  const testDatabaseUrl = process.env.DATABASE_URL?.replace(
    'cernio_dev',
    'cernio_test',
  );

  if (!testDatabaseUrl) {
    throw new Error('DATABASE_URL not set in environment');
  }

  process.env.DATABASE_URL = testDatabaseUrl;

  // Create Prisma client
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: testDatabaseUrl,
      },
    },
  });

  // Connect to database
  await prisma.$connect();

  // Clean the database before tests
  await cleanDatabase();

  return prisma;
}

/**
 * Clean all data from the test database
 * Maintains schema but removes all records
 */
export async function cleanDatabase() {
  if (!prisma) {
    throw new Error('Test database not initialized');
  }

  // Delete in correct order to respect foreign key constraints
  await prisma.auditEvent.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
}

/**
 * Teardown test database after running tests
 */
export async function teardownTestDatabase() {
  if (prisma) {
    await cleanDatabase();
    await prisma.$disconnect();
  }
}

/**
 * Get the test Prisma client instance
 */
export function getTestPrisma(): PrismaClient {
  if (!prisma) {
    throw new Error('Test database not initialized. Call setupTestDatabase first.');
  }
  return prisma;
}

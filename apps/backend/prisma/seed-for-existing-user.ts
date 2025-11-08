import { PrismaClient, ClientType, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed for existing user...');

  // Get the first company that has users
  const company = await prisma.company.findFirst({
    include: { users: true },
  });

  if (!company) {
    console.error('No company found! Please create a user first.');
    return;
  }

  console.log(`Found company: ${company.name} (ID: ${company.id})`);
  console.log(`Company has ${company.users.length} users`);

  // Seed clients for this company
  const clients = [
    {
      name: 'Riverside Shopping Center LLC',
      type: ClientType.COMMERCIAL,
      imageUrl: 'https://ui-avatars.com/api/?name=Riverside+Shopping+Center&background=10B981&color=fff&size=200',
      street1: '4250 Commerce Boulevard',
      street2: 'Suite 100',
      city: 'Portland',
      state: 'Oregon',
      postalCode: '97220',
      country: 'United States',
      contacts: [
        {
          name: 'David Martinez',
          email: 'dmartinez@riversidesc.com',
          phone: '(503) 555-0142',
          role: 'Property Manager',
          imageUrl: 'https://i.pravatar.cc/150?img=12',
          isPrimary: true,
        },
        {
          name: 'Sarah Chen',
          email: 'schen@riversidesc.com',
          phone: '(503) 555-0143',
          role: 'Operations Director',
          imageUrl: 'https://i.pravatar.cc/150?img=5',
          isPrimary: false,
        },
      ],
    },
    {
      name: 'Metro Steel Manufacturing',
      type: ClientType.INDUSTRIAL,
      imageUrl: 'https://ui-avatars.com/api/?name=Metro+Steel&background=8B5CF6&color=fff&size=200',
      street1: '1875 Industrial Parkway',
      street2: '',
      city: 'Cleveland',
      state: 'Ohio',
      postalCode: '44135',
      country: 'United States',
      contacts: [
        {
          name: 'Robert Thompson',
          email: 'rthompson@metrosteel.com',
          phone: '(216) 555-0198',
          role: 'Facilities Director',
          imageUrl: 'https://i.pravatar.cc/150?img=33',
          isPrimary: true,
        },
        {
          name: 'Jennifer Walsh',
          email: 'jwalsh@metrosteel.com',
          phone: '(216) 555-0199',
          role: 'Safety Manager',
          imageUrl: 'https://i.pravatar.cc/150?img=20',
          isPrimary: false,
        },
        {
          name: 'Michael Rodriguez',
          email: 'mrodriguez@metrosteel.com',
          phone: '(216) 555-0200',
          role: 'Plant Manager',
          imageUrl: 'https://i.pravatar.cc/150?img=15',
          isPrimary: false,
        },
      ],
    },
    {
      name: 'Thompson Family Trust',
      type: ClientType.RESIDENTIAL,
      imageUrl: 'https://ui-avatars.com/api/?name=Thompson+Family&background=3B82F6&color=fff&size=200',
      street1: '892 Oakwood Drive',
      street2: '',
      city: 'Austin',
      state: 'Texas',
      postalCode: '78704',
      country: 'United States',
      contacts: [
        {
          name: 'James Thompson',
          email: 'james.thompson@email.com',
          phone: '(512) 555-0176',
          role: 'Homeowner',
          imageUrl: 'https://i.pravatar.cc/150?img=11',
          isPrimary: true,
        },
        {
          name: 'Lisa Thompson',
          email: 'lisa.thompson@email.com',
          phone: '(512) 555-0177',
          role: 'Homeowner',
          imageUrl: 'https://i.pravatar.cc/150?img=9',
          isPrimary: true,
        },
      ],
    },
    {
      name: 'City of Springfield Public Works',
      type: ClientType.MUNICIPAL,
      imageUrl: 'https://ui-avatars.com/api/?name=Springfield+PW&background=F59E0B&color=fff&size=200',
      street1: '324 City Hall Plaza',
      street2: 'Department of Public Works',
      city: 'Springfield',
      state: 'Illinois',
      postalCode: '62701',
      country: 'United States',
      contacts: [
        {
          name: 'Patricia Anderson',
          email: 'p.anderson@springfield.gov',
          phone: '(217) 555-0234',
          role: 'Public Works Director',
          imageUrl: 'https://i.pravatar.cc/150?img=47',
          isPrimary: true,
        },
        {
          name: 'Kevin Murphy',
          email: 'k.murphy@springfield.gov',
          phone: '(217) 555-0235',
          role: 'Project Coordinator',
          imageUrl: 'https://i.pravatar.cc/150?img=52',
          isPrimary: false,
        },
      ],
    },
  ];

  for (const clientData of clients) {
    const existingClient = await prisma.client.findFirst({
      where: {
        name: clientData.name,
        companyId: company.id,
      },
    });

    if (existingClient) {
      console.log(`Client "${clientData.name}" already exists for this company, skipping...`);
      continue;
    }

    const { contacts, ...clientInfo } = clientData;

    const client = await prisma.client.create({
      data: {
        ...clientInfo,
        companyId: company.id,
        contacts: {
          create: contacts,
        },
      },
      include: {
        contacts: true,
      },
    });

    console.log(`Created client: ${client.name} with ${client.contacts.length} contacts`);
  }

  console.log('Database seed completed!');

  // Seed projects for existing clients
  console.log('\nSeeding projects...');
  const existingClients = await prisma.client.findMany({
    where: { companyId: company.id },
    include: { projects: true },
  });

  if (existingClients.length === 0) {
    console.log('No clients found. Please seed clients first.');
    return;
  }

  const projectsData = [
    {
      clientName: 'Riverside Shopping Center LLC',
      name: 'North Wing Demolition',
      description: 'Complete demolition of north wing retail spaces including interior demolition, hazardous material abatement, and structural demolition.',
      status: ProjectStatus.ACTIVE,
      imageUrl: 'https://ui-avatars.com/api/?name=North+Wing&background=10B981&color=fff&size=200',
      street1: '4250 Commerce Boulevard',
      street2: 'North Wing',
      city: 'Portland',
      state: 'Oregon',
      postalCode: '97220',
      country: 'United States',
      startDate: new Date('2025-01-15'),
      estimatedCompletionDate: new Date('2025-04-30'),
      estimatedBudget: 285000,
      actualCost: 142500,
    },
    {
      clientName: 'Metro Steel Manufacturing',
      name: 'Warehouse C Teardown',
      description: 'Industrial warehouse demolition including steel structure dismantling, concrete foundation removal, and site remediation.',
      status: ProjectStatus.PLANNED,
      imageUrl: 'https://ui-avatars.com/api/?name=Warehouse+C&background=8B5CF6&color=fff&size=200',
      street1: '1875 Industrial Parkway',
      street2: 'Warehouse C',
      city: 'Cleveland',
      state: 'Ohio',
      postalCode: '44135',
      country: 'United States',
      startDate: new Date('2025-03-01'),
      estimatedCompletionDate: new Date('2025-06-15'),
      estimatedBudget: 520000,
    },
    {
      clientName: 'Thompson Family Trust',
      name: 'Residential Property Demolition',
      description: 'Single-family home demolition and lot clearing for new construction. Includes asbestos abatement and utility disconnection.',
      status: ProjectStatus.COMPLETED,
      imageUrl: 'https://ui-avatars.com/api/?name=Thompson+Home&background=3B82F6&color=fff&size=200',
      street1: '892 Oakwood Drive',
      street2: '',
      city: 'Austin',
      state: 'Texas',
      postalCode: '78704',
      country: 'United States',
      startDate: new Date('2024-11-01'),
      estimatedCompletionDate: new Date('2024-11-15'),
      actualCompletionDate: new Date('2024-11-14'),
      estimatedBudget: 28000,
      actualCost: 26750,
    },
    {
      clientName: 'City of Springfield Public Works',
      name: 'Old Municipal Building Demo',
      description: 'Demolition of 1960s municipal office building. Selective demolition to preserve historic facade elements for reuse.',
      status: ProjectStatus.ACTIVE,
      imageUrl: 'https://ui-avatars.com/api/?name=Municipal+Building&background=F59E0B&color=fff&size=200',
      street1: '324 City Hall Plaza',
      street2: 'Building 4',
      city: 'Springfield',
      state: 'Illinois',
      postalCode: '62701',
      country: 'United States',
      startDate: new Date('2025-01-08'),
      estimatedCompletionDate: new Date('2025-05-30'),
      estimatedBudget: 425000,
      actualCost: 198000,
    },
  ];

  for (const projectData of projectsData) {
    const client = existingClients.find((c) => c.name === projectData.clientName);
    if (!client) {
      console.log(`Client "${projectData.clientName}" not found, skipping project "${projectData.name}"`);
      continue;
    }

    const existingProject = await prisma.project.findFirst({
      where: {
        name: projectData.name,
        clientId: client.id,
      },
    });

    if (existingProject) {
      console.log(`Project "${projectData.name}" already exists, skipping...`);
      continue;
    }

    const { clientName, ...projectInfo } = projectData;

    await prisma.project.create({
      data: {
        ...projectInfo,
        clientId: client.id,
        companyId: company.id,
      },
    });

    console.log(`Created project: ${projectData.name} for client ${client.name}`);
  }

  console.log('\nAll seed data completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

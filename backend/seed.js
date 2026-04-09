import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data...');

    // 1. Create a Street
    const street = await prisma.street.upsert({
        where: { id: 'seed-street-1' },
        update: {},
        create: {
            id: 'seed-street-1',
            name: 'Main Boulevard',
        },
    });

    // 2. Create some Houses
    const house1 = await prisma.house.upsert({
        where: { id: 'seed-house-101' },
        update: {},
        create: {
            id: 'seed-house-101',
            houseNumber: 'A-101',
            streetId: street.id,
        },
    });

    const house2 = await prisma.house.upsert({
        where: { id: 'seed-house-102' },
        update: {},
        create: {
            id: 'seed-house-102',
            houseNumber: 'B-202',
            streetId: street.id,
        },
    });

    // 3. Create a Resident/User
    await prisma.user.upsert({
        where: { id: 'demo-resident-1' },
        update: {},
        create: {
            id: 'demo-resident-1',
            fullName: 'John Doe (Demo)',
            email: 'john@example.com',
            phoneNumber: '123456789',
            residentType: 'OWNER',
            role: 'MEMBER',
            houseId: house1.id,
        },
    });

    await prisma.user.upsert({
        where: { id: 'demo-resident-2' },
        update: {},
        create: {
            id: 'demo-resident-2',
            fullName: 'Jane Smith (Demo)',
            email: 'jane@example.com',
            phoneNumber: '987654321',
            residentType: 'TENANT',
            role: 'MEMBER',
            houseId: house2.id,
        },
    });

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

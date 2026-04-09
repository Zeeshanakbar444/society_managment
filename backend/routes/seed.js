import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', verifyToken, async (req, res) => {
    try {
        console.log('Seeding via API...');

        // 1. Street
        const street = await prisma.street.upsert({
            where: { id: 'seed-street-1' },
            update: {},
            create: { id: 'seed-street-1', name: 'Main Boulevard' },
        });

        // 2. Houses
        await prisma.house.upsert({
            where: { id: 'seed-house-101' },
            update: {},
            create: { id: 'seed-house-101', houseNumber: 'A-101', streetId: street.id },
        });

        await prisma.house.upsert({
            where: { id: 'seed-house-102' },
            update: {},
            create: { id: 'seed-house-102', houseNumber: 'B-202', streetId: street.id },
        });

        // 3. Residents
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
                houseId: 'seed-house-101',
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
                houseId: 'seed-house-101', // Mapping both to same house for demo ease if needed
            },
        });

        res.json({ message: 'Database seeded successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Seed failed: ' + err.message });
    }
});

export default router;

import express from 'express';
import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';

const router = express.Router();
const prisma = new PrismaClient();

// Get all residents
router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: { house: { include: { street: true } } },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create resident
router.post('/', async (req, res) => {
    const { id, fullName, phoneNumber, email, residentType, houseId } = req.body;
    try {
        const userCount = await prisma.user.count();
        const role = userCount === 0 ? 'ADMIN' : (req.body.role || 'MEMBER');

        const user = await prisma.user.upsert({
            where: { id },
            update: {
                fullName,
                phoneNumber,
                email,
                role,
                residentType,
                houseId,
            },
            create: {
                id,
                fullName,
                phoneNumber,
                email,
                role,
                residentType,
                houseId,
            },
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get resident by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: {
                house: { include: { street: true } },
                complaints: true
            },
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update resident (role, residentType, houseId, fullName, phoneNumber, email)
router.patch('/:id', async (req, res) => {
    const { fullName, phoneNumber, email, residentType, houseId, role } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                ...(fullName !== undefined && { fullName }),
                ...(phoneNumber !== undefined && { phoneNumber }),
                ...(email !== undefined && { email }),
                ...(residentType !== undefined && { residentType }),
                ...(houseId !== undefined && { houseId }),
                ...(role !== undefined && { role }),
            },
            include: { house: { include: { street: true } } },
        });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete resident — removes from Firebase Auth AND the database
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Delete from Firebase Authentication (ignore if user doesn't exist there)
        try {
            await admin.auth().deleteUser(id);
        } catch (firebaseErr) {
            // user-not-found is acceptable (e.g. seeded users without Firebase account)
            if (firebaseErr.code !== 'auth/user-not-found') {
                return res.status(500).json({ error: `Firebase deletion failed: ${firebaseErr.message}` });
            }
        }

        // 2. Delete from Prisma database
        await prisma.user.delete({ where: { id } });

        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;

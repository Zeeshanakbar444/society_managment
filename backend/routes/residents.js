import express from 'express';
import { PrismaClient } from '@prisma/client';

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

// Create/Update resident (Upsert based on Firebase UID)
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


// delete user account 
// Delete resident
// router.delete('/:id', async (req, res) => {
//     try {
//         await prisma.user.delete({
//             where: { id: req.params.id },
//         });
//         res.status(204).send();
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });


export default router;

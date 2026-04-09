import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all houses
router.get('/', async (req, res) => {
    try {
        const houses = await prisma.house.findMany({
            include: { street: true, residents: true },
        });
        res.json(houses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a house
router.post('/', async (req, res) => {
    const { houseNumber, streetId } = req.body;
    try {
        const house = await prisma.house.create({
            data: { houseNumber, streetId },
        });
        res.status(201).json(house);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;

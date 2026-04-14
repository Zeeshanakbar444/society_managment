import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Get all streets
router.get('/', async (req, res) => {
    try {
        const streets = await prisma.street.findMany({
            include: { houses: true },
        });
        res.json(streets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a street
router.post('/', async (req, res) => {
    const { name } = req.body;
    try {
        const street = await prisma.street.create({
            data: { name },
        });
        res.status(201).json(street);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;

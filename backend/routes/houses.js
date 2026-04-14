import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

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
            include: { street: true },
        });
        res.status(201).json(house);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a house
router.patch('/:id', async (req, res) => {
    const { houseNumber, streetId } = req.body;
    try {
        const house = await prisma.house.update({
            where: { id: req.params.id },
            data: {
                ...(houseNumber !== undefined && { houseNumber }),
                ...(streetId !== undefined && { streetId }),
            },
            include: { street: true },
        });
        res.json(house);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a house
router.delete('/:id', async (req, res) => {
    try {
        await prisma.house.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;

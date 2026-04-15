import express from 'express';
import prisma from '../lib/prisma.js';
import { handlePrismaError } from '../lib/errorHandlers.js';

const router = express.Router();

// Get all streets
router.get('/', async (req, res) => {
    try {
        const streets = await prisma.street.findMany({
            include: { houses: true },
        });
        res.json(streets);
    } catch (error) {
        return handlePrismaError(error, res, "Streets");
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
        return handlePrismaError(error, res, "Street");
    }
});

export default router;

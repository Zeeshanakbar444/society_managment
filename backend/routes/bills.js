import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all bills
router.get('/', async (req, res) => {
    try {
        const bills = await prisma.bill.findMany({
            include: { house: { include: { street: true } } },
        });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate monthly bills for all houses
router.post('/generate', async (req, res) => {
    const { amount, dueDate, billingMonth } = req.body; // billingMonth as ISO string
    try {
        const houses = await prisma.house.findMany();
        const billingDate = new Date(billingMonth);
        billingDate.setDate(1); // Set to first of month

        const bills = await Promise.all(
            houses.map((house) =>
                prisma.bill.create({
                    data: {
                        amount,
                        dueDate: new Date(dueDate),
                        billingMonth: billingDate,
                        houseId: house.id,
                    },
                })
            )
        );
        res.status(201).json({ message: `Generated ${bills.length} bills`, bills });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update payment status
router.patch('/:id/status', async (req, res) => {
    const { status, paidAt } = req.body;
    try {
        const bill = await prisma.bill.update({
            where: { id: req.params.id },
            data: {
                status,
                paidAt: status === 'PAID' ? new Date(paidAt || Date.now()) : null,
            },
        });
        res.json(bill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;

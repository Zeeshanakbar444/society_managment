import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Get all billls
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
    const { amount, dueDate, billingMonth } = req.body;
    try {
        const houses = await prisma.house.findMany();
        if (houses.length === 0) {
            return res.status(400).json({ error: 'No houses found to generate bills for.' });
        }

        const billingDate = new Date(billingMonth);
        billingDate.setDate(1);
        billingDate.setHours(0, 0, 0, 0);

        const due = new Date(dueDate);

        // Check if bills already exist for this month to avoid duplicates
        const existingBills = await prisma.bill.findFirst({
            where: {
                billingMonth: billingDate
            }
        });

        if (existingBills) {
            return res.status(400).json({ error: 'Bills for this month have already been generated.' });
        }

        const billData = houses.map((house) => ({
            amount: amount,
            dueDate: due,
            billingMonth: billingDate,
            houseId: house.id,
            status: 'UNPAID'
        }));

        const result = await prisma.bill.createMany({
            data: billData,
            skipDuplicates: true,
        });

        res.status(201).json({
            message: `Generated ${result.count} bills`,
            count: result.count
        });
    } catch (error) {
        console.error('Billing generation error:', error);
        res.status(500).json({ error: error.message });
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

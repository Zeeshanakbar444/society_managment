import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Get all expenses
router.get('/', async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany();
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Record an expense
router.post('/', async (req, res) => {
    const { title, amount, category, date, description } = req.body;
    try {
        const expense = await prisma.expense.create({
            data: {
                title,
                amount,
                category,
                date: date ? new Date(date) : undefined,
                description,
            },
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;

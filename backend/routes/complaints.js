import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all complaints
router.get('/', async (req, res) => {
    try {
        const complaints = await prisma.complaint.findMany({
            include: {
                user: true,
                house: { include: { street: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create complaint
router.post('/', async (req, res) => {
    const { subject, description, houseId, userId } = req.body;
    try {
        const complaint = await prisma.complaint.create({
            data: { subject, description, houseId, userId, status: 'OPEN' },
        });
        res.status(201).json(complaint);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update complaint status (Admin only — state machine)
router.patch('/:id/status', async (req, res) => {
    const { status, adminNote } = req.body;
    try {
        const currentComplaint = await prisma.complaint.findUnique({
            where: { id: req.params.id },
        });

        if (!currentComplaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        // To CLOSE, an adminNote is required
        if (status === 'CLOSED' && !adminNote && !currentComplaint.adminNote) {
            return res.status(400).json({ error: 'Closing note is required from Admin before closing a complaint.' });
        }

        const complaint = await prisma.complaint.update({
            where: { id: req.params.id },
            data: {
                status,
                adminNote: adminNote || undefined,
            },
        });
        res.json(complaint);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
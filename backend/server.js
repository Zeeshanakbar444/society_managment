import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import streetRoutes from './routes/streets.js';
import houseRoutes from './routes/houses.js';
import residentRoutes from './routes/residents.js';
import billRoutes from './routes/bills.js';
import expenseRoutes from './routes/expenses.js';
import complaintRoutes from './routes/complaints.js';
import seedRoutes from './routes/seed.js';

import { verifyToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/streets', verifyToken, streetRoutes);
app.use('/api/houses', verifyToken, houseRoutes);
app.use('/api/residents', verifyToken, residentRoutes);
app.use('/api/bills', verifyToken, billRoutes);
app.use('/api/expenses', verifyToken, expenseRoutes);
app.use('/api/complaints', verifyToken, complaintRoutes);
app.use('/api/seed', verifyToken, seedRoutes);
app.use('/api/user', verifyToken, seedRoutes);

const PORT = process.env.PORT || 5000;

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

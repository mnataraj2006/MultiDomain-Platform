import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import Booking from './models/Booking.js';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// Parse comma-separated origins, e.g. "https://foo.vercel.app,https://bar.vercel.app"
const rawOrigins = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);

const originFn = (origin, callback) => {
    // Allow server-to-server requests (no origin) and local dev
    if (!origin || origin.startsWith('http://localhost')) {
        return callback(null, true);
    }
    // Allow if explicitly listed
    if (rawOrigins.includes(origin)) {
        return callback(null, true);
    }
    // Allow any Vercel preview/production URL for the same project
    if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
    }
    // Fallback: If no explicit CORS_ORIGIN is defined in env, allow all by echoing (required for credentials)
    if (rawOrigins.length === 0) {
        return callback(null, true);
    }
    callback(null, false); // Reject cleanly without throwing an Express error
};

const corsOptions = { origin: originFn, credentials: true };

const io = new Server(httpServer, {
    cors: { origin: originFn, methods: ['GET', 'POST'] }
});

app.use(cors(corsOptions));
app.use(express.json());

import platformRoutes from './routes/platformRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import serviceRequestRoutes from './routes/serviceRequestRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

// ... (previous imports)

app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);
import settingsRoutes from './routes/settingsRoutes.js';

// ... (previous imports)

app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api', platformRoutes); // Base API for core features

// Real-time Booking Updates
const setupChangeStream = () => {
    try {
        const bookingStream = Booking.watch();
        bookingStream.on('change', (change) => {
            console.log('Booking Change:', change.operationType);
            io.emit('bookingUpdate', change);
        });
        bookingStream.on('error', (err) => {
            console.log('Booking ChangeStream error (replica set needed?):', err.message);
        });

        // Payment Watcher
        // Note: Payment model must be imported
        import('./models/Payment.js').then((module) => {
            const Payment = module.default;
            const paymentStream = Payment.watch();
            paymentStream.on('change', (change) => {
                console.log('Payment Change:', change.operationType);
                io.emit('paymentUpdate', change);
            });
            paymentStream.on('error', (err) => {
                console.log('Payment ChangeStream error (replica set needed?):', err.message);
            });
        }).catch(err => console.log('Payment watch error', err));

    } catch (error) {
        console.log("Change streams error:", error.message);
    }
};

mongoose.connection.once('open', () => {
    setupChangeStream();
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));


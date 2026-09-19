import express from 'express';
import cors from 'cors';
import { i18next, i18nextMiddleware } from './config/i18n';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import workerRoutes from './routes/worker.routes';
import serviceRoutes from './routes/service.routes';
import searchRoutes from './routes/search.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import reviewRoutes from './routes/review.routes';
import disputeRoutes from './routes/dispute.routes';
import adminRoutes from './routes/admin.routes';
import notificationRoutes from './routes/notification.routes';
import policyRoutes from './routes/policy.routes';

const app = express();

// ============================================
// Core Middleware
// ============================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(i18nextMiddleware.handle(i18next));
app.use(apiLimiter);

// ============================================
// Health Check
// ============================================
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'SewaShayog API is running 🚀',
    version: '1.0.0',
    team: 'WorkLoom',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// API Routes
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/policies', policyRoutes);

// ============================================
// 404 Handler
// ============================================
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Route not found',
  });
});

// ============================================
// Global Error Handler (must be last)
// ============================================
app.use(errorHandler);

export default app;

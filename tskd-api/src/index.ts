import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRoutes from './auth-routes';

const app = new Hono();

// CORS configuration
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'https://yourdomain.com'
  ],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  credentials: true
}));

// Mount auth routes
app.route('/auth', authRoutes);

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  }, 500);
});

export default app;

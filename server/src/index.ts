import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
]
  .filter(Boolean)
  .map((url) => (url as string).trim().replace(/\/+$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (mobile apps, curl, server-to-server tests)
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.trim().replace(/\/+$/, '');
      // In development or if origin matches allowed list or Vercel domain
      if (
        process.env.NODE_ENV !== 'production' ||
        allowedOrigins.some((allowed) => allowed.toLowerCase() === normalizedOrigin.toLowerCase()) ||
        normalizedOrigin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

// Root & Health Checks
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'FoodRescue Core API',
    version: '2.0.0',
    documentation: 'See /api/health for system status',
  });
});

app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'FoodRescue Core API',
  });
});

// API Routes (supports both /api/resource and /resource)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/donations', '/donations'], donationRoutes);
app.use(['/api/requests', '/requests'], requestRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);
app.use(['/api/stats', '/stats'], statsRoutes);

// 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Only bind to local port when not running as a Vercel serverless function
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`FoodRescue Backend server running on port ${PORT}`);
  });
}

export default app;

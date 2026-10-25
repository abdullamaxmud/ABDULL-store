const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

// Load environment configuration (server/.env locally; real environment variables on the host)
dotenv.config({ path: path.join(__dirname, '.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Refuse to start online with missing or unsafe settings rather than run insecurely
if (isProduction) {
  const problems = [];
  try {
    require('./config/jwt').getJwtSecret();
  } catch (err) {
    problems.push(err.message);
  }
  if (!process.env.MONGO_URI) problems.push('MONGO_URI is not set');
  if (problems.length) {
    console.error(`❌ Cannot start in production:\n - ${problems.join('\n - ')}`);
    process.exit(1);
  }
}

// Connect to MongoDB
connectDB();

const app = express();

// Behind a hosting proxy (Render, Railway, ...) trust its X-Forwarded-For header so
// rate limiting and logs see the visitor's real IP instead of the proxy's
if (isProduction) app.set('trust proxy', 1);

// Disable X-Powered-By header to prevent fingerprinting
app.disable('x-powered-by');

// 1. Set HTTP Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Allows cross-origin API interactions and client SPAs
  })
);

// 2. Strict CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

// The live site's own address: CLIENT_URL if set, plus the URL Render assigns automatically
for (const url of [process.env.CLIENT_URL, process.env.RENDER_EXTERNAL_URL]) {
  const clean = (url || '').replace(/\/+$/, '');
  if (clean && !allowedOrigins.includes(clean)) allowedOrigins.push(clean);
}

// CORS only guards the API. The site's own pages, scripts and styles (served below)
// are same-origin, and requests from the site's own address are always allowed — so
// the store keeps working on any domain it is deployed to.
app.use(
  '/api',
  cors((req, callback) => {
    const origin = req.header('Origin');
    const ownOrigin = `${req.protocol}://${req.get('host')}`;
    const base = {
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    };

    // No origin: mobile apps, Postman, server-to-server
    if (!origin || origin === ownOrigin || allowedOrigins.includes(origin)) {
      return callback(null, { ...base, origin: true });
    }

    return callback(new Error(`CORS policy violation: Origin "${origin}" is not authorized.`));
  })
);

// Stripe webhook needs the untouched raw body for signature verification,
// so it is registered before the JSON parser and sanitizers.
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json', limit: '1mb' }),
  require('./controllers/paymentController').handleStripeWebhook
);

// 3. Body Parser Middleware with safe payload size limit (4MB supports user avatar uploads)
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '4mb' }));
app.use(cookieParser());

// 4. Data Sanitization against NoSQL Query Injection (strips '$' and '.' from req.body, req.query, req.params)
app.use(mongoSanitize());

// 5. Prevent HTTP Parameter Pollution (HPP)
app.use(
  hpp({
    whitelist: ['price', 'rating', 'category', 'brand', 'inStock', 'hasDiscount', 'sort', 'page', 'limit'],
  })
);

// 6. Apply Global API Rate Limiting to prevent DoS and brute-force scraping
app.use('/api', apiLimiter);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ABDULL E-Commerce REST API is operational and secure',
    timestamp: new Date().toISOString(),
  });
});

// Mount Application REST Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Serve the built React storefront (client/dist) from this same server, so the
// whole store runs as one web service. Any non-API page falls back to index.html
// and React Router takes it from there.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (require('fs').existsSync(path.join(clientDist, 'index.html'))) {
  app.use(
    express.static(clientDist, {
      index: false,
      setHeaders: (res, filePath) => {
        // Hashed build assets never change; index.html must always be fresh
        if (filePath.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      },
    })
  );
  app.get(/^\/(?!api(\/|$)).*/, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🛡️ ABDULL Secure Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🛍️ Health: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

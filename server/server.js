const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { ensureSchema } = require('./db/initDb');
const { sseHandler } = require('./services/realtime.service');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Real-time Server-Sent Events (SSE) stream
app.get('/api/events', sseHandler);

// Routes
const authRoutes = require('./routes/auth.routes');
const sosRoutes = require('./routes/sos.routes');
const garageRoutes = require('./routes/garage.routes');
const adminRoutes = require('./routes/admin.routes');
const vehicleRoutes = require('./routes/vehicle.routes');

app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/garage', garageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vehicles', vehicleRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'rapid-revive-api', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.send({ status: 'Online', message: 'Rapid-Revive API Running' });
});

app.get('/', (req, res) => {
  res.send({ status: 'Online', message: 'Rapid-Revive API Server Running' });
});

if (!process.env.VERCEL) {
  ensureSchema()
    .then(() => {
      console.log('✅ Database schema verified & synchronized');
      app.listen(PORT, () => {
        console.log(`🚀 Rapid-Revive Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ Database initialization failed:', err.message);
      app.listen(PORT, () => {
        console.log(`🚀 Rapid-Revive Server running on port ${PORT} (DB init error)`);
      });
    });
}

// Export for Vercel Serverless Functions
module.exports = app;

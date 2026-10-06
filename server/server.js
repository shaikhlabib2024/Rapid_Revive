const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth.routes');
const sosRoutes = require('./routes/sos.routes');
const garageRoutes = require('./routes/garage.routes');
const adminRoutes = require('./routes/admin.routes');

app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/garage', garageRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send({ status: 'Online', message: 'Rapid-Revive API Server Running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Rapid-Revive Server running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
const seedDatabase = require('./utils/seed');

// Route modules
const infoRoutes = require('./routes/info.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const authRoutes = require('./routes/auth.routes');
const uploadRoutes = require('./routes/upload.routes');
const pengurusRoutes = require('./routes/pengurus.routes');
const settingsRoutes = require('./routes/settings.routes');
const programRoutes = require('./routes/program.routes');
const partnerRoutes = require('./routes/partner.routes');
const path = require('path');

const app = express();

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --------------- API Routes ---------------
app.use('/api/auth', authRoutes);
app.use('/api/info', infoRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/pengurus', pengurusRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/program', programRoutes);
app.use('/api/partner', partnerRoutes);

// --------------- Health & Index ---------------
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to the Karangtaruna Rawa Arum Modular API' });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// --------------- Server Startup ---------------
const PORT = process.env.PORT || 5555;

const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server startup failed. Running in offline fallback mode.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (Database offline)`);
    });
  }
};

startServer();

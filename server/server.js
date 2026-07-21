const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
const seedDatabase = require('./utils/seed');

// Route modules
const infoRoutes = require('./routes/info.routes');
const registerRoutes = require('./routes/register.routes');
const newsletterRoutes = require('./routes/newsletter.routes');

const app = express();

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json());

// --------------- API Routes ---------------
app.use('/api/info', infoRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/newsletter', newsletterRoutes);

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
const PORT = process.env.PORT || 5000;

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

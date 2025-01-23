const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user');
const missionRoutes = require('./routes/mission');
const missionFactorRoutes = require('./routes/missionFactor');
const dotenv = require('dotenv');

dotenv.config();

// Create log directory if it doesn't exist
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create a write stream for logging
const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'server.log'), 
  { flags: 'a' }
);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Custom logging middleware
app.use((req, res, next) => {
  const log = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
  accessLogStream.write(log);
  console.log(log.trim());
  next();
});

// Import like routes
const likeRoutes = require('./routes/like');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/mission-factors', missionFactorRoutes);
app.use('/api/likes', likeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const errorLog = `${new Date().toISOString()} - ERROR: ${err.stack || err.message}\n`;
  accessLogStream.write(errorLog);
  console.error('Detailed error:', {
    message: err.message,
    stack: err.stack,
    errors: err.errors,
    requestBody: req.body,
    requestParams: req.params,
    requestQuery: req.query
  });
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      errors: err.errors,
      requestBody: req.body,
      requestParams: req.params,
      requestQuery: req.query
    }
  });
});

// Run migrations and start server
const PORT = process.env.PORT || 5000;
const { sequelize } = require('./models');

sequelize.sync()
  .then(() => {
    app.listen(PORT, () => {
      const startLog = `Server running on port ${PORT}\n`;
      accessLogStream.write(startLog);
      console.log(startLog.trim());
    });
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
    process.exit(1);
  });

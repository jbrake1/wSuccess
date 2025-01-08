const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Import models
require('./models/Success');
require('./models/RelevantFact');
require('./models/RelevantAssumption');

// Import routes
const authRoutes = require('./routes/auth');
const missionRoutes = require('./routes/missions');
const userRoutes = require('./routes/users');
const successRoutes = require('./routes/successes');
const relevantFactRoutes = require('./routes/relevant_facts');
const relevantAssumptionRoutes = require('./routes/relevant_assumptions');
const constraintsNObstaclesRoutes = require('./routes/constraints_n_obstacles');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/users', userRoutes);
app.use('/api', successRoutes);
app.use('/api', relevantFactRoutes);
app.use('/api', relevantAssumptionRoutes);
app.use('/api/constraints_n_obstacles', constraintsNObstaclesRoutes);

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

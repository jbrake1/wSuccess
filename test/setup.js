const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function setupTestDatabase() {
  // Connect to test database
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/project_management_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Clear existing test data
  await mongoose.connection.dropDatabase();

  // Create test user
  const hashedPassword = await bcrypt.hash('4240!', 10);
  await User.create({
    name: 'Test User',
    email: 'support@dwalliance.com',
    password: hashedPassword,
  });

  console.log('Test database setup complete');
  await mongoose.connection.close();
}

setupTestDatabase().catch(err => {
  console.error('Test database setup failed:', err);
  process.exit(1);
});

const Mocha = require('mocha');
const path = require('path');
const { exec } = require('child_process');
const { Builder, By, until } = require('selenium-webdriver');
const net = require('net');
require('dotenv').config({ path: '.env.test' });

async function isServerReady(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch (err) {
      // Ignore errors and retry
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

// Create new Mocha instance
const mocha = new Mocha({
  timeout: 30000, // 30 second timeout
  reporter: 'spec'
});

// Add test files
mocha.addFile(path.join(__dirname, 'users.test.js'));
mocha.addFile(path.join(__dirname, 'missions.test.js'));
mocha.addFile(path.join(__dirname, 'successes.test.js'));
mocha.addFile(path.join(__dirname, 'collaborators.test.js'));
mocha.addFile(path.join(__dirname, 'drivers_resources.test.js'));

// Start server and run tests
(async function() {
  try {
    console.log('Checking server status...');
    
    let backendProcess, frontendProcess;
    
    // Check backend server
    if (!await isServerReady('http://localhost:5000/health')) {
      console.log('Starting backend server...');
      backendProcess = exec('npm start');
      if (!await isServerReady('http://localhost:5000/health')) {
        throw new Error('Backend server failed to start');
      }
    }
    
    // Check frontend server
    if (!await isServerReady('http://localhost:3000')) {
      console.log('Starting frontend server...');
      frontendProcess = exec('cd client && npm start');
      if (!await isServerReady('http://localhost:3000')) {
        throw new Error('Frontend server failed to start');
      }
    }
    
    console.log('Servers are ready');

    // Run tests
    mocha.run(failures => {
      process.exit(failures ? 1 : 0);
    });
  } catch (error) {
    console.error('Error starting servers:', error);
    process.exit(1);
  }
})();

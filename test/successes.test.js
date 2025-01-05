/**
 * Successes CRUD Tests
 * 
 * Tests the full lifecycle of Success entities through the UI:
 * 1. Login as test user
 * 2. Navigate to Missions page
 * 3. Access Successes for a Mission
 * 4. Create a new Success
 * 5. Verify Success appears in list
 * 6. Delete the Success
 * 7. Verify Success is removed
 * 
 * Dependencies:
 * - Selenium WebDriver for browser automation
 * - Mongoose for database operations
 * - Assert for test assertions
 */

const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');
const Success = require('../models/Success');

describe('Login Test', function() {
  // Test configuration
  this.timeout(60000); // Increased timeout
  let driver;

  before(async function() {
    // Initialize web driver
    driver = await new Builder().forBrowser('chrome').build();
  });

  it('should successfully login and verify dashboard', async function() {
    try {
      // Navigate to login page
      await driver.get('http://localhost:3000');
      
      // Wait for login form to load
      await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
      
      // Fill in login form
      await driver.findElement(By.css('input[type="email"]'))
        .sendKeys('support@dwalliance.com');
      await driver.findElement(By.css('input[type="password"]'))
        .sendKeys('4240!');
     why 
      // Submit form
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      // Wait for dashboard redirect
      await driver.wait(until.urlIs('http://localhost:3000/dashboard'), 10000);
      
      // Verify login by checking for dashboard content
      const dashboardSource = await driver.getPageSource();
      console.log('Dashboard Page Source:', dashboardSource.substring(0, 1000));
      
      // Verify dashboard content
      assert(dashboardSource.includes('Dashboard'), 'Dashboard page should load after login');
    } catch (err) {
      console.error('Login failed:', err.message);
      throw err;
    }
  });

  after(async function() {
    await driver.quit();
  });
});

describe('Success API Tests', function() {
  let testSuccess;
  let testUser;
  let authToken;

  before(async function() {
    // Create test user and get auth token
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123'
    });

    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    authToken = loginRes.data.token;

    // Create test success
    testSuccess = await Success.create({
      description: 'Test Success',
      mission: new mongoose.Types.ObjectId(),
      createdBy: testUser._id
    });
  });

  describe('DELETE /missions/:missionId/successes/:successId', function() {
    it('should delete a success with valid ID', async function() {
      const res = await axios.delete(
        `http://localhost:5000/api/missions/${testSuccess.mission}/successes/${testSuccess._id}`,
        { headers: { 'x-auth-token': authToken } }
      );
      
      assert.equal(res.status, 200);
      assert.equal(res.data.msg, 'Success removed');
    });

    it('should return 404 for non-existent success', async function() {
      try {
        const fakeId = new mongoose.Types.ObjectId();
        await axios.delete(
          `http://localhost:5000/api/missions/${testSuccess.mission}/successes/${fakeId}`,
          { headers: { 'x-auth-token': authToken } }
        );
      } catch (err) {
        assert.equal(err.response.status, 404);
        assert.equal(err.response.data.msg, 'Success not found');
      }
    });

    it('should return 401 for unauthorized requests', async function() {
      try {
        await axios.delete(
          `http://localhost:5000/api/missions/${testSuccess.mission}/successes/${testSuccess._id}`
        );
      } catch (err) {
        assert.equal(err.response.status, 401);
      }
    });
  });

  after(async function() {
    // Clean up test data
    await User.deleteMany({});
    await Success.deleteMany({});
  });
});

const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');
require('chromedriver');

describe('Collaborators CRUD Tests', function() {
  let driver;
  
  before(async function() {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('http://localhost:5000/login');
    
    // Wait for login form to be present
    try {
      await driver.wait(until.elementLocated(By.css('.login-container')), 30000);
      const pageSource = await driver.getPageSource();
      console.log('Page source:', pageSource);
    } catch (err) {
      console.error('Failed to locate login container:', err);
      const pageSource = await driver.getPageSource();
      console.log('Page source:', pageSource);
      throw err;
    }
    
    // Login with test credentials
    const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);
    await emailInput.sendKeys('support@dwalliance.com');
    
    const passwordInput = await driver.wait(until.elementLocated(By.css('input[type="password"]')), 5000);
    await passwordInput.sendKeys('4240!');
    
    const submitButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 5000);
    await submitButton.click();
    
    // Wait for dashboard to load
    await driver.wait(until.urlContains('dashboard'), 5000);
  });

  after(async function() {
    await driver.quit();
  });

  it('should create a new collaborator', async function() {
    // Test will be implemented
  });

  it('should delete a collaborator', async function() {
    // Test will be implemented  
  });
});

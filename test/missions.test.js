const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

describe('Missions CRUD Tests', function() {
  this.timeout(30000);
  let driver;

  before(async function() {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('http://localhost:3000/');
    
    // Login with test credentials
    try {
      // Wait for login form to load
      await driver.wait(until.elementLocated(By.css('.login-container')), 5000);
      
      // Fill out login form
      const emailField = await driver.findElement(By.css('.login-container input[type="email"]'));
      const passwordField = await driver.findElement(By.css('.login-container input[type="password"]'));
      const submitButton = await driver.findElement(By.css('.login-container button[type="submit"]'));
      
      await emailField.sendKeys('support@dwalliance.com');
      await passwordField.sendKeys('4240!');
      await submitButton.click();
      
      // Wait for dashboard to load
      await driver.wait(until.elementLocated(By.css('.dashboard')), 5000);
    } catch (err) {
      console.error('Login failed. Current URL:', await driver.getCurrentUrl());
      console.error('Page source after login attempt:');
      console.error(await driver.getPageSource());
      throw err;
    }
  });

  after(async function() {
    await driver.quit();
  });

  it('should create a new mission', async function() {
    await driver.get('http://localhost:3000/missions/new');
    
    // Fill out mission form
    await driver.wait(until.elementLocated(By.css('.mission-form')), 5000);
    await driver.findElement(By.name('name')).sendKeys('Test Mission');
    await driver.findElement(By.name('description')).sendKeys('Test Description');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Verify mission creation
    await driver.wait(until.elementLocated(By.css('.mission-list')), 5000);
    const missionList = await driver.findElement(By.css('.mission-list')).getText();
    assert(missionList.includes('Test Mission'), 'New mission should appear in list');
  });

  it('should delete a mission', async function() {
    await driver.get('http://localhost:3000/missions');
    
    // Click delete on first mission
    await driver.wait(until.elementLocated(By.css('.mission-list')), 5000);
    const deleteButton = await driver.findElement(By.css('.mission-list-item:first-child .delete-btn'));
    await deleteButton.click();
    
    // Confirm deletion
    await driver.wait(until.alertIsPresent(), 5000);
    await driver.switchTo().alert().accept();
    
    // Verify deletion
    await driver.wait(until.elementLocated(By.css('.mission-list')), 5000);
    const missionList = await driver.findElement(By.css('.mission-list')).getText();
    assert(!missionList.includes('Test Mission'), 'Mission should be removed from list');
  });
});

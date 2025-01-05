const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
require('dotenv').config();

// Test data factory
const createTestUser = () => ({
  firstName: `Test${Date.now()}`,
  lastName: `User${Date.now()}`,
  email: `test.user.${Date.now()}@example.com`,
  password: 'Test1234!'
});

describe('Users CRUD Tests', function() {
  this.timeout(30000);
  let driver;
  let testUser;

  before(async function() {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('http://localhost:3000/');
    
    // Login with test credentials from environment
    try {
      await driver.wait(until.elementLocated(By.css('form')), 5000);
      
      const emailField = await driver.findElement(By.css('input[type="email"]'));
      const passwordField = await driver.findElement(By.css('input[type="password"]'));
      const submitButton = await driver.findElement(By.css('button[type="submit"]'));
      
      await emailField.sendKeys(process.env.TEST_USER_EMAIL);
      await passwordField.sendKeys(process.env.TEST_USER_PASSWORD);
      await submitButton.click();
      
      await driver.wait(until.elementLocated(By.css('.dashboard')), 5000);
    } catch (err) {
      console.error('Login failed. Current URL:', await driver.getCurrentUrl());
      throw err;
    }
  });

  beforeEach(async function() {
    testUser = createTestUser();
  });

  after(async function() {
    await driver.quit();
  });

  it('should create a new user', async function() {
    await driver.get('http://localhost:3000/users/new');
    
    await driver.wait(until.elementLocated(By.css('.user-form')), 5000);
    await driver.findElement(By.name('firstName')).sendKeys(testUser.firstName);
    await driver.findElement(By.name('lastName')).sendKeys(testUser.lastName);
    await driver.findElement(By.name('email')).sendKeys(testUser.email);
    await driver.findElement(By.name('password')).sendKeys(testUser.password);
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.elementLocated(By.css('.user-list')), 5000);
    const userList = await driver.findElement(By.css('.user-list')).getText();
    assert(
      userList.includes(`${testUser.firstName} ${testUser.lastName}`),
      `Expected to find ${testUser.firstName} ${testUser.lastName} in user list`
    );
  });

  it('should read user details', async function() {
    // First create a user to read
    await driver.get('http://localhost:3000/users/new');
    await driver.wait(until.elementLocated(By.css('.user-form')), 5000);
    await driver.findElement(By.name('firstName')).sendKeys(testUser.firstName);
    await driver.findElement(By.name('lastName')).sendKeys(testUser.lastName);
    await driver.findElement(By.name('email')).sendKeys(testUser.email);
    await driver.findElement(By.name('password')).sendKeys(testUser.password);
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Navigate to users list
    await driver.get('http://localhost:3000/users');
    await driver.wait(until.elementLocated(By.css('.user-list')), 5000);
    
    // Find and click on our test user
    const userItem = await driver.findElement(
      By.xpath(`//*[contains(text(), '${testUser.firstName} ${testUser.lastName}')]`)
    );
    await userItem.click();
    
    // Verify details page
    await driver.wait(until.elementLocated(By.css('.user-details')), 5000);
    const userDetails = await driver.findElement(By.css('.user-details')).getText();
    assert(
      userDetails.includes(`${testUser.firstName} ${testUser.lastName}`),
      `Expected to find ${testUser.firstName} ${testUser.lastName} in user details`
    );
    assert(
      userDetails.includes(testUser.email),
      `Expected to find ${testUser.email} in user details`
    );
  });

  it('should update a user', async function() {
    // First create a user to update
    await driver.get('http://localhost:3000/users/new');
    await driver.wait(until.elementLocated(By.css('.user-form')), 5000);
    await driver.findElement(By.name('firstName')).sendKeys(testUser.firstName);
    await driver.findElement(By.name('lastName')).sendKeys(testUser.lastName);
    await driver.findElement(By.name('email')).sendKeys(testUser.email);
    await driver.findElement(By.name('password')).sendKeys(testUser.password);
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Navigate to users list
    await driver.get('http://localhost:3000/users');
    await driver.wait(until.elementLocated(By.css('.user-list')), 5000);
    
    // Find and click edit on our test user
    const userItem = await driver.findElement(
      By.xpath(`//*[contains(text(), '${testUser.firstName} ${testUser.lastName}')]`)
    );
    const editButton = await userItem.findElement(By.xpath('./following-sibling::button[contains(@class, "edit-btn")]'));
    await editButton.click();
    
    // Update user details
    await driver.wait(until.elementLocated(By.css('.user-form')), 5000);
    const firstNameField = await driver.findElement(By.name('firstName'));
    await firstNameField.clear();
    const updatedFirstName = `Updated${Date.now()}`;
    await firstNameField.sendKeys(updatedFirstName);
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Verify update
    await driver.wait(until.elementLocated(By.css('.user-list')), 5000);
    const userList = await driver.findElement(By.css('.user-list')).getText();
    assert(
      userList.includes(`${updatedFirstName} ${testUser.lastName}`),
      `Expected to find updated user ${updatedFirstName} ${testUser.lastName} in list`
    );
  });

  it('should delete a user', async function() {
    // First create a user to delete
    await driver.get('http://localhost:3000/users/new');
    await driver.wait(until.elementLocated(By.css('.user-form')), 5000);
    await driver.findElement(By.name('firstName')).sendKeys(testUser.firstName);
    await driver.findElement(By.name('lastName')).sendKeys(testUser.lastName);
    await driver.findElement(By.name('email')).sendKeys(testUser.email);
    await driver.findElement(By.name('password')).sendKeys(testUser.password);
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Navigate to users list
    await driver.get('http://localhost:3000/users');
    await driver.wait(until.elementLocated(By.css('.user-list')), 5000);
    
    // Find and click delete on our test user
    const userItem = await driver.findElement(
      By.xpath(`//*[contains(text(), '${testUser.firstName} ${testUser.lastName}')]`)
    );
    const deleteButton = await userItem.findElement(By.xpath('./following-sibling::button[contains(@class, "delete-btn")]'));
    await deleteButton.click();
    
    // Confirm deletion
    await driver.wait(until.alertIsPresent(), 5000);
    await driver.switchTo().alert().accept();
    
    // Verify deletion
    await driver.wait(until.elementLocated(By.css('.user-list')), 5000);
    const userList = await driver.findElement(By.css('.user-list')).getText();
    assert(
      !userList.includes(`${testUser.firstName} ${testUser.lastName}`),
      `Expected ${testUser.firstName} ${testUser.lastName} to be removed from list`
    );
  });
});

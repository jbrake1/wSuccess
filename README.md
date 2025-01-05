# Project Management Tool

This is a full-stack project management application with user authentication and CRUD operations for various entities.

## Project Structure

```
.
├── client/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   └── ...           # Other frontend files
├── middleware/           # Express middleware
├── models/               # Mongoose models
├── routes/               # Express routes
├── test/                 # Selenium test suite
│   ├── *.test.js         # Test files for each entity
│   └── test-runner.js    # Test execution script
├── server.js             # Express server
└── ...                   # Other configuration files
```

## Testing Approach

The project uses Selenium for end-to-end testing with the following guidelines:

1. Tests are organized by entity type (users, missions, etc.)
2. Each test file contains CRUD operations
3. Tests run against both frontend and backend
4. Test data is cleaned up after each test

## AI Interaction Guidelines

### What AI Should Do:
- Create and modify test files
- Identify and report bugs
- Suggest improvements to test coverage
- Update documentation
- Fix minor syntax issues
- Refactor test code for better maintainability

### What AI Should NOT Do:
- Modify core application logic
- Change database schemas
- Alter authentication mechanisms
- Modify production configuration
- Make changes to the frontend UI
- Change API contracts without approval

## Running Tests

All commands should be run from the project root directory (/Users/jimmybrake/Documents/wSuccess) unless otherwise specified.

1. Start both frontend and backend servers:
```bash
# From project root
npm start

# Open new terminal tab, navigate to client directory
cd client
npm start
```

2. Run all tests:
```bash
# From project root
npm test
```

3. Run specific test file:
```bash
# From project root
node test/users.test.js
```

4. Install dependencies:
```bash
# From project root (installs backend dependencies)
npm install

# From client directory (installs frontend dependencies)
cd client
npm install
```

5. Build frontend:
```bash
# From client directory
cd client
npm run build
```

6. Run development server:
```bash
# From project root (backend)
npm run dev

# From client directory (frontend)
cd client
npm run dev
```

## Reporting Issues

When reporting bugs:
- Include test file and line number
- Describe expected vs actual behavior
- Provide relevant error messages
- Do not attempt to fix the issue unless instructed

## Extra AI Prompts

- after you make a change test retest for properfunctionality
- document all functionality required at the top of each file
- at each decision point function of substantial block of code explain its purpose in plain english
- for each page or API endpoint create a test file and write a test for each function
- for each test file create a test runner file that runs all tests in the file
- if a file exists - first read it before editing it - make sure all it's present functionality remains unless you are editing an existing functionality being mindful of all it's existing dependencies
- if a file does not exist - create it and write the test for it
- before running any tests insure the servers are running and the database is connected. restart the servers if necessary

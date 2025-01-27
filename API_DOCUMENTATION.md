# Mission Planner API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication
All endpoints except `/users/login` and `/users/register` require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## User Endpoints

### Register User
- **POST** `/users/register`
- **Authentication**: Not required
- **Body**: 
```json
{
  "email": "user@example.com",  // Required, must be unique
  "name": "John Doe",           // Required
  "password": "securePassword123!"  // Required, min 8 chars
}
```
- **Success Response**:
```json
{
  "id": 14,
  "email": "test2@example.com",
  "name": "Test User 2",
  "created": "2025-01-26T02:17:15.637Z",
  "created_by": "system",
  "updatedAt": "2025-01-26T02:17:15.640Z",
  "createdAt": "2025-01-26T02:17:15.640Z"
}
```
- **Error Responses**:
  - 400: Missing required fields
  - 400: Email already exists
  - 500: Server error
- **Example**:
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe","password":"securePassword123!"}'
```

### Login
- **POST** `/users/login`
- **Authentication**: Not required
- **Body**:
```json
{
  "email": "user@example.com",  // Required, must be registered
  "password": "securePassword123!"  // Required, must match registered password
}
```
- **Success Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsImVtYWlsIjoidGVzdDJAZXhhbXBsZS5jb20iLCJpYXQiOjE3Mzc4NTc4NDMsImV4cCI6MTczNzg2MTQ0M30.2a2Zsgzwyh7AFGZtDCujxajIKoENWDWlgNBbkjBCtcA"
}
```
- **Error Responses**:
  - 400: Missing required fields
  - 401: Invalid credentials
  - 500: Server error
- **Example**:
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123!"}'
```

## Mission Endpoints

### Create Mission
- **POST** `/missions`
- **Authentication**: Required
- **Body**:
```json
{
  "name": "Mission Name",        // Required, max 255 chars
  "description": "Mission Description",  // Optional
  "userId": 1,                   // Required, must be valid user ID
  "createdBy": 1                 // Required, must be valid user ID
}
```
- **Success Response**:
```json
{
  "id": 22,
  "userId": 14,
  "name": "Test Mission",
  "description": "Test Description",
  "createdBy": 14,
  "created": "2025-01-26T02:17:39.518Z"
}
```
- **Error Responses**:
  - 400: Missing required fields
  - 400: Invalid user ID
  - 401: Unauthorized
  - 500: Server error
- **Example**:
```bash
curl -X POST http://localhost:5000/api/missions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Mission Name","description":"Mission Description","userId":1,"createdBy":1}'
```

### Get All Missions
- **GET** `/missions`
- **Example**:
```bash
curl -X GET http://localhost:5000/api/missions \
  -H "Authorization: Bearer <token>"
```

## Mission Factor Endpoints

### Create Factor
- **POST** `/mission-factors`
- **Authentication**: Required
- **Body**:
```json
{
  "missionId": 1,               // Required, must be valid mission ID
  "description": "Factor Description",  // Required, max 1000 chars
  "factorType": "success",      // Required, must be 'success' or 'failure'
  "createdBy": 1                // Required, must be valid user ID
}
```
- **Success Response**:
```json
{
  "id": 4,
  "missionId": 22,
  "description": "Test Factor",
  "factorType": "success",
  "createdBy": 14,
  "created": "2025-01-26T02:17:47.883Z",
  "updatedAt": "2025-01-26T02:17:47.883Z",
  "createdAt": "2025-01-26T02:17:47.883Z"
}
```
- **Error Responses**:
  - 400: Missing required fields
  - 400: Invalid mission ID
  - 400: Invalid factor type
  - 401: Unauthorized
  - 500: Server error
- **Example**:
```bash
curl -X POST http://localhost:5000/api/mission-factors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"missionId":1,"description":"Factor Description","factorType":"success","createdBy":1}'
```

## Like Endpoints

### Create Like
- **POST** `/likes`
- **Authentication**: Required
- **Body**:
```json
{
  "factorId": 1  // Required, must be valid factor ID
}
```
- **Success Response**:
```json
{
  "id": 2,
  "factorId": 4,
  "createdBy": 14,
  "created": "2025-01-26T02:17:56.113Z",
  "updatedAt": "2025-01-26T02:17:56.114Z",
  "createdAt": "2025-01-26T02:17:56.114Z"
}
```
- **Error Responses**:
  - 400: Missing required fields
  - 400: Invalid factor ID
  - 401: Unauthorized
  - 409: Already liked
  - 500: Server error
- **Example**:
```bash
curl -X POST http://localhost:5000/api/likes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"factorId":1}'
```

## Detailed Factors and Examples

### 1. Successes
**Definition**: Goals or outcomes that define the mission's success. These are tangible or measurable results that the mission aims to achieve.

**Examples**:
- For a marketing campaign: "Achieve a 20% increase in brand awareness within three months."
- For a software launch: "Successfully onboard 100 users within the first month."

### 2. Drivers and Resources  
**Definition**: Elements that support achieving the mission, including people, tools, budget, or existing processes.

**Examples**:
- "Budget allocation of $10,000 for marketing."
- "Team of five engineers with expertise in backend development."
- "Access to a pre-existing customer email database."

### 3. Constraints and Obstacles
**Definition**: Limitations or challenges that might impede progress. These can be internal (e.g., resource limitations) or external (e.g., regulatory requirements).

**Examples**:
- "Strict regulatory compliance for data privacy (e.g., GDPR)."
- "Limited workforce availability during holidays."

### 4. Relevant Facts
**Definition**: Known information or data points that are factual in nature and may influence decision-making.

**Examples**:
- "The target audience prefers mobile-first applications."
- "Historical sales data shows a 15% decrease in demand during Q4."

### 5. Relevant Assumptions  
**Definition**: Hypotheses or beliefs that are not confirmed but are used as a basis for planning.

**Examples**:
- "Assuming user engagement will increase by 10% with improved UX design."
- "Assuming team members will complete training before the project start date."

### 6. Course of Action
**Definition**: Specific actions or steps planned to achieve the mission goals. These are practical, executable strategies based on successes, drivers, and constraints.

**Examples**:
- "Develop a social media campaign targeting millennials within the first week."
- "Deploy a beta version of the app to a test group for feedback before the final launch."

### 7. Likes (Voting Mechanism)
**Definition**: A system to prioritize factors by team consensus. Team members 'like' the factors they find most critical or impactful, helping focus on key priorities.

**Examples**:
- Success Factor: "Team votes that 'Increase sales by 25%' is the most critical success factor."
- Resource Factor: "High agreement that the marketing budget is the most crucial driver."

## Example Session

1. Register a new user:
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"Test123!"}'
```

2. Login to get token:
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

3. Create a mission (using token from login):
```bash
curl -X POST http://localhost:5000/api/missions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Test Mission","description":"Test Description","userId":1,"createdBy":1}'
```

4. Create a mission factor:
```bash
curl -X POST http://localhost:5000/api/mission-factors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"missionId":1,"description":"Test Factor","factorType":"success","createdBy":1}'
```

5. Like a factor:
```bash
curl -X POST http://localhost:5000/api/likes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"factorId":1}'

# Mission Planner API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## User Endpoints

### Register a new user
**POST** `/users/register`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Login
**POST** `/users/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get all users
**GET** `/users`

### Get single user
**GET** `/users/:id`

### Update user
**PUT** `/users/:id`

### Delete user
**DELETE** `/users/:id`

## Mission Endpoints

### Create a mission
**POST** `/missions`

Request body:
```json
{
  "name": "Mission Name",
  "description": "Mission Description"
}
```

### Get all missions
**GET** `/missions`

### Get mission with participants
**GET** `/missions/with-participants`

### Get single mission
**GET** `/missions/:id`

### Update mission
**PUT** `/missions/:id`

### Delete mission
**DELETE** `/missions/:id`

### Add participant to mission
**POST** `/missions/:missionId/participants`

Request body:
```json
{
  "userId": 1
}
```

### Remove participant from mission
**DELETE** `/missions/:missionId/participants/:userId`

### Get mission participants
**GET** `/missions/:missionId/participants`

## Mission Factor Endpoints

### Create mission factor
**POST** `/mission-factors`

Request body:
```json
{
  "missionId": 1,
  "factorType": "TYPE",
  "description": "Factor description"
}
```

### Get factors for mission
**GET** `/mission-factors/mission/:missionId`

### Get single factor
**GET** `/mission-factors/factor/:id`

### Update factor
**PUT** `/mission-factors/:id`

### Delete factor
**DELETE** `/mission-factors/:id`

## Like Endpoints

### Create like
**POST** `/likes`

Request body:
```json
{
  "factorId": 1
}
```

### Get likes for factor
**GET** `/likes/factor/:factorId`

### Delete like
**DELETE** `/likes/:id`

## Error Responses
All errors return a JSON response with the following structure:
```json
{
  "error": "Error message",
  "details": {
    "message": "Detailed error message",
    "stack": "Error stack trace (in development only)"
  }
}
```

Common error codes:
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

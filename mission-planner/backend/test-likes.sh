#!/bin/bash

# Start the server in background
npm start &
SERVER_PID=$!
sleep 2 # Wait for server to start

# Test data variables
TEST_EMAIL="testuser@example.com"
TEST_PASSWORD="testpassword"
TEST_MISSION_NAME="Test Mission"
TEST_FACTOR_DESC="Test Factor"

# Function to get auth token
get_auth_token() {
  local response=$(curl -s -X POST http://localhost:5000/api/users/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "'"$TEST_EMAIL"'",
      "password": "'"$TEST_PASSWORD"'"
    }')
  echo $response | jq -r '.token'
}

# Function to cleanup test data
cleanup() {
  echo "Cleaning up test data..."
  curl -X DELETE http://localhost:5000/api/users/$USER_ID \
    -H "Authorization: Bearer $TOKEN"
  kill $SERVER_PID
  exit
}

# Trap Ctrl+C to run cleanup
trap cleanup SIGINT

# Create test user
echo "Creating test user..."
USER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$TEST_EMAIL"'",
    "name": "Test User",
    "password": "'"$TEST_PASSWORD"'"
  }')
  
echo "User creation response: $USER_RESPONSE"

# Verify response contains ID
if ! echo "$USER_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  echo "Error: Failed to create user"
  echo "Response: $USER_RESPONSE"
  cleanup
  exit 1
fi

USER_ID=$(echo $USER_RESPONSE | jq -r '.id')
echo "Created user with ID: $USER_ID"

# Get auth token
echo "Logging in to get auth token..."
TOKEN=$(get_auth_token)
if [ -z "$TOKEN" ]; then
  echo "Failed to get auth token"
  cleanup
  exit 1
fi
echo "Obtained auth token"

# Create test mission
echo "Creating test mission..."
MISSION_RESPONSE=$(curl -s -X POST http://localhost:5000/api/missions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "'"$TEST_MISSION_NAME"'",
    "createdBy": '"$USER_ID"'
  }')
MISSION_ID=$(echo $MISSION_RESPONSE | jq -r '.id')
echo "Created mission with ID: $MISSION_ID"

# Create test factor
echo "Creating test factor..."
FACTOR_RESPONSE=$(curl -s -X POST http://localhost:5000/api/mission-factors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "missionId": '"$MISSION_ID"',
    "description": "'"$TEST_FACTOR_DESC"'",
    "factorType": "success",
    "createdBy": '"$USER_ID"'
  }')
FACTOR_ID=$(echo $FACTOR_RESPONSE | jq -r '.id')
echo "Created factor with ID: $FACTOR_ID"

# Test Like Endpoints
echo -e "\nTesting Like Endpoints:"

# Create a like
echo "Creating like..."
LIKE_RESPONSE=$(curl -s -X POST http://localhost:5000/api/likes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "factorId": '"$FACTOR_ID"'
  }')
LIKE_ID=$(echo $LIKE_RESPONSE | jq -r '.id')
echo "Created like with ID: $LIKE_ID"

# Get likes for factor
echo -e "\nGetting likes for factor:"
curl -s http://localhost:5000/api/likes/factor/$FACTOR_ID \
  -H "Authorization: Bearer $TOKEN" | jq

# Delete the like
echo -e "\nDeleting like..."
curl -s -X DELETE http://localhost:5000/api/likes/$LIKE_ID \
  -H "Authorization: Bearer $TOKEN"

# Verify deletion
echo -e "\nVerifying deletion:"
curl -s http://localhost:5000/api/likes/factor/$FACTOR_ID \
  -H "Authorization: Bearer $TOKEN" | jq

# Cleanup
cleanup

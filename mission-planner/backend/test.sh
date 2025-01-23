#!/bin/bash

# Test mission participant API flow with cleanup

# Cleanup any existing test data first
echo "Cleaning up any existing test data..."
TOKEN=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"test_creator@test.com","password":"Test123!"}' \
  http://localhost:5000/api/users/login | jq -r '.token')

if [ -n "$TOKEN" ]; then
  # Delete test mission if exists
  curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
    http://localhost:5000/api/missions/5 | jq
  
  # Delete test users using stored IDs
  echo "Deleting test users..."
  if [ -n "$TEST_CREATOR_ID" ]; then
    curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
      http://localhost:5000/api/users/$TEST_CREATOR_ID > /dev/null
  fi

  if [ -n "$TEST_PARTICIPANT1_ID" ]; then
    curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
      http://localhost:5000/api/users/$TEST_PARTICIPANT1_ID > /dev/null
  fi

  if [ -n "$TEST_PARTICIPANT2_ID" ]; then
    curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
      http://localhost:5000/api/users/$TEST_PARTICIPANT2_ID > /dev/null
  fi
fi

# Create test accounts and store IDs
echo -e "\nCreating test accounts..."
TEST_CREATOR_ID=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"test_creator@test.com","password":"Test123!","name":"Test Creator"}' \
  http://localhost:5000/api/users/register | jq -r '.id')

TEST_PARTICIPANT1_ID=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"test_participant1@test.com","password":"Test123!","name":"Test Participant 1"}' \
  http://localhost:5000/api/users/register | jq -r '.id')

TEST_PARTICIPANT2_ID=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"test_participant2@test.com","password":"Test123!","name":"Test Participant 2"}' \
  http://localhost:5000/api/users/register | jq -r '.id')

# Login and get token
echo -e "\nLogging in as test creator..."
TOKEN=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"test_creator@test.com","password":"Test123!"}' \
  http://localhost:5000/api/users/login | jq -r '.token')

if [ -z "$TOKEN" ]; then
  echo "Login failed"
  exit 1
fi
echo "Login successful. Token: $TOKEN"

# Create a new mission
echo -e "\nCreating new mission..."
MISSION=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Mission","description":"Test Mission Description","userId":4,"createdBy":4}' \
  http://localhost:5000/api/missions)

MISSION_ID=$(echo $MISSION | jq -r '.id')
if [ -z "$MISSION_ID" ]; then
  echo "Mission creation failed"
  exit 1
fi
echo "Mission created successfully. ID: $MISSION_ID"

# Add participants
echo -e "\nAdding participants..."
PARTICIPANT1_ID=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"email":"test_participant1@test.com"}' \
  http://localhost:5000/api/users/find | jq -r '.id')
if [ -z "$PARTICIPANT1_ID" ]; then
  echo "Failed to get participant1 ID"
  exit 1
fi

PARTICIPANT2_ID=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"email":"test_participant2@test.com"}' \
  http://localhost:5000/api/users/find | jq -r '.id')
if [ -z "$PARTICIPANT2_ID" ]; then
  echo "Failed to get participant2 ID"
  exit 1
fi

echo "Adding participant1..."
curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"missionId\":\"$MISSION_ID\",\"userId\":\"$PARTICIPANT1_ID\",\"createdBy\":4}" \
  http://localhost:5000/api/missions/$MISSION_ID/participants | jq

echo "Adding participant2..."
curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"missionId\":\"$MISSION_ID\",\"userId\":\"$PARTICIPANT2_ID\",\"createdBy\":4}" \
  http://localhost:5000/api/missions/$MISSION_ID/participants | jq

# Verify participants
echo -e "\nListing participants..."
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/missions/$MISSION_ID/participants | jq

# Get all missions with participants
echo -e "\nGetting all missions with participants..."
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/missions/with-participants | jq

# Test mission factors
echo -e "\nTesting mission factors..."

# Create mission factor
echo -e "\nCreating mission factor..."
FACTOR=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"missionId\":\"$MISSION_ID\",\"description\":\"Test factor\",\"factorType\":\"success\",\"createdBy\":4}" \
  http://localhost:5000/api/mission-factors)

FACTOR_ID=$(echo $FACTOR | jq -r '.id')
if [ -z "$FACTOR_ID" ]; then
  echo "Mission factor creation failed"
  exit 1
fi
echo "Mission factor created successfully. ID: $FACTOR_ID"

# Get mission factor
echo -e "\nGetting mission factor..."
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/mission-factors/factor/$FACTOR_ID | jq

# Update mission factor
echo -e "\nUpdating mission factor..."
curl -s -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"description":"Updated test factor"}' \
  http://localhost:5000/api/mission-factors/$FACTOR_ID | jq

# Verify update
echo -e "\nGetting updated mission factor..."
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/mission-factors/factor/$FACTOR_ID | jq

# Delete mission factor
echo -e "\nDeleting mission factor..."
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/mission-factors/$FACTOR_ID | jq

# Verify deletion
echo -e "\nVerifying mission factor deletion..."
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/mission-factors/factor/$FACTOR_ID | jq

# Cleanup
echo -e "\nCleaning up test data..."
echo "Deleting mission..."
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/missions/$MISSION_ID | jq

echo "Deleting test users..."
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
  -d '{"email":"test_creator@test.com"}' \
  http://localhost:5000/api/users > /dev/null

curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
  -d '{"email":"test_participant1@test.com"}' \
  http://localhost:5000/api/users > /dev/null

curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
  -d '{"email":"test_participant2@test.com"}' \
  http://localhost:5000/api/users > /dev/null

echo "Test script completed successfully. All test data cleaned up."

#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Utility functions
print_header() {
  echo -e "\n${YELLOW}=== $1 ===${NC}"
}

print_success() {
  echo -e "${GREEN}✔ $1${NC}"
  ((TESTS_PASSED++))
  ((TESTS_RUN++))
}

print_failure() {
  echo -e "${RED}✖ $1${NC}"
  ((TESTS_FAILED++))
  ((TESTS_RUN++))
}

cleanup() {
  print_header "CLEANING UP TEST DATA"
  
  # First try to login with existing test user
  TOKEN=$(curl -s -X POST -H "Content-Type: application/json" \
    -d '{"email":"test_creator@test.com","password":"Test123!"}' \
    http://localhost:5000/api/users/login | jq -r '.token')

  if [ -n "$TOKEN" ]; then
    # First delete all missions created by test users
    for email in "test_creator@test.com" "test_participant1@test.com" "test_participant2@test.com"; do
      echo -e "\nCleaning up data for: $email"
      
      # Find user ID
      USER_ID=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
        -d "{\"email\":\"$email\"}" \
        http://localhost:5000/api/users/find | jq -r '.id')
      
      if [ -n "$USER_ID" ] && [ "$USER_ID" != "null" ]; then
        # Get all missions for this user
        MISSIONS=$(curl -s -H "Authorization: Bearer $TOKEN" \
          http://localhost:5000/api/missions?userId=$USER_ID | jq -r '.[].id')
        
        # Delete each mission and its dependencies
        for MISSION_ID in $MISSIONS; do
          echo "Cleaning up mission ID: $MISSION_ID"
          
          # Delete mission factors
          FACTORS=$(curl -s -H "Authorization: Bearer $TOKEN" \
            http://localhost:5000/api/mission-factors/mission/$MISSION_ID | jq -r '.[].id')
          for FACTOR_ID in $FACTORS; do
            echo "Deleting factor ID: $FACTOR_ID"
            curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
              http://localhost:5000/api/mission-factors/$FACTOR_ID > /dev/null
          done
          
          # Delete mission participants
          curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
            http://localhost:5000/api/mission-participants/mission/$MISSION_ID > /dev/null
            
          # Finally delete the mission
          DELETE_RESPONSE=$(curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
            http://localhost:5000/api/missions/$MISSION_ID)
          echo "Mission deletion response: $DELETE_RESPONSE"
        done
      fi
    done
    
    # Then delete test users
    for email in "test_creator@test.com" "test_participant1@test.com" "test_participant2@test.com"; do
      echo -e "\nDeleting user: $email"
      # First try to find user ID
      USER_ID=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
        -d "{\"email\":\"$email\"}" \
        http://localhost:5000/api/users/find | jq -r '.id')
      
      if [ -n "$USER_ID" ] && [ "$USER_ID" != "null" ]; then
        DELETE_RESPONSE=$(curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
          http://localhost:5000/api/users/$USER_ID)
        echo "Delete response: $DELETE_RESPONSE"
      else
        echo "User not found: $email"
      fi
    done
  else
    # If login fails, try to delete users without token
    echo -e "\nFailed to get token, attempting direct user deletion"
    for email in "test_creator@test.com" "test_participant1@test.com" "test_participant2@test.com"; do
      echo -e "\nDeleting user: $email"
      # First try to find user ID
      USER_ID=$(curl -s -X POST -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\"}" \
        http://localhost:5000/api/users/find | jq -r '.id')
      
      if [ -n "$USER_ID" ] && [ "$USER_ID" != "null" ]; then
        DELETE_RESPONSE=$(curl -s -X DELETE \
          http://localhost:5000/api/users/$USER_ID)
        echo "Delete response: $DELETE_RESPONSE"
      else
        echo "User not found: $email"
      fi
    done
  fi
}

# Start clean
cleanup

# Test user registration
print_header "TESTING USER REGISTRATION"
REGISTER_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"test_creator@test.com","password":"Test123!","name":"Test Creator"}' \
  http://localhost:5000/api/users/register)

TEST_CREATOR_ID=$(echo $REGISTER_RESPONSE | jq -r '.id')
if [ -n "$TEST_CREATOR_ID" ] && [ "$TEST_CREATOR_ID" != "null" ]; then
  print_success "User registration successful"
  echo "Created user ID: $TEST_CREATOR_ID"
else
  echo -e "${RED}User registration response: $REGISTER_RESPONSE${NC}"
  print_failure "User registration failed"
  exit 1
fi

# Test user login
print_header "TESTING USER LOGIN"
TOKEN=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"test_creator@test.com","password":"Test123!"}' \
  http://localhost:5000/api/users/login | jq -r '.token')

if [ -n "$TOKEN" ]; then
  print_success "User login successful"
else
  print_failure "User login failed"
fi

# Test mission creation
print_header "TESTING MISSION CREATION"
MISSION=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\":\"Test Mission\",\"description\":\"Test Mission Description\",\"userId\":\"$TEST_CREATOR_ID\",\"createdBy\":\"$TEST_CREATOR_ID\"}" \
  http://localhost:5000/api/missions)

MISSION_ID=$(echo $MISSION | jq -r '.id')
if [ -n "$MISSION_ID" ] && [ "$MISSION_ID" != "null" ]; then
  print_success "Mission creation successful"
  echo "Created mission ID: $MISSION_ID"
else
  echo -e "${RED}Mission creation response: $MISSION${NC}"
  print_failure "Mission creation failed"
  exit 1
fi

# Test adding participants
print_header "TESTING PARTICIPANT MANAGEMENT"
PARTICIPANT1_ID=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"email":"test_participant1@test.com"}' \
  http://localhost:5000/api/users/find | jq -r '.id')

PARTICIPANT2_ID=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"email":"test_participant2@test.com"}' \
  http://localhost:5000/api/users/find | jq -r '.id')

if [ -n "$PARTICIPANT1_ID" ] && [ -n "$PARTICIPANT2_ID" ]; then
  print_success "Participant lookup successful"
else
  print_failure "Participant lookup failed"
fi

# Test mission factors
print_header "TESTING MISSION FACTORS"
FACTOR=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"missionId\":\"$MISSION_ID\",\"description\":\"Test factor\",\"factorType\":\"success\",\"createdBy\":\"$TEST_CREATOR_ID\"}" \
  http://localhost:5000/api/mission-factors)

FACTOR_ID=$(echo $FACTOR | jq -r '.id')
if [ -n "$FACTOR_ID" ] && [ "$FACTOR_ID" != "null" ]; then
  print_success "Mission factor creation successful"
  echo "Created factor ID: $FACTOR_ID"
else
  echo -e "${RED}Mission factor creation response: $FACTOR${NC}"
  print_failure "Mission factor creation failed"
  exit 1
fi

# Test position update
print_header "TESTING FACTOR POSITION UPDATE"

# Create two more factors for position testing
FACTOR2=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"missionId\":\"$MISSION_ID\",\"description\":\"Test factor 2\",\"factorType\":\"constraint\",\"createdBy\":\"$TEST_CREATOR_ID\"}" \
  http://localhost:5000/api/mission-factors)

FACTOR2_ID=$(echo $FACTOR2 | jq -r '.id')

FACTOR3=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"missionId\":\"$MISSION_ID\",\"description\":\"Test factor 3\",\"factorType\":\"driver\",\"createdBy\":\"$TEST_CREATOR_ID\"}" \
  http://localhost:5000/api/mission-factors)

FACTOR3_ID=$(echo $FACTOR3 | jq -r '.id')

# Update positions
POSITION_UPDATE1=$(curl -s -X PATCH -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"position\":2,\"userId\":\"$TEST_CREATOR_ID\"}" \
  http://localhost:5000/api/mission-factors/$FACTOR_ID/position)

POSITION_UPDATE2=$(curl -s -X PATCH -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"position\":1,\"userId\":\"$TEST_CREATOR_ID\"}" \
  http://localhost:5000/api/mission-factors/$FACTOR2_ID/position)

POSITION_UPDATE3=$(curl -s -X PATCH -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"position\":3,\"userId\":\"$TEST_CREATOR_ID\"}" \
  http://localhost:5000/api/mission-factors/$FACTOR3_ID/position)

# Verify positions by getting all factors
FACTORS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/mission-factors/mission/$MISSION_ID)

# Check if factors were retrieved and have correct positions
FACTOR2_POSITION=$(echo $FACTORS_RESPONSE | jq -r ".[] | select(.id == $FACTOR2_ID) | .position")
if [ "$FACTOR2_POSITION" = "1" ]; then
  print_success "Factor 2 position update successful"
else
  print_failure "Factor 2 position update failed"
fi

FACTOR1_POSITION=$(echo $FACTORS_RESPONSE | jq -r ".[] | select(.id == $FACTOR_ID) | .position")
if [ "$FACTOR1_POSITION" = "2" ]; then
  print_success "Factor 1 position update successful"
else
  print_failure "Factor 1 position update failed"
fi

FACTOR3_POSITION=$(echo $FACTORS_RESPONSE | jq -r ".[] | select(.id == $FACTOR3_ID) | .position")
if [ "$FACTOR3_POSITION" = "3" ]; then
  print_success "Factor 3 position update successful"
else
  print_failure "Factor 3 position update failed"
fi

# Test like functionality
print_header "TESTING LIKE FUNCTIONALITY"

# Verify and refresh token if needed
echo -e "\nAttempting token refresh..."
TOKEN_RESPONSE=$(curl -v -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test_creator@test.com","password":"Test123!"}')
  
echo -e "\nToken response: $TOKEN_RESPONSE"
TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}Failed to refresh token. Response: $TOKEN_RESPONSE${NC}"
  print_failure "Token refresh failed"
  exit 1
fi

echo -e "\nSuccessfully refreshed token"

# Debug token and headers
echo -e "\nUsing token: $TOKEN"
echo "Headers:"
echo "Authorization: Bearer $TOKEN"
echo "Content-Type: application/json"

# Debug factor ID
echo -e "\nUsing factor ID: $FACTOR_ID"

# Create a like
LIKE_RESPONSE=$(curl -v -X POST http://localhost:5000/api/likes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "factorId": "'"$FACTOR_ID"'"
  }')
LIKE_ID=$(echo $LIKE_RESPONSE | jq -r '.id')

if [ -n "$LIKE_ID" ] && [ "$LIKE_ID" != "null" ]; then
  print_success "Like creation successful"
  echo "Created like ID: $LIKE_ID"
else
  echo -e "${RED}Like creation response: $LIKE_RESPONSE${NC}"
  print_failure "Like creation failed"
  exit 1
fi

# Get likes for factor
LIKES=$(curl -s http://localhost:5000/api/likes/factor/$FACTOR_ID \
  -H "Authorization: Bearer $TOKEN" | jq -r '. | length')

if [ "$LIKES" -gt 0 ]; then
  print_success "Like retrieval successful"
else
  print_failure "Like retrieval failed"
fi

# Delete the like
DELETE_RESPONSE=$(curl -s -X DELETE http://localhost:5000/api/likes/$LIKE_ID \
  -H "Authorization: Bearer $TOKEN" | jq -r '.message')

if [ "$DELETE_RESPONSE" = "Like was deleted successfully!" ]; then
  print_success "Like deletion successful"
else
  echo -e "${RED}Delete response: $DELETE_RESPONSE${NC}"
  print_failure "Like deletion failed"
fi

# Verify deletion
VERIFICATION=$(curl -s http://localhost:5000/api/likes/factor/$FACTOR_ID \
  -H "Authorization: Bearer $TOKEN" | jq -r 'if . == null then 0 else length end')

if [ "$VERIFICATION" -eq 0 ]; then
  print_success "Like verification successful"
else
  echo -e "${RED}Expected 0 likes but found $VERIFICATION${NC}"
  print_failure "Like verification failed"
fi


# Final cleanup
cleanup

# Test summary
print_header "TEST SUMMARY"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "Total Tests Run: $TESTS_RUN"

if [ $TESTS_FAILED -gt 0 ]; then
  exit 1
fi

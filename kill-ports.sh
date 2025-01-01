#!/bin/bash

# Function to kill processes on a specific port
kill_port() {
  local port=$1
  echo "Killing processes on port $port..."
  
  # Check if any processes are using the port
  if ! lsof -i :$port > /dev/null 2>&1; then
    echo "No processes found on port $port"
    return 0
  fi
  
  # Try multiple methods to kill processes
  echo "Found processes on port $port - attempting to kill..."
  sudo lsof -ti :$port | xargs sudo kill -9 || true
  sudo pkill -f ":$port" || true
  
  # Verify port is free
  if lsof -i :$port > /dev/null 2>&1; then
    echo "Failed to kill processes on port $port"
    exit 1
  else
    echo "Successfully killed processes on port $port"
  fi
}

# Kill processes on both ports
kill_port 3000
kill_port 5000

# Add delay to ensure processes are fully terminated
sleep 3

echo "Port cleanup complete"

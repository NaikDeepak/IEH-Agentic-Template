#!/bin/bash
echo "Killing processes on ports 5173, 8001, 8180, 9199..."
lsof -t -i:5173 -i:8001 -i:8180 -i:9199 -i:4400 -i:4000 -i:5001 | xargs kill -9 2>/dev/null || true
echo "Killing any lingering Firebase Emulator Java processes..."
pkill -f "firebase-tools" || true
pkill -f "firestore-emulator" || true
pkill -f "java" || true
echo "Processes killed. Waiting a moment..."
sleep 2

echo "Starting Firebase Emulators..."
# Start emulator in background
firebase emulators:start --only auth,firestore --project india-emp-hub --config firebase.e2e.json > emulator.log 2>&1 &
EMULATOR_PID=$!
echo "Emulator started with PID $EMULATOR_PID. Logs in emulator.log"

# Wait for emulator to be ready
echo "Waiting for emulator to be ready..."
start_time=$(date +%s)
while ! curl -s http://127.0.0.1:9199/ > /dev/null; do
    current_time=$(date +%s)
    if (( current_time - start_time > 60 )); then
        echo "Timeout waiting for Auth emulator"
        exit 1
    fi
    sleep 1
done
echo "Emulator Auth port 9199 reachable."

start_time=$(date +%s)
while ! curl -s http://127.0.0.1:8180/ > /dev/null; do
    current_time=$(date +%s)
    if (( current_time - start_time > 60 )); then
        echo "Timeout waiting for Firestore emulator"
        exit 1
    fi
    sleep 1
done
echo "Emulator Firestore port 8180 reachable."

echo "Running tests..."
# Pass environment variables explicitly to Playwright
export VITE_USE_FIREBASE_EMULATOR=true
export VITE_FIREBASE_AUTH_EMULATOR_HOST=localhost
export VITE_FIREBASE_AUTH_EMULATOR_PORT=9199
export VITE_FIREBASE_FIRESTORE_EMULATOR_HOST=localhost
export VITE_FIREBASE_FIRESTORE_EMULATOR_PORT=8180
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9199
export FIRESTORE_EMULATOR_HOST=localhost:8180

npx playwright test e2e/employer-pages-coverage.spec.ts e2e/seeker-pages-coverage.spec.ts

# Cleanup
echo "Cleaning up..."
kill $EMULATOR_PID || true


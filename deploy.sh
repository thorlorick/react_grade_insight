#!/bin/bash

set -e  # exit if any command fails

# --- FRONTEND ---
echo "Updating frontend..."
cd ~/react_grade_insight/frontend/ || { echo "Frontend directory not found"; exit 1; }
git pull origin main
npm run build

# --- BACKEND ---
echo "Updating backend..."
cd ~/react_grade_insight/backend/ || { echo "Backend directory not found"; exit 1; }
git pull origin main

# Restart backend via PM2
pm2 restart grade-backend || pm2 start src/server.js --name grade-backend

echo "Deployment complete!"

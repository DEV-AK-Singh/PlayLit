#!/bin/bash

echo "Starting production deployment..."

# Install dependencies
npm run install:all

# Build both frontend and backend
npm run build

# Set production environment
export NODE_ENV=production

# Start the application
npm start

echo "Deployment completed!"
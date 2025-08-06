#!/bin/bash

# Stop Football Twitter Bot

echo "🛑 Stopping Football Twitter Bot..."

pm2 stop all
pm2 delete all

echo "✅ Bot stopped successfully!"
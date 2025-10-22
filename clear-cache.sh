#!/bin/bash
echo "🧹 Clearing Vite cache and rebuilding..."

# Kill any running dev server
pkill -f "vite" 2>/dev/null

# Clear Vite cache
rm -rf .vite
rm -rf node_modules/.vite
rm -rf dist

echo "✅ Cache cleared!"
echo "🔄 Restarting dev server..."

# Restart dev server
npm run dev

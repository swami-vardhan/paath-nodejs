#!/bin/bash

# Divine Audio - Quick Start Script
# For Linux/macOS/WSL2 systems

set -e

echo "🙏 Divine Audio - Quick Start"
echo "============================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm or bun is available
if command -v bun &> /dev/null; then
    PKG_MANAGER="bun"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
else
    echo "❌ No package manager found. Please install npm or bun."
    exit 1
fi

echo "📦 Installing dependencies..."
if [ "$PKG_MANAGER" = "bun" ]; then
    bun install --frozen-lockfile 2>/dev/null || bun install
else
    npm install
fi

echo ""
echo "🗄️ Setting up database..."
if [ "$PKG_MANAGER" = "bun" ]; then
    bun run db:push
else
    npx prisma db push
fi

echo ""
echo "🏗️ Building application..."
if [ "$PKG_MANAGER" = "bun" ]; then
    bun run build
else
    npm run build
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Starting Divine Audio at http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
NODE_ENV=production node .next/standalone/server.js

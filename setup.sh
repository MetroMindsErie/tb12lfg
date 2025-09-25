#!/bin/bash
# setup.sh - Complete setup script for TB12.LFG

echo "🚀 Starting TB12.LFG setup process..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

echo "✅ Node.js is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ npm is installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found. Creating from .env.development..."
    cp .env.development .env.local
    echo "⚠️ Please update your .env.local file with your actual Supabase credentials"
else
    echo "✅ .env.local file found"
fi

# Run setup script
echo "🔧 Running setup script..."
npm run setup

# Check environment
echo "🔍 Checking environment..."
npm run check-env

echo "✨ Setup complete! Follow these next steps:"
echo "1. Make sure your Supabase tables are created (see supabase/schema.sql)"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Navigate to http://localhost:3000"
echo ""
echo "For more information, refer to GETTING_STARTED.md"
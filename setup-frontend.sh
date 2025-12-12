#!/bin/bash

echo "🚀 Delineate Frontend Setup Script"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 24+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 24 ]; then
    echo "❌ Node.js version 24+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if .env exists in root
if [ ! -f .env ]; then
    echo "📝 Creating root .env file..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env and add your Sentry DSN!"
    echo ""
else
    echo "✅ Root .env file exists"
    echo ""
fi

# Check if frontend/.env exists
if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend/.env file..."
    cd frontend
    cp .env.example .env
    cd ..
    echo "✅ Created frontend/.env file"
    echo ""
else
    echo "✅ Frontend .env file exists"
    echo ""
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install
echo "✅ Backend dependencies installed"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo "✅ Frontend dependencies installed"
echo ""

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "🐳 Docker detected!"
    echo ""
    echo "You can now start the application using:"
    echo ""
    echo "  Option 1 (Recommended): npm run docker:dev"
    echo "  Option 2: Run services separately:"
    echo "    - Terminal 1: npm run dev"
    echo "    - Terminal 2: cd frontend && npm run dev"
    echo ""
else
    echo "⚠️  Docker not detected. You'll need to run services manually:"
    echo ""
    echo "  Terminal 1: npm run dev"
    echo "  Terminal 2: cd frontend && npm run dev"
    echo ""
fi

# Check for Sentry DSN
if grep -q "VITE_SENTRY_DSN=$" .env || grep -q "VITE_SENTRY_DSN=your-sentry-dsn-here" .env; then
    echo "⚠️  IMPORTANT: Add your Sentry DSN to .env file!"
    echo ""
    echo "  1. Go to https://sentry.io"
    echo "  2. Create a new React project"
    echo "  3. Copy the DSN"
    echo "  4. Edit .env and add: VITE_SENTRY_DSN=<your-dsn>"
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "  1. Add your Sentry DSN to .env (if not done)"
echo "  2. Run: npm run docker:dev"
echo "  3. Open: http://localhost:5173"
echo ""
echo "📖 For detailed instructions, see:"
echo "  - SETUP.md"
echo "  - frontend/README.md"
echo ""

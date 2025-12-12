@echo off
setlocal enabledelayedexpansion

echo ========================================
echo 🚀 Delineate Frontend Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 24+ first.
    exit /b 1
)

REM Check Node version
for /f "tokens=1 delims=v." %%i in ('node -v') do set NODE_MAJOR=%%i
set NODE_MAJOR=%NODE_MAJOR:v=%
if %NODE_MAJOR% LSS 24 (
    echo ❌ Node.js version 24+ is required. Current version: 
    node -v
    exit /b 1
)

echo ✅ Node.js detected
node -v
echo.

REM Check if .env exists in root
if not exist .env (
    echo 📝 Creating root .env file...
    copy .env.example .env >nul
    echo ✅ Created .env file
    echo ⚠️  Please edit .env and add your Sentry DSN!
    echo.
) else (
    echo ✅ Root .env file exists
    echo.
)

REM Check if frontend/.env exists
if not exist frontend\.env (
    echo 📝 Creating frontend\.env file...
    cd frontend
    copy .env.example .env >nul
    cd ..
    echo ✅ Created frontend\.env file
    echo.
) else (
    echo ✅ Frontend .env file exists
    echo.
)

REM Install backend dependencies
echo 📦 Installing backend dependencies...
call npm install
echo ✅ Backend dependencies installed
echo.

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
cd ..
echo ✅ Frontend dependencies installed
echo.

REM Check if Docker is available
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo 🐳 Docker detected!
    echo.
    echo You can now start the application using:
    echo.
    echo   Option 1 (Recommended): npm run docker:dev
    echo   Option 2: Run services separately:
    echo     - Terminal 1: npm run dev
    echo     - Terminal 2: cd frontend ^&^& npm run dev
    echo.
) else (
    echo ⚠️  Docker not detected. You'll need to run services manually:
    echo.
    echo   Terminal 1: npm run dev
    echo   Terminal 2: cd frontend ^&^& npm run dev
    echo.
)

REM Check for Sentry DSN
findstr /C:"VITE_SENTRY_DSN=$" .env >nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  IMPORTANT: Add your Sentry DSN to .env file!
    echo.
    echo   1. Go to https://sentry.io
    echo   2. Create a new React project
    echo   3. Copy the DSN
    echo   4. Edit .env and add: VITE_SENTRY_DSN=^<your-dsn^>
    echo.
)

echo ✅ Setup complete!
echo.
echo 📚 Next steps:
echo   1. Add your Sentry DSN to .env (if not done)
echo   2. Run: npm run docker:dev
echo   3. Open: http://localhost:5173
echo.
echo 📖 For detailed instructions, see:
echo   - SETUP.md
echo   - frontend\README.md
echo.

pause

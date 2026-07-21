@echo off
REM Divine Audio - Quick Start Script for Windows

echo.
echo 🙏 Divine Audio - Quick Start
echo ============================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🗄️ Setting up database...
call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to setup database
    pause
    exit /b 1
)

echo.
echo 🏗️ Building application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to build application
    pause
    exit /b 1
)

echo.
echo ✅ Setup complete!
echo.
echo Starting Divine Audio at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

REM Start the server
set NODE_ENV=production
node .next\standalone\server.js

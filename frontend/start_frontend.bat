@echo off

echo Starting Legal Research Assistant Frontend...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is required but not installed. Please install Node.js 18 or higher.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo npm is required but not installed. Please install npm.
    pause
    exit /b 1
)

REM Install dependencies
echo Installing Node.js dependencies...
npm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    echo VITE_API_URL=http://localhost:8000 > .env
)

REM Start the development server
echo Starting Vite development server...
npm run dev

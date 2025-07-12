@echo off

echo Starting Legal Research Assistant Backend...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is required but not installed. Please install Python 3.9 or higher.
    pause
    exit /b 1
)

REM Check if Poetry is installed
poetry --version >nul 2>&1
if errorlevel 1 (
    echo Poetry is not installed. Please install Poetry first.
    echo Visit: https://python-poetry.org/docs/#installation
    pause
    exit /b 1
)

REM Install dependencies
echo Installing Python dependencies...
poetry install

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from example...
    copy .env.example .env
    echo Please edit .env file with your actual API keys and configuration.
    pause
)

REM Create necessary directories
echo Creating directories...
if not exist logs mkdir logs
if not exist uploads mkdir uploads
if not exist vector_db mkdir vector_db

REM Initialize database
echo Initializing database...
poetry run python init_db.py

REM Start the server
echo Starting FastAPI server...
poetry run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

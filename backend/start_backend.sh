#!/bin/bash

# Legal Research Assistant - Backend Startup Script

echo "Starting Legal Research Assistant Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed. Please install Python 3.9 or higher."
    exit 1
fi

# Check if Poetry is installed
if ! command -v poetry &> /dev/null; then
    echo "Poetry is not installed. Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
    export PATH="$HOME/.local/bin:$PATH"
fi

# Install dependencies
echo "Installing Python dependencies..."
poetry install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "Please edit .env file with your actual API keys and configuration."
fi

# Create necessary directories
echo "Creating directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p vector_db

# Initialize database
echo "Initializing database..."
poetry run python init_db.py

# Start the server
echo "Starting FastAPI server..."
poetry run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

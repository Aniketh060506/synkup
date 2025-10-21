@echo off
title CopyDock Desktop App
color 0A

echo.
echo ================================================
echo          CopyDock Desktop App v1.0
echo ================================================
echo.

REM Change to script directory
cd /d "%~dp0"

echo [INFO] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)
echo [OK] Python found

echo.
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found

echo.
echo [INFO] Installing backend dependencies (first time only)...
cd backend
if not exist "requirements_installed.flag" (
    echo Installing Python packages...
    python -m pip install -r requirements.txt
    if errorlevel 1 (
        echo [WARNING] Some packages failed to install, but continuing...
    )
    echo. > requirements_installed.flag
    echo [OK] Backend dependencies installed
) else (
    echo [OK] Backend dependencies already installed
)

cd ..

echo.
echo [INFO] Installing Electron dependencies (first time only)...
cd electron
if not exist "node_modules" (
    echo Installing Node.js packages...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install Electron dependencies!
        pause
        exit /b 1
    )
    echo [OK] Electron dependencies installed
) else (
    echo [OK] Electron dependencies already installed
)

echo.
echo ================================================
echo   Starting CopyDock...
echo ================================================
echo.
echo Backend API will start on http://localhost:8001
echo Frontend will open in Electron window
echo.
echo Press Ctrl+C to stop the application
echo.

REM Start backend in background
start /B python ..\backend\server.py > ..\backend.log 2>&1

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

REM Start Electron (this will block)
echo Starting Electron...
call npm start

REM Cleanup on exit
echo.
echo Application closed.
pause

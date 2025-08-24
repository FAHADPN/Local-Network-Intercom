@echo off
chcp 65001 >nul
title Tradelink Intercom - ngrok Setup Script

echo 🎤 Tradelink Intercom - ngrok Setup Script
echo ==========================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ngrok is not installed.
    echo.
    echo 📥 Please install ngrok manually:
    echo 1. Go to https://ngrok.com/download
    echo 2. Download the Windows version
    echo 3. Extract to a folder
    echo 4. Add the folder to your PATH environment variable
    echo.
    pause
    exit /b 1
) else (
    echo ✅ ngrok is already installed
)

echo.
echo 🔐 Setting up ngrok authentication...

REM Check if ngrok is authenticated
ngrok config check >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ngrok is not authenticated.
    echo.
    echo 📋 To authenticate ngrok:
    echo 1. Go to https://dashboard.ngrok.com/get-started/your-authtoken
    echo 2. Copy your authtoken
    echo 3. Run: ngrok config add-authtoken YOUR_TOKEN_HERE
    echo.
    set /p auth="Do you have your authtoken? (y/n): "
    if /i "%auth%"=="y" (
        set /p token="Enter your authtoken: "
        ngrok config add-authtoken "%token%"
        echo ✅ ngrok authenticated successfully!
    ) else (
        echo ⚠️  Please authenticate ngrok manually before continuing
        echo Run: ngrok config add-authtoken YOUR_TOKEN_HERE
    )
) else (
    echo ✅ ngrok is already authenticated
)

echo.
echo 🚀 Starting Tradelink Intercom server...

REM Check if server is already running
curl -s http://localhost:3000 >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ Server is already running on port 3000
) else (
    echo 📡 Starting server...
    echo Run this in another terminal: bun run dev
    echo.
    pause
)

echo.
echo 🌐 Setting up ngrok tunnel...

REM Start ngrok tunnel
echo Starting ngrok tunnel to http://localhost:3000...
echo This will create a public HTTPS URL for your app.
echo.
echo 📱 Use the HTTPS URL to access your app from any device!
echo 🔒 HTTPS is required for microphone access in production.
echo.
echo Press Ctrl+C to stop ngrok when done.
echo.

REM Start ngrok
ngrok http 3000

pause

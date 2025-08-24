#!/bin/bash

# Tradelink Intercom - ngrok Setup Script
# This script helps set up ngrok for HTTPS access

echo "🎤 Tradelink Intercom - ngrok Setup Script"
echo "=========================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed."
    echo ""
    echo "📥 Installing ngrok..."
    echo ""
    
    # Detect OS and provide installation instructions
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "🐧 Linux detected"
        echo "Installing ngrok..."
        curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
        echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
        sudo apt update && sudo apt install ngrok
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🍎 macOS detected"
        echo "Installing ngrok via Homebrew..."
        brew install ngrok/ngrok/ngrok
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        echo "🪟 Windows detected"
        echo "Please download ngrok from: https://ngrok.com/download"
        echo "Extract to a folder and add to PATH"
        exit 1
    else
        echo "❓ Unknown OS. Please install ngrok manually:"
        echo "https://ngrok.com/download"
        exit 1
    fi
else
    echo "✅ ngrok is already installed"
fi

echo ""
echo "🔐 Setting up ngrok authentication..."

# Check if ngrok is authenticated
if ! ngrok config check &> /dev/null; then
    echo "❌ ngrok is not authenticated."
    echo ""
    echo "📋 To authenticate ngrok:"
    echo "1. Go to https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "2. Copy your authtoken"
    echo "3. Run: ngrok config add-authtoken YOUR_TOKEN_HERE"
    echo ""
    read -p "Do you have your authtoken? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your authtoken: " authtoken
        ngrok config add-authtoken "$authtoken"
        echo "✅ ngrok authenticated successfully!"
    else
        echo "⚠️  Please authenticate ngrok manually before continuing"
        echo "Run: ngrok config add-authtoken YOUR_TOKEN_HERE"
    fi
else
    echo "✅ ngrok is already authenticated"
fi

echo ""
echo "🚀 Starting Tradelink Intercom server..."

# Check if server is already running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server is already running on port 3000"
else
    echo "📡 Starting server..."
    echo "Run this in another terminal: bun run dev"
    echo ""
    read -p "Press Enter when server is running..."
fi

echo ""
echo "🌐 Setting up ngrok tunnel..."

# Start ngrok tunnel
echo "Starting ngrok tunnel to http://localhost:3000..."
echo "This will create a public HTTPS URL for your app."
echo ""
echo "📱 Use the HTTPS URL to access your app from any device!"
echo "🔒 HTTPS is required for microphone access in production."
echo ""
echo "Press Ctrl+C to stop ngrok when done."
echo ""

# Start ngrok
ngrok http 3000

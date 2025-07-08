#!/bin/bash

# Ekklesia Project Setup Script
echo "🏗️  Setting up Ekklesia Church Management System..."

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Start PostgreSQL container
echo "🐘 Starting PostgreSQL container..."
npm run db:up

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Run database migrations
echo "🗄️  Running database migrations..."
npm run db:migrate

echo "🎉 Setup complete!"
echo ""
echo "🚀 To start development:"
echo "   npm run dev"
echo ""
echo "📊 To view database:"
echo "   npm run db:studio"
echo ""
echo "🔧 To view pgAdmin:"
echo "   npm run pgadmin:up"
echo "   Open http://localhost:5050 (admin@example.com / admin)"
echo ""
echo "💡 Applications will be available at:"
echo "   API: http://localhost:3000/api"
echo "   Admin: http://localhost:4201/"
echo "   Client: http://localhost:4200/"

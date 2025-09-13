#!/bin/bash

# 🚀 Civic Issue Tracker - Unix Setup Script
# Run this script in terminal

echo "🏆 Civic Issue Tracker - Unix Setup"
echo "==================================="

# Check if Node.js is installed
echo ""
echo "📦 Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js version: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm version: $NPM_VERSION"
else
    echo "❌ npm not found. Please install npm"
    exit 1
fi

# Check if MongoDB is installed
echo ""
echo "🗄️ Checking MongoDB installation..."
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is installed"
else
    echo "⚠️ MongoDB not found. Please install MongoDB or use MongoDB Atlas (cloud)"
fi

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install mobile app dependencies
echo ""
echo "📱 Installing mobile app dependencies..."
cd ../mobile-app
npm install
if [ $? -eq 0 ]; then
    echo "✅ Mobile app dependencies installed"
else
    echo "❌ Failed to install mobile app dependencies"
    exit 1
fi

# Create .env file for backend
echo ""
echo "⚙️ Creating environment configuration..."
cd ../backend
if [ ! -f ".env" ]; then
    cat > .env << EOF
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/civic-issues

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development
EOF
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

# Start MongoDB service
echo ""
echo "🗄️ Starting MongoDB service..."
if command -v brew &> /dev/null; then
    # macOS with Homebrew
    brew services start mongodb-community 2>/dev/null || echo "⚠️ Could not start MongoDB service"
elif command -v systemctl &> /dev/null; then
    # Linux with systemd
    sudo systemctl start mongod 2>/dev/null || echo "⚠️ Could not start MongoDB service"
else
    echo "⚠️ Please start MongoDB manually or use MongoDB Atlas"
fi

# Create admin user
echo ""
echo "👤 Creating admin user..."
npm run create-admin
if [ $? -eq 0 ]; then
    echo "✅ Admin user created successfully!"
    echo "📧 Email: admin@civicissues.com"
    echo "🔑 Password: admin123"
else
    echo "⚠️ Could not create admin user. You can create it manually later"
fi

# Get local IP address
echo ""
echo "🌐 Getting local IP address..."
IP_ADDRESS=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
if [ -z "$IP_ADDRESS" ]; then
    IP_ADDRESS="localhost"
fi
echo "✅ Your local IP: $IP_ADDRESS"

# Update mobile app API URL
echo ""
echo "📱 Updating mobile app API URL..."
cd ../mobile-app
sed -i.bak "s|http://192\.168\.42\.83:5000/api|http://$IP_ADDRESS:5000/api|g" App.js
echo "✅ Updated API URL to: http://$IP_ADDRESS:5000/api"

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo "1. Start backend server:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2. Start mobile app (in new terminal):"
echo "   cd mobile-app"
echo "   npm start"
echo ""
echo "3. Open admin dashboard:"
echo "   Open admin-dashboard/index.html in your browser"
echo ""
echo "🔑 Admin Credentials:"
echo "   Email: admin@civicissues.com"
echo "   Password: admin123"
echo ""
echo "📱 Mobile App API URL: http://$IP_ADDRESS:5000/api"

cd ..

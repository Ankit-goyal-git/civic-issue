# 🚀 Civic Issue Tracker - Windows Setup Script
# Run this script in PowerShell as Administrator

Write-Host "🏆 Civic Issue Tracker - Windows Setup" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if Node.js is installed
Write-Host "`n📦 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is installed
Write-Host "`n🗄️ Checking MongoDB installation..." -ForegroundColor Yellow
try {
    $mongoVersion = mongod --version
    Write-Host "✅ MongoDB is installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ MongoDB not found. Please install MongoDB from https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    Write-Host "Or use MongoDB Atlas (cloud) for easier setup" -ForegroundColor Yellow
}

# Install backend dependencies
Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Install mobile app dependencies
Write-Host "`n📱 Installing mobile app dependencies..." -ForegroundColor Yellow
Set-Location ../mobile-app
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Mobile app dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install mobile app dependencies" -ForegroundColor Red
    exit 1
}

# Create .env file for backend
Write-Host "`n⚙️ Creating environment configuration..." -ForegroundColor Yellow
Set-Location ../backend
if (-not (Test-Path ".env")) {
    @"
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/civic-issues

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Created .env file" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Start MongoDB service (Windows)
Write-Host "`n🗄️ Starting MongoDB service..." -ForegroundColor Yellow
try {
    Start-Service MongoDB
    Write-Host "✅ MongoDB service started" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not start MongoDB service. Please start it manually or use MongoDB Atlas" -ForegroundColor Yellow
}

# Create admin user
Write-Host "`n👤 Creating admin user..." -ForegroundColor Yellow
npm run create-admin
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Admin user created successfully!" -ForegroundColor Green
    Write-Host "📧 Email: admin@civicissues.com" -ForegroundColor Cyan
    Write-Host "🔑 Password: admin123" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ Could not create admin user. You can create it manually later" -ForegroundColor Yellow
}

# Get local IP address
Write-Host "`n🌐 Getting local IP address..." -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"} | Select-Object -First 1).IPAddress
Write-Host "✅ Your local IP: $ipAddress" -ForegroundColor Green

# Update mobile app API URL
Write-Host "`n📱 Updating mobile app API URL..." -ForegroundColor Yellow
$appJsPath = "../mobile-app/App.js"
$content = Get-Content $appJsPath -Raw
$newContent = $content -replace "http://192\.168\.42\.83:5000/api", "http://$ipAddress:5000/api"
Set-Content $appJsPath $newContent
Write-Host "✅ Updated API URL to: http://$ipAddress:5000/api" -ForegroundColor Green

Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "================" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start backend server:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "`n2. Start mobile app (in new terminal):" -ForegroundColor White
Write-Host "   cd mobile-app" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host "`n3. Open admin dashboard:" -ForegroundColor White
Write-Host "   Open admin-dashboard/index.html in your browser" -ForegroundColor Gray
Write-Host "`n🔑 Admin Credentials:" -ForegroundColor Yellow
Write-Host "   Email: admin@civicissues.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host "`nMobile App API URL: http://$ipAddress:5000/api" -ForegroundColor Cyan

Set-Location ..

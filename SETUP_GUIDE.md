# 🚀 Civic Issue Tracker - Complete Setup Guide

## 📋 **Prerequisites**

### **Required Software**
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud)
- **Git** - [Download here](https://git-scm.com/)
- **Expo CLI** (for mobile app) - `npm install -g expo-cli`

### **Mobile Development**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, Mac only)
- **Expo Go app** on your mobile device

## 🖥️ **Windows Setup (PowerShell)**

### **Option 1: Automated Setup**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup-windows.ps1
```

### **Option 2: Manual Setup**
```powershell
# 1. Install dependencies
cd backend
npm install

cd ..\mobile-app
npm install

# 2. Create environment file
cd ..\backend
# Create .env file with your configuration

# 3. Start MongoDB service
Start-Service MongoDB

# 4. Create admin user
npm run create-admin

# 5. Start backend
npm run dev

# 6. Start mobile app (new terminal)
cd ..\mobile-app
npm start
```

## 🍎 **Mac/Linux Setup**

### **Option 1: Automated Setup**
```bash
chmod +x setup-unix.sh
./setup-unix.sh
```

### **Option 2: Manual Setup**
```bash
# 1. Install dependencies
cd backend && npm install
cd ../mobile-app && npm install

# 2. Start MongoDB
brew services start mongodb-community  # Mac
# or
sudo systemctl start mongod            # Linux

# 3. Create admin user
cd backend && npm run create-admin

# 4. Start backend
npm run dev

# 5. Start mobile app (new terminal)
cd ../mobile-app && npm start
```

## ⚙️ **Configuration**

### **1. Backend Environment (.env)**
Create `backend/.env`:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/civic-issues

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development
```

### **2. Mobile App API URL**
Update `mobile-app/App.js` line 33:
```javascript
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';
```

**Find your IP address:**
- Windows: `ipconfig`
- Mac/Linux: `ifconfig`

### **3. Admin Dashboard API URL**
Update `admin-dashboard/index.html` line 337:
```javascript
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';
```

## 🚀 **Running the Application**

### **1. Start Backend Server**
```bash
cd backend
npm run dev
```
**Look for**: `🚀 Server running on http://localhost:5000`

### **2. Create Admin User**
```bash
cd backend
npm run create-admin
```
**Default credentials**: admin@civicissues.com / admin123

### **3. Start Mobile App**
```bash
cd mobile-app
npm start
```
- Scan QR code with Expo Go app
- Or press 'w' for web version

### **4. Open Admin Dashboard**
- Open `admin-dashboard/index.html` in browser
- Login with admin credentials

## 📱 **Mobile App Testing**

### **Using Expo Go (Recommended)**
1. Install Expo Go app on your phone
2. Scan QR code from terminal
3. App will load on your device

### **Using Web Browser**
1. Press 'w' in terminal
2. App opens in browser
3. Good for testing, limited mobile features

### **Using Emulator**
1. Start Android Studio emulator
2. Press 'a' in terminal
3. App installs on emulator

## 🔧 **Troubleshooting**

### **Common Issues**

#### **"Network request failed"**
- Check if backend is running
- Verify API URL in mobile app
- Ensure same WiFi network

#### **"MongoDB connection failed"**
- Start MongoDB service
- Check MongoDB URI in .env
- Use MongoDB Atlas for cloud database

#### **"Access token required"**
- User not logged in
- Login first before submitting reports

#### **Buttons stuck on "Signing In..."**
- Backend server not running
- Wrong API URL
- Network connectivity issues

### **Debug Steps**
1. **Test Backend**: Visit `http://localhost:5000/api/health`
2. **Check Logs**: Look at backend console for errors
3. **Test Connection**: Use "Test Backend Connection" in mobile app
4. **Verify Network**: Same WiFi network required

## 📦 **Project Structure**

```
civic-issue-tracker/
├── backend/                 # Node.js/Express API
│   ├── server.js           # Main server file
│   ├── create-admin.js     # Admin user creation
│   ├── uploads/            # Photo storage
│   └── package.json        # Backend dependencies
├── mobile-app/             # React Native/Expo app
│   ├── App.js              # Main app component
│   ├── package.json        # Mobile app dependencies
│   └── assets/             # App icons and images
├── admin-dashboard/        # Web admin interface
│   └── index.html          # Admin dashboard
├── .gitignore              # Git ignore rules
├── setup-windows.ps1       # Windows setup script
└── README.md               # Project documentation
```

## 🎯 **Features**

### ✅ **Implemented**
- User authentication (register/login)
- User-specific report tracking
- Photo upload with location
- Admin dashboard with user management
- Protected API routes
- Mobile app with authentication

### 🔄 **Ready for Enhancement**
- Cloud file storage
- Email notifications
- Push notifications
- Automated routing
- Analytics dashboard
- Interactive maps

## 🚀 **Production Deployment**

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for production setup.

## 📞 **Support**

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- Review console logs for error messages
- Test backend connection using mobile app button
- Ensure all prerequisites are installed

## 🎉 **Success Indicators**

- Backend shows: `✅ Connected to MongoDB`
- Mobile app shows: "Backend is running!" when testing
- Login works with admin credentials
- Reports can be submitted successfully
- Admin dashboard shows user information

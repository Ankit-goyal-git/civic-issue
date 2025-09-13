# 🔧 Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### 1. **Buttons Getting Stuck (Sign In/Submit)**

#### **Problem**: Buttons show "Signing In..." or "Submitting..." but never complete

#### **Solutions**:

**Step 1: Check Backend Server**
```bash
cd backend
npm run dev
```
Look for: `🚀 Server running on http://localhost:5000`

**Step 2: Test Backend Connection**
- In mobile app, tap "Test Backend Connection" button
- Should show: "Backend is running!"

**Step 3: Check API URL**
- Current API URL: `http://192.168.42.83:5000/api`
- Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Update API URL in `mobile-app/App.js` line 33

**Step 4: Check Network**
- Make sure mobile device and computer are on same WiFi
- Try accessing `http://192.168.42.83:5000/api/health` in mobile browser

### 2. **Login/Registration Fails**

#### **Problem**: "Login Failed" or "Registration Failed" errors

#### **Solutions**:

**Check Backend Logs**:
```bash
cd backend
npm run dev
```
Look for error messages in console

**Common Issues**:
- MongoDB not running
- Database connection failed
- Email already exists (for registration)

**Fix MongoDB**:
```bash
# Windows: Start MongoDB service
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### 3. **Photo Upload Issues**

#### **Problem**: Photos not uploading or reports submitted without photos

#### **Solutions**:

**Check Upload Directory**:
```bash
cd backend
ls uploads/
```
Should see uploaded photos

**Check File Permissions**:
```bash
chmod 755 backend/uploads/
```

**Test Without Photo**:
- Try submitting report without photo first
- If that works, photo upload is the issue

### 4. **Admin Dashboard Issues**

#### **Problem**: Can't login to admin dashboard

#### **Solutions**:

**Create Admin User**:
```bash
cd backend
npm run create-admin
```

**Default Admin Credentials**:
- Email: `admin@civicissues.com`
- Password: `admin123`

**Check Admin Role**:
- Make sure user has `role: 'admin'` in database

### 5. **Mobile App Not Loading**

#### **Problem**: App crashes or won't start

#### **Solutions**:

**Clear Cache**:
```bash
cd mobile-app
npx expo start --clear
```

**Check Dependencies**:
```bash
cd mobile-app
npm install
```

**Restart Metro**:
```bash
cd mobile-app
npx expo start --reset-cache
```

## 🔍 **Debug Steps**

### **Step 1: Check Backend**
```bash
cd backend
npm run dev
```
Should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
📱 API available at http://localhost:5000/api
```

### **Step 2: Test API**
Open browser: `http://localhost:5000/api/health`
Should see: `{"status":"OK","message":"Civic Issue Tracker API is running!"}`

### **Step 3: Check Mobile App**
```bash
cd mobile-app
npm start
```
Tap "Test Backend Connection" button

### **Step 4: Check Database**
```bash
# Connect to MongoDB
mongo
use civic-issues
db.users.find()
db.reports.find()
```

## 🚀 **Quick Fixes**

### **Reset Everything**:
```bash
# Stop all processes
# Restart backend
cd backend
npm run dev

# Restart mobile app
cd mobile-app
npx expo start --clear

# Create admin user
cd backend
npm run create-admin
```

### **Check IP Address**:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```
Update API URL in `mobile-app/App.js` with your computer's IP

### **Test with Default Admin**:
- Email: `admin@civicissues.com`
- Password: `admin123`

## 📞 **Still Having Issues?**

1. **Check Console Logs**: Look for error messages
2. **Test Backend Connection**: Use the test button in mobile app
3. **Verify Network**: Same WiFi network
4. **Check Dependencies**: Run `npm install` in both folders
5. **Restart Everything**: Backend, mobile app, and database

## 🎯 **Common Error Messages**

| Error | Solution |
|-------|----------|
| "Network request failed" | Check API URL and network |
| "Access token required" | User not logged in |
| "Invalid or expired token" | Login again |
| "Admin access required" | Use admin account |
| "User already exists" | Use different email |
| "Failed to fetch" | Backend server not running |

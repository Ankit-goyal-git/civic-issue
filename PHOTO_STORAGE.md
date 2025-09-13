# 📸 Photo Storage Information

## Where Photos Are Stored

**Local Storage**: `civic-issue-tracker/backend/uploads/` folder

### File Structure
```
backend/
├── uploads/           # 📸 Photos are stored here
│   ├── photo-1234567890-123456789.jpg
│   ├── photo-1234567891-123456789.png
│   └── ...
├── server.js
└── package.json
```

### Photo Naming Convention
- Format: `photo-{timestamp}-{random}.{extension}`
- Example: `photo-1694567890123-987654321.jpg`
- This ensures unique filenames and prevents conflicts

### Accessing Photos
- **Admin Dashboard**: Photos display automatically via `http://localhost:5000/uploads/filename`
- **Mobile App**: Photos are served through the backend API
- **Direct Access**: `http://localhost:5000/uploads/photo-filename.jpg`

### Production Deployment Options

#### Option 1: Keep Local Storage
- Photos stay in server's file system
- Simple and works immediately
- Good for small to medium scale

#### Option 2: Cloud Storage (Recommended for Production)
- **Cloudinary**: Free tier available, easy integration
- **AWS S3**: Scalable, pay-per-use
- **Google Cloud Storage**: Reliable, good pricing

### Current Configuration
- **Max file size**: 5MB
- **Supported formats**: JPG, PNG, GIF
- **Storage location**: Local `uploads/` directory
- **URL access**: `http://localhost:5000/uploads/filename`

### Backup Recommendations
- Regularly backup the `uploads/` folder
- Consider automated backups for production
- Monitor disk space usage

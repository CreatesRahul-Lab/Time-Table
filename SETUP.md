# 🚀 Quick Setup Guide

This guide will help you set up and run the Smart Classroom & Timetable Scheduler application.

## ⚡ Prerequisites

Before starting, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## 📦 Installation Steps

### 1. Install Backend Dependencies
```powershell
cd backend
npm install
```

### 2. Install Frontend Dependencies
```powershell
cd ../frontend
npm install
```

### 3. Create Environment Configuration
Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-timetable
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRE=7d
NODE_ENV=development
```

**Important:** Replace `your_super_secret_jwt_key_here_make_it_long_and_complex` with a secure random string.

## 🏃‍♂️ Running the Application

### Option 1: Using VS Code Integrated Terminal

1. **Start MongoDB** (if installed locally):
   ```powershell
   # In PowerShell as Administrator
   net start MongoDB
   ```

2. **Start Backend Server** (Terminal 1):
   ```powershell
   cd backend
   npm run dev
   ```
   ✅ Backend will run on http://localhost:5000

3. **Start Frontend Server** (Terminal 2):
   ```powershell
   cd frontend
   npm start
   ```
   ✅ Frontend will run on http://localhost:3000

### Option 2: Using VS Code Tasks

You can also create VS Code tasks to automate this process:

1. Press `Ctrl+Shift+P` and type "Tasks: Configure Task"
2. Create a `tasks.json` file with the provided configuration
3. Press `Ctrl+Shift+P` and run "Tasks: Run Task"

## 🔐 Default Login Credentials

After setting up, you can create an admin account by registering through the UI or using the API directly.

**For testing, you can register with:**
- Email: admin@test.com
- Password: admin123
- Role: admin

## 📋 Verification Checklist

After starting both servers, verify everything is working:

- [ ] Backend API responds at http://localhost:5000/api/test
- [ ] Frontend loads at http://localhost:3000
- [ ] MongoDB connection is successful (check backend console)
- [ ] Registration/Login works
- [ ] Dashboard displays without errors

## 🔧 Development Tools

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- MongoDB for VS Code
- REST Client (for API testing)

### Useful npm Scripts

**Backend:**
```powershell
npm run dev      # Start with nodemon (auto-restart)
npm start        # Start production server
npm test         # Run tests
```

**Frontend:**
```powershell
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

## 🐛 Troubleshooting

### Common Issues

1. **Port 3000 already in use:**
   ```powershell
   # Kill process on port 3000
   npx kill-port 3000
   ```

2. **MongoDB connection failed:**
   - Ensure MongoDB service is running
   - Check if port 27017 is available
   - Verify MONGODB_URI in .env file

3. **Module not found errors:**
   ```powershell
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

4. **CORS errors:**
   - Ensure both servers are running
   - Check that proxy is set in frontend package.json

### MongoDB Setup (Windows)

If you don't have MongoDB installed:

1. **Download and Install MongoDB Community Edition**
2. **Start MongoDB Service:**
   ```powershell
   # Start MongoDB service
   net start MongoDB

   # Or run manually
   mongod --dbpath C:\data\db
   ```

3. **Verify installation:**
   ```powershell
   mongo --version
   ```

### Alternative: MongoDB Atlas (Cloud)

If you prefer cloud database:

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update MONGODB_URI in .env file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-timetable
   ```

## 🎯 Next Steps

Once everything is running:

1. **Explore the Dashboard** - Navigate to http://localhost:3000
2. **Check API Documentation** - Visit the README.md for API endpoints
3. **Create Test Data** - Add some subjects, faculty, and classrooms
4. **Generate Timetables** - Test the optimization algorithm
5. **Customize Features** - Modify components to fit your needs

## 📞 Need Help?

If you encounter any issues:

1. Check the browser console for frontend errors
2. Check the terminal/console for backend errors
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed
5. Make sure MongoDB is running and accessible

---

**Happy Coding! 🎉**

For detailed documentation, see the main [README.md](README.md) file.

# Smart Classroom & Timetable Scheduler

A comprehensive MERN stack application for intelligent timetable generation and classroom management with optimization algorithms and role-based access control.

## Problem Statement ID: 25028

This system addresses the complex challenge of automated timetable scheduling in educational institutions, providing optimal allocation of classrooms, faculty, and time slots while considering multiple constraints and preferences.

## Features

### Core Features
- 🎯 **Intelligent Timetable Generation** - Genetic algorithm-based optimization
- 👥 **Multi-Role Management** - Admin, Faculty, and Student access levels
- 🏫 **Classroom Management** - Smart allocation with capacity and facility constraints
- 👨‍🏫 **Faculty Management** - Workload distribution and availability tracking
- 📚 **Subject Management** - Prerequisites, credits, and requirement handling
- 📊 **Analytics & Reports** - Comprehensive dashboard with insights

### Advanced Features
- 🔄 **Multiple Optimization Options** - Generate and compare different timetable versions
- ✅ **Approval Workflows** - Review and approval system for timetables
- 🎨 **Dark Mode Support** - Enhanced user experience
- 📱 **Responsive Design** - Works on all device sizes
- 🔒 **Secure Authentication** - JWT-based authentication system
- 📈 **Real-time Dashboard** - Live statistics and quick actions

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Genetic Algorithm** - Timetable optimization

### Frontend
- **React 18.2.0** - UI library
- **React Router DOM 6.15.0** - Client-side routing
- **React Hook Form 7.45.4** - Form management
- **React Hot Toast 2.4.1** - Notifications
- **React Icons 4.10.1** - Icon library
- **Axios 1.5.0** - HTTP client
- **CSS3** - Styling with CSS variables and Grid

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Sih
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

   Create `.env` file in backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/smart-timetable
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on http://localhost:5000

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on http://localhost:3000

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Timetable Endpoints
- `GET /api/timetables` - Get all timetables (with filters)
- `POST /api/timetables/generate` - Generate new timetable
- `POST /api/timetables/generate-options` - Generate multiple options
- `GET /api/timetables/:id` - Get specific timetable
- `PUT /api/timetables/:id` - Update timetable
- `PUT /api/timetables/:id/approve` - Approve/reject timetable
- `PUT /api/timetables/:id/publish` - Publish timetable
- `DELETE /api/timetables/:id` - Delete timetable

### Subject Endpoints
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create new subject
- `GET /api/subjects/:id` - Get specific subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Faculty Endpoints
- `GET /api/faculty` - Get all faculty
- `POST /api/faculty` - Create new faculty
- `GET /api/faculty/:id` - Get specific faculty
- `PUT /api/faculty/:id` - Update faculty
- `DELETE /api/faculty/:id` - Delete faculty

### Classroom Endpoints
- `GET /api/classrooms` - Get all classrooms
- `POST /api/classrooms` - Create new classroom
- `GET /api/classrooms/:id` - Get specific classroom
- `PUT /api/classrooms/:id` - Update classroom
- `DELETE /api/classrooms/:id` - Delete classroom

## Database Schema

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: ['admin', 'faculty', 'student'],
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    department: String
  }
}
```

### Timetable Model
```javascript
{
  name: String,
  department: String,
  semester: Number,
  academicYear: String,
  shift: ['morning', 'afternoon', 'evening'],
  batch: String,
  schedule: {
    monday: [{ timeSlot, subject, faculty, classroom }],
    tuesday: [...],
    // ... other days
  },
  constraints: Object,
  optimizationResults: {
    score: Number,
    metrics: Object,
    conflicts: Array
  },
  status: ['draft', 'generated', 'review', 'approved', 'published']
}
```

## Optimization Algorithm

The system uses a **Genetic Algorithm** for timetable optimization with the following features:

### Fitness Function
- **Faculty Availability** (25%) - Ensures faculty are available during assigned slots
- **Classroom Capacity** (20%) - Matches classroom size with class requirements
- **Subject Distribution** (20%) - Evenly distributes subjects across the week
- **No Time Conflicts** (25%) - Prevents scheduling conflicts
- **Faculty Workload** (10%) - Balances teaching load across faculty

### Constraints Handling
- Hard constraints (must be satisfied)
- Soft constraints (preferences, weighted optimization)
- Conflict detection and resolution
- Multiple optimization runs for best results

## User Roles & Permissions

### Admin
- Full system access
- User management
- System configuration
- Analytics and reports
- All CRUD operations

### Faculty
- View assigned timetables
- Submit availability preferences
- View classroom and subject information
- Limited profile management

### Student
- View published timetables
- Access class schedules
- View room assignments

## Development Guidelines

### Project Structure
```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication, validation
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── config/         # Configuration files
├── package.json
└── server.js

frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── context/       # React context
│   ├── services/      # API calls
│   └── styles/        # CSS files
├── public/
└── package.json
```

### Code Style
- ES6+ JavaScript features
- Async/await for asynchronous operations
- Functional components with hooks
- Consistent error handling
- Comprehensive input validation

### Security Features
- JWT token authentication
- Password hashing with bcrypt
- Input sanitization
- CORS configuration
- Helmet security headers
- Role-based access control

## Deployment

### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=strong_production_secret
PORT=5000
```

### Build Commands
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env file
   - Verify network connectivity

2. **Authentication Issues**
   - Check JWT secret configuration
   - Verify token expiration settings
   - Clear browser storage and re-login

3. **Build Errors**
   - Run `npm install` to update dependencies
   - Check Node.js version compatibility
   - Clear npm cache: `npm cache clean --force`

### Performance Optimization

- Enable MongoDB indexing for frequently queried fields
- Implement caching for static data
- Use pagination for large datasets
- Optimize bundle size with code splitting
- Enable gzip compression

## Roadmap

### Phase 1 (Current)
- ✅ Basic MERN stack setup
- ✅ Authentication system
- ✅ Core CRUD operations
- ✅ Timetable generation algorithm

### Phase 2 (Upcoming)
- 🔄 Advanced filtering and search
- 🔄 Email notifications
- 🔄 Calendar integration
- 🔄 Mobile app development

### Phase 3 (Future)
- 📋 Machine learning improvements
- 📋 Integration with LMS systems
- 📋 Advanced analytics
- 📋 Multi-campus support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email [support@smarttimetable.com](mailto:support@smarttimetable.com) or create an issue in the repository.

## Acknowledgments

- Problem Statement ID 25028 for the requirements specification
- Educational institutions for domain expertise
- Open source community for tools and libraries
- Contributors and beta testers

---

**Smart Classroom & Timetable Scheduler** - Revolutionizing educational scheduling with intelligent automation.

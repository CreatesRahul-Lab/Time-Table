import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout Components
import Layout from './components/Layout/Layout';
import AuthLayout from './components/Layout/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TimetableList from './pages/Timetables/TimetableList';
import TimetableCreate from './pages/Timetables/TimetableCreate';
import TimetableView from './pages/Timetables/TimetableView';
import SubjectList from './pages/Subjects/SubjectList';
import SubjectCreate from './pages/Subjects/SubjectCreate';
import FacultyList from './pages/Faculty/FacultyList';
import FacultyCreate from './pages/Faculty/FacultyCreate';
import ClassroomList from './pages/Classrooms/ClassroomList';
import ClassroomCreate from './pages/Classrooms/ClassroomCreate';
import UserList from './pages/Users/UserList';
import Profile from './pages/Profile';
import Reports from './pages/Reports';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" replace /> : <AuthLayout><Login /></AuthLayout>
        } />
        <Route path="/register" element={
          user ? <Navigate to="/dashboard" replace /> : <AuthLayout><Register /></AuthLayout>
        } />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          
          {/* Timetable Routes */}
          <Route path="timetables" element={<TimetableList />} />
          <Route path="timetables/create" element={
            <ProtectedRoute permission="canCreateTimetable">
              <TimetableCreate />
            </ProtectedRoute>
          } />
          <Route path="timetables/:id" element={<TimetableView />} />
          
          {/* Subject Routes */}
          <Route path="subjects" element={<SubjectList />} />
          <Route path="subjects/create" element={
            <ProtectedRoute permission="canCreateTimetable">
              <SubjectCreate />
            </ProtectedRoute>
          } />
          
          {/* Faculty Routes */}
          <Route path="faculty" element={<FacultyList />} />
          <Route path="faculty/create" element={
            <ProtectedRoute permission="canCreateTimetable">
              <FacultyCreate />
            </ProtectedRoute>
          } />
          
          {/* Classroom Routes */}
          <Route path="classrooms" element={<ClassroomList />} />
          <Route path="classrooms/create" element={
            <ProtectedRoute permission="canCreateTimetable">
              <ClassroomCreate />
            </ProtectedRoute>
          } />
          
          {/* User Management Routes */}
          <Route path="users" element={
            <ProtectedRoute role="admin">
              <UserList />
            </ProtectedRoute>
          } />
          
          {/* Reports */}
          <Route path="reports" element={
            <ProtectedRoute permission="canViewReports">
              <Reports />
            </ProtectedRoute>
          } />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

export default App;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, role, permission }) => {
  const { user, loading, hasRole, hasPermission } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirement
  if (role && !hasRole(role)) {
    return (
      <div className="container" style={{ marginTop: '2rem' }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>
              Access Denied
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              You don't have the required role to access this page.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Required: {Array.isArray(role) ? role.join(' or ') : role}
              <br />
              Your role: {user.role}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check permission requirement
  if (permission && !hasPermission(permission)) {
    return (
      <div className="container" style={{ marginTop: '2rem' }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>
              Access Denied
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              You don't have the required permission to access this page.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Required permission: {permission}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

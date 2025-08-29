import React from 'react';

const AuthLayout = ({ children }) => {
  const layoutStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
    padding: '1rem'
  };

  const containerStyle = {
    width: '100%',
    maxWidth: '400px'
  };

  const logoStyle = {
    textAlign: 'center',
    marginBottom: '2rem'
  };

  const titleStyle = {
    color: 'white',
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0 0 0.5rem 0'
  };

  const subtitleStyle = {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.875rem',
    margin: 0
  };

  return (
    <div style={layoutStyle}>
      <div style={containerStyle}>
        <div style={logoStyle}>
          <h1 style={titleStyle}>Smart Timetable</h1>
          <p style={subtitleStyle}>Intelligent Classroom Scheduling</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: { width: '1rem', height: '1rem' },
    md: { width: '2rem', height: '2rem' },
    lg: { width: '3rem', height: '3rem' }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    gap: '1rem'
  };

  const spinnerStyle = {
    ...sizeClasses[size],
    border: '2px solid var(--border-color)',
    borderRadius: '50%',
    borderTopColor: 'var(--primary-color)',
    animation: 'spin 1s ease-in-out infinite'
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      {text && (
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.875rem',
          margin: 0 
        }}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;

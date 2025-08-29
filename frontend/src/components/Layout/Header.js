import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiBell, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const headerStyle = {
    height: '4rem',
    backgroundColor: 'var(--background-color)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    boxShadow: 'var(--shadow-sm)',
    position: 'sticky',
    top: 0,
    zIndex: 50
  };

  const leftSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  };

  const rightSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  };

  const menuButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.5rem',
    height: '2.5rem',
    border: 'none',
    background: 'transparent',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    transition: 'var(--transition)'
  };

  const userMenuStyle = {
    position: 'relative'
  };

  const userButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    border: 'none',
    background: 'transparent',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer',
    transition: 'var(--transition)'
  };

  const avatarStyle = {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '600'
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    backgroundColor: 'var(--background-color)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    minWidth: '200px',
    zIndex: 100,
    display: dropdownOpen ? 'block' : 'none'
  };

  const dropdownItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.75rem 1rem',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'var(--transition)',
    fontSize: '0.875rem'
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
  };

  return (
    <header style={headerStyle}>
      <div style={leftSectionStyle}>
        <button 
          style={menuButtonStyle}
          onClick={onMenuClick}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background-alt)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <FiMenu size={20} />
        </button>
        
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.25rem', 
          fontWeight: '600',
          color: 'var(--text-primary)'
        }}>
          Smart Timetable Scheduler
        </h2>
      </div>

      <div style={rightSectionStyle}>
        {/* Notifications */}
        <button 
          style={menuButtonStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background-alt)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <FiBell size={20} />
        </button>

        {/* User Menu */}
        <div style={userMenuStyle}>
          <button 
            style={userButtonStyle}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background-alt)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <div style={avatarStyle}>
              {getInitials(user?.profile?.firstName + ' ' + user?.profile?.lastName)}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500',
                color: 'var(--text-primary)'
              }}>
                {user?.profile?.firstName} {user?.profile?.lastName}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-secondary)'
              }}>
                {user?.role}
              </div>
            </div>
          </button>

          <div style={dropdownStyle}>
            <button 
              style={dropdownItemStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background-alt)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              onClick={() => {
                setDropdownOpen(false);
                // Navigate to profile
              }}
            >
              <FiUser size={16} />
              Profile
            </button>
            
            <button 
              style={dropdownItemStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background-alt)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              onClick={() => {
                setDropdownOpen(false);
                // Navigate to settings
              }}
            >
              <FiSettings size={16} />
              Settings
            </button>
            
            <div style={{ 
              height: '1px', 
              backgroundColor: 'var(--border-color)', 
              margin: '0.5rem 0' 
            }} />
            
            <button 
              style={{
                ...dropdownItemStyle,
                color: 'var(--error-color)'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background-alt)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              onClick={handleLogout}
            >
              <FiLogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {dropdownOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99
          }}
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;

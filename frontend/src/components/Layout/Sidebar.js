import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, 
  FiCalendar, 
  FiBook, 
  FiUsers, 
  FiMapPin, 
  FiUser, 
  FiBarChart2,
  FiX
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '16rem',
    backgroundColor: 'var(--background-color)',
    borderRight: '1px solid var(--border-color)',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const headerStyle = {
    padding: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const logoStyle = {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--primary-color)',
    margin: 0
  };

  const closeButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    border: 'none',
    background: 'transparent',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer',
    color: 'var(--text-secondary)'
  };

  const navStyle = {
    flex: 1,
    padding: '1rem 0',
    overflow: 'auto'
  };

  const navItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1.5rem',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'var(--transition)',
    fontSize: '0.875rem',
    fontWeight: '500'
  };

  const activeNavItemStyle = {
    ...navItemStyle,
    color: 'var(--primary-color)',
    backgroundColor: 'rgb(59 130 246 / 0.1)',
    borderRight: '3px solid var(--primary-color)'
  };

  const navGroupStyle = {
    margin: '1rem 0'
  };

  const navGroupTitleStyle = {
    padding: '0.5rem 1.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-light)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 99,
    display: isOpen ? 'block' : 'none'
  };

  const menuItems = [
    {
      title: 'Main',
      items: [
        {
          path: '/dashboard',
          label: 'Dashboard',
          icon: FiHome,
          show: true
        }
      ]
    },
    {
      title: 'Timetable Management',
      items: [
        {
          path: '/timetables',
          label: 'Timetables',
          icon: FiCalendar,
          show: true
        }
      ]
    },
    {
      title: 'Resources',
      items: [
        {
          path: '/subjects',
          label: 'Subjects',
          icon: FiBook,
          show: true
        },
        {
          path: '/faculty',
          label: 'Faculty',
          icon: FiUsers,
          show: true
        },
        {
          path: '/classrooms',
          label: 'Classrooms',
          icon: FiMapPin,
          show: true
        }
      ]
    },
    {
      title: 'Administration',
      items: [
        {
          path: '/users',
          label: 'Users',
          icon: FiUser,
          show: hasRole('admin')
        },
        {
          path: '/reports',
          label: 'Reports',
          icon: FiBarChart2,
          show: hasPermission('canViewReports')
        }
      ]
    }
  ];

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Overlay */}
      <div style={overlayStyle} onClick={onClose} />
      
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={logoStyle}>Smart Timetable</h1>
          <button 
            style={closeButtonStyle}
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background-alt)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={navStyle}>
          {menuItems.map((group, groupIndex) => (
            <div key={groupIndex} style={navGroupStyle}>
              <div style={navGroupTitleStyle}>{group.title}</div>
              {group.items
                .filter(item => item.show)
                .map((item, itemIndex) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);
                  
                  return (
                    <NavLink
                      key={itemIndex}
                      to={item.path}
                      style={isActive ? activeNavItemStyle : navItemStyle}
                      onClick={onClose}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.target.style.backgroundColor = 'var(--background-alt)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <Icon size={18} />
                      {item.label}
                    </NavLink>
                  );
                })}
            </div>
          ))}
        </nav>

        {/* User Info */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--background-alt)'
        }}>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.25rem'
          }}>
            Logged in as
          </div>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            {user?.profile?.firstName} {user?.profile?.lastName}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            textTransform: 'capitalize'
          }}>
            {user?.role}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

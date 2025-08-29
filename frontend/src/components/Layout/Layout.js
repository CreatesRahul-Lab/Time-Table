import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const layoutStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--background-alt)'
  };

  const mainContentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: sidebarOpen ? '0' : '0'
  };

  const contentStyle = {
    flex: 1,
    padding: '2rem',
    overflow: 'auto'
  };

  return (
    <div style={layoutStyle}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={mainContentStyle}>
        <Header onMenuClick={toggleSidebar} />
        <main style={contentStyle}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AppShell.module.css';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = isAdmin
    ? [
        { to: '/admin', label: 'Dashboard', icon: '◫' },
      ]
    : [
        { to: '/', label: 'Dashboard', icon: '◫' },
        { to: '/interview/setup', label: 'New Interview', icon: '▸' },
      ];

  return (
    <div className={styles.shell}>
      {/* Top Nav */}
      <nav className={styles.topNav}>
        <div className={styles.navLeft}>
          <button
            className={styles.hamburger}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </button>
          <div className={styles.logo}>
            <span className={styles.logoNeedle}>▮</span>
            <span className={`${styles.logoText} display-text`}>InterviewSim</span>
          </div>
        </div>
        <div className={styles.navRight}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'User'}</span>
            {isAdmin && <span className={`${styles.adminBadge} data-text`}>ADMIN</span>}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      <div className={styles.body}>
        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarNav}>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/' || item.to === '/admin'}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </aside>

        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className={styles.overlay}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={styles.main}>
          <div className={styles.content}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import styles from './AppShell.module.css';

/**
 * Detects if the current pathname is an active interview session.
 * Matches /interview/:id but NOT /interview/setup or /interview/:id/report.
 */
function isInterviewActive(pathname) {
  return /^\/interview\/\d+$/.test(pathname);
}

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavTarget, setPendingNavTarget] = useState(null);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const interviewActive = isInterviewActive(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Guards a navigation action — if interview is active,
   * shows confirm modal instead of navigating immediately.
   */
  const guardedNavigate = useCallback((target, e) => {
    if (interviewActive) {
      if (e) e.preventDefault();
      setPendingNavTarget(target);
      setShowLeaveModal(true);
    }
    // If not active, NavLink handles navigation normally
  }, [interviewActive]);

  /** User confirmed leaving the interview */
  const confirmLeave = () => {
    setShowLeaveModal(false);
    if (pendingNavTarget === '__logout__') {
      handleLogout();
    } else if (pendingNavTarget) {
      navigate(pendingNavTarget);
    }
    setPendingNavTarget(null);
  };

  const cancelLeave = () => {
    setShowLeaveModal(false);
    setPendingNavTarget(null);
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
          <button
            className={styles.logoutBtn}
            onClick={(e) => {
              if (interviewActive) {
                e.preventDefault();
                setPendingNavTarget('__logout__');
                setShowLeaveModal(true);
              } else {
                handleLogout();
              }
            }}
          >
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
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''} ${interviewActive ? styles.navItemGuarded : ''}`
                }
                onClick={(e) => {
                  setSidebarOpen(false);
                  guardedNavigate(item.to, e);
                }}
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

      {/* Leave Interview Confirmation Modal */}
      <Modal
        isOpen={showLeaveModal}
        onClose={cancelLeave}
        title="Leave Interview?"
      >
        <p className={styles.leaveModalText}>
          Your interview is still in progress. Your progress is
          <strong> automatically saved</strong> and you can resume later
          from the Dashboard.
        </p>
        <div className={styles.leaveModalActions}>
          <Button variant="ghost" onClick={cancelLeave}>
            Stay in Interview
          </Button>
          <Button variant="accent" onClick={confirmLeave}>
            Leave &amp; Save Progress ▸
          </Button>
        </div>
      </Modal>
    </div>
  );
}

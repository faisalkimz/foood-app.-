import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Chefs from './pages/Chefs';
import Orders from './pages/Orders';
import Analytics from './pages/Analytics';
import Activity from './pages/Activity';
import './index.css';

const PAGES = {
  dashboard: Dashboard,
  users: Users,
  chefs: Chefs,
  orders: Orders,
  analytics: Analytics,
  activity: Activity,
};

const TITLES = {
  dashboard: 'Dashboard',
  users: 'Customer Management',
  chefs: 'Chef Management',
  orders: 'Order Tracking',
  analytics: 'Analytics',
  activity: 'Activity Log',
};

function restoreSession() {
  const savedToken = sessionStorage.getItem('admin_token');
  if (!savedToken) return { admin: null, token: null };
  try {
    const payload = JSON.parse(atob(savedToken.split('.')[1]));
    if (payload.exp * 1000 > Date.now()) {
      return {
        admin: { email: payload.email, name: payload.name, role: payload.role },
        token: savedToken,
      };
    }
  } catch {
    // invalid token
  }
  sessionStorage.removeItem('admin_token');
  return { admin: null, token: null };
}

export default function App() {
  const [session, setSession] = useState(() => restoreSession());
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const { admin, token } = session;

  const handleLogin = (adminUser, jwt) => {
    setSession({ admin: adminUser, token: jwt });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setSession({ admin: null, token: null });
    setCurrentPage('dashboard');
    setSearchQuery('');
  };

  // Show login if not authenticated
  if (!admin) {
    return <Login onLogin={handleLogin} />;
  }

  const PageComponent = PAGES[currentPage];

  return (
    <>
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        admin={admin}
        onLogout={handleLogout}
      />
      <div className="main">
        <Topbar
          title={TITLES[currentPage]}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          admin={admin}
        />
        <div className="page-content">
          <PageComponent searchQuery={searchQuery} token={token} />
        </div>
      </div>
    </>
  );
}

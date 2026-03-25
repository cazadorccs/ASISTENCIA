import { useState, useEffect } from 'react';
import { AttendanceProvider } from './context/AttendanceContext';
import { Dashboard } from './components/attendance/Dashboard';
import { Login } from './components/auth/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<string>('');

  useEffect(() => {
    const storedUser = localStorage.getItem('app_user');
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (loggedUser: string) => {
    setUser(loggedUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('app_user');
    setUser('');
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AttendanceProvider>
      <div style={{ position: 'relative' }}>
        <button
          onClick={handleLogout}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            zIndex: 1000
          }}
        >
          Cerrar Sesión ({user})
        </button>
        <Dashboard />
      </div>
    </AttendanceProvider>
  );
}

export default App;

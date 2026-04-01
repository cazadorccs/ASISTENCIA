import { useState, useEffect } from 'react';
import { AttendanceProvider } from './context/AttendanceContext';
import { Dashboard } from './components/attendance/Dashboard';
import { Login } from './components/auth/Login';

type UserRole = 'admin' | 'gerente' | 'supervisor' | 'empleado';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<string>('');
  const [role, setRole] = useState<UserRole>('empleado');

  useEffect(() => {
    const storedUser = localStorage.getItem('app_user');
    const storedRole = localStorage.getItem('app_role') as UserRole;
    if (storedUser) {
      setUser(storedUser);
      setRole(storedRole || 'empleado');
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (loggedUser: string, userRole: UserRole) => {
    setUser(loggedUser);
    setRole(userRole);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('app_user');
    localStorage.removeItem('app_role');
    setUser('');
    setRole('empleado');
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
      <Dashboard userRole={role} onLogout={handleLogout} userName={user} />
    </AttendanceProvider>
  );
}

export default App;

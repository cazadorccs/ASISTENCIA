import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { Dashboard } from './components/attendance/Dashboard';
import { Login } from './components/auth/Login';

const ProtectedRoute = () => {
  const { isAuthenticated, role, logout, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AttendanceProvider>
      <Dashboard userRole={role} onLogout={logout} userName={user} />
    </AttendanceProvider>
  );
};

const PublicRoute = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <Login />,
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

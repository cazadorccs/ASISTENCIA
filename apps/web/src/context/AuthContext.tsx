import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'gerente' | 'supervisor' | 'empleado';

interface AuthContextType {
  isAuthenticated: boolean;
  user: string;
  role: UserRole;
  login: (loggedUser: string, userRole: UserRole) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<string>('');
  const [role, setRole] = useState<UserRole>('empleado');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Aquí a futuro implementaremos la llamada real al backend: /api/auth/me
    const storedUser = localStorage.getItem('app_user');
    const storedRole = localStorage.getItem('app_role') as UserRole;
    if (storedUser) {
      setUser(storedUser);
      setRole(storedRole || 'empleado');
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  const login = (loggedUser: string, userRole: UserRole) => {
    localStorage.setItem('app_user', loggedUser);
    localStorage.setItem('app_role', userRole);
    setUser(loggedUser);
    setRole(userRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('app_user');
    localStorage.removeItem('app_role');
    setUser('');
    setRole('empleado');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, role, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

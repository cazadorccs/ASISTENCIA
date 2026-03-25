import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface User {
  username: string;
  password: string;
  name: string;
}

const USERS: User[] = [
  { username: 'admin', password: 'admin123', name: 'Administrador' },
  { username: 'user', password: 'user123', name: 'Usuario' },
];

interface LoginProps {
  onLogin: (user: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    const user = USERS.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      localStorage.setItem('app_user', user.name);
      onLogin(user.name);
    } else {
      setError('Usuario o contraseña incorrectos');
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1e3a5f',
            marginBottom: '8px'
          }}>
            Sistema de Asistencia
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Ingrese sus credenciales para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <Input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px' }}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <strong>Usuarios de prueba:</strong><br/>
          admin / admin123<br/>
          user / user123
        </div>
      </div>
    </div>
  );
}

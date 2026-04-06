import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';

const API_BASE = '/api';

export function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Credenciales incorrectas');
        setLoading(false);
        return;
      }

      login(data.user.name, data.user.role);
    } catch (err) {
      setError('Error de conexión. Intente más tarde.');
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Left panel - Branding & Abstract Gradient */}
      <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 relative overflow-hidden items-center justify-center p-12">
        {/* Abstract floating circles */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 text-center animate-fade-in">
          <div className="bg-white rounded-2xl backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-glass p-4 w-64 h-24">
            <img src="/logo.png" alt="MIPPCI Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-tight mb-4">
            Gestión de Asistencia
          </h1>
          <p className="text-brand-100 text-lg font-light max-w-md mx-auto">
            Plataforma corporativa centralizada para el monitoreo de flujos de personal.
          </p>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex flex-col justify-center flex-1 p-8 sm:p-12 lg:p-24 bg-slate-50 relative">
        <div className="w-full max-w-md mx-auto animate-slide-up">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-heading font-bold text-slate-850 mb-2">Bienvenido</h2>
            <p className="text-slate-500">Ingresa tus credenciales para acceder</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-float border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Institucional</label>
                <Input
                  type="email"
                  placeholder="ej. admin@mipcci.com"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full transition-shadow duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full transition-shadow duration-200"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-fade-in">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 h-12 text-base shadow-md hover:shadow-lg transition-transform transform active:scale-95 bg-brand-600 hover:bg-brand-700"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Autenticando...</span>
                  </div>
                ) : 'Iniciar sesión'}
              </Button>
            </form>
          </div>

          <div className="mt-8 text-center hidden">
            {/* Keeping demo notes hidden for clean presentation but functional */}
            <p className="text-xs text-slate-400">Prueba con admin / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

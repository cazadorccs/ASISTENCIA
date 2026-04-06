import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string | null;
  isActive: boolean;
  createdAt: string;
}

interface UserFormData {
  email: string;
  password?: string;
  name: string;
  role: string;
  department: string;
}

const ROLES = ['admin', 'gerencia', 'manager', 'rrhh', 'administracion', 'seguridad', 'auditoria', 'empleado'];
const DEPARTMENTS = ['Gerencia', 'RRHH', 'Administración', 'Auditoría', 'Seguridad', 'TI', 'Contabilidad', 'Legal', 'Mercadeo'];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    name: '',
    role: 'empleado',
    department: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.data || []);
    } catch (err) {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department || '',
      });
    } else {
      setEditingUser(null);
      setFormData({ email: '', password: '', name: '', role: 'empleado', department: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar usuario');
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al eliminar');
      fetchUsers();
    } catch (err) {
      setError('Error al eliminar usuario');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
      fetchUsers();
    } catch (err) {
      setError('Error al cambiar estado');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Gestión de Usuarios</h2>
          <p className="text-sm text-slate-500">Administra los usuarios del sistema</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          + Nuevo Usuario
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Departamento</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Cargando...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No hay usuarios</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 capitalize">{user.role}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.department || '-'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenModal(user)}
                      className="text-brand-600 hover:text-brand-800 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          {!editingUser && (
            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {ROLES.map((role) => (
                <option key={role} value={role} className="capitalize">{role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Seleccionar...</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

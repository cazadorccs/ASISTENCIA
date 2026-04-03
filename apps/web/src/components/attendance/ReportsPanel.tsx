import { useMemo, useState } from 'react';
import type { AttendanceLog, AccessArea } from '../../types/types';
import { clsx } from 'clsx';
import { FloorReport } from './FloorReport';

type UserRole = 'admin' | 'seguridad' | 'rrhh' | 'administracion' | 'auditoria' | 'empleado';

interface ReportsPanelProps {
  logs: AttendanceLog[];
  userRole: UserRole;
}

type ReportType = 'department' | 'hourly' | 'no-exit' | 'access-points' | 'daily' | 'floor' | 'payroll' | 'dining' | 'audit' | 'visitors' | null;

const ROLE_REPORTS: Record<UserRole, ReportType[]> = {
  admin: ['department', 'hourly', 'no-exit', 'access-points', 'daily', 'floor', 'payroll', 'dining', 'audit', 'visitors'],
  seguridad: ['visitors', 'floor', 'access-points', 'hourly'],
  rrhh: ['payroll', 'daily', 'department', 'floor'],
  administracion: ['dining', 'daily', 'floor'],
  auditoria: ['audit', 'no-exit', 'access-points', 'floor', 'hourly'],
  empleado: [],
};

export function ReportsPanel({ logs, userRole }: ReportsPanelProps) {
  const [activeReport, setActiveReport] = useState<ReportType>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  const availableReports = ROLE_REPORTS[userRole] || [];

  const uniqueDepartments = useMemo(() => {
    const depts = new Set<string>();
    logs.forEach(log => {
      if (log.department) depts.add(log.department);
    });
    return Array.from(depts).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = searchTerm === '' || 
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchDept = filterDepartment === '' || log.department === filterDepartment;
      
      return matchSearch && matchDept;
    });
  }, [logs, searchTerm, filterDepartment]);

  if (availableReports.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
        Reportes
      </h2>
      
      <div className="flex gap-2 mb-4 flex-wrap">
        {availableReports.includes('department') && (
          <button
            onClick={() => setActiveReport(activeReport === 'department' ? null : 'department')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              activeReport === 'department'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Por Departamento
          </button>
        )}
        {availableReports.includes('hourly') && (
          <button
            onClick={() => setActiveReport(activeReport === 'hourly' ? null : 'hourly')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              activeReport === 'hourly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Distribución Horaria
          </button>
        )}
        {availableReports.includes('no-exit') && (
          <button
            onClick={() => setActiveReport(activeReport === 'no-exit' ? null : 'no-exit')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              activeReport === 'no-exit'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Entradas sin Salida
          </button>
        )}
        {availableReports.includes('access-points') && (
          <button
            onClick={() => setActiveReport(activeReport === 'access-points' ? null : 'access-points')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              activeReport === 'access-points'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Puntos de Acceso
          </button>
        )}
        {availableReports.includes('daily') && (
          <button
            onClick={() => setActiveReport(activeReport === 'daily' ? null : 'daily')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              activeReport === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Resumen Diario
          </button>
        )}
        {availableReports.includes('floor') && (
          <button
            onClick={() => setActiveReport(activeReport === 'floor' ? null : 'floor')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              activeReport === 'floor'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Por Piso
          </button>
        )}
        {availableReports.includes('payroll') && (
          <button
            onClick={() => setActiveReport(activeReport === 'payroll' ? null : 'payroll')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              activeReport === 'payroll' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Pre-Nómina (RRHH)
          </button>
        )}
        {availableReports.includes('dining') && (
          <button
            onClick={() => setActiveReport(activeReport === 'dining' ? null : 'dining')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              activeReport === 'dining' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Plan Comer
          </button>
        )}
        {availableReports.includes('audit') && (
          <button
            onClick={() => setActiveReport(activeReport === 'audit' ? null : 'audit')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              activeReport === 'audit' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Auditoría
          </button>
        )}
        {availableReports.includes('visitors') && (
          <button
            onClick={() => setActiveReport(activeReport === 'visitors' ? null : 'visitors')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              activeReport === 'visitors' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Visitantes
          </button>
        )}
      </div>

      {activeReport && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 animate-fade-in">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Buscar Usuario</label>
            <input 
              type="text" 
              placeholder="Escribe el nombre o ID..." 
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Filtrar por Departamento</label>
            <div className="relative">
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white appearance-none pr-10"
                value={filterDepartment}
                onChange={e => setFilterDepartment(e.target.value)}
              >
                <option value="">Todos los departamentos</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'floor' && <FloorReport logs={filteredLogs} />}
      {activeReport === 'department' && <DepartmentReport logs={filteredLogs} />}
      {activeReport === 'hourly' && <HourlyReport logs={filteredLogs} />}
      {activeReport === 'no-exit' && <NoExitReport logs={filteredLogs} />}
      {activeReport === 'access-points' && <AccessPointsReport logs={filteredLogs} />}
      {activeReport === 'daily' && <DailyReport logs={filteredLogs} />}
      {activeReport === 'payroll' && <PrePayrollReport logs={filteredLogs} />}
      {activeReport === 'dining' && <DiningHallReport logs={filteredLogs} />}
      {activeReport === 'audit' && <AuditReport logs={filteredLogs} />}
      {activeReport === 'visitors' && <VisitorsReport logs={filteredLogs} />}
    </div>
  );
}

function DepartmentReport({ logs }: { logs: AttendanceLog[] }) {
  const departmentStats = useMemo(() => {
    const stats: Record<string, { entrada: number; salida: number; uniqueUsers: Set<string> }> = {};
    
    logs.forEach(log => {
      const dept = log.department || 'Sin departamento';
      if (!stats[dept]) {
        stats[dept] = { entrada: 0, salida: 0, uniqueUsers: new Set() };
      }
      if (log.type === 'entrada') {
        stats[dept].entrada++;
      } else {
        stats[dept].salida++;
      }
      stats[dept].uniqueUsers.add(log.userId);
    });
    
    return Object.entries(stats).map(([dept, data]) => ({
      department: dept,
      entrada: data.entrada,
      salida: data.salida,
      total: data.entrada + data.salida,
      uniqueUsers: data.uniqueUsers.size,
    })).sort((a, b) => b.total - a.total);
  }, [logs]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Entradas</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Salidas</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Usuarios Únicos</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {departmentStats.map((stat) => (
            <tr key={stat.department} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{stat.department}</td>
              <td className="px-4 py-3 text-sm text-green-600 text-right">{stat.entrada}</td>
              <td className="px-4 py-3 text-sm text-red-600 text-right">{stat.salida}</td>
              <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{stat.total}</td>
              <td className="px-4 py-3 text-sm text-gray-600 text-right">{stat.uniqueUsers}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HourlyReport({ logs }: { logs: AttendanceLog[] }) {
  const hourlyStats = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const stats: Record<number, { entrada: number; salida: number }> = {};
    
    hours.forEach(h => {
      stats[h] = { entrada: 0, salida: 0 };
    });
    
    logs.forEach(log => {
      const hour = log.timestamp.getHours();
      if (log.type === 'entrada') {
        stats[hour].entrada++;
      } else {
        stats[hour].salida++;
      }
    });
    
    return hours.map(hour => ({
      hour,
      label: `${hour.toString().padStart(2, '0')}:00`,
      entrada: stats[hour].entrada,
      salida: stats[hour].salida,
      total: stats[hour].entrada + stats[hour].salida,
    }));
  }, [logs]);

  const maxTotal = Math.max(...hourlyStats.map(h => h.total), 1);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-24 gap-1">
        {hourlyStats.map(({ hour, label, entrada, salida, total }) => (
          <div key={hour} className="flex flex-col items-center">
            <div 
              className="w-full bg-blue-500 rounded-t"
              style={{ height: `${(total / maxTotal) * 100}px`, minHeight: total > 0 ? '4px' : '0' }}
              title={`${label}: ${entrada} ent, ${salida} sal`}
            />
            <span className="text-[10px] text-gray-500 mt-1">{hour % 6 === 0 ? label : ''}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 justify-center text-sm">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-500 rounded"></span> Entradas
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-500 rounded"></span> Salidas
        </span>
      </div>
    </div>
  );
}

function NoExitReport({ logs }: { logs: AttendanceLog[] }) {
  const noExitUsers = useMemo(() => {
    const byUserDate = new Map<string, { userId: string; userName: string; department: string; date: string; entry: Date; area: AccessArea }>();
    
    logs.forEach(log => {
      const dateKey = log.timestamp.toISOString().split('T')[0];
      const userKey = `${log.userId}_${dateKey}`;
      
      if (log.type === 'entrada') {
        byUserDate.set(userKey, {
          userId: log.userId,
          userName: log.userName,
          department: log.department || '',
          date: dateKey,
          entry: log.timestamp,
          area: log.area as AccessArea,
        });
      } else if (log.type === 'salida') {
        byUserDate.delete(userKey);
      }
    });
    
    return Array.from(byUserDate.values());
  }, [logs]);

  if (noExitUsers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay registros de entrada sin salida
      </div>
    );
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-VE', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-12">#</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hora Entrada</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {noExitUsers.map((user, index) => (
            <tr key={`${user.userId}_${user.date}`} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-500 font-medium">
                {index + 1}
              </td>
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                <div className="text-xs text-gray-500">ID: {user.userId}</div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{user.department}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {new Date(user.date).toLocaleDateString('es-VE')}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ↑ {formatDateTime(user.entry)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccessPointsReport({ logs }: { logs: AttendanceLog[] }) {
  const accessStats = useMemo(() => {
    const stats: Record<string, { entrada: number; salida: number; area: AccessArea }> = {};
    
    logs.forEach(log => {
      const point = log.accessPoint;
      if (!stats[point]) {
        stats[point] = { entrada: 0, salida: 0, area: log.area as AccessArea };
      }
      if (log.type === 'entrada') {
        stats[point].entrada++;
      } else {
        stats[point].salida++;
      }
    });
    
    return Object.entries(stats).map(([point, data]) => ({
      point: point.split('_')[0] || point,
      fullPoint: point,
      entrada: data.entrada,
      salida: data.salida,
      total: data.entrada + data.salida,
      area: data.area,
    })).sort((a, b) => b.total - a.total);
  }, [logs]);

  const maxTotal = Math.max(...accessStats.map(s => s.total), 1);
  const totalEntradas = accessStats.reduce((sum, stat) => sum + stat.entrada, 0);
  const totalSalidas = accessStats.reduce((sum, stat) => sum + stat.salida, 0);

  return (
    <div className="space-y-3">
      {accessStats.map((stat) => (
        <div key={stat.fullPoint} className="flex items-center gap-3">
          <div className="w-32 text-sm font-medium text-gray-900 truncate" title={stat.fullPoint}>
            {stat.point}
          </div>
          <div className="flex-1">
            <div className="h-6 bg-gray-100 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${(stat.total / maxTotal) * 100}%` }}
              />
            </div>
          </div>
          <div className="w-24 text-right text-sm">
            <span className="text-green-600">{stat.entrada}</span>
            {' / '}
            <span className="text-red-600">{stat.salida}</span>
          </div>
        </div>
      ))}
      {/* Fila de Totalizador */}
      <div className="pt-3 mt-3 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-32 text-sm font-bold text-gray-900">
            Total General
          </div>
          <div className="flex-1 text-right text-xs text-gray-500 pr-2">
            Sumatoria de puntos
          </div>
          <div className="w-24 text-right text-sm font-bold">
            <span className="text-green-600">{totalEntradas}</span>
            {' / '}
            <span className="text-red-600">{totalSalidas}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DailyReport({ logs }: { logs: AttendanceLog[] }) {
  const dailyStats = useMemo(() => {
    const stats: Record<string, { entrada: number; salida: number; uniqueUsers: Set<string> }> = {};
    
    logs.forEach(log => {
      const dateKey = log.timestamp.toISOString().split('T')[0];
      if (!stats[dateKey]) {
        stats[dateKey] = { entrada: 0, salida: 0, uniqueUsers: new Set() };
      }
      if (log.type === 'entrada') {
        stats[dateKey].entrada++;
      } else {
        stats[dateKey].salida++;
      }
      stats[dateKey].uniqueUsers.add(log.userId);
    });
    
    return Object.entries(stats).map(([date, data]) => ({
      date,
      entrada: data.entrada,
      salida: data.salida,
      sinSalida: Math.max(0, data.entrada - data.salida),
      uniqueUsers: data.uniqueUsers.size,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [logs]);

  const maxTotal = Math.max(...dailyStats.map(d => d.entrada), 1);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Entradas</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Salidas</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Sin Salida</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Usuarios Únicos</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Flujo (Entradas)</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dailyStats.map((stat) => (
            <tr key={stat.date} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {new Date(stat.date).toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric', month: 'short' })}
              </td>
              <td className="px-4 py-3 text-sm text-green-600 text-right">{stat.entrada}</td>
              <td className="px-4 py-3 text-sm text-red-600 text-right">{stat.salida}</td>
              <td className="px-4 py-3 text-sm text-orange-600 text-right font-bold">{stat.sinSalida}</td>
              <td className="px-4 py-3 text-sm text-gray-600 text-right">{stat.uniqueUsers}</td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden w-32">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${(stat.entrada / maxTotal) * 100}%` }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PrePayrollReport({ logs }: { logs: AttendanceLog[] }) {
  const payrollData = useMemo(() => {
    const byUserDate = new Map<string, any>();
    logs.forEach(log => {
      const dateKey = log.timestamp.toISOString().split('T')[0];
      const userKey = `${log.userId}_${dateKey}`;
      let data = byUserDate.get(userKey);
      if (!data) {
        data = { userId: log.userId, userName: log.userName, date: dateKey, firstEntry: null, lastExit: null, isLate: false };
        byUserDate.set(userKey, data);
      }
      if (log.type === 'entrada') {
        if (!data.firstEntry || log.timestamp < data.firstEntry) {
          data.firstEntry = log.timestamp;
          const h = log.timestamp.getHours();
          const m = log.timestamp.getMinutes();
          if (h > 8 || (h === 8 && m > 30)) data.isLate = true;
        }
      } else {
        if (!data.lastExit || log.timestamp > data.lastExit) data.lastExit = log.timestamp;
      }
    });
    return Array.from(byUserDate.values()).map(d => {
      let hours = 0;
      if (d.firstEntry && d.lastExit) {
        hours = (d.lastExit.getTime() - d.firstEntry.getTime()) / (1000 * 60 * 60);
      }
      return { ...d, hours };
    }).sort((a,b) => b.date.localeCompare(a.date));
  }, [logs]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Llegada</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Salida</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Horas Netas</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Estatus</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payrollData.map((data: any) => (
            <tr key={`${data.userId}_${data.date}`} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-gray-900">{data.userName}</div>
                <div className="text-xs text-gray-500">ID: {data.userId}</div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{new Date(data.date).toLocaleDateString('es-VE')}</td>
              <td className="px-4 py-3 text-sm text-gray-600 text-right">{data.firstEntry ? new Intl.DateTimeFormat('es-VE', {timeStyle: 'short'}).format(data.firstEntry) : '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-600 text-right">{data.lastExit ? new Intl.DateTimeFormat('es-VE', {timeStyle: 'short'}).format(data.lastExit) : '-'}</td>
              <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{data.hours ? data.hours.toFixed(2) + ' h' : '-'}</td>
              <td className="px-4 py-3 text-center">
                {data.isLate ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Llegada Tardía</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">A tiempo</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DiningHallReport({ logs }: { logs: AttendanceLog[] }) {
  const diners = useMemo(() => {
    const byUserDate = new Map<string, any>();
    logs.forEach(log => {
      if (log.type === 'entrada') {
        const h = log.timestamp.getHours();
        if (h >= 6 && h < 11) {
          const dateKey = log.timestamp.toISOString().split('T')[0];
          const userKey = `${log.userId}_${dateKey}`;
          if (!byUserDate.has(userKey)) {
            byUserDate.set(userKey, { userId: log.userId, userName: log.userName, department: log.department, date: dateKey, entry: log.timestamp });
          }
        }
      }
    });
    return Array.from(byUserDate.values());
  }, [logs]);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between">
        <div>
          <h3 className="text-blue-900 font-bold text-lg">Proyección de Comensales (6:00 AM - 11:00 AM)</h3>
          <p className="text-sm text-blue-700">Personal contabilizado como posibles usuarios del servicio de comedor hoy.</p>
        </div>
        <div className="text-3xl font-black text-blue-600">{diners.length}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hora Ingreso</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {diners.map((user: any) => (
              <tr key={`${user.userId}_${user.date}`} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                  <div className="text-xs text-gray-500">ID: {user.userId}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.department}</td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">{new Intl.DateTimeFormat('es-VE', {timeStyle: 'short'}).format(user.entry)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditReport({ logs }: { logs: AttendanceLog[] }) {
  const anomalies = useMemo(() => {
    const list: any[] = [];
    const byUserDate = new Map<string, any>();
    logs.forEach(log => {
      const dateKey = log.timestamp.toISOString().split('T')[0];
      const userKey = `${log.userId}_${dateKey}`;
      let data = byUserDate.get(userKey);
      if (!data) {
        data = { userId: log.userId, userName: log.userName, date: dateKey, firstEntry: null, lastExit: null, entries: 0, exits: 0 };
        byUserDate.set(userKey, data);
      }
      if (log.type === 'entrada') {
        data.entries++;
        if (!data.firstEntry || log.timestamp < data.firstEntry) data.firstEntry = log.timestamp;
      } else {
        data.exits++;
        if (!data.lastExit || log.timestamp > data.lastExit) data.lastExit = log.timestamp;
      }
    });
    
    byUserDate.forEach(data => {
      let hours = 0;
      if (data.firstEntry && data.lastExit) {
        hours = (data.lastExit.getTime() - data.firstEntry.getTime()) / (1000 * 60 * 60);
      } else if (data.firstEntry && !data.lastExit) {
        hours = (new Date().getTime() - data.firstEntry.getTime()) / (1000 * 60 * 60);
      }
      
      if (hours > 14) list.push({ ...data, type: 'Jornada Excesiva', desc: `> 14h (${hours.toFixed(1)}h)` });
      if (data.entries > 2 && data.exits === 0) list.push({ ...data, type: 'Omisión de Salida', desc: `${data.entries} entradas, 0 salidas` });
    });
    return list;
  }, [logs]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuario / Fecha</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Anomalía</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Detalle</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {anomalies.map((a: any, i) => (
            <tr key={i} className="hover:bg-red-50/50">
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-gray-900">{a.userName}</div>
                <div className="text-xs text-gray-500">Fecha: {a.date}</div>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-800">{a.type}</span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 font-medium">{a.desc}</td>
            </tr>
          ))}
          {anomalies.length === 0 && <tr><td colSpan={3} className="text-center py-6 text-gray-500">No se detectaron anomalías</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function VisitorsReport({ logs }: { logs: AttendanceLog[] }) {
  const visitors = useMemo(() => {
    return logs.filter(l => l.department && l.department.toLowerCase().includes('visita'));
  }, [logs]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Visitante</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hora / Área</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {visitors.map((v: any, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-gray-900">{v.userName}</div>
                <div className="text-xs text-gray-500">ID: {v.userId}</div>
              </td>
              <td className="px-4 py-3">
                <span className={clsx("inline-flex items-center px-2 py-1 rounded-full text-xs font-medium", v.type === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                  {v.type === 'entrada' ? '↑ Ingreso' : '↓ Salida'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                <div>{new Intl.DateTimeFormat('es-VE', {dateStyle:'short', timeStyle: 'short'}).format(v.timestamp)}</div>
                <div className="text-xs text-gray-400 capitalize">{v.area.replace('_', ' ')}</div>
              </td>
            </tr>
          ))}
          {visitors.length === 0 && <tr><td colSpan={3} className="text-center py-6 text-gray-500">No hay flujo de visitantes registrados</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

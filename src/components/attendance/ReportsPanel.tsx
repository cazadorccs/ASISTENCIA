import { useMemo, useState } from 'react';
import type { AttendanceLog, AccessArea } from '../../types/types';
import { clsx } from 'clsx';
import { FloorReport } from './FloorReport';

type UserRole = 'admin' | 'gerente' | 'supervisor' | 'empleado';

interface ReportsPanelProps {
  logs: AttendanceLog[];
  userRole: UserRole;
}

type ReportType = 'department' | 'hourly' | 'no-exit' | 'access-points' | 'daily' | 'floor' | null;

const ROLE_REPORTS: Record<UserRole, ReportType[]> = {
  admin: ['department', 'hourly', 'no-exit', 'access-points', 'daily', 'floor'],
  gerente: ['department', 'hourly', 'access-points', 'daily', 'floor'],
  supervisor: ['department', 'hourly', 'access-points', 'daily', 'floor'],
  empleado: [],
};

export function ReportsPanel({ logs, userRole }: ReportsPanelProps) {
  const [activeReport, setActiveReport] = useState<ReportType>(null);

  const availableReports = ROLE_REPORTS[userRole] || [];

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
      </div>

      {activeReport === 'floor' && <FloorReport logs={logs} />}
      {activeReport === 'department' && <DepartmentReport logs={logs} />}
      {activeReport === 'hourly' && <HourlyReport logs={logs} />}
      {activeReport === 'no-exit' && <NoExitReport logs={logs} />}
      {activeReport === 'access-points' && <AccessPointsReport logs={logs} />}
      {activeReport === 'daily' && <DailyReport logs={logs} />}
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
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hora Entrada</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {noExitUsers.map((user) => (
            <tr key={`${user.userId}_${user.date}`} className="hover:bg-gray-50">
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
      total: data.entrada + data.salida,
      uniqueUsers: data.uniqueUsers.size,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [logs]);

  const maxTotal = Math.max(...dailyStats.map(d => d.total), 1);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Entradas</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Salidas</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Usuarios Únicos</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gráfico</th>
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
              <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{stat.total}</td>
              <td className="px-4 py-3 text-sm text-gray-600 text-right">{stat.uniqueUsers}</td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden w-32">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${(stat.total / maxTotal) * 100}%` }}
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

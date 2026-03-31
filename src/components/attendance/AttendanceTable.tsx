import { useState, useMemo } from 'react';
import type { AttendanceLog, AccessArea } from '../../types/types';
import { clsx } from 'clsx';

interface AttendanceTableProps {
  logs: AttendanceLog[];
  pageSize?: number;
}

const AREA_LABELS: Record<AccessArea, string> = {
  recepcion_principal: 'Recepción Principal',
  estacionamiento: 'Estacionamiento',
  proveedores: 'Proveedores',
};

interface GroupedLog {
  userId: string;
  userName: string;
  department: string;
  date: string;
  firstEntry: Date | null;
  lastExit: Date | null;
  totalEntries: number;
  totalExits: number;
  areas: Set<AccessArea>;
}

export function AttendanceTable({ logs, pageSize = 20 }: AttendanceTableProps) {
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<keyof AttendanceLog>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'individual' | 'grouped'>('individual');

  const groupedLogs = useMemo((): GroupedLog[] => {
    const grouped = new Map<string, GroupedLog>();
    
    logs.forEach(log => {
      const dateKey = log.timestamp.toISOString().split('T')[0];
      const groupKey = `${log.userId}_${dateKey}`;
      
      const existing = grouped.get(groupKey);
      if (!existing) {
        grouped.set(groupKey, {
          userId: log.userId,
          userName: log.userName,
          department: log.department,
          date: dateKey,
          firstEntry: log.type === 'entrada' ? log.timestamp : null,
          lastExit: log.type === 'salida' ? log.timestamp : null,
          totalEntries: log.type === 'entrada' ? 1 : 0,
          totalExits: log.type === 'salida' ? 1 : 0,
          areas: new Set([log.area]),
        });
      } else {
        if (log.type === 'entrada' && (!existing.firstEntry || log.timestamp < existing.firstEntry)) {
          existing.firstEntry = log.timestamp;
        }
        if (log.type === 'salida' && (!existing.lastExit || log.timestamp > existing.lastExit)) {
          existing.lastExit = log.timestamp;
        }
        if (log.type === 'entrada') existing.totalEntries++;
        if (log.type === 'salida') existing.totalExits++;
        existing.areas.add(log.area);
      }
    });
    
    return Array.from(grouped.values()).sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      const aTime = a.firstEntry || a.lastExit;
      const bTime = b.firstEntry || b.lastExit;
      if (!aTime || !bTime) return 0;
      return bTime.getTime() - aTime.getTime();
    });
  }, [logs]);

  const sortedGrouped = useMemo(() => {
    return [...groupedLogs].sort((a, b) => {
      const aVal = a.firstEntry || a.lastExit;
      const bVal = b.firstEntry || b.lastExit;
      if (!aVal || !bVal) return 0;
      return sortDir === 'asc' 
        ? aVal.getTime() - bVal.getTime()
        : bVal.getTime() - aVal.getTime();
    });
  }, [groupedLogs, sortDir]);

  const paginatedGrouped = useMemo(() => {
    const start = page * pageSize;
    return sortedGrouped.slice(start, start + pageSize);
  }, [sortedGrouped, page, pageSize]);

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDir === 'asc' 
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }
      
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDir === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [logs, sortField, sortDir]);

  const paginatedLogs = useMemo(() => {
    const start = page * pageSize;
    return sortedLogs.slice(start, start + pageSize);
  }, [sortedLogs, page, pageSize]);

  const handleSort = (field: keyof AttendanceLog) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-VE', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };

  const SortIcon = ({ field }: { field: keyof AttendanceLog }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDir === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="mt-4 text-gray-500">No hay registros para mostrar</p>
        <p className="text-sm text-gray-400">Sube un archivo CSV para comenzar</p>
      </div>
    );
  }

  const totalPages = viewMode === 'individual' 
    ? Math.ceil(logs.length / pageSize) 
    : Math.ceil(groupedLogs.length / pageSize);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => { setViewMode('individual'); setPage(0); }}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              viewMode === 'individual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Registros Individuales
          </button>
          <button
            onClick={() => { setViewMode('grouped'); setPage(0); }}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              viewMode === 'grouped'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Vista por Usuario
          </button>
        </div>
        {viewMode === 'grouped' && (
          <span className="text-sm text-gray-500">
            {groupedLogs.length} usuario{groupedLogs.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        {viewMode === 'individual' ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: 'userName' as const, label: 'Nombre' },
                  { key: 'department' as const, label: 'Departamento' },
                  { key: 'area' as const, label: 'Área' },
                  { key: 'type' as const, label: 'Tipo' },
                  { key: 'timestamp' as const, label: 'Fecha/Hora' },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    {label}
                    <SortIcon field={key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                    <div className="text-xs text-gray-500">ID: {log.userId}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {log.department}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={clsx(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      log.area === 'recepcion_principal' && 'bg-blue-100 text-blue-800',
                      log.area === 'estacionamiento' && 'bg-purple-100 text-purple-800',
                      log.area === 'proveedores' && 'bg-orange-100 text-orange-800'
                    )}>
                      {AREA_LABELS[log.area]}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={clsx(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      log.type === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}>
                      {log.type === 'entrada' ? '↑ Entrada' : '↓ Salida'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {formatDateTime(log.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Primera Entrada
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Salida
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registros
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Áreas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedGrouped.map((user) => (
                <tr key={`${user.userId}_${user.date}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {new Date(user.date).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                    <div className="text-xs text-gray-500">ID: {user.userId}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {user.department}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.firstEntry ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ↑ {formatDateTime(user.firstEntry)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.lastExit ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ↓ {formatDateTime(user.lastExit)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <span className="text-green-600 text-sm font-medium">{user.totalEntries} ent</span>
                      <span className="text-red-600 text-sm font-medium">{user.totalExits} sal</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {Array.from(user.areas).map(area => (
                        <span key={area} className={clsx(
                          'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
                          area === 'recepcion_principal' && 'bg-blue-100 text-blue-800',
                          area === 'estacionamiento' && 'bg-purple-100 text-purple-800',
                          area === 'proveedores' && 'bg-orange-100 text-orange-800'
                        )}>
                          {AREA_LABELS[area]}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-t-0 border-gray-200 rounded-b-lg">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-medium">{page * pageSize + 1}</span> a{' '}
            <span className="font-medium">{Math.min((page + 1) * pageSize, viewMode === 'individual' ? logs.length : groupedLogs.length)}</span> de{' '}
            <span className="font-medium">{viewMode === 'individual' ? logs.length : groupedLogs.length}</span> {viewMode === 'individual' ? 'registros' : 'usuarios'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

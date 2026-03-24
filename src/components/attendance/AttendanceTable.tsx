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

export function AttendanceTable({ logs, pageSize = 20 }: AttendanceTableProps) {
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<keyof AttendanceLog>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

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

  const totalPages = Math.ceil(logs.length / pageSize);

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

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
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
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-t-0 border-gray-200 rounded-b-lg">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-medium">{page * pageSize + 1}</span> a{' '}
            <span className="font-medium">{Math.min((page + 1) * pageSize, logs.length)}</span> de{' '}
            <span className="font-medium">{logs.length}</span> registros
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

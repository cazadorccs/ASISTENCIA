import { clsx } from 'clsx';
import type { CorteType } from '../../util/scheduler';
import { getCorteDisplayName } from '../../util/scheduler';

interface CorteStatusProps {
  currentCorte: CorteType | null;
  nextCorte: Date;
  timeRemaining: string;
}

export function CorteStatus({ currentCorte, nextCorte, timeRemaining }: CorteStatusProps) {
  const formatNextCorte = (date: Date) => {
    return new Intl.DateTimeFormat('es-VE', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        <div className={clsx(
          'w-3 h-3 rounded-full animate-pulse',
          currentCorte ? 'bg-green-500' : 'bg-yellow-500'
        )} />
        <span className="text-sm font-medium text-gray-700">
          Estado:
        </span>
        <span className={clsx(
          'px-2 py-1 rounded text-xs font-medium',
          currentCorte 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        )}>
          {currentCorte ? getCorteDisplayName(currentCorte) : 'Sin corte activo'}
        </span>
      </div>

      <div className="hidden sm:block w-px h-6 bg-gray-300" />

      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm text-gray-600">
          Próximo corte: <span className="font-medium">{formatNextCorte(nextCorte)}</span>
        </span>
      </div>

      <div className="hidden sm:block w-px h-6 bg-gray-300" />

      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm text-gray-600">
          Tiempo restante: <span className="font-medium text-blue-600">{timeRemaining}</span>
        </span>
      </div>
    </div>
  );
}

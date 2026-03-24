import { clsx } from 'clsx';
import type { AccessArea } from '../../types/types';

interface AccessPointSelectorProps {
  selectedArea: AccessArea | null;
  onSelect: (area: AccessArea | null) => void;
  stats: Record<AccessArea, { entrada: number; salida: number }>;
}

const AREA_LABELS: Record<AccessArea, string> = {
  recepcion_principal: 'Recepción Principal',
  estacionamiento: 'Estacionamiento',
  proveedores: 'Proveedores',
};

const AREA_ICONS: Record<AccessArea, string> = {
  recepcion_principal: 'M9 3v2m6-2v2M9 3v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
  estacionamiento: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  proveedores: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
};

export function AccessPointSelector({ selectedArea, onSelect, stats }: AccessPointSelectorProps) {
  const areas: (AccessArea | null)[] = [null, 'recepcion_principal', 'estacionamiento', 'proveedores'];

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Filtrar por Área
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {areas.map((area) => {
          const isSelected = selectedArea === area;
          const areaKey = area as AccessArea;
          
          return (
            <button
              key={area ?? 'all'}
              onClick={() => onSelect(area)}
              className={clsx(
                'relative p-4 rounded-lg border-2 transition-all duration-200 text-left',
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={clsx(
                    'font-medium text-sm',
                    isSelected ? 'text-blue-700' : 'text-gray-900'
                  )}>
                    {area ? AREA_LABELS[area] : 'Todas las Áreas'}
                  </p>
                  {area && (
                    <div className="mt-2 flex gap-3 text-xs">
                      <span className="text-green-600">
                        ↑ {stats[areaKey].entrada}
                      </span>
                      <span className="text-red-600">
                        ↓ {stats[areaKey].salida}
                      </span>
                    </div>
                  )}
                </div>
                {area && (
                  <svg
                    className={clsx(
                      'w-5 h-5',
                      isSelected ? 'text-blue-500' : 'text-gray-400'
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={AREA_ICONS[areaKey]}
                    />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

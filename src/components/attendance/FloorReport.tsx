import { useMemo, useState } from 'react';
import type { AttendanceLog } from '../../types/types';

const FLOOR_MAPPING: Record<string, string> = {
  'despacho': 'Piso 14',
  'analisis del entorno': 'Piso 13',
  'estrategias': 'Piso 13',
  'analicis del entorno': 'Piso 13',
  'viceministerio de gestion comunicacional': 'Piso 12',
  'comunicacion de gobierno': 'Piso 12',
  'oficina de informacion regional': 'Piso 12',
  'articulacion con medios': 'Piso 12',
  'viceministerio de estrategia': 'Piso 12',
  'agencia venezolana de publicidad': 'Piso 11',
  'avp': 'Piso 11',
  'tecnologia': 'Piso 10',
  'administracion': 'Piso 8',
  'presupuesto': 'Piso 8',
  'contabilidad': 'Piso 8',
  'tesoreria': 'Piso 8',
  'compras': 'Piso 8',
  'bienes nacionales': 'Piso 8',
  'archivo administracion': 'Piso 7',
  'archivo rrhh': 'Piso 7',
  'produccion nacional independiente': 'Piso 6',
  'auditoria': 'Piso 6',
  'medios internacionales': 'Piso 6',
  'rrhh': 'Piso 5',
  'consultoria juridica': 'Piso 5',
  'planificacion': 'Piso 5',
  'medios alternativos comunitarios': 'Piso 4',
  'fundacion premio nacional de periodismo': 'Piso 4',
  'medios digitales': 'Piso 3',
  'pagina web': 'Piso 3',
  'guerrilla comunicacional': 'Piso 3',
  'servicios generales': 'Piso 2',
  'vicemisterio de transmision': 'Piso 2',
  'comedor': 'Piso 1',
  'secretaria': 'Mezzanina',
  'seguridad': 'Planta Baja',
  'protocolo': 'Planta Baja',
  'correspondencia': 'Planta Baja',
  'atencion al cdno': 'Planta Baja',
  'servicio medico': 'Planta Baja',
  'gimnasio': 'Sotano 1',
};

const FLOOR_COLORS = [
  '#6366f1', // Piso 14 - Indigo
  '#8b5cf6', // Piso 13 - Violet
  '#a855f7', // Piso 12 - Purple
  '#d946ef', // Piso 11 - Fuchsia
  '#ec4899', // Piso 10 - Pink
  '#f43f5e', // Piso 9 - Rose
  '#f97316', // Piso 8 - Orange
  '#eab308', // Piso 7 - Yellow
  '#84cc16', // Piso 6 - Lime
  '#22c55e', // Piso 5 - Green
  '#14b8a6', // Piso 4 - Teal
  '#06b6d4', // Piso 3 - Cyan
  '#0ea5e9', // Piso 2 - Sky
  '#3b82f6', // Piso 1 - Blue
  '#64748b', // Mezzanina - Slate
  '#e11d48', // Planta Baja - Rose (destacado)
  '#78716c', // Sotano 1 - Stone
  '#57534e', // Sotano 2 - Stone darker
];

const FLOOR_ORDER = [
  'Piso 14', 'Piso 13', 'Piso 12', 'Piso 11', 'Piso 10', 
  'Piso 9', 'Piso 8', 'Piso 7', 'Piso 6', 'Piso 5',
  'Piso 4', 'Piso 3', 'Piso 2', 'Piso 1', 'Mezzanina', 
  'Planta Baja', 'Sotano 1', 'Sotano 2'
];

function getFloorByDepartment(department: string | undefined): string {
  if (!department) return 'Planta Baja';
  const deptLower = department.toLowerCase().replace('mippci/', '').trim();
  
  for (const [key, floor] of Object.entries(FLOOR_MAPPING)) {
    if (deptLower.includes(key) || key.includes(deptLower)) {
      return floor;
    }
  }
  return 'Planta Baja';
}

function getFloorByAccessPoint(accessPoint: string | undefined): string {
  if (!accessPoint) return 'Planta Baja';
  const apLower = accessPoint.toLowerCase();
  if (apLower.includes('sotano')) return 'Sotano 1';
  if (apLower.includes('planta baja')) return 'Planta Baja';
  return 'Planta Baja';
}

interface FloorReportProps {
  logs: AttendanceLog[];
}

interface PersonData {
  name: string;
  department: string;
  entryTime: string | null;
  exitTime: string | null;
  status: 'dentro' | 'fuera';
  lastEntry: Date | null;
  lastExit: Date | null;
}

export function FloorReport({ logs }: FloorReportProps) {
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { floorStats, dates } = useMemo(() => {
    const floorPeopleMap = new Map<string, Map<string, PersonData>>();
    const dateSet = new Set<string>();
    
    logs.forEach(log => {
      const dateKey = log.timestamp.toISOString().split('T')[0];
      dateSet.add(dateKey);
      
      const floor = getFloorByDepartment(log.department) || getFloorByAccessPoint(log.accessPoint);
      
      if (!floorPeopleMap.has(floor)) {
        floorPeopleMap.set(floor, new Map());
      }
      
      const floorPeople = floorPeopleMap.get(floor)!;
      const userId = log.userId;
      
      if (!floorPeople.has(userId)) {
        floorPeople.set(userId, {
          name: log.userName,
          department: log.department || 'mippci',
          entryTime: null,
          exitTime: null,
          status: 'fuera',
          lastEntry: null,
          lastExit: null,
        });
      }
      
      const person = floorPeople.get(userId)!;
      
      if (log.type === 'entrada') {
        person.entryTime = log.timestamp.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
        person.lastEntry = log.timestamp;
        person.status = 'dentro';
      } else {
        person.exitTime = log.timestamp.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
        person.lastExit = log.timestamp;
        person.status = 'fuera';
      }
    });
    
    const stats = FLOOR_ORDER.map(floor => {
      const floorPeople = floorPeopleMap.get(floor) || new Map<string, PersonData>();
      const people = Array.from(floorPeople.values())
        .sort((a, b) => a.name.localeCompare(b.name));
      
      const departments: Record<string, number> = {};
      let firstEntry: string | null = null;
      let lastEntry: string | null = null;
      
      people.forEach(p => {
        const deptKey = p.department.replace('mippci/', '') || 'General';
        departments[deptKey] = (departments[deptKey] || 0) + 1;
        
        if (p.entryTime && (!firstEntry || p.entryTime < firstEntry)) {
          firstEntry = p.entryTime;
        }
        if (p.entryTime && (!lastEntry || p.entryTime > lastEntry)) {
          lastEntry = p.entryTime;
        }
      });
      
      return {
        floor,
        count: people.length,
        inside: people.filter(p => p.status === 'dentro').length,
        outside: people.filter(p => p.status === 'fuera').length,
        people,
        departments,
        firstEntry,
        lastEntry,
      };
    });
    
    return { 
      floorStats: stats, 
      dates: Array.from(dateSet).sort() 
    };
  }, [logs]);

  const total = floorStats.reduce((sum, f) => sum + f.count, 0);
  const selectedFloorData = floorStats.find(f => f.floor === selectedFloor);
  
  const filteredPeople = selectedFloorData?.people.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const exportToCSV = () => {
    if (!selectedFloorData) return;
    
    const headers = ['#', 'Nombre', 'Departamento', 'Entrada', 'Salida', 'Estado'];
    const rows = filteredPeople.map((p, i) => [
      i + 1,
      p.name,
      p.department.replace('mippci/', ''),
      p.entryTime || '-',
      p.exitTime || '-',
      p.status === 'dentro' ? 'Dentro' : 'Fuera'
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFloorData.floor}_${dates[dates.length - 1]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxCount = Math.max(...floorStats.map(f => f.inside), 1);
  const maxFloor = floorStats.reduce((max, f) => f.inside > max.inside ? f : max, { floor: '', inside: 0 });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Edificio MIPPCI</h3>
        
        <div className="flex items-end justify-around h-64 pl-8 pt-2 pb-4 gap-1 w-full border-b border-gray-200">
          {floorStats.map(({ floor, inside }, index) => {
            const isActive = inside > 0;
            const heightPercent = maxCount > 0 ? (inside / maxCount) * 100 : 0;
            const isMaxFloor = floor === maxFloor.floor;
            const floorColor = isMaxFloor ? '#dc2626' : FLOOR_COLORS[index];
            
            return (
              <div key={floor} className="flex flex-col items-center flex-1 h-full justify-end">
                {inside > 0 && (
                  <span className="text-[8px] font-bold mb-0.5" style={{ color: floorColor }}>
                    {inside}
                  </span>
                )}
                <div 
                  className="w-full max-w-8 rounded-t transition-all duration-300"
                  style={{ 
                    height: `${isActive ? heightPercent : 0}%`,
                    backgroundColor: isActive ? floorColor : 'transparent'
                  }}
                  title={`${floor}: ${inside} personas`}
                />
                <span className="text-[7px] text-gray-500 mt-1 truncate max-w-[30px]">
                  {floor.replace('Piso ', 'P').replace('Planta Baja', 'PB').replace('Sotano ', 'S')}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-1 items-center">
          {floorStats.map(({ floor, count, inside, outside }, index) => {
            const isActive = count > 0;
            const isSelected = selectedFloor === floor;
            const isMaxFloor = floor === maxFloor.floor;
            const floorColor = isMaxFloor ? '#dc2626' : FLOOR_COLORS[index];
            
            return (
              <div key={floor} className="flex items-center gap-3 w-48">
                <button
                  onClick={() => setSelectedFloor(isActive ? (isSelected ? null : floor) : null)}
                  disabled={!isActive}
                  className={`w-20 h-10 rounded-md transition-all duration-300 flex items-center justify-center cursor-not-allowed ${isActive ? 'hover:opacity-80' : ''}`}
                  style={{
                    backgroundColor: isActive ? floorColor : '#e5e7eb',
                  }}
                >
                  <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {isActive ? count : '\u00A0'}
                  </span>
                </button>
                <div className="flex-1">
                  <span className="text-xs text-gray-700 font-medium block" title={floor}>
                    {floor}
                  </span>
                  {count > 0 ? (
                    <span className="text-[10px] text-gray-400">
                      <span className="text-green-600">●</span> {inside} dentro / <span className="text-red-500">●</span> {outside} fuera
                    </span>
                  ) : (
                    <span className="text-[10px] text-transparent">placeholder</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumen por Piso</h3>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="text-left py-1.5 px-2 text-gray-600">Piso</th>
                  <th className="text-right py-1.5 px-2 text-gray-600">Cant.</th>
                  <th className="text-right py-1.5 px-2 text-gray-600">Dentro</th>
                  <th className="text-right py-1.5 px-2 text-gray-600">%</th>
                </tr>
              </thead>
              <tbody>
                {floorStats.filter(f => f.count > 0).map(({ floor, count, inside }) => (
                  <tr key={floor} className="border-t border-gray-100">
                    <td className="py-1.5 px-2 text-gray-700">{floor}</td>
                    <td className="py-1.5 px-2 text-right font-medium text-gray-900">{count}</td>
                    <td className="py-1.5 px-2 text-right text-green-600">{inside}</td>
                    <td className="py-1.5 px-2 text-right text-gray-500">
                      {total > 0 ? ((count / total) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 text-xs font-semibold text-gray-700">
            Total: {total} personas ({floorStats.reduce((s, f) => s + f.inside, 0)} dentro)
          </div>
          {dates.length > 0 && (
            <div className="mt-1 text-xs text-gray-400">
              Fecha: {dates[0]} {dates.length > 1 ? `al ${dates[dates.length - 1]}` : ''}
            </div>
          )}
        </div>

        {selectedFloorData && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                {selectedFloorData.floor}
              </h3>
              <button
                onClick={exportToCSV}
                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
              >
                Exportar CSV
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-400 block">Primera entrada</span>
                <span className="font-medium text-gray-700">{selectedFloorData.firstEntry || '-'}</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-400 block">Última entrada</span>
                <span className="font-medium text-gray-700">{selectedFloorData.lastEntry || '-'}</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-400 block">Dentro</span>
                <span className="font-medium text-green-600">{selectedFloorData.inside}</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-400 block">Fuera</span>
                <span className="font-medium text-red-500">{selectedFloorData.outside}</span>
              </div>
            </div>

            <div className="mb-3 p-2 bg-white rounded border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Distribución por Departamento</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(selectedFloorData.departments)
                  .sort((a, b) => b[1] - a[1])
                  .map(([dept, count]) => (
                    <span key={dept} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {dept}: {count}
                    </span>
                  ))}
              </div>
            </div>

            <div className="mb-2">
              <input
                type="text"
                placeholder="Buscar por nombre o departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-600">#</th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-600">Nombre</th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-600">Entrada</th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-600">Salida</th>
                    <th className="px-2 py-1.5 text-center font-medium text-gray-600">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPeople.map((person, index) => (
                    <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-2 py-1.5 text-gray-500">{index + 1}</td>
                      <td className="px-2 py-1.5 text-gray-800">{person.name}</td>
                      <td className="px-2 py-1.5 text-gray-600">{person.entryTime || '-'}</td>
                      <td className="px-2 py-1.5 text-gray-600">{person.exitTime || '-'}</td>
                      <td className="px-2 py-1.5 text-center">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          person.status === 'dentro' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {person.status === 'dentro' ? 'Dentro' : 'Fuera'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-2 pt-2 border-t border-gray-200 text-xs font-semibold text-gray-700 flex justify-between">
              <span>Total: {filteredPeople.length} personas</span>
              {searchTerm && <span className="text-gray-400">({selectedFloorData.count} total)</span>}
            </div>
          </div>
        )}

        {!selectedFloorData && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-center py-8 text-gray-400">
              Haz clic en un piso para ver las personas
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

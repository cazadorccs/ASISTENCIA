import { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { FileUploader } from './FileUploader';
import { AccessPointSelector } from './AccessPointSelector';
import { AttendanceTable } from './AttendanceTable';
import { CorteStatus } from './CorteStatus';
import { Button } from '../ui/Button';
import type { AccessArea } from '../../types/types';
import { clsx } from 'clsx';

const AREA_LABELS: Record<AccessArea, string> = {
  recepcion_principal: 'Recepción Principal',
  estacionamiento: 'Estacionamiento',
  proveedores: 'Proveedores',
};

export function Dashboard() {
  const { 
    state, 
    logsByArea, 
    statsByArea, 
    totalStats, 
    peoplePresent,
    corteStatus,
    loadFromFile, 
    selectArea,
    clearLogs 
  } = useAttendance();

  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (file: File) => {
    setUploading(true);
    try {
      await loadFromFile(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-heading font-bold text-gray-900">
                Control de Asistencia
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Torre Corporativa - 3 Áreas de Acceso
              </p>
            </div>
            <div className="flex items-center gap-3">
              {state.logs.length > 0 && (
                <Button variant="danger" size="sm" onClick={clearLogs}>
                  Limpiar Datos
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <CorteStatus
            currentCorte={corteStatus.currentCorte}
            nextCorte={corteStatus.nextCorte}
            timeRemaining={corteStatus.timeRemaining}
          />

          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{state.error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Registros"
              value={totalStats.total}
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              }
            />
            <StatCard
              title="Entradas"
              value={totalStats.entradas}
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              }
              color="green"
            />
            <StatCard
              title="Salidas"
              value={totalStats.salidas}
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              }
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              title="Personas en Torre"
              value={peoplePresent}
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              }
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['recepcion_principal', 'estacionamiento', 'proveedores'] as AccessArea[]).map(area => (
              <div key={area} className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-3">{AREA_LABELS[area]}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Entradas:</span>
                    <span className="font-medium text-green-600">{statsByArea[area].entrada}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Salidas:</span>
                    <span className="font-medium text-red-600">{statsByArea[area].salida}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total:</span>
                      <span className="font-medium">{statsByArea[area].entrada + statsByArea[area].salida}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
              Subir Archivo CSV
            </h2>
            <FileUploader onFileSelect={handleFileSelect} loading={uploading || state.isLoading} />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <AccessPointSelector
              selectedArea={state.selectedArea}
              onSelect={selectArea}
              stats={statsByArea}
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
              Registros de Asistencia
            </h2>
            <AttendanceTable logs={logsByArea} />
          </div>
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'purple';
}

function StatCard({ title, value, icon, color = 'blue' }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
      <div className={clsx('p-3 rounded-lg', colors[color])}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

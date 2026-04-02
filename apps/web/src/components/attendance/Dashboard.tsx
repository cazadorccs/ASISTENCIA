import { useState, useMemo } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { FileUploader } from './FileUploader';
import { AccessPointSelector } from './AccessPointSelector';
import { AttendanceTable } from './AttendanceTable';
import { CorteStatus } from './CorteStatus';
import { ReportsPanel } from './ReportsPanel';
import { Button } from '../ui/Button';
import type { AccessArea, AttendanceLog } from '../../types/types';
import { clsx } from 'clsx';

type UserRole = 'admin' | 'gerente' | 'supervisor' | 'empleado';

interface DashboardProps {
  userRole?: UserRole;
  onLogout?: () => void;
  userName?: string;
}

const AREA_LABELS: Record<AccessArea, string> = {
  recepcion_principal: 'Recepción Principal',
  estacionamiento: 'Estacionamiento',
  proveedores: 'Proveedores',
};

type ViewTab = 'overview' | 'upload' | 'areas' | 'reports' | 'records';

export function Dashboard({ userRole = 'empleado', onLogout, userName }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [isEvacuationMode, setIsEvacuationMode] = useState(false);
  
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
      // Opcionalmente redirigir al overview después de carga exitosa
      // setActiveTab('overview');
    } finally {
      setUploading(false);
    }
  };

  const menuItems: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { 
      id: 'overview', 
      label: 'Dashboard Principal', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> 
    },
    { 
      id: 'upload', 
      label: 'Subir Archivo CSV', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /> 
    },
    { 
      id: 'areas', 
      label: 'Filtrar por Área', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /> 
    },
    { 
      id: 'reports', 
      label: 'Generar Reportes', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> 
    },
    { 
      id: 'records', 
      label: 'Registro de Asistencia', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /> 
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      
      {/* Sidebar Lateral */}
      <aside className="w-72 bg-slate-850 text-slate-300 flex flex-col shadow-xl z-20 hidden md:flex fixed h-full transition-all">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl tracking-tight leading-tight">MIPPCI</h2>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Control de Asistencia</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Panel de Control</p>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium',
                  activeTab === item.id 
                    ? 'bg-brand-600/10 text-brand-400 border border-brand-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <svg className={clsx("w-5 h-5", activeTab === item.id ? "text-brand-400" : "text-slate-500")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {item.icon}
                </svg>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs uppercase">
              {(userName || userRole).charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName || 'Administrador'}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{userRole}</p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-300 border border-slate-700 py-2 px-4 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:ml-72 min-h-screen">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm flex items-center justify-between px-6 py-4">
          <div className="flex-1">
            <h1 className="text-xl font-heading font-bold text-slate-850 tracking-tight">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="danger" size="sm" onClick={() => setIsEvacuationMode(true)} className="shadow-lg animate-pulse ring-2 ring-red-500 ring-offset-2">
              🚨 MODO EVACUACIÓN
            </Button>
            {state.logs.length > 0 && activeTab === 'overview' && (
              <Button variant="danger" size="sm" onClick={clearLogs} className="shadow-sm hidden md:flex">
                Limpiar Memoria
              </Button>
            )}
          </div>
        </header>

        {isEvacuationMode && (
          <EvacuationView logs={state.logs} onExit={() => setIsEvacuationMode(false)} />
        )}

        <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
          
          {/* Alertas globales */}
          <CorteStatus
            currentCorte={corteStatus.currentCorte}
            nextCorte={corteStatus.nextCorte}
            timeRemaining={corteStatus.timeRemaining}
          />

          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 shadow-sm animate-fade-in">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Se detectó un problema</p>
                <p className="text-sm text-red-600">{state.error}</p>
              </div>
            </div>
          )}

          {/* Vistas */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
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
                <StatCard
                  title="Posibles Comensales"
                  value={peoplePresent}
                  icon={
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4h18z" />
                  }
                  color="blue"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['recepcion_principal', 'estacionamiento', 'proveedores'] as AccessArea[]).map(area => (
                  <div key={area} className="bg-white rounded-xl border border-slate-100 shadow-soft p-5 transition-transform hover:-translate-y-1 hover:shadow-glass duration-300">
                    <h3 className="font-heading font-semibold text-slate-800 mb-3">{AREA_LABELS[area]}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Entradas:</span>
                        <span className="font-medium text-green-600">{statsByArea[area].entrada}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Salidas:</span>
                        <span className="font-medium text-red-600">{statsByArea[area].salida}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Total:</span>
                          <span className="font-medium text-brand-600">{statsByArea[area].entrada + statsByArea[area].salida}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-6 animate-fade-in">
              <div className="mb-6">
                <p className="text-slate-500">Carga un archivo en formato CSV exportado desde el sistema biométrico para consolidar los datos dentro de la memoria temporal.</p>
              </div>
              <FileUploader onFileSelect={handleFileSelect} loading={uploading || state.isLoading} />
            </div>
          )}

          {activeTab === 'areas' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-6">
                <AccessPointSelector
                  selectedArea={state.selectedArea}
                  onSelect={selectArea}
                  stats={statsByArea}
                />
              </div>
              <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-6">
                <h3 className="font-heading font-semibold text-slate-800 mb-4">Resultados Filtrados</h3>
                <AttendanceTable logs={logsByArea} />
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
             <div className="animate-fade-in">
                <ReportsPanel logs={state.logs} userRole={userRole} />
             </div>
          )}

          {activeTab === 'records' && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-6 animate-fade-in">
              <AttendanceTable logs={logsByArea} />
            </div>
          )}

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
    blue: 'bg-brand-50 text-brand-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5 flex items-center gap-5 transition-transform hover:-translate-y-1 hover:shadow-glass duration-300">
      <div className={clsx('p-3.5 rounded-xl', colors[color])}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-heading font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function EvacuationView({ logs, onExit }: { logs: AttendanceLog[], onExit: () => void }) {
  const [safeList, setSafeList] = useState<Set<string>>(new Set());

  const missingUsers = useMemo(() => {
    const byUserDate = new Map<string, any>();
    
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
        });
      } else if (log.type === 'salida') {
        byUserDate.delete(userKey);
      }
    });
    
    return Array.from(byUserDate.values());
  }, [logs]);

  const toggleSafe = (userKey: string) => {
    setSafeList(prev => {
      const next = new Set(prev);
      if (next.has(userKey)) next.delete(userKey);
      else next.add(userKey);
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const csvRows = ["Estado,Usuario,ID,Departamento,Ingreso"];
    missingUsers.forEach((u: any) => {
      const isSafe = safeList.has(`${u.userId}_${u.date}`);
      csvRows.push(`${isSafe ? 'A SALVO' : 'PENDIENTE'},"${u.userName}","${u.userId}","${u.department}","${new Intl.DateTimeFormat('es-VE', {timeStyle: 'short'}).format(u.entry)}"`);
    });
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Evacuacion_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsApp = () => {
    const text = `🚨 REPORTE DE EVACUACIÓN MIPPCI 🚨\nTotal a Salvo: ${safeList.size}\nFaltan por Evacuar: ${missingUsers.length - safeList.size}\nAtención requerida de inmediato.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-red-900/95 flex flex-col items-center p-6 sm:p-12 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-8 flex flex-col min-h-full">
        <div className="flex justify-between items-center border-b pb-6 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-red-600 flex items-center gap-4">
              <span className="animate-pulse">🚨</span> ROLL-CALL DE EMERGENCIA
            </h1>
            <p className="text-slate-600 mt-2 font-medium">Lista activa de personas contabilizadas dentro de la torre al momento de la activación.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleWhatsApp} className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.388 0 12.038c0 2.124.553 4.195 1.604 6.012L.036 24l6.19-1.624A11.968 11.968 0 0012.033 24c6.641 0 12.033-5.388 12.033-12.038C24.066 5.388 18.672 0 12.031 0zm.002 22.015c-1.785 0-3.535-.48-5.07-1.39l-.364-.216-3.766.988 1.006-3.673-.237-.377A9.972 9.972 0 011.996 12.04c0-5.541 4.51-10.054 10.05-10.054s10.05 4.512 10.05 10.053c0 5.542-4.51 10.053-10.05 10.053l-.002-.077zm5.514-7.534c-.303-.152-1.792-.885-2.07-987-.278-.102-.48-.152-.682.15l-.978 1.196c-.201.252-.403.277-.706.126-2.126-1.063-3.72-2.39-5.116-4.783-.15-.252-.016-.39.136-.54.135-.135.303-.353.454-.53.15-.177.202-.303.303-.505.101-.202.05-.38-.026-.53-.075-.152-.682-1.644-.934-2.251-.247-.594-.497-.513-.682-.522l-.582-.01c-.202 0-.53.076-.807.38-.278.303-1.06 1.036-1.06 2.526 0 1.49 1.085 2.932 1.236 3.134.152.202 2.138 3.262 5.176 4.536 2.052.864 2.894.945 3.967.79 1.22-.178 2.71-1.107 3.09-2.176.38-1.067.38-1.98.267-2.176-.113-.192-.416-.293-.72-.444z"/></svg>
              WhatsApp
            </button>
            <button onClick={handleDownload} className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              CSV
            </button>
            <button onClick={handlePrint} className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-bold hover:bg-slate-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              Imprimir
            </button>
            <button onClick={onExit} className="px-5 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 ml-2">
              CERRAR
            </button>
          </div>
        </div>
        
        <div className="flex gap-6 mb-8">
          <div className="bg-red-50 p-6 rounded-xl flex-1 border border-red-100">
            <h3 className="text-red-800 text-xl font-bold mb-1">Por Evacuar</h3>
            <p className="text-5xl font-black text-red-600">{missingUsers.length - safeList.size}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl flex-1 border border-green-100">
            <h3 className="text-green-800 text-xl font-bold mb-1">A Salvo (Confirmados)</h3>
            <p className="text-5xl font-black text-green-600">{safeList.size}</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Usuario</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Departamento</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Hora Ingreso</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {missingUsers.map((user: any) => {
                const uKey = `${user.userId}_${user.date}`;
                const isSafe = safeList.has(uKey);
                return (
                  <tr key={uKey} className={clsx("transition-colors", isSafe ? "bg-green-50" : "hover:bg-slate-50")}>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleSafe(uKey)}
                        className={clsx(
                          "px-4 py-2 rounded-full font-bold text-xs ring-2 ring-offset-2 transition-all",
                          isSafe ? "bg-green-500 text-white ring-green-500" : "bg-red-100 text-red-700 ring-transparent hover:bg-red-200"
                        )}
                      >
                        {isSafe ? '✓ A SALVO' : 'PENDIENTE'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{user.userName}</div>
                      <div className="text-xs text-slate-500">ID: {user.userId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{user.department}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Intl.DateTimeFormat('es-VE', {timeStyle: 'short'}).format(user.entry)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {missingUsers.length === 0 && (
            <div className="text-center py-12 text-slate-500 font-medium">Torre vacía al momento de activación.</div>
          )}
        </div>
      </div>
    </div>
  );
}

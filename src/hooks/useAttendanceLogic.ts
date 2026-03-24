import { useCallback, useMemo, useEffect, useReducer } from 'react';
import type { 
  AttendanceLog, 
  AttendanceState, 
  AttendanceAction, 
  AccessArea 
} from '../types/types';
import { parseCSVToAttendanceLogs } from '../util/csvParser';
import { storage } from '../util/storage';
import { createScheduler, getCorteStatus, getStoredCorteData, type CorteType } from '../util/scheduler';

const initialState: AttendanceState = {
  logs: [],
  users: [],
  accessPoints: [
    { id: 'recepcion_entrada', name: 'Recepción Principal - Entrada', area: 'recepcion_principal', type: 'entrada' },
    { id: 'recepcion_salida', name: 'Recepción Principal - Salida', area: 'recepcion_principal', type: 'salida' },
    { id: 'estacionamiento_entrada', name: 'Estacionamiento - Entrada', area: 'estacionamiento', type: 'entrada' },
    { id: 'estacionamiento_salida', name: 'Estacionamiento - Salida', area: 'estacionamiento', type: 'salida' },
    { id: 'proveedores_entrada', name: 'Proveedores - Entrada', area: 'proveedores', type: 'entrada' },
    { id: 'proveedores_salida', name: 'Proveedores - Salida', area: 'proveedores', type: 'salida' },
  ],
  selectedArea: null,
  isLoading: false,
  error: null,
  currentCorte: null,
  lastUpdate: null,
};

function attendanceReducer(state: AttendanceState, action: AttendanceAction): AttendanceState {
  switch (action.type) {
    case 'SET_LOGS':
      const users = extractUniqueUsers(action.payload);
      return { 
        ...state, 
        logs: action.payload, 
        users,
        isLoading: false,
        lastUpdate: new Date(),
      };
    case 'ADD_LOG':
      const newUsers = extractUniqueUsers([action.payload, ...state.logs]);
      return { 
        ...state, 
        logs: [action.payload, ...state.logs],
        users: newUsers,
      };
    case 'SET_AREA':
      storage.saveConfig({ selectedArea: action.payload });
      return { ...state, selectedArea: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_CORTE':
      return { ...state, currentCorte: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

function extractUniqueUsers(logs: AttendanceLog[]) {
  const userMap = new Map<string, { id: string; name: string; department: string }>();
  
  logs.forEach(log => {
    if (!userMap.has(log.userId)) {
      userMap.set(log.userId, {
        id: log.userId,
        name: log.userName,
        department: log.department,
      });
    }
  });
  
  return Array.from(userMap.values());
}

export const useAttendanceLogic = () => {
  const [state, dispatch] = useReducer(attendanceReducer, initialState);

  useEffect(() => {
    const savedLogs = storage.loadLogs();
    if (savedLogs.length > 0) {
      dispatch({ type: 'SET_LOGS', payload: savedLogs });
    }

    const config = storage.loadConfig();
    if (config.selectedArea) {
      dispatch({ type: 'SET_AREA', payload: config.selectedArea as AccessArea });
    }

    const corteData = getStoredCorteData();
    const status = getCorteStatus();
    if (status.currentCorte) {
      dispatch({ type: 'SET_CORTE', payload: status.currentCorte });
    } else if (corteData.manana && corteData.tarde) {
      dispatch({ type: 'SET_CORTE', payload: 'tarde' });
    } else if (corteData.manana) {
      dispatch({ type: 'SET_CORTE', payload: 'manana' });
    }
  }, []);

  useEffect(() => {
    if (state.logs.length === 0) return;

    const cleanup = createScheduler({
      onCorteTrigger: (type: CorteType, logs: AttendanceLog[]) => {
        storage.saveCorte(type, logs);
        dispatch({ type: 'SET_CORTE', payload: type });
      },
      currentLogs: state.logs,
      checkIntervalMs: 60000,
    });

    return cleanup;
  }, [state.logs]);

  const loadFromCSV = useCallback((csvContent: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const logs = parseCSVToAttendanceLogs(csvContent);
      
      if (logs.length === 0) {
        dispatch({ type: 'SET_ERROR', payload: 'No se encontraron registros en el CSV' });
        return;
      }

      storage.saveLogs(logs);
      dispatch({ type: 'SET_LOGS', payload: logs });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al parsear el archivo CSV' });
    }
  }, []);

  const loadFromFile = useCallback(async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          loadFromCSV(content);
          resolve();
        } else {
          reject(new Error('No se pudo leer el archivo'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsText(file);
    });
  }, [loadFromCSV]);

  const selectArea = useCallback((area: AccessArea | null) => {
    dispatch({ type: 'SET_AREA', payload: area });
  }, []);

  const addLog = useCallback((log: AttendanceLog) => {
    dispatch({ type: 'ADD_LOG', payload: log });
    const updatedLogs = [log, ...state.logs];
    storage.saveLogs(updatedLogs);
  }, [state.logs]);

  const clearLogs = useCallback(() => {
    storage.saveLogs([]);
    dispatch({ type: 'SET_LOGS', payload: [] });
  }, []);

  const logsByArea = useMemo(() => {
    if (!state.selectedArea) return state.logs;
    return state.logs.filter(log => log.area === state.selectedArea);
  }, [state.logs, state.selectedArea]);

  const statsByArea = useMemo(() => {
    const stats: Record<AccessArea, { entrada: number; salida: number }> = {
      recepcion_principal: { entrada: 0, salida: 0 },
      estacionamiento: { entrada: 0, salida: 0 },
      proveedores: { entrada: 0, salida: 0 },
    };

    state.logs.forEach(log => {
      if (log.type === 'entrada') {
        stats[log.area].entrada++;
      } else {
        stats[log.area].salida++;
      }
    });

    return stats;
  }, [state.logs]);

  const corteStatus = useMemo(() => getCorteStatus(), [state.lastUpdate]);

  const totalStats = useMemo(() => {
    return {
      total: state.logs.length,
      entradas: state.logs.filter(l => l.type === 'entrada').length,
      salidas: state.logs.filter(l => l.type === 'salida').length,
      uniqueUsers: state.users.length,
    };
  }, [state.logs, state.users]);

  return {
    state,
    logsByArea,
    statsByArea,
    totalStats,
    corteStatus,
    loadFromCSV,
    loadFromFile,
    selectArea,
    addLog,
    clearLogs,
  };
};

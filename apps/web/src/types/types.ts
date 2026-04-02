export type AccessArea = 'recepcion_principal' | 'estacionamiento' | 'proveedores';

export type AccessType = 'entrada' | 'salida';

export interface User {
  id: string;
  name: string;
  department: string;
}

export interface AccessPoint {
  id: string;
  name: string;
  area: AccessArea;
  type: AccessType;
}

export interface AttendanceLog {
  id: string;
  userId: string;
  userName: string;
  department: string;
  timestamp: Date;
  accessPoint: string;
  area: AccessArea;
  type: AccessType;
  source: string;
  temperature?: number;
  isAbnormal: boolean;
}

export interface AttendanceState {
  logs: AttendanceLog[];
  users: User[];
  accessPoints: AccessPoint[];
  selectedArea: AccessArea | null;
  isLoading: boolean;
  error: string | null;
  currentCorte: 'manana' | 'tarde' | null;
  lastUpdate: Date | null;
}

export type AttendanceAction =
  | { type: 'SET_LOGS'; payload: AttendanceLog[] }
  | { type: 'ADD_LOG'; payload: AttendanceLog }
  | { type: 'SET_AREA'; payload: AccessArea | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CORTE'; payload: 'manana' | 'tarde' | null }
  | { type: 'CLEAR_ERROR' };

export interface CorteData {
  logs: AttendanceLog[];
  timestamp: Date;
  type: 'manana' | 'tarde';
}

export interface StorageConfig {
  selectedArea: AccessArea | null;
  lastCorte: string | null;
}

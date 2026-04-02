import type { AttendanceLog, CorteData } from '../types/types';

const STORAGE_KEYS = {
  LOGS: 'attendance_logs',
  CONFIG: 'attendance_config',
  CORTE_MANANA: 'corte_manana',
  CORTE_TARDE: 'corte_tarde',
  ULTIMO_CORTE: 'ultimo_corte',
} as const;

export const storage = {
  saveLogs(logs: AttendanceLog[]): void {
    try {
      const serialized = JSON.stringify(logs, (key, value) => {
        if (key === 'timestamp') return value instanceof Date ? value.toISOString() : value;
        return value;
      });
      localStorage.setItem(STORAGE_KEYS.LOGS, serialized);
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  },

  loadLogs(): AttendanceLog[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return parsed.map((log: AttendanceLog) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }));
    } catch (error) {
      console.error('Error loading logs:', error);
      return [];
    }
  },

  saveCorte(type: 'manana' | 'tarde', logs: AttendanceLog[]): void {
    try {
      const corteData: CorteData = {
        logs,
        timestamp: new Date(),
        type,
      };
      const key = type === 'manana' ? STORAGE_KEYS.CORTE_MANANA : STORAGE_KEYS.CORTE_TARDE;
      localStorage.setItem(key, JSON.stringify(corteData));
      localStorage.setItem(STORAGE_KEYS.ULTIMO_CORTE, new Date().toISOString());
    } catch (error) {
      console.error('Error saving corte:', error);
    }
  },

  loadCorte(type: 'manana' | 'tarde'): CorteData | null {
    try {
      const key = type === 'manana' ? STORAGE_KEYS.CORTE_MANANA : STORAGE_KEYS.CORTE_TARDE;
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const parsed: CorteData = JSON.parse(stored);
      return {
        ...parsed,
        timestamp: new Date(parsed.timestamp),
        logs: parsed.logs.map(log => ({
          ...log,
          timestamp: new Date(log.timestamp),
        })),
      };
    } catch (error) {
      console.error('Error loading corte:', error);
      return null;
    }
  },

  getUltimoCorteTimestamp(): Date | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ULTIMO_CORTE);
      return stored ? new Date(stored) : null;
    } catch {
      return null;
    }
  },

  saveConfig(config: { selectedArea: string | null }): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  },

  loadConfig(): { selectedArea: string | null } {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return stored ? JSON.parse(stored) : { selectedArea: null };
    } catch {
      return { selectedArea: null };
    }
  },

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

import type { AttendanceLog, CorteData } from '../types/types';
import { storage } from './storage';

const CORTE_HOURS = {
  MANANA: 10,
  TARDE: 14,
} as const;

export type CorteType = 'manana' | 'tarde';

export interface SchedulerConfig {
  onCorteTrigger: (type: CorteType, logs: AttendanceLog[]) => void;
  currentLogs: AttendanceLog[];
  checkIntervalMs?: number;
}

function getCurrentCorte(): CorteType | null {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= CORTE_HOURS.MANANA && hour < CORTE_HOURS.TARDE) {
    return 'manana';
  } else if (hour >= CORTE_HOURS.TARDE) {
    return 'tarde';
  }
  return null;
}

export function getCorteDisplayName(type: CorteType): string {
  return type === 'manana' ? 'Corte 10:00 AM' : 'Corte 14:00 PM';
}

export function getNextCorteTime(): Date {
  const now = new Date();
  const currentHour = now.getHours();

  let nextCorte: Date;

  if (currentHour < CORTE_HOURS.MANANA) {
    nextCorte = new Date(now);
    nextCorte.setHours(CORTE_HOURS.MANANA, 0, 0, 0);
  } else if (currentHour < CORTE_HOURS.TARDE) {
    nextCorte = new Date(now);
    nextCorte.setHours(CORTE_HOURS.TARDE, 0, 0, 0);
  } else {
    nextCorte = new Date(now);
    nextCorte.setDate(nextCorte.getDate() + 1);
    nextCorte.setHours(CORTE_HOURS.MANANA, 0, 0, 0);
  }

  return nextCorte;
}

export function shouldTriggerCorte(type: CorteType, lastTimestamp: Date | null): boolean {
  if (!lastTimestamp) return true;

  const now = new Date();
  const today = now.getDate();

  if (type === 'manana' && lastTimestamp.getDate() !== today) {
    return now.getHours() >= CORTE_HOURS.MANANA;
  }
  
  if (type === 'tarde' && lastTimestamp.getDate() !== today) {
    return now.getHours() >= CORTE_HOURS.TARDE;
  }

  return false;
}

export function getCorteStatus(): {
  currentCorte: CorteType | null;
  nextCorte: Date;
  timeRemaining: string;
} {
  const currentCorte = getCurrentCorte();
  const nextCorte = getNextCorteTime();
  
  const now = new Date();
  const diffMs = nextCorte.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  let timeRemaining: string;
  if (hours > 0) {
    timeRemaining = `${hours}h ${mins}m`;
  } else {
    timeRemaining = `${mins}m`;
  }

  return {
    currentCorte,
    nextCorte,
    timeRemaining,
  };
}

export function createScheduler(config: SchedulerConfig): () => void {
  const { onCorteTrigger, currentLogs, checkIntervalMs = 60000 } = config;

  const checkAndTrigger = () => {
    const currentCorte = getCurrentCorte();
    const lastCorte = storage.getUltimoCorteTimestamp();

    if (currentCorte && shouldTriggerCorte(currentCorte, lastCorte)) {
      storage.saveCorte(currentCorte, currentLogs);
      onCorteTrigger(currentCorte, currentLogs);
    }
  };

  const intervalId = setInterval(checkAndTrigger, checkIntervalMs);

  checkAndTrigger();

  return () => clearInterval(intervalId);
}

export function getStoredCorteData(): {
  manana: CorteData | null;
  tarde: CorteData | null;
} {
  return {
    manana: storage.loadCorte('manana'),
    tarde: storage.loadCorte('tarde'),
  };
}

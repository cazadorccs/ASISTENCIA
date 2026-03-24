import { createContext, useContext, ReactNode } from 'react';
import { useAttendanceLogic } from '../hooks/useAttendanceLogic';
import type { AttendanceState } from '../types/types';

interface AttendanceContextType extends ReturnType<typeof useAttendanceLogic> {
  state: AttendanceState;
}

const AttendanceContext = createContext<AttendanceContextType | null>(null);

interface AttendanceProviderProps {
  children: ReactNode;
}

export function AttendanceProvider({ children }: AttendanceProviderProps) {
  const logic = useAttendanceLogic();

  return (
    <AttendanceContext.Provider value={logic}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance(): AttendanceContextType {
  const context = useContext(AttendanceContext);
  
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  
  return context;
}

export { AttendanceContext };

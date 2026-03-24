import type { AttendanceLog, AccessArea, AccessType } from '../types/types';

const AREA_MAP: Record<string, AccessArea> = {
  'planta baja 1': 'recepcion_principal',
  'planta baja1': 'recepcion_principal',
  'planta baja 2': 'proveedores',
  'planta baja2': 'proveedores',
  'sotano': 'estacionamiento',
};

const TYPE_MAP: Record<string, AccessType> = {
  'entrada': 'entrada',
  'salida': 'salida',
};

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

function parseAccessPoint(accessPoint: string): { area: AccessArea; type: AccessType } {
  const normalized = normalizeText(accessPoint);
  
  let area: AccessArea = 'recepcion_principal';
  let type: AccessType = 'entrada';

  for (const [key, value] of Object.entries(AREA_MAP)) {
    if (normalized.includes(key)) {
      area = value;
      break;
    }
  }

  for (const [key, value] of Object.entries(TYPE_MAP)) {
    if (normalized.startsWith(key)) {
      type = value;
      break;
    }
  }

  return { area, type };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function parseCSVToAttendanceLogs(csvContent: string): AttendanceLog[] {
  const lines = csvContent.trim().split('\n');
  
  if (lines.length < 2) {
    return [];
  }

  const headerLine = lines[0];
  const hasHeader = headerLine.includes('ID de persona') || headerLine.includes('Nombre');
  
  const dataLines = hasHeader ? lines.slice(1) : lines;
  
  const logs: AttendanceLog[] = [];

  for (const line of dataLines) {
    if (!line.trim() || line.trim() === '') continue;

    const columns = line.split(',');
    
    if (columns.length < 6) continue;

    const userIdRaw = columns[0].replace(/'/g, '').trim();
    const userId = userIdRaw || generateId();
    const userName = columns[1]?.trim() || 'Desconocido';
    const department = columns[2]?.trim() || 'Sin departamento';
    const timestampStr = columns[3]?.trim() || new Date().toISOString();
    const accessPoint = columns[5]?.trim() || 'Sin punto de acceso';
    const source = columns[7]?.trim() || 'CSV';
    const temperature = columns[9]?.trim() && columns[9]?.trim() !== '-' 
      ? parseFloat(columns[9].trim()) 
      : undefined;
    const isAbnormal = columns[10]?.trim() === '1' || columns[10]?.trim().toLowerCase() === 'si';

    const { area, type } = parseAccessPoint(accessPoint);

    const timestamp = new Date(timestampStr);

    logs.push({
      id: generateId(),
      userId,
      userName,
      department,
      timestamp,
      accessPoint,
      area,
      type,
      source,
      temperature,
      isAbnormal,
    });
  }

  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function exportLogsToCSV(logs: AttendanceLog[]): string {
  const header = 'ID,Nombre,Departamento,Hora,Estado,Punto de Acceso,Area,Tipo';
  
  const rows = logs.map(log => {
    return [
      log.userId,
      log.userName,
      log.department,
      log.timestamp.toISOString(),
      'Nada',
      log.accessPoint,
      log.area,
      log.type,
    ].join(',');
  });

  return [header, ...rows].join('\n');
}

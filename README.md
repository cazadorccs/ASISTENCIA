# Asistencia App - Plataforma de Inteligencia Operativa

Sistema avanzado de control de asistencia y análisis de acceso para la Torre Corporativa del MIPPCI. Diseñado para transformar los registros biométricos en inteligencia operativa accionable para los departamentos de Seguridad, RRHH y Administración.

## 🚀 Características y Módulos Principales

### 🚨 1. Módulo de Seguridad y Emergencias (Roll-Call)
- **Modo Evacuación:** Botón de pánico que bloquea la interfaz en una pantalla de contingencia roja.
- **Headcount en Tiempo Real:** Calcula instantáneamente a todas las personas que ingresaron al edificio y no registran salida, marcándolos como "Por Evacuar".
- **Gestión In Situ:** Controles interactivos para marcar a los empleados como "A SALVO" a medida que llegan a los puntos de encuentro.
- **Protocolos de Exportación Rápida:**
  - Envío automatizado del reporte a grupos de **WhatsApp**.
  - Descarga instantánea en **CSV** para reportes forenses.
  - Impresión térmica/PDF **(Print)** directa.

### 💼 2. Módulo de Pre-Nómina (Recursos Humanos)
- Cálculos exactos de permanencia cruzando primera entrada vs. última salida.
- **Sistema de Semáforo:** Detecta anomalías como "Llegadas Tardías" (límite configurable, ej. 08:30 AM).

### 🍽️ 3. Módulo Plan Comedor (Administración)
- Algoritmo predictivo que cruza las asistencias matutinas (06:00 a 11:00 AM) para proyectar la demografía de posibles comensales. Ayuda drásticamente a reducir el desperdicio de raciones y ajustar la logística culinaria del día.

### 🕵️ 4. Módulo de Auditoría y Control
- **Detección de Jornadas Excesivas:** Escanea permanencias irracionales mayores a 14 horas continuas (pernoctas no autorizadas).
- **Omisión de Salida / Evasión:** Señala usuarios con múltiples marcajes de entrada sin contrapartidas de salida.

### 🏢 5. Control de Visitantes y Flujo por Piso
- **Visitantes:** Panel que separa algorítmicamente a cualquier tercero temporal de la nómina regular.
- **Cámara Instantánea por Piso:** Mapeo de la distribución del personal a lo largo de los distintos niveles de la torre, basado en la afiliación de departamentos.

### 🔍 6. Motor de Búsqueda y Datos Crudos
- Filtro unificado inteligente con búsqueda global transversal por: Nombre, Cédula (ID), Departamento y Área.
- Agrupación avanzada (Vista Individual vs Vista Condensada por Usuario).

---

## 🛠️ Stack Tecnológico

- **Frontend Core:** React 18
- **Lenguaje:** TypeScript estricto
- **Bundler y Fast Refresh:** Vite
- **Estilos y UI:** Tailwind CSS (Arquitectura utility-first)
- **Gestión de Estados:** React Context API & Hooks (useMemo optimizado para miles de registros CSV).
- **Runtime:** Node.js 18+

---

## 💻 Instalación y Uso

1. **Instalar dependencias:**
```bash
npm install
```

2. **Ejecutar Entorno de Desarrollo (Monorepo):**
```bash
# Servidor API
npm run dev:api

# Aplicación Web Frontend
npm run dev --workspace=asistencia-web
```

3. **Compilar para Producción:**
```bash
npm run build
```

---

## 📂 Architectura y Estructura

```
apps/web/
├── src/
│   ├── components/
│   │   ├── attendance/    # Núcleo: Dashboard, ReportsPanel, EvacuationView, etc.
│   │   ├── auth/          # UI de Autenticación 
│   │   └── ui/            # Elementos estructurales base
│   ├── context/           # Estado central de los logs subidos
│   ├── types/             # Typescript Interfaces (AttendanceLog, AccessArea)
│   └── main.tsx           # Punto de entrada
```

---

## 📄 Formato Esperado CSV

El sistema se alimenta de un Data Dump del servidor biométrico ZKTeco u homólogo. Exige los siguientes encabezados:

```csv
userId,userName,department,timestamp,accessPoint,area,type,source,temperature
```

> **📌 Nota de Uso:** Al procesar un CSV multi-día, todos los reportes de Piso y Estado Actual calcularán la posición del usuario basándose siempre en su acción cronológica más reciente.

---

**Licencia:** Privado - MIPPCI

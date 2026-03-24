# Asistencia App

Sistema de control de asistencia para Torre Corporativa con 3 áreas de acceso.

## Características

- **Gestión de Áreas de Acceso**
  - Recepción Principal
  - Estacionamiento
  - Proveedores

- **Importación de Datos**
  - Carga de archivos CSV con registros de asistencia
  - Validación y procesamiento automático

- **Estadísticas en Tiempo Real**
  - Total de registros
  - Entradas y salidas por área
  - Conteo por punto de acceso

- **Control de Cortes**
  - Corte de mañana
  - Corte de tarde
  - Temporizador de próximo corte

- **Interfaz Responsive**
  - Diseño adaptativo para escritorio y móvil
  - Tabla de registros con filtros por área

## Tecnologías

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Context API

## Requisitos

- Node.js 18+
- npm 9+

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Producción

```bash
npm run build
```

## Estructura del Proyecto

```
src/
├── components/
│   ├── attendance/    # Componentes de asistencia
│   └── ui/            # Componentes UI reutilizables
├── context/           # Contextos de React
├── hooks/            # Custom hooks
├── types/            # Definiciones de tipos
└── util/             # Utilidades
```

## Formato CSV

El archivo CSV debe contener las siguientes columnas:

```csv
userId,userName,department,timestamp,accessPoint,area,type,source,temperature
```

## Licencia

Privado - Mippci

# Asistencia App — Plataforma de Inteligencia Operativa

> Sistema fullstack de control de asistencia y análisis de acceso para la Torre Corporativa del MIPPCI. Transforma los registros biométricos en inteligencia operativa accionable para los departamentos de Seguridad, RRHH y Administración.

---

## 🏗️ Arquitectura General

Proyecto organizado como **monorepo** con dos aplicaciones independientes:

```
ASISTENCIA/
├── apps/
│   ├── api/          # Backend REST — Express + Prisma + PostgreSQL
│   └── web/          # Frontend SPA — React + Vite + TailwindCSS
└── package.json      # Scripts de raíz (monorepo npm workspaces)
```

---

## 🛠️ Stack Tecnológico

### Backend (`apps/api`)
| Tecnología | Uso |
|---|---|
| **Node.js + TypeScript** | Runtime y lenguaje principal |
| **Express 5** | Framework HTTP / API REST |
| **Prisma 7 + PostgreSQL** | ORM y base de datos relacional |
| **JSON Web Token (JWT)** | Autenticación sin estado |
| **bcryptjs** | Hash seguro de contraseñas |
| **Zod** | Validación de esquemas en endpoints |
| **tsx + nodemon** | Hot-reload en desarrollo |

### Frontend (`apps/web`)
| Tecnología | Uso |
|---|---|
| **React 18 + TypeScript** | UI framework con tipado estricto |
| **Vite 5** | Bundler y servidor de desarrollo |
| **Tailwind CSS 3** | Estilos utility-first |
| **React Router DOM 7** | Enrutamiento con rutas protegidas |
| **React Context API** | Estado global (Auth + Attendance) |
| **clsx** | Composición condicional de clases CSS |

---

## 🚀 Módulos y Características

### 🔐 Autenticación y Control de Acceso
- Login con **email/contraseña** validado contra la base de datos PostgreSQL.
- Sesión gestionada con **JWT** (expira en 24h) y `localStorage`.
- Sistema de **roles diferenciado** con distintos permisos de vista:
  - `admin` · `seguridad` · `rrhh` · `administracion` · `auditoria` · `empleado`
- Rutas protegidas en el frontend: redireccionan a `/login` si no hay sesión activa.

### 🚨 Módulo de Seguridad y Emergencias (Roll-Call)
- **Modo Evacuación:** Pantalla de contingencia que calcula en tiempo real todas las personas que ingresaron al edificio y no registran salida ("Por Evacuar").
- **Gestión In Situ:** Controles para marcar empleados como "A SALVO" conforme llegan al punto de encuentro.
- **Exportación rápida:** Reporte descargable en CSV, listo para impresión térmica/PDF.

### 💼 Módulo de Pre-Nómina (RRHH)
- Cálculo de permanencia real: primera entrada vs. última salida.
- **Sistema semáforo:** detecta llegadas tardías (límite configurable, ej. 08:30 AM).
- Detección de **jornadas excesivas** (pernoctas > 14 horas continuas).

### 🍽️ Módulo Plan Comedor (Administración)
- Proyección de comensales cruzando asistencias del turno matutino (06:00–11:00 AM).
- Reduce desperdicio de raciones y optimiza la logística del día.

### 🕵️ Módulo de Auditoría y Control
- Detección de **omisión de salida / evasión**: múltiples entradas sin contrapartidas de salida.
- Escaneo de anomalías y marcajes sospechosos.

### 🏢 Control de Visitantes y Flujo por Piso
- Separación algorítmica de visitantes temporales vs. nómina regular.
- Mapa de distribución de personal por piso, basado en la afiliación departamental.

### 🔍 Motor de Búsqueda y Datos Crudos
- Carga de archivos CSV emitidos por el servidor biométrico ZKTeco.
- Filtro inteligente transversal: Nombre, Cédula (ID), Departamento, Área.
- Vista doble: **Individual** (todos los registros) y **Condensada** (último estado por usuario).

---

## 💻 Instalación y Uso

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+ (instancia local o remota)

### 1. Clonar e instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear `apps/api/.env` con los siguientes valores:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/asistencia"
JWT_SECRET="tu_secreto_seguro"
PORT=3001
```

### 3. Configurar la base de datos

```bash
# Aplicar el esquema a la base de datos
npm run db:push --workspace=asistencia-api

# Generar el cliente Prisma
npm run db:generate --workspace=asistencia-api
```

### 4. Ejecutar en desarrollo

```bash
# En terminales separadas:

# Servidor API  →  http://localhost:3001
npm run dev:api

# Aplicación Web  →  http://localhost:5173
npm run dev:web
```

### 5. Compilar para producción

```bash
npm run build
```

---

## 🗄️ Base de Datos (Prisma Schema)

| Modelo | Descripción |
|---|---|
| `User` | Usuarios del sistema con roles y departamento |
| `AccessPoint` | Puntos de acceso biométrico (nombre, área, tipo) |
| `AttendanceLog` | Registro individual de cada marcaje biométrico |
| `Corte` | Snapshot de un reporte exportado (JSON) |

---

## 🌐 API Endpoints

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión | ❌ |
| `POST` | `/api/auth/register` | Registrar nuevo usuario | ❌ |
| `GET` | `/api/attendance` | Listar registros de asistencia | ✅ JWT |
| `POST` | `/api/attendance` | Importar registros (CSV parse) | ✅ JWT |
| `GET` | `/api/users` | Listar usuarios del sistema | ✅ JWT Admin |
| `GET` | `/health` | Health check del servidor | ❌ |

---

## 📂 Estructura del Código

```
apps/
├── api/
│   └── src/
│       ├── config/        # Cliente Prisma (db.ts)
│       ├── middleware/     # Validación Zod (validate.ts) + Auth JWT
│       ├── routes/        # attendance.ts · auth.ts · users.ts
│       ├── schemas/       # Esquemas Zod para validación de body
│       └── index.ts       # Entry point — Express app
└── web/
    └── src/
        ├── components/
        │   ├── attendance/ # Dashboard · AttendanceTable · ReportsPanel
        │   │               # FloorReport · FileUploader · AccessPointSelector
        │   ├── auth/       # Login
        │   └── ui/         # Button · Input (design system base)
        ├── context/        # AuthContext · AttendanceContext
        ├── hooks/          # Hooks personalizados
        ├── types/          # Interfaces TypeScript (AttendanceLog, etc.)
        ├── util/           # Helpers y utilidades
        └── router.tsx      # Rutas protegidas (ProtectedRoute / PublicRoute)
```

---

## 📄 Formato CSV de Importación

El sistema acepta Data Dumps del servidor biométrico ZKTeco con el siguiente formato:

```csv
userId,userName,department,timestamp,accessPoint,area,type,source,temperature
```

> **📌 Nota:** Al procesar un CSV multi-día, todos los reportes calculan la posición del usuario basándose siempre en su acción cronológica más reciente.

---

**Licencia:** Privado — MIPPCI © 2026

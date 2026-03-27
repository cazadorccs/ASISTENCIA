# Sistema de Base de Datos - Asistencia MIPPCI

## 1. Tecnologías

- **Base de datos**: PostgreSQL 15+
- **ORM**: Prisma (recomendado) o Drizzle
- **Backend**: Node.js + Express
- **Frontend**: React (proyecto existente)

---

## 2. Instalación de PostgreSQL

### Windows (usando PostgreSQL installer)
1. Descargar de: https://www.postgresql.org/download/windows/
2. Ejecutar el instalador `postgresql-15.x-x-windows-x64.exe`
3. En configuración:
   - **Puerto**: 5432 (default)
   - **Contraseña postgres**: `asistencia2024`
   - **Superuser**: postgres
4. Instalar **pgAdmin 4** (incluido) para gestión visual
5. Finishing: crear base de datos `asistencia_db`

### Docker (alternativa rápida)
```bash
docker run --name asistencia-postgres \
  -e POSTGRES_PASSWORD=asistencia2024 \
  -e POSTGRES_DB=asistencia_db \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  -d postgres:15-alpine
```

---

## 3. Creación de la Base de Datos

### Conectarse a PostgreSQL
```bash
# Via psql (línea de comandos)
psql -U postgres -h localhost -p 5432
# Contraseña: asistencia2024
```

### Ejecutar script de creación
```sql
-- Conectarse como postgres y ejecutar:

-- 1. Crear base de datos
CREATE DATABASE asistencia_db;

-- 2. Conectarse a la DB
\c asistencia_db;

-- 3. Crear extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 4. Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('gerencia', 'admin', 'manager', 'supervisor', 'empleado')),
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tabla de puntos de acceso
CREATE TABLE access_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  area VARCHAR(50) NOT NULL CHECK (area IN ('recepcion_principal', 'estacionamiento', 'proveedores')),
  type VARCHAR(20) NOT NULL CHECK (type IN ('entrada', 'salida'))
);

-- 6. Tabla de registros de asistencia
CREATE TABLE attendance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  timestamp TIMESTAMP NOT NULL,
  access_point_id UUID REFERENCES access_points(id) ON DELETE SET NULL,
  area VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('entrada', 'salida')),
  source VARCHAR(50) DEFAULT 'csv_import',
  temperature DECIMAL(4,1),
  is_abnormal BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Tabla de cortes
CREATE TABLE cortes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('manana', 'tarde')),
  logs JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Índices para búsquedas
CREATE INDEX idx_logs_timestamp ON attendance_logs(timestamp);
CREATE INDEX idx_logs_user_id ON attendance_logs(user_id);
CREATE INDEX idx_logs_area ON attendance_logs(area);
CREATE INDEX idx_logs_department ON attendance_logs(department);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);

-- 9. Insertar puntos de acceso iniciales
INSERT INTO access_points (id, name, area, type) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Recepción Principal - Entrada', 'recepcion_principal', 'entrada'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Recepción Principal - Salida', 'recepcion_principal', 'salida'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Estacionamiento - Entrada', 'estacionamiento', 'entrada'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Estacionamiento - Salida', 'estacionamiento', 'salida'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Proveedores - Entrada', 'proveedores', 'entrada'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Proveedores - Salida', 'proveedores', 'salida');

-- 10. Crear usuario de aplicación (no usar postgres)
CREATE USER app_user WITH PASSWORD 'app_asistencia_2024';
GRANT ALL PRIVILEGES ON DATABASE asistencia_db TO app_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

---

## 4. Conexión desde la Aplicación

### Usando Prisma (recomendado)

```bash
# 1. Instalar Prisma
npm install prisma @prisma/client

# 2. Inicializar
npx prisma init
```

### Archivo `.env`
```env
DATABASE_URL="postgresql://app_user:app_asistencia_2024@localhost:5432/asistencia_db?schema=public"
JWT_SECRET="asistencia_jwt_secret_key_2024"
```

### Archivo `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  name         String
  role         String
  department   String?
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  logs         AttendanceLog[]

  @@map("users")
}

model AccessPoint {
  id     String @id @default(uuid())
  name   String
  area   String
  type   String
  logs   AttendanceLog[]

  @@map("access_points")
}

model AttendanceLog {
  id             String   @id @default(uuid())
  userId         String?  @map("user_id")
  userName       String   @map("user_name")
  department     String?
  timestamp      DateTime
  accessPointId  String?  @map("access_point_id")
  area           String
  type           String
  source         String   @default("csv_import")
  temperature    Decimal? @db.Decimal(4,1)
  isAbnormal     Boolean  @default(false) @map("is_abnormal")
  createdAt      DateTime @default(now()) @map("created_at")

  user          User?          @relation(fields: [userId], references: [id])
  accessPoint   AccessPoint?   @relation(fields: [accessPointId], references: [id])

  @@index([timestamp])
  @@index([area])
  @@index([userId])
  @@map("attendance_logs")
}

model Corte {
  id        String   @id @default(uuid())
  type      String
  logs      Json
  createdAt DateTime @default(now()) @map("created_at")

  @@map("cortes")
}
```

### Generar cliente Prisma
```bash
npx prisma generate
```

---

## 5. Estructura de Archivos Backend

```
backend/
├── src/
│   ├── index.ts              # Servidor Express
│   ├── config/
│   │   └── db.ts             # Conexión Prisma
│   ├── middleware/
│   │   └── auth.ts           # JWT + verificación rol
│   ├── routes/
│   │   ├── auth.ts           # Login/logout
│   │   ├── users.ts          # CRUD usuarios
│   │   ├── attendance.ts    # Registros + import
│   │   └── cortes.ts         # Cortes
│   ├── controllers/
│   └── utils/
├── prisma/
│   └── schema.prisma
├── .env
└── package.json
```

---

## 6. Permisos por Rol

| Campo | Gerencia | Admin | Manager | Supervisor | Empleado |
|-------|----------|-------|---------|------------|----------|
| Ver Dashboard | ✓ | ✓ | ✓ | ✓ | Limitado |
| Ver todos logs | ✓ | ✓ | Depto | Depto | Propios |
| Importar CSV | ✓ | ✓ | ✓ | ✗ | ✗ |
| CRUD Usuarios | ✓ | ✓ | ✗ | ✗ | ✗ |
| Reportes | ✓ | ✓ | ✓ | Limitado | ✗ |

---

## 7. Endpoints API

```typescript
// Auth
POST /api/auth/login      // {email, password} → {token, user}
POST /api/auth/logout     // invalida token

// Users (admin+)
GET    /api/users         // lista usuarios
POST   /api/users         // crear usuario
GET    /api/users/:id     // ver usuario
PUT    /api/users/:id     // editar usuario
DELETE /api/users/:id     // eliminar usuario

// Attendance (según rol)
GET  /api/attendance?area=&dept=&start=&end=&page=&limit=
POST /api/attendance                    // entrada manual
POST /api/attendance/import             // CSV (manager+)

// Cortes
GET /api/cortes
POST /api/cortes
```

---

## 8. Scripts de Migración

Para migrate datos de localStorage a PostgreSQL:

```typescript
// scripts/migrate-local-data.ts
// 1. Leer localStorage.getItem('attendance_logs')
// 2. Leer localStorage.getItem('users')
// 3. Insertar en PostgreSQL vía Prisma
// 4. Verificar integridad
```

---

## Resumen de Credenciales

| Servicio | Valor |
|----------|-------|
| DB Host | localhost |
| Puerto | 5432 |
| DB Name | asistencia_db |
| Usuario | app_user |
| Contraseña | app_asistencia_2024 |
| JWT Secret | asistencia_jwt_secret_key_2024 |
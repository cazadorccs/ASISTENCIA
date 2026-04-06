-- ============================================================
-- ASISTENCIA APP — Base de Datos PostgreSQL
-- MIPPCI · Torre Corporativa
-- Generado: 2026-04-06
-- Descripción: Esquema completo de la base de datos para el
--              sistema de control de asistencia biométrica.
-- ============================================================

-- ------------------------------------------------------------
-- 0. Extensiones necesarias
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- Para gen_random_uuid()


-- ============================================================
-- 1. TABLA: users
--    Usuarios del sistema con autenticación y roles.
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    name          VARCHAR(255)  NOT NULL,
    role          VARCHAR(50)   NOT NULL
                    CHECK (role IN ('admin', 'gerencia', 'manager', 'seguridad', 'rrhh', 'administracion', 'auditoria', 'empleado')),
    department    VARCHAR(255),
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users             IS 'Usuarios del sistema con acceso a la plataforma ASISTENCIA.';
COMMENT ON COLUMN users.role        IS 'Rol del usuario: admin | seguridad | rrhh | administracion | auditoria | empleado';
COMMENT ON COLUMN users.is_active   IS 'Indica si el usuario puede iniciar sesión. Usar en lugar de borrar registros.';

-- Índices de usuarios
CREATE INDEX IF NOT EXISTS idx_users_email     ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role      ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);


-- ============================================================
-- 2. TABLA: access_points
--    Puntos de acceso biométrico registrados en el edificio.
-- ============================================================
CREATE TABLE IF NOT EXISTS access_points (
    id    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name  VARCHAR(255) NOT NULL,
    area  VARCHAR(255) NOT NULL,
    type  VARCHAR(50)  NOT NULL
            CHECK (type IN ('entrada', 'salida', 'bidireccional'))
);

COMMENT ON TABLE  access_points       IS 'Lectores biométricos ZKTeco u homólogos instalados en el edificio.';
COMMENT ON COLUMN access_points.area  IS 'Zona o piso donde está ubicado el lector (ej: Piso 1, Estacionamiento).';
COMMENT ON COLUMN access_points.type  IS 'Dirección permitida: entrada | salida | bidireccional';

-- Índices de puntos de acceso
CREATE INDEX IF NOT EXISTS idx_access_points_area ON access_points (area);


-- ============================================================
-- 3. TABLA: attendance_logs
--    Registro histórico de cada marcaje biométrico individual.
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance_logs (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID,
    user_name        VARCHAR(255) NOT NULL,
    department       VARCHAR(255),
    timestamp        TIMESTAMPTZ  NOT NULL,
    access_point_id  UUID,
    area             VARCHAR(255) NOT NULL,
    type             VARCHAR(50)  NOT NULL
                       CHECK (type IN ('entrada', 'salida')),
    source           VARCHAR(50)  NOT NULL DEFAULT 'csv_import'
                       CHECK (source IN ('csv_import', 'manual', 'api')),
    temperature      NUMERIC(4,1),
    is_abnormal      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- Relaciones
    CONSTRAINT fk_attendance_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE SET NULL,

    CONSTRAINT fk_attendance_access_point
        FOREIGN KEY (access_point_id)
        REFERENCES access_points (id)
        ON DELETE SET NULL
);

COMMENT ON TABLE  attendance_logs              IS 'Cada fila representa un único marcaje biométrico de entrada o salida.';
COMMENT ON COLUMN attendance_logs.user_id      IS 'FK a users. NULL si el usuario no existe en el sistema (visitante o ID desconocido).';
COMMENT ON COLUMN attendance_logs.user_name    IS 'Nombre capturado desde el CSV, incluso si user_id es NULL.';
COMMENT ON COLUMN attendance_logs.type         IS 'Dirección del marcaje: entrada | salida';
COMMENT ON COLUMN attendance_logs.source       IS 'Origen del registro: csv_import | manual | api';
COMMENT ON COLUMN attendance_logs.temperature  IS 'Temperatura corporal registrada por el lector (si aplica).';
COMMENT ON COLUMN attendance_logs.is_abnormal  IS 'Flag para marcajes detectados como anomalía por el motor de auditoría.';

-- Índices de attendance_logs (críticos para el rendimiento de reportes)
CREATE INDEX IF NOT EXISTS idx_att_timestamp       ON attendance_logs (timestamp);
CREATE INDEX IF NOT EXISTS idx_att_area            ON attendance_logs (area);
CREATE INDEX IF NOT EXISTS idx_att_user_id         ON attendance_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_att_type            ON attendance_logs (type);
CREATE INDEX IF NOT EXISTS idx_att_is_abnormal     ON attendance_logs (is_abnormal);
CREATE INDEX IF NOT EXISTS idx_att_user_timestamp  ON attendance_logs (user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_att_source          ON attendance_logs (source);


-- ============================================================
-- 4. TABLA: cortes
--    Snapshots exportados de reportes analíticos (JSON).
-- ============================================================
CREATE TABLE IF NOT EXISTS cortes (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    type       VARCHAR(50) NOT NULL
                 CHECK (type IN ('evacuacion', 'pre_nomina', 'comedor', 'auditoria', 'visitantes', 'piso')),
    logs       JSONB       NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  cortes       IS 'Snapshots de reportes generados por el sistema. Se guardan como JSONB para trazabilidad.';
COMMENT ON COLUMN cortes.type  IS 'Tipo de reporte: evacuacion | pre_nomina | comedor | auditoria | visitantes | piso';
COMMENT ON COLUMN cortes.logs  IS 'Contenido completo del reporte serializado como JSON en el momento de su generación.';

-- Índices de cortes
CREATE INDEX IF NOT EXISTS idx_cortes_type       ON cortes (type);
CREATE INDEX IF NOT EXISTS idx_cortes_created_at ON cortes (created_at DESC);
-- Índice GIN para búsquedas dentro del JSONB
CREATE INDEX IF NOT EXISTS idx_cortes_logs_gin   ON cortes USING GIN (logs);


-- ============================================================
-- 5. FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger en tabla users
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 6. DATOS SEMILLA — Puntos de acceso iniciales
-- ============================================================
INSERT INTO access_points (id, name, area, type) VALUES
    (gen_random_uuid(), 'Entrada Principal PB',    'Planta Baja',    'entrada'),
    (gen_random_uuid(), 'Salida Principal PB',     'Planta Baja',    'salida'),
    (gen_random_uuid(), 'Control Estacionamiento', 'Estacionamiento','bidireccional'),
    (gen_random_uuid(), 'Ascensor Piso 2',         'Piso 2',         'bidireccional'),
    (gen_random_uuid(), 'Ascensor Piso 3',         'Piso 3',         'bidireccional'),
    (gen_random_uuid(), 'Ascensor Piso 4',         'Piso 4',         'bidireccional'),
    (gen_random_uuid(), 'Ascensor Piso 5',         'Piso 5',         'bidireccional'),
    (gen_random_uuid(), 'Acceso Comedor',          'Comedor',        'bidireccional'),
    (gen_random_uuid(), 'Acceso Sala de Reuniones','Sala Reuniones', 'bidireccional'),
    (gen_random_uuid(), 'Salida Emergencia PB',    'Planta Baja',    'salida')
ON CONFLICT DO NOTHING;


-- ============================================================
-- 7. DATOS SEMILLA — Usuario administrador inicial
--    IMPORTANTE: Cambiar la contraseña tras el primer inicio.
--    Hash bcrypt de: Admin@2026!
-- ============================================================
INSERT INTO users (id, email, password_hash, name, role, department, is_active) VALUES
    (
        gen_random_uuid(),
        'admin@mippci.gob.ve',
        '$2b$10$K9sPz7Kv1lQ3nR5XvYwZt.placeholder_hash_change_on_first_run',
        'Administrador del Sistema',
        'admin',
        'Tecnología e Informática',
        TRUE
    )
ON CONFLICT (email) DO NOTHING;


-- ============================================================
-- 8. VISTAS ÚTILES
-- ============================================================

-- Vista: último estado conocido de cada persona en el edificio
CREATE OR REPLACE VIEW v_estado_actual AS
SELECT DISTINCT ON (user_name)
    user_name,
    department,
    area,
    type       AS ultimo_marcaje,
    timestamp  AS ultima_vez,
    user_id
FROM attendance_logs
ORDER BY user_name, timestamp DESC;

COMMENT ON VIEW v_estado_actual IS
    'Muestra el estado actual de cada persona (dentro/fuera) basándose en su marcaje más reciente.';

-- Vista: personas actualmente dentro del edificio (sin salida registrada)
CREATE OR REPLACE VIEW v_dentro_del_edificio AS
SELECT
    user_name,
    department,
    area,
    ultima_vez,
    user_id
FROM v_estado_actual
WHERE ultimo_marcaje = 'entrada';

COMMENT ON VIEW v_dentro_del_edificio IS
    'Subconjunto de v_estado_actual: solo personas cuyo último marcaje fue una entrada (posiblemente aún en el edificio).';

-- Vista: resumen de asistencia del día actual
CREATE OR REPLACE VIEW v_resumen_hoy AS
SELECT
    DATE(timestamp AT TIME ZONE 'America/Caracas') AS fecha,
    COUNT(*)                                        AS total_marcajes,
    COUNT(DISTINCT user_name)                       AS personas_unicas,
    SUM(CASE WHEN type = 'entrada' THEN 1 ELSE 0 END) AS entradas,
    SUM(CASE WHEN type = 'salida'  THEN 1 ELSE 0 END) AS salidas
FROM attendance_logs
WHERE DATE(timestamp AT TIME ZONE 'America/Caracas') = CURRENT_DATE
GROUP BY 1;

COMMENT ON VIEW v_resumen_hoy IS 'Estadísticas rápidas del día en curso.';


-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================

CREATE DATABASE IF NOT EXISTS sistema_reservas
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE sistema_reservas;

SET time_zone = '+00:00';


CREATE TABLE usuarios (
    id_usuario BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(30),
    fecha_registro DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    estado ENUM('activo', 'inactivo', 'bloqueado') NOT NULL DEFAULT 'activo'
);


CREATE TABLE membresias (
    id_membresia BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_mensual DECIMAL(10,2) NOT NULL,
    duracion_meses INT UNSIGNED NOT NULL DEFAULT 1,
    estado ENUM('activa', 'inactiva') NOT NULL DEFAULT 'activa',

    CHECK (precio_mensual >= 0),
    CHECK (duracion_meses > 0)
);

CREATE TABLE beneficios (
    id_beneficio BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo_beneficio ENUM(
        'descuento',
        'prioridad_reserva',
        'experiencia_exclusiva',
        'combo',
        'otro'
    ) NOT NULL,
    valor DECIMAL(10,2),
    estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',

    CHECK (valor IS NULL OR valor >= 0)
);

CREATE TABLE membresia_beneficios (
    id_membresia BIGINT UNSIGNED NOT NULL,
    id_beneficio BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (id_membresia, id_beneficio),

    FOREIGN KEY (id_membresia)
        REFERENCES membresias(id_membresia),

    FOREIGN KEY (id_beneficio)
        REFERENCES beneficios(id_beneficio)
);

CREATE TABLE suscripciones (
    id_suscripcion BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT UNSIGNED NOT NULL,
    id_membresia BIGINT UNSIGNED NOT NULL,
    fecha_inicio DATETIME(3) NOT NULL,
    fecha_vencimiento DATETIME(3) NOT NULL,
    renovacion_automatica BOOLEAN NOT NULL DEFAULT FALSE,
    estado ENUM(
        'pendiente',
        'activa',
        'vencida',
        'cancelada'
    ) NOT NULL DEFAULT 'pendiente',
    fecha_creacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    FOREIGN KEY (id_membresia)
        REFERENCES membresias(id_membresia),

    CHECK (fecha_vencimiento > fecha_inicio),

    INDEX idx_suscripcion_usuario_estado (id_usuario, estado),
    INDEX idx_suscripcion_vencimiento (fecha_vencimiento)
);


CREATE TABLE sedes (
    id_sede BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    telefono VARCHAR(30),
    zona_horaria VARCHAR(64) NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
    horario_apertura TIME,
    horario_cierre TIME,
    estado ENUM('activa', 'inactiva') NOT NULL DEFAULT 'activa'
);


CREATE TABLE experiencias (
    id_experiencia BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    tematica VARCHAR(150),
    duracion_minutos INT UNSIGNED NOT NULL,
    edad_minima INT UNSIGNED DEFAULT 0,
    es_exclusiva_socios BOOLEAN NOT NULL DEFAULT FALSE,
    estado ENUM('activa', 'inactiva') NOT NULL DEFAULT 'activa',

    CHECK (duracion_minutos > 0)
);

CREATE TABLE experiencias_sedes (
    id_experiencia_sede BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_experiencia BIGINT UNSIGNED NOT NULL,
    id_sede BIGINT UNSIGNED NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    estado ENUM('activa', 'inactiva') NOT NULL DEFAULT 'activa',

    FOREIGN KEY (id_experiencia)
        REFERENCES experiencias(id_experiencia),

    FOREIGN KEY (id_sede)
        REFERENCES sedes(id_sede),

    UNIQUE (id_experiencia, id_sede),

    CHECK (precio >= 0)
);


CREATE TABLE horarios (
    id_horario BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_experiencia_sede BIGINT UNSIGNED NOT NULL,
    fecha_inicio DATETIME(3) NOT NULL,
    fecha_fin DATETIME(3) NOT NULL,
    capacidad_maxima INT UNSIGNED NOT NULL,
    estado ENUM(
        'disponible',
        'completo',
        'cancelado',
        'finalizado'
    ) NOT NULL DEFAULT 'disponible',

    FOREIGN KEY (id_experiencia_sede)
        REFERENCES experiencias_sedes(id_experiencia_sede),

    CHECK (fecha_fin > fecha_inicio),
    CHECK (capacidad_maxima > 0),

    INDEX idx_horario_fecha (fecha_inicio, fecha_fin),
    INDEX idx_horario_experiencia (id_experiencia_sede, fecha_inicio)
);


CREATE TABLE reservas (
    id_reserva BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT UNSIGNED NOT NULL,
    id_horario BIGINT UNSIGNED NOT NULL,
    fecha_reserva DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    cantidad_personas INT UNSIGNED NOT NULL,
    precio_original DECIMAL(10,2) NOT NULL,
    descuento_aplicado DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_final DECIMAL(10,2) NOT NULL,
    estado ENUM(
        'pendiente',
        'confirmada',
        'cancelada',
        'finalizada'
    ) NOT NULL DEFAULT 'pendiente',
    fecha_cancelacion DATETIME(3),

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    FOREIGN KEY (id_horario)
        REFERENCES horarios(id_horario),

    CHECK (cantidad_personas > 0),
    CHECK (precio_original >= 0),
    CHECK (descuento_aplicado >= 0),
    CHECK (precio_final >= 0),

    INDEX idx_reserva_usuario (id_usuario),
    INDEX idx_reserva_horario_estado (id_horario, estado)
);


CREATE TABLE productos (
    id_producto BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    imagen VARCHAR(500),
    estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',

    CHECK (precio >= 0)
);

CREATE TABLE stock (
    id_producto BIGINT UNSIGNED NOT NULL,
    id_sede BIGINT UNSIGNED NOT NULL,
    cantidad_disponible INT UNSIGNED NOT NULL DEFAULT 0,
    ultima_actualizacion DATETIME(3) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (id_producto, id_sede),

    FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto),

    FOREIGN KEY (id_sede)
        REFERENCES sedes(id_sede)
);


CREATE TABLE compras (
    id_compra BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT UNSIGNED NOT NULL,
    fecha_compra DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM(
        'pendiente',
        'pagada',
        'cancelada',
        'reembolsada'
    ) NOT NULL DEFAULT 'pendiente',

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CHECK (subtotal >= 0),
    CHECK (descuento >= 0),
    CHECK (total >= 0),

    INDEX idx_compra_usuario (id_usuario)
);

CREATE TABLE detalle_compra (
    id_detalle BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_compra BIGINT UNSIGNED NOT NULL,
    id_producto BIGINT UNSIGNED NOT NULL,
    cantidad INT UNSIGNED NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (id_compra)
        REFERENCES compras(id_compra),

    FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto),

    CHECK (cantidad > 0),
    CHECK (precio_unitario >= 0),
    CHECK (subtotal >= 0),

    INDEX idx_detalle_compra (id_compra)
);


CREATE TABLE combos (
    id_combo BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    exclusivo_socios BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_inicio DATETIME(3),
    fecha_fin DATETIME(3),
    estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',

    CHECK (precio >= 0),
    CHECK (
        fecha_fin IS NULL
        OR fecha_inicio IS NULL
        OR fecha_fin > fecha_inicio
    )
);

CREATE TABLE detalle_combo (
    id_detalle_combo BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_combo BIGINT UNSIGNED NOT NULL,
    id_producto BIGINT UNSIGNED,
    id_experiencia BIGINT UNSIGNED,
    cantidad INT UNSIGNED NOT NULL DEFAULT 1,

    FOREIGN KEY (id_combo)
        REFERENCES combos(id_combo),

    FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto),

    FOREIGN KEY (id_experiencia)
        REFERENCES experiencias(id_experiencia),

    CHECK (cantidad > 0),

    CHECK (
        (id_producto IS NOT NULL AND id_experiencia IS NULL)
        OR
        (id_producto IS NULL AND id_experiencia IS NOT NULL)
    )
);


CREATE TABLE promociones (
    id_promocion BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    tipo_descuento ENUM('porcentaje', 'monto_fijo') NOT NULL,
    valor_descuento DECIMAL(10,2) NOT NULL,
    fecha_inicio DATETIME(3) NOT NULL,
    fecha_fin DATETIME(3) NOT NULL,
    exclusiva_socios BOOLEAN NOT NULL DEFAULT FALSE,
    estado ENUM('activa', 'inactiva') NOT NULL DEFAULT 'activa',

    CHECK (valor_descuento > 0),
    CHECK (fecha_fin > fecha_inicio)
);

CREATE TABLE promocion_productos (
    id_promocion BIGINT UNSIGNED NOT NULL,
    id_producto BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (id_promocion, id_producto),

    FOREIGN KEY (id_promocion)
        REFERENCES promociones(id_promocion),

    FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
);

CREATE TABLE promocion_experiencias (
    id_promocion BIGINT UNSIGNED NOT NULL,
    id_experiencia BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (id_promocion, id_experiencia),

    FOREIGN KEY (id_promocion)
        REFERENCES promociones(id_promocion),

    FOREIGN KEY (id_experiencia)
        REFERENCES experiencias(id_experiencia)
);

CREATE TABLE promocion_combos (
    id_promocion BIGINT UNSIGNED NOT NULL,
    id_combo BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (id_promocion, id_combo),

    FOREIGN KEY (id_promocion)
        REFERENCES promociones(id_promocion),

    FOREIGN KEY (id_combo)
        REFERENCES combos(id_combo)
);

CREATE TABLE reserva_promociones (
    id_reserva BIGINT UNSIGNED NOT NULL,
    id_promocion BIGINT UNSIGNED NOT NULL,
    monto_descuento DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (id_reserva, id_promocion),

    FOREIGN KEY (id_reserva)
        REFERENCES reservas(id_reserva),

    FOREIGN KEY (id_promocion)
        REFERENCES promociones(id_promocion),

    CHECK (monto_descuento >= 0)
);

CREATE TABLE compra_promociones (
    id_compra BIGINT UNSIGNED NOT NULL,
    id_promocion BIGINT UNSIGNED NOT NULL,
    monto_descuento DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (id_compra, id_promocion),

    FOREIGN KEY (id_compra)
        REFERENCES compras(id_compra),

    FOREIGN KEY (id_promocion)
        REFERENCES promociones(id_promocion),

    CHECK (monto_descuento >= 0)
);


CREATE TABLE accesos_preventa (
    id_acceso BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_experiencia BIGINT UNSIGNED NOT NULL,
    fecha_inicio_preventa DATETIME(3) NOT NULL,
    fecha_fin_preventa DATETIME(3) NOT NULL,
    fecha_inicio_publico DATETIME(3) NOT NULL,
    estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',

    FOREIGN KEY (id_experiencia)
        REFERENCES experiencias(id_experiencia),

    CHECK (fecha_fin_preventa > fecha_inicio_preventa),
    CHECK (fecha_inicio_publico >= fecha_fin_preventa),

    INDEX idx_preventa_fechas (
        fecha_inicio_preventa,
        fecha_inicio_publico
    )
);


CREATE TABLE pagos (
    id_pago BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_reserva BIGINT UNSIGNED,
    id_compra BIGINT UNSIGNED,
    id_suscripcion BIGINT UNSIGNED,
    id_transaccion_externa VARCHAR(255) UNIQUE,
    plataforma VARCHAR(100) NOT NULL,
    metodo_pago VARCHAR(100),
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago DATETIME(3),
    fecha_creacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    estado ENUM(
        'pendiente',
        'aprobado',
        'rechazado',
        'reembolsado'
    ) NOT NULL DEFAULT 'pendiente',

    FOREIGN KEY (id_reserva)
        REFERENCES reservas(id_reserva),

    FOREIGN KEY (id_compra)
        REFERENCES compras(id_compra),

    FOREIGN KEY (id_suscripcion)
        REFERENCES suscripciones(id_suscripcion),

    CHECK (monto >= 0),

    CHECK (
        (id_reserva IS NOT NULL AND id_compra IS NULL AND id_suscripcion IS NULL)
        OR
        (id_reserva IS NULL AND id_compra IS NOT NULL AND id_suscripcion IS NULL)
        OR
        (id_reserva IS NULL AND id_compra IS NULL AND id_suscripcion IS NOT NULL)
    ),

    INDEX idx_pago_estado (estado),
    INDEX idx_pago_fecha (fecha_pago)
);


CREATE TABLE notificaciones (
    id_notificacion BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT UNSIGNED NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo ENUM(
        'reserva',
        'pago',
        'membresia',
        'promocion',
        'recordatorio',
        'otro'
    ) NOT NULL,
    fecha_creacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    fecha_envio DATETIME(3),
    estado ENUM(
        'pendiente',
        'enviada',
        'leida',
        'fallida'
    ) NOT NULL DEFAULT 'pendiente',

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    INDEX idx_notificacion_usuario (id_usuario, estado)
);

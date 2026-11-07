import os, textwrap, zipfile, json

base = "/mnt/data/backend_sistema_reservas"
os.makedirs(base + "/src/config", exist_ok=True)
os.makedirs(base + "/src/middleware", exist_ok=True)
os.makedirs(base + "/src/routes", exist_ok=True)
os.makedirs(base + "/src/utils", exist_ok=True)
os.makedirs(base + "/sql", exist_ok=True)

files = {
"package.json": r'''
{
  "name": "backend-sistema-reservas",
  "version": "1.0.0",
  "private": true,
  "description": "API REST para un sistema de reservas de experiencias inmersivas",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "express-rate-limit": "^7.5.0",
    "helmet": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.12.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.9"
  }
}
''',
".env.example": r'''
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=sistema_reservas

JWT_SECRET=cambiar_por_una_clave_larga_y_aleatoria
JWT_EXPIRES_IN=8h

CORS_ORIGIN=http://localhost:5173
RESERVA_PENDIENTE_MINUTOS=15

# Completar cuando se elija la plataforma de pagos.
PAYMENT_PROVIDER=
PAYMENT_API_KEY=
PAYMENT_WEBHOOK_SECRET=
''',
".gitignore": r'''
node_modules/
.env
npm-debug.log
''',
"src/config/db.js": r'''
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z",
  dateStrings: true,
  decimalNumbers: true
});

module.exports = pool;
''',
"src/utils/httpError.js": r'''
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = HttpError;
''',
"src/middleware/auth.js": r'''
const jwt = require("jsonwebtoken");
const HttpError = require("../utils/httpError");

function autenticar(req, res, next) {
  const header = req.headers.authorization || "";
  const [tipo, token] = header.split(" ");

  if (tipo !== "Bearer" || !token) {
    return next(new HttpError(401, "Debes iniciar sesión."));
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new HttpError(401, "El token es inválido o venció."));
  }
}

module.exports = { autenticar };
''',
"src/routes/auth.js": r'''
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const HttpError = require("../utils/httpError");
const { autenticar } = require("../middleware/auth");

const router = express.Router();

router.post("/registro", async (req, res, next) => {
  try {
    const { nombre, apellido, email, contrasena, telefono } = req.body;

    if (!nombre || !apellido || !email || !contrasena) {
      throw new HttpError(400, "Nombre, apellido, email y contraseña son obligatorios.");
    }
    if (String(contrasena).length < 8) {
      throw new HttpError(400, "La contraseña debe tener al menos 8 caracteres.");
    }

    const [existentes] = await pool.execute(
      "SELECT id_usuario FROM usuarios WHERE email = ? LIMIT 1",
      [String(email).trim().toLowerCase()]
    );
    if (existentes.length) throw new HttpError(409, "Ya existe una cuenta con ese email.");

    const hash = await bcrypt.hash(contrasena, 12);
    const [resultado] = await pool.execute(
      `INSERT INTO usuarios (nombre, apellido, email, contrasena, telefono)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre.trim(), apellido.trim(), String(email).trim().toLowerCase(), hash, telefono || null]
    );

    res.status(201).json({
      mensaje: "Usuario registrado correctamente.",
      id_usuario: resultado.insertId
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, contrasena } = req.body;
    if (!email || !contrasena) throw new HttpError(400, "Email y contraseña son obligatorios.");

    const [usuarios] = await pool.execute(
      `SELECT id_usuario, nombre, apellido, email, contrasena, estado
       FROM usuarios WHERE email = ? LIMIT 1`,
      [String(email).trim().toLowerCase()]
    );

    if (!usuarios.length) throw new HttpError(401, "Credenciales incorrectas.");
    const usuario = usuarios[0];

    const valida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!valida || usuario.estado !== "activo") {
      throw new HttpError(401, "Credenciales incorrectas o cuenta inactiva.");
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({
      mensaje: "Inicio de sesión correcto.",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/perfil", autenticar, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id_usuario, nombre, apellido, email, telefono, fecha_registro
       FROM usuarios WHERE id_usuario = ?`,
      [req.usuario.id_usuario]
    );
    if (!rows.length) throw new HttpError(404, "Usuario no encontrado.");
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
''',
"src/routes/catalogo.js": r'''
const express = require("express");
const pool = require("../config/db");
const HttpError = require("../utils/httpError");

const router = express.Router();

router.get("/sedes", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id_sede, nombre, direccion, ciudad, telefono, zona_horaria,
              horario_apertura, horario_cierre
       FROM sedes WHERE estado = 'activa'
       ORDER BY nombre`
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get("/experiencias", async (req, res, next) => {
  try {
    const { id_sede } = req.query;
    let sql = `
      SELECT e.id_experiencia, e.nombre, e.descripcion, e.tematica,
             e.duracion_minutos, e.edad_minima, e.es_exclusiva_socios,
             es.id_sede, s.nombre AS sede, es.id_experiencia_sede, es.precio
      FROM experiencias e
      JOIN experiencias_sedes es ON es.id_experiencia = e.id_experiencia
      JOIN sedes s ON s.id_sede = es.id_sede
      WHERE e.estado = 'activa' AND es.estado = 'activa' AND s.estado = 'activa'
    `;
    const params = [];
    if (id_sede) {
      if (!Number.isInteger(Number(id_sede))) throw new HttpError(400, "id_sede inválido.");
      sql += " AND es.id_sede = ?";
      params.push(Number(id_sede));
    }
    sql += " ORDER BY e.nombre, s.nombre";

    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get("/horarios/:idExperienciaSede", async (req, res, next) => {
  try {
    const id = Number(req.params.idExperienciaSede);
    if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Identificador inválido.");

    const [rows] = await pool.execute(
      `SELECT h.id_horario, h.fecha_inicio, h.fecha_fin,
              h.capacidad_maxima,
              h.capacidad_maxima - COALESCE(SUM(
                CASE
                  WHEN r.estado = 'confirmada'
                    OR (r.estado = 'pendiente' AND r.fecha_expiracion > UTC_TIMESTAMP(3))
                  THEN r.cantidad_personas
                  ELSE 0
                END
              ), 0) AS cupos_disponibles,
              s.zona_horaria
       FROM horarios h
       JOIN experiencias_sedes es ON es.id_experiencia_sede = h.id_experiencia_sede
       JOIN sedes s ON s.id_sede = es.id_sede
       LEFT JOIN reservas r ON r.id_horario = h.id_horario
       WHERE h.id_experiencia_sede = ?
         AND h.estado = 'disponible'
         AND h.fecha_inicio > UTC_TIMESTAMP(3)
       GROUP BY h.id_horario, h.fecha_inicio, h.fecha_fin,
                h.capacidad_maxima, s.zona_horaria
       HAVING cupos_disponibles > 0
       ORDER BY h.fecha_inicio`,
      [id]
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
''',
"src/routes/reservas.js": r'''
const express = require("express");
const pool = require("../config/db");
const HttpError = require("../utils/httpError");
const { autenticar } = require("../middleware/auth");

const router = express.Router();

router.use(autenticar);

async function tieneMembresiaActiva(conn, idUsuario) {
  const [rows] = await conn.execute(
    `SELECT s.id_suscripcion
     FROM suscripciones s
     WHERE s.id_usuario = ?
       AND s.estado = 'activa'
       AND s.fecha_inicio <= UTC_TIMESTAMP(3)
       AND s.fecha_vencimiento > UTC_TIMESTAMP(3)
     ORDER BY s.fecha_vencimiento DESC
     LIMIT 1`,
    [idUsuario]
  );
  return rows.length > 0;
}

router.post("/", async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const idUsuario = req.usuario.id_usuario;
    const idHorario = Number(req.body.id_horario);
    const cantidad = Number(req.body.cantidad_personas);

    if (!Number.isInteger(idHorario) || idHorario <= 0 ||
        !Number.isInteger(cantidad) || cantidad <= 0) {
      throw new HttpError(400, "Debes indicar un horario y una cantidad de personas válidos.");
    }

    await conn.beginTransaction();

    const [horarios] = await conn.execute(
      `SELECT h.id_horario, h.fecha_inicio, h.fecha_fin, h.capacidad_maxima,
              es.precio, e.id_experiencia, e.es_exclusiva_socios,
              e.estado AS estado_experiencia, es.estado AS estado_experiencia_sede
       FROM horarios h
       JOIN experiencias_sedes es ON es.id_experiencia_sede = h.id_experiencia_sede
       JOIN experiencias e ON e.id_experiencia = es.id_experiencia
       WHERE h.id_horario = ?
       FOR UPDATE`,
      [idHorario]
    );

    if (!horarios.length) throw new HttpError(404, "Horario no encontrado.");
    const horario = horarios[0];

    if (horario.estado_experiencia !== "activa" ||
        horario.estado_experiencia_sede !== "activa") {
      throw new HttpError(409, "La experiencia no está disponible.");
    }

    const [estadoHorario] = await conn.execute(
      "SELECT estado FROM horarios WHERE id_horario = ?",
      [idHorario]
    );
    if (estadoHorario[0].estado !== "disponible") {
      throw new HttpError(409, "El horario no está disponible.");
    }

    const [futuro] = await conn.execute(
      "SELECT ( ? > UTC_TIMESTAMP(3) ) AS es_futuro",
      [horario.fecha_inicio]
    );
    if (!futuro[0].es_futuro) throw new HttpError(409, "No se puede reservar un horario que ya comenzó.");

    const esSocio = await tieneMembresiaActiva(conn, idUsuario);
    if (horario.es_exclusiva_socios && !esSocio) {
      throw new HttpError(403, "Esta experiencia es exclusiva para socios.");
    }

    const [ocupacion] = await conn.execute(
      `SELECT COALESCE(SUM(cantidad_personas), 0) AS ocupados
       FROM reservas
       WHERE id_horario = ?
         AND (
           estado = 'confirmada'
           OR (estado = 'pendiente' AND fecha_expiracion > UTC_TIMESTAMP(3))
         )`,
      [idHorario]
    );

    const disponibles = Number(horario.capacidad_maxima) - Number(ocupacion[0].ocupados);
    if (cantidad > disponibles) {
      throw new HttpError(409, `No hay suficientes cupos. Disponibles: ${Math.max(0, disponibles)}.`);
    }

    let descuento = 0;
    if (esSocio) {
      const [beneficios] = await conn.execute(
        `SELECT MAX(b.valor) AS porcentaje
         FROM suscripciones s
         JOIN membresia_beneficios mb ON mb.id_membresia = s.id_membresia
         JOIN beneficios b ON b.id_beneficio = mb.id_beneficio
         WHERE s.id_usuario = ?
           AND s.estado = 'activa'
           AND s.fecha_inicio <= UTC_TIMESTAMP(3)
           AND s.fecha_vencimiento > UTC_TIMESTAMP(3)
           AND b.estado = 'activo'
           AND b.tipo_beneficio = 'descuento'`,
        [idUsuario]
      );
      const porcentaje = Math.max(0, Math.min(100, Number(beneficios[0].porcentaje || 0)));
      descuento = Number((Number(horario.precio) * cantidad * porcentaje / 100).toFixed(2));
    }

    const original = Number((Number(horario.precio) * cantidad).toFixed(2));
    const final = Number((original - descuento).toFixed(2));
    const minutos = Math.max(1, Number(process.env.RESERVA_PENDIENTE_MINUTOS || 15));

    const [insert] = await conn.execute(
      `INSERT INTO reservas
       (id_usuario, id_horario, cantidad_personas, precio_original,
        descuento_aplicado, precio_final, estado, fecha_expiracion)
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente',
               DATE_ADD(UTC_TIMESTAMP(3), INTERVAL ? MINUTE))`,
      [idUsuario, idHorario, cantidad, original, descuento, final, minutos]
    );

    await conn.commit();

    res.status(201).json({
      mensaje: "Reserva creada. Está pendiente de pago.",
      id_reserva: insert.insertId,
      estado: "pendiente",
      precio_original: original,
      descuento_aplicado: descuento,
      precio_final: final,
      fecha_expiracion_minutos: minutos,
      siguiente_paso: "Iniciar el pago mediante la plataforma externa configurada."
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
});

router.get("/mis-reservas", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT r.id_reserva, r.fecha_reserva, r.cantidad_personas,
              r.precio_original, r.descuento_aplicado, r.precio_final,
              r.estado, r.fecha_expiracion,
              h.fecha_inicio, h.fecha_fin,
              e.nombre AS experiencia, s.nombre AS sede,
              s.zona_horaria
       FROM reservas r
       JOIN horarios h ON h.id_horario = r.id_horario
       JOIN experiencias_sedes es ON es.id_experiencia_sede = h.id_experiencia_sede
       JOIN experiencias e ON e.id_experiencia = es.id_experiencia
       JOIN sedes s ON s.id_sede = es.id_sede
       WHERE r.id_usuario = ?
       ORDER BY r.fecha_reserva DESC`,
      [req.usuario.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/cancelar", async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const idReserva = Number(req.params.id);
    if (!Number.isInteger(idReserva) || idReserva <= 0) {
      throw new HttpError(400, "Identificador de reserva inválido.");
    }

    await conn.beginTransaction();

    const [rows] = await conn.execute(
      `SELECT r.id_reserva, r.estado, h.fecha_inicio
       FROM reservas r
       JOIN horarios h ON h.id_horario = r.id_horario
       WHERE r.id_reserva = ? AND r.id_usuario = ?
       FOR UPDATE`,
      [idReserva, req.usuario.id_usuario]
    );

    if (!rows.length) throw new HttpError(404, "Reserva no encontrada.");
    if (!["pendiente", "confirmada"].includes(rows[0].estado)) {
      throw new HttpError(409, "La reserva no se puede cancelar.");
    }

    const [fecha] = await conn.execute(
      "SELECT (? > UTC_TIMESTAMP(3)) AS es_futuro",
      [rows[0].fecha_inicio]
    );
    if (!fecha[0].es_futuro) throw new HttpError(409, "No se puede cancelar una reserva cuyo horario ya comenzó.");

    await conn.execute(
      `UPDATE reservas
       SET estado = 'cancelada', fecha_cancelacion = UTC_TIMESTAMP(3)
       WHERE id_reserva = ?`,
      [idReserva]
    );

    await conn.commit();
    res.json({ mensaje: "Reserva cancelada correctamente." });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
});

module.exports = router;
''',
"src/routes/pagos.js": r'''
const express = require("express");
const pool = require("../config/db");
const HttpError = require("../utils/httpError");
const { autenticar } = require("../middleware/auth");

const router = express.Router();

router.use(autenticar);

/*
  Este endpoint informa el estado de un pago perteneciente al usuario.
  La creación del checkout y la confirmación definitiva deben implementarse
  con el SDK y el webhook firmado de la plataforma elegida.
*/
router.get("/:id/estado", async (req, res, next) => {
  try {
    const idPago = Number(req.params.id);
    if (!Number.isInteger(idPago) || idPago <= 0) {
      throw new HttpError(400, "Identificador de pago inválido.");
    }

    const [rows] = await pool.execute(
      `SELECT p.id_pago, p.plataforma, p.monto, p.fecha_pago, p.estado,
              p.id_reserva, p.id_compra, p.id_suscripcion
       FROM pagos p
       LEFT JOIN reservas r ON r.id_reserva = p.id_reserva
       LEFT JOIN compras c ON c.id_compra = p.id_compra
       LEFT JOIN suscripciones s ON s.id_suscripcion = p.id_suscripcion
       WHERE p.id_pago = ?
         AND (
           r.id_usuario = ?
           OR c.id_usuario = ?
           OR s.id_usuario = ?
         )
       LIMIT 1`,
      [idPago, req.usuario.id_usuario, req.usuario.id_usuario, req.usuario.id_usuario]
    );

    if (!rows.length) throw new HttpError(404, "Pago no encontrado.");
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
''',
"src/server.js": r'''
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const pool = require("./config/db");
const HttpError = require("./utils/httpError");

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map(x => x.trim())
    : false
}));
app.use(express.json({ limit: "1mb" }));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false
}));

app.get("/api/salud", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT UTC_TIMESTAMP(3) AS hora_utc, @@session.time_zone AS zona_sesion"
    );
    res.json({
      estado: "ok",
      servicio: "backend-sistema-reservas",
      base_de_datos: "conectada",
      reloj: rows[0]
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/catalogo", require("./routes/catalogo"));
app.use("/api/reservas", require("./routes/reservas"));
app.use("/api/pagos", require("./routes/pagos"));

app.use((req, res, next) => {
  next(new HttpError(404, "Ruta no encontrada."));
});

app.use((error, req, res, next) => {
  console.error(error);
  const status = error.status || (error.code === "ER_DUP_ENTRY" ? 409 : 500);
  const message = error.status
    ? error.message
    : error.code === "ER_DUP_ENTRY"
      ? "El registro ya existe."
      : "Ocurrió un error interno.";

  res.status(status).json({ error: message });
});

const port = Number(process.env.PORT || 3000);

async function iniciar() {
  try {
    await pool.query("SELECT 1");
    app.listen(port, () => {
      console.log(`Backend escuchando en http://localhost:${port}`);
    });
  } catch (error) {
    console.error("No se pudo conectar con MySQL:", error.message);
    process.exit(1);
  }
}

iniciar();
''',
"sql/01_migracion_reservas.sql": r'''
USE sistema_reservas;

-- Ejecutar una sola vez sobre la base creada con el SQL anterior.
ALTER TABLE reservas
    ADD COLUMN fecha_expiracion DATETIME(3) NULL AFTER fecha_cancelacion;

-- Las reservas pendientes existentes no deben retener cupos indefinidamente.
UPDATE reservas
SET fecha_expiracion = DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 15 MINUTE)
WHERE estado = 'pendiente'
  AND fecha_expiracion IS NULL;

-- Las reservas no pendientes no necesitan vencimiento.
UPDATE reservas
SET fecha_expiracion = NULL
WHERE estado <> 'pendiente';

CREATE INDEX idx_reservas_expiracion
    ON reservas (estado, fecha_expiracion, id_horario);
''',
"README.md": r'''
# Backend - Sistema de Reservas

API REST desarrollada con Node.js, Express y MySQL 8.

## Requisitos

- Node.js 18 o superior.
- MySQL 8.0.
- La base `sistema_reservas` creada con el script SQL del proyecto.

## Instalación

1. Abrir una terminal en la carpeta del proyecto.
2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Copiar `.env.example` como `.env`.
4. Completar los datos de conexión MySQL y definir un `JWT_SECRET` largo y aleatorio.
5. Ejecutar la migración:

   ```bash
   mysql -u root -p sistema_reservas < sql/01_migracion_reservas.sql
   ```

6. Iniciar el servidor:

   ```bash
   npm run dev
   ```

El servidor queda disponible en `http://localhost:3000`.

## Endpoints

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| GET | `/api/salud` | Estado de API, MySQL y reloj UTC | No |
| POST | `/api/auth/registro` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/perfil` | Consultar perfil | Sí |
| GET | `/api/catalogo/sedes` | Listar sedes activas | No |
| GET | `/api/catalogo/experiencias` | Listar experiencias; admite `?id_sede=1` | No |
| GET | `/api/catalogo/horarios/:idExperienciaSede` | Horarios y cupos disponibles | No |
| POST | `/api/reservas` | Crear reserva pendiente | Sí |
| GET | `/api/reservas/mis-reservas` | Listar reservas propias | Sí |
| PATCH | `/api/reservas/:id/cancelar` | Cancelar reserva propia | Sí |
| GET | `/api/pagos/:id/estado` | Consultar estado de pago propio | Sí |

## Ejemplos

### Registro

`POST /api/auth/registro`

```json
{
  "nombre": "Ana",
  "apellido": "Pérez",
  "email": "ana@example.com",
  "contrasena": "una-clave-segura",
  "telefono": "1122334455"
}
```

### Login

`POST /api/auth/login`

```json
{
  "email": "ana@example.com",
  "contrasena": "una-clave-segura"
}
```

Usar el token devuelto en las rutas protegidas:

`Authorization: Bearer TOKEN`

### Crear reserva

`POST /api/reservas`

```json
{
  "id_horario": 1,
  "cantidad_personas": 2
}
```

La reserva queda `pendiente` durante los minutos definidos en `RESERVA_PENDIENTE_MINUTOS`.
La reserva bloquea cupos mientras no expire. La confirmación final depende de la notificación
firmada de la plataforma de pagos.

## Tiempo y zonas horarias

- La sesión MySQL se configura en UTC.
- Los momentos de operación se generan con `UTC_TIMESTAMP(3)`.
- `fecha_inicio` y `fecha_fin` de `horarios` se almacenan como instantes UTC.
- `sedes.zona_horaria` identifica la zona IANA para presentar horarios locales.
- La aplicación cliente debe enviar fechas ISO 8601 con offset cuando cree o administre horarios.

## Reglas y límites de esta primera versión

- Las contraseñas se guardan con hash bcrypt.
- La autenticación usa JWT.
- La creación de reservas bloquea el registro del horario con `FOR UPDATE` y usa una transacción.
- Se valida la membresía activa para experiencias exclusivas.
- Si existe un beneficio activo de tipo `descuento`, su `valor` se interpreta como porcentaje.
- La API no confirma pagos por sí misma. Falta elegir la plataforma (por ejemplo, Mercado Pago),
  implementar su checkout y validar su webhook con firma. Nunca se debe confiar en un estado
  de pago enviado directamente por el navegador.
- No se implementaron todavía permisos de administrador porque el esquema actual no contiene
  roles ni usuarios administrativos.
- La cancelación cambia el estado de la reserva; las políticas de reembolso deben integrarse
  con la plataforma de pagos.

## Importante sobre vencimiento de reservas pendientes

Esta versión calcula la disponibilidad ignorando reservas pendientes cuyo `fecha_expiracion`
ya pasó. Para liberar físicamente esas reservas y reflejar el estado `cancelada`, se debe
incorporar un proceso programado o una tarea de limpieza. No afecta al cálculo de cupos.
'''
}

for path, content in files.items():
    with open(os.path.join(base, path), "w", encoding="utf-8") as f:
        f.write(textwrap.dedent(content).lstrip())

zip_path = "/mnt/data/backend_sistema_reservas.zip"
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, filenames in os.walk(base):
        for filename in filenames:
            full = os.path.join(root, filename)
            arc = os.path.relpath(full, base)
            z.write(full, os.path.join("backend_sistema_reservas", arc))

print("Proyecto creado:", zip_path)
print("Archivos:")
for root, dirs, filenames in os.walk(base):
    for filename in filenames:
        print(os.path.relpath(os.path.join(root, filename), base))

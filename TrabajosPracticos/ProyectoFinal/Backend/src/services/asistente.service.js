
import OpenAI from "openai";
import pool from "../config/database.js";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function responderAsistente(mensaje) {
    const [experiencias] = await pool.execute(`
        SELECT
            e.nombre,
            e.descripcion,
            e.tematica,
            e.duracion_minutos,
            e.edad_minima,
            e.es_exclusiva_socios,
            es.precio,
            s.nombre AS sede,
            s.ciudad
        FROM experiencias e
        INNER JOIN experiencias_sedes es
            ON es.id_experiencia = e.id_experiencia
        INNER JOIN sedes s
            ON s.id_sede = es.id_sede
        WHERE e.estado = 'activa'
        AND es.estado = 'activa'
        AND s.estado = 'activa'
    `);

    const [horarios] = await pool.execute(`
        SELECT
            e.nombre AS experiencia,
            s.nombre AS sede,
            h.fecha_inicio,
            h.fecha_fin,
            h.capacidad_maxima -
                COALESCE(r.ocupados, 0) AS cupos_disponibles
        FROM horarios h
        INNER JOIN experiencias_sedes es
            ON es.id_experiencia_sede = h.id_experiencia_sede
        INNER JOIN experiencias e
            ON e.id_experiencia = es.id_experiencia
        INNER JOIN sedes s
            ON s.id_sede = es.id_sede
        LEFT JOIN (
            SELECT
                id_horario,
                SUM(cantidad_personas) AS ocupados
            FROM reservas
            WHERE estado = 'confirmada'
            OR (
                estado = 'pendiente'
                AND fecha_expiracion > NOW(3)
            )
            GROUP BY id_horario
        ) r ON r.id_horario = h.id_horario
        WHERE h.estado = 'disponible'
        AND h.fecha_inicio > NOW(3)
        ORDER BY h.fecha_inicio
        LIMIT 100
    `);

    const contexto = {
        experiencias,
        horarios
    };

    const response = await openai.responses.create({
        model: process.env.OPENAI_MODEL,
        instructions: `
Sos el asistente virtual oficial de Umbral.

Tu función es ayudar a los visitantes a conocer experiencias,
sedes, horarios, precios y disponibilidad.

REGLAS:
- Respondé siempre en español.
- Utilizá únicamente los datos del contexto.
- Nunca inventes precios, horarios, cupos ni experiencias.
- Si un dato no está disponible, indicá que no tenés esa información.
- No confirmes reservas ni pagos.
- Para reservar, indicá que el visitante debe utilizar el sistema.
- No solicites contraseñas ni datos de tarjetas.
- Derivá las consultas administrativas complejas al personal.
        `,
        input: `
DATOS ACTUALES:
${JSON.stringify(contexto, null, 2)}

CONSULTA:
${mensaje}
        `
    });

    return response.output_text;
}

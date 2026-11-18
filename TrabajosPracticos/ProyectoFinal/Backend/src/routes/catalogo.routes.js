
import { Router } from "express";
import pool from "../config/database.js";

const router = Router();

router.get("/experiencias", async (req, res, next) => {
    try {
        const [experiencias] = await pool.execute(`
            SELECT
                e.id_experiencia,
                e.nombre,
                e.descripcion,
                e.tematica,
                e.duracion_minutos,
                e.edad_minima,
                e.es_exclusiva_socios,
                es.id_experiencia_sede,
                es.precio,
                s.id_sede,
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
            ORDER BY e.nombre
        `);

        res.json(experiencias);
    } catch (error) {
        next(error);
    }
});

router.get("/sedes", async (req, res, next) => {
    try {
        const [sedes] = await pool.execute(`
            SELECT *
            FROM sedes
            WHERE estado = 'activa'
            ORDER BY ciudad, nombre
        `);

        res.json(sedes);
    } catch (error) {
        next(error);
    }
});

router.get("/horarios/:idExperienciaSede", async (req, res, next) => {
    try {
        const [horarios] = await pool.execute(`
            SELECT
                h.id_horario,
                h.fecha_inicio,
                h.fecha_fin,
                h.capacidad_maxima,
                h.estado,
                h.capacidad_maxima -
                    COALESCE(r.ocupados, 0) AS cupos_disponibles
            FROM horarios h
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
            WHERE h.id_experiencia_sede = ?
            AND h.estado = 'disponible'
            AND h.fecha_inicio > NOW(3)
            ORDER BY h.fecha_inicio
        `, [req.params.idExperienciaSede]);

        res.json(horarios);
    } catch (error) {
        next(error);
    }
});

router.get("/productos", async (req, res, next) => {
    try {
        const [productos] = await pool.execute(`
            SELECT id_producto, nombre, descripcion, precio, imagen
            FROM productos
            WHERE estado = 'activo'
            ORDER BY nombre
        `);

        res.json(productos);
    } catch (error) {
        next(error);
    }
});

export default router;

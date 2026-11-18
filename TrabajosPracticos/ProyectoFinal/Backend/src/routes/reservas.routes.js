
import { Router } from "express";
import pool from "../config/database.js";
import { verificarToken } from "../middleware/auth.js";

const router = Router();

router.post("/", verificarToken, async (req, res, next) => {
    const conexion = await pool.getConnection();

    try {
        const { id_horario, cantidad_personas } = req.body;
        const id_usuario = req.usuario.id;

        if (!id_horario ||
            !Number.isInteger(cantidad_personas) ||
            cantidad_personas < 1) {
            return res.status(400).json({
                error: "Datos de reserva inválidos."
            });
        }

        await conexion.beginTransaction();

        const [horarios] = await conexion.execute(`
            SELECT
                h.id_horario,
                h.capacidad_maxima,
                h.fecha_inicio,
                h.estado,
                es.precio,
                e.es_exclusiva_socios
            FROM horarios h
            INNER JOIN experiencias_sedes es
                ON es.id_experiencia_sede = h.id_experiencia_sede
            INNER JOIN experiencias e
                ON e.id_experiencia = es.id_experiencia
            WHERE h.id_horario = ?
            FOR UPDATE
        `, [id_horario]);

        if (!horarios.length) {
            await conexion.rollback();

            return res.status(404).json({
                error: "Horario no encontrado."
            });
        }

        const horario = horarios[0];

        if (horario.estado !== "disponible" ||
            new Date(horario.fecha_inicio) <= new Date()) {
            await conexion.rollback();

            return res.status(409).json({
                error: "Horario no disponible."
            });
        }

        const [ocupacion] = await conexion.execute(`
            SELECT COALESCE(SUM(cantidad_personas), 0) AS ocupados
            FROM reservas
            WHERE id_horario = ?
            AND (
                estado = 'confirmada'
                OR (
                    estado = 'pendiente'
                    AND fecha_expiracion > NOW(3)
                )
            )
        `, [id_horario]);

        const disponibles = Number(horario.capacidad_maxima) -
            Number(ocupacion[0].ocupados);

        if (cantidad_personas > disponibles) {
            await conexion.rollback();

            return res.status(409).json({
                error: "No hay suficientes cupos disponibles.",
                cupos_disponibles: disponibles
            });
        }

        const [membresias] = await conexion.execute(`
            SELECT id_suscripcion
            FROM suscripciones
            WHERE id_usuario = ?
            AND estado = 'activa'
            AND fecha_inicio <= NOW(3)
            AND fecha_vencimiento > NOW(3)
            LIMIT 1
        `, [id_usuario]);

        if (horario.es_exclusiva_socios && !membresias.length) {
            await conexion.rollback();

            return res.status(403).json({
                error: "Experiencia exclusiva para socios."
            });
        }

        const precio = Number(horario.precio) * cantidad_personas;

        const [resultado] = await conexion.execute(`
            INSERT INTO reservas (
                id_usuario,
                id_horario,
                cantidad_personas,
                precio_original,
                descuento_aplicado,
                precio_final,
                estado,
                fecha_expiracion
            )
            VALUES (?, ?, ?, ?, 0, ?, 'pendiente',
                    DATE_ADD(NOW(3), INTERVAL 15 MINUTE))
        `, [
            id_usuario,
            id_horario,
            cantidad_personas,
            precio,
            precio
        ]);

        await conexion.commit();

        res.status(201).json({
            mensaje: "Reserva creada.",
            id_reserva: resultado.insertId,
            precio_original: precio,
            descuento_aplicado: 0,
            precio_final: precio,
            estado: "pendiente",
            minutos_para_pagar: 15
        });
    } catch (error) {
        await conexion.rollback();
        next(error);
    } finally {
        conexion.release();
    }
});

router.get("/mis-reservas", verificarToken, async (req, res, next) => {
    try {
        const [reservas] = await pool.execute(`
            SELECT
                r.id_reserva,
                r.fecha_reserva,
                r.cantidad_personas,
                r.precio_original,
                r.descuento_aplicado,
                r.precio_final,
                r.estado,
                h.fecha_inicio,
                h.fecha_fin,
                e.nombre AS experiencia,
                s.nombre AS sede
            FROM reservas r
            INNER JOIN horarios h
                ON h.id_horario = r.id_horario
            INNER JOIN experiencias_sedes es
                ON es.id_experiencia_sede = h.id_experiencia_sede
            INNER JOIN experiencias e
                ON e.id_experiencia = es.id_experiencia
            INNER JOIN sedes s
                ON s.id_sede = es.id_sede
            WHERE r.id_usuario = ?
            ORDER BY r.fecha_reserva DESC
        `, [req.usuario.id]);

        res.json(reservas);
    } catch (error) {
        next(error);
    }
});

router.patch("/:id/cancelar", verificarToken, async (req, res, next) => {
    try {
        const [resultado] = await pool.execute(`
            UPDATE reservas
            SET estado = 'cancelada',
                fecha_cancelacion = NOW(3)
            WHERE id_reserva = ?
            AND id_usuario = ?
            AND estado IN ('pendiente', 'confirmada')
        `, [req.params.id, req.usuario.id]);

        if (!resultado.affectedRows) {
            return res.status(404).json({
                error: "Reserva no encontrada o no cancelable."
            });
        }

        res.json({
            mensaje: "Reserva cancelada."
        });
    } catch (error) {
        next(error);
    }
});

export default router;


import { Router } from "express";
import pool from "../config/database.js";
import { verificarToken } from "../middleware/auth.js";

const router = Router();

router.post("/reserva/:idReserva", verificarToken, async (req, res, next) => {
    try {
        const [reservas] = await pool.execute(`
            SELECT id_reserva, precio_final, estado, fecha_expiracion
            FROM reservas
            WHERE id_reserva = ?
            AND id_usuario = ?
        `, [req.params.idReserva, req.usuario.id]);

        if (!reservas.length) {
            return res.status(404).json({
                error: "Reserva no encontrada."
            });
        }

        const reserva = reservas[0];

        if (reserva.estado !== "pendiente" ||
            !reserva.fecha_expiracion ||
            new Date(reserva.fecha_expiracion) <= new Date()) {
            return res.status(409).json({
                error: "La reserva venció o no está pendiente."
            });
        }

        const [existentes] = await pool.execute(`
            SELECT id_pago, estado
            FROM pagos
            WHERE id_reserva = ?
            AND estado = 'pendiente'
            LIMIT 1
        `, [req.params.idReserva]);

        if (existentes.length) {
            return res.json({
                mensaje: "Ya existe un pago pendiente.",
                id_pago: existentes[0].id_pago
            });
        }

        const [resultado] = await pool.execute(`
            INSERT INTO pagos (
                id_reserva,
                plataforma,
                monto,
                estado
            )
            VALUES (?, 'pendiente_integracion', ?, 'pendiente')
        `, [req.params.idReserva, reserva.precio_final]);

        res.status(201).json({
            mensaje: "Pago registrado como pendiente.",
            id_pago: resultado.insertId,
            monto: reserva.precio_final,
            estado: "pendiente"
        });
    } catch (error) {
        next(error);
    }
});

router.get("/:idPago", verificarToken, async (req, res, next) => {
    try {
        const [pagos] = await pool.execute(`
            SELECT
                p.id_pago,
                p.monto,
                p.plataforma,
                p.metodo_pago,
                p.estado,
                p.fecha_creacion,
                p.fecha_pago
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
        `, [
            req.params.idPago,
            req.usuario.id,
            req.usuario.id,
            req.usuario.id
        ]);

        if (!pagos.length) {
            return res.status(404).json({
                error: "Pago no encontrado."
            });
        }

        res.json(pagos[0]);
    } catch (error) {
        next(error);
    }
});

export default router;

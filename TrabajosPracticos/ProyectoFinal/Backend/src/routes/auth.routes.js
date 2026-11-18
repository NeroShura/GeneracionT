
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import { verificarToken } from "../middleware/auth.js";

const router = Router();

function generarToken(usuario) {
    return jwt.sign(
        {
            id: usuario.id_usuario,
            email: usuario.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d"
        }
    );
}

router.post("/registro", async (req, res, next) => {
    try {
        const { nombre, apellido, email, contrasena, telefono } = req.body;

        if (!nombre || !apellido || !email || !contrasena) {
            return res.status(400).json({
                error: "Completá los campos obligatorios."
            });
        }

        if (contrasena.length < 8) {
            return res.status(400).json({
                error: "La contraseña debe tener al menos 8 caracteres."
            });
        }

        const [existente] = await pool.execute(
            "SELECT id_usuario FROM usuarios WHERE email = ?",
            [email]
        );

        if (existente.length) {
            return res.status(409).json({
                error: "El correo ya está registrado."
            });
        }

        const hash = await bcrypt.hash(contrasena, 12);

        const [resultado] = await pool.execute(
            `INSERT INTO usuarios
            (nombre, apellido, email, contrasena, telefono)
            VALUES (?, ?, ?, ?, ?)`,
            [nombre, apellido, email, hash, telefono || null]
        );

        const usuario = {
            id_usuario: resultado.insertId,
            nombre,
            apellido,
            email
        };

        res.status(201).json({
            mensaje: "Usuario registrado correctamente.",
            usuario,
            token: generarToken(usuario)
        });
    } catch (error) {
        next(error);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const { email, contrasena } = req.body;

        if (!email || !contrasena) {
            return res.status(400).json({
                error: "Ingresá correo y contraseña."
            });
        }

        const [usuarios] = await pool.execute(
            `SELECT id_usuario, nombre, apellido, email,
            contrasena, estado
            FROM usuarios WHERE email = ?`,
            [email]
        );

        if (!usuarios.length) {
            return res.status(401).json({
                error: "Correo o contraseña incorrectos."
            });
        }

        const usuario = usuarios[0];

        if (usuario.estado !== "activo") {
            return res.status(403).json({
                error: "La cuenta no está activa."
            });
        }

        const coincide = await bcrypt.compare(
            contrasena,
            usuario.contrasena
        );

        if (!coincide) {
            return res.status(401).json({
                error: "Correo o contraseña incorrectos."
            });
        }

        delete usuario.contrasena;

        res.json({
            mensaje: "Inicio de sesión correcto.",
            usuario,
            token: generarToken(usuario)
        });
    } catch (error) {
        next(error);
    }
});

router.get("/perfil", verificarToken, async (req, res, next) => {
    try {
        const [suscripciones] = await pool.execute(
            `SELECT
                su.id_suscripcion,
                su.fecha_inicio,
                su.fecha_vencimiento,
                m.nombre AS membresia
            FROM suscripciones su
            INNER JOIN membresias m
                ON m.id_membresia = su.id_membresia
            WHERE su.id_usuario = ?
                AND su.estado = 'activa'
                AND su.fecha_inicio <= NOW(3)
                AND su.fecha_vencimiento > NOW(3)
                AND m.estado = 'activa'
            ORDER BY su.fecha_vencimiento DESC
            LIMIT 1`,
            [req.usuario.id]
        );

        let membresia = null;

        if (suscripciones.length > 0) {
            const suscripcion = suscripciones[0];

            const [beneficios] = await pool.execute(
                `SELECT
                    b.nombre,
                    b.descripcion,
                    b.tipo_beneficio,
                    b.valor
                FROM membresia_beneficios mb
                INNER JOIN beneficios b
                    ON b.id_beneficio = mb.id_beneficio
                WHERE mb.id_membresia = (
                    SELECT id_membresia
                    FROM suscripciones
                    WHERE id_suscripcion = ?
                )
                AND b.estado = 'activo'`,
                [suscripcion.id_suscripcion]
            );

            membresia = {
                nombre: suscripcion.membresia,
                fechaInicio: suscripcion.fecha_inicio,
                fechaVencimiento: suscripcion.fecha_vencimiento,
                beneficios
            };
        }

        res.json({
            usuario: {
                id: req.usuario.id,
                nombre: req.usuario.nombre,
                apellido: req.usuario.apellido,
                email: req.usuario.email
            },
            esSocio: membresia !== null,
            membresia
        });

    } catch (error) {
        next(error);
    }
});


export default router;

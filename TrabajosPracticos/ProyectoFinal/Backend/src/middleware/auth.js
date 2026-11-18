import jwt from "jsonwebtoken";
import pool from "../config/database.js";

async function autenticar(req, res, next, opcional = false) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        if (opcional) {
            req.usuario = null;
            return next();
        }

        return res.status(401).json({
            error: "Tenés que iniciar sesión."
        });
    }

    const coincidencia = authorization.match(/^Bearer\s+(.+)$/i);

    if (!coincidencia) {
        return res.status(401).json({
            error: "Formato de autenticación inválido."
        });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            error: "La autenticación no está configurada correctamente."
        });
    }

    try {
        const token = coincidencia[1];

        const datosToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!datosToken.id) {
            return res.status(401).json({
                error: "El token no contiene un usuario válido."
            });
        }

        const [usuarios] = await pool.execute(
            `SELECT
                id_usuario,
                nombre,
                apellido,
                email,
                estado
            FROM usuarios
            WHERE id_usuario = ?
            LIMIT 1`,
            [datosToken.id]
        );

        if (!usuarios.length) {
            return res.status(401).json({
                error: "El usuario asociado al token no existe."
            });
        }

        const usuario = usuarios[0];

        if (usuario.estado !== "activo") {
            return res.status(403).json({
                error: "La cuenta no está activa."
            });
        }

        req.usuario = {
            id: usuario.id_usuario,
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email
        };

        next();
    } catch (error) {
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                error: "El token es inválido o expiró. Iniciá sesión nuevamente."
            });
        }

        next(error);
    }
}

export function verificarToken(req, res, next) {
    return autenticar(req, res, next, false);
}

export function verificarTokenOpcional(req, res, next) {
    return autenticar(req, res, next, true);
}

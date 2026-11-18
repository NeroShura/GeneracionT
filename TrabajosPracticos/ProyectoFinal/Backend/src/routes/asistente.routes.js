
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { verificarToken } from "../middleware/auth.js";
import { responderAsistente } from "../services/asistente.service.js";

const router = Router();

const limiteAsistente = rateLimit({
    windowMs: 60000,
    limit: 15
});

router.post("/", limiteAsistente, async (req, res, next) => {
    try {
        const { mensaje } = req.body;

        if (typeof mensaje !== "string" || !mensaje.trim()) {
            return res.status(400).json({
                error: "Escribí un mensaje."
            });
        }

        if (mensaje.length > 2000) {
            return res.status(400).json({
                error: "El mensaje es demasiado largo."
            });
        }

        let idUsuario = null;

        const authorization = req.headers.authorization;

        if (authorization) {
            verificarToken(req, res, () => {
                idUsuario = req.usuario.id;
            });

            if (!idUsuario) return;
        }

        const respuesta = await responderAsistente(
            mensaje.trim(),
            idUsuario
        );

        res.json({ respuesta });

    } catch (error) {
        next(error);
    }
});

export default router;

import { Router } from "express";
import rateLimit from "express-rate-limit";

import { verificarTokenOpcional } from "../middleware/auth.js";
import { responderAsistente } from "../services/asistente.service.js";

const router = Router();

const limiteAsistente = rateLimit({
    windowMs: 60000,
    limit: 15,
    message: {
        error: "Realizaste demasiadas consultas. Esperá un momento."
    }
});

router.post(
    "/",
    limiteAsistente,
    verificarTokenOpcional,
    async (req, res, next) => {
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

            const idUsuario = req.usuario?.id ?? null;

            const respuesta = await responderAsistente(
                mensaje.trim(),
                idUsuario
            );

            res.json({
                respuesta
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;

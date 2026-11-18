
import { Router } from "express";
import rateLimit from "express-rate-limit";
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

        const respuesta = await responderAsistente(mensaje.trim());

        res.json({ respuesta });
    } catch (error) {
        next(error);
    }
});

export default router;

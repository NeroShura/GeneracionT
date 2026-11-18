
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

import pool from "./config/database.js";

import authRoutes from "./routes/auth.routes.js";
import catalogoRoutes from "./routes/catalogo.routes.js";
import reservasRoutes from "./routes/reservas.routes.js";
import pagosRoutes from "./routes/pagos.routes.js";
import asistenteRoutes from "./routes/asistente.routes.js";

const app = express();

app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5500"
}));

app.use(express.json({ limit: "1mb" }));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200
}));

app.get("/", (req, res) => {
    res.json({
        nombre: "Umbral API",
        version: "1.0.0",
        estado: "funcionando"
    });
});

app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            servidor: "conectado",
            base_de_datos: "conectada"
        });
    } catch {
        res.status(503).json({
            servidor: "conectado",
            base_de_datos: "desconectada"
        });
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/catalogo", catalogoRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/asistente", asistenteRoutes);

app.use((req, res) => {
    res.status(404).json({
        error: "Ruta no encontrada."
    });
});

app.use((error, req, res, next) => {
    console.error(error);

    if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            error: "El registro ya existe."
        });
    }

    res.status(500).json({
        error: "Error interno del servidor."
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Umbral API funcionando en puerto ${PORT}`);
});

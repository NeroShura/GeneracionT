
import jwt from "jsonwebtoken";

export function verificarToken(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Debés iniciar sesión."
        });
    }

    const token = authorization.split(" ")[1];

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({
            error: "Token inválido o vencido."
        });
    }
}

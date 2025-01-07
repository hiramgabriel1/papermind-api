import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

/**
 * Genera un token JWT
 * @param payload Datos a incluir en el token
 * @param expiresIn Tiempo de expiración (ej: "1h", "7d")
 * @returns Token generado
 */
export const generateToken = (payload: object, expiresIn = "1h") => {
	return jwt.sign(payload, String(SECRET), { expiresIn });
};

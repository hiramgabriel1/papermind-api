import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

/**
 *
 * this method is responsible for checking the token and checking if the user is authorized to access the route
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	const token =
		(req.headers.auth as string) || req.headers.authorization?.split(" ")[1];

	if (!token) {
		res.status(401).json({ error: "Acceso no autorizado, token requerido." });
		return;
	}

	try {
		const decoded = jwt.verify(token, String(SECRET_KEY));
		(req as any).user = decoded;
		next();
	} catch (error) {
		res.status(403).json({ error: "Token inválido o expirado." });
		return;
	}
};

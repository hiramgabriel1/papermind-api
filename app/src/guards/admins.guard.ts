import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_ADMIN;

/**
 *
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const authAdminMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	const token =
		(req.headers.authAdmin as string) ||
		req.headers.authorization?.split(" ")[1];

	if (!token) {
		res
			.status(401)
			.json({ error: "Acceso no autorizado - admin no autorizado." });
		return;
	}

	try {
		const decoded = jwt.verify(token, String(SECRET_KEY));
		(req as any).user = decoded;
		next();
	} catch (error) {
		console.log(error);

		res
			.status(403)
			.json({ error: "Token inválido o expirado.", message: error });
		return;
	}
};

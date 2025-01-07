import { Request, Response, Router } from "express";
import UserService from "../services/users.service";
import { authMiddleware } from "../guards/auth.guard";

const userService = new UserService();
const userRouter = Router();
const path = "/api/v1/users";

/**
 * 📌 Endpoint to create a user
 */
userRouter.post(`${path}/create-user`, async (req: Request, res: Response) => {
	try {
		await userService.createProfile(req, res);
	} catch (error) {
		console.error("Error en /create-user:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
});

/**
 * 📌 Endpoint to login user
 */
userRouter.post(`${path}/auth-user`, async (req: Request, res: Response) => {
	try {
		await userService.loginUser(req, res);
	} catch (error) {
		console.error("Error en /auth-user:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
});

/**
 * 📌 Endpoint to show all users
 */
userRouter.get(
	`${path}/show-users`,
	authMiddleware,
	async (req: Request, res: Response) => {
		try {
			await userService.showUsers(req, res);
		} catch (error) {
			console.error("Error en /show-users:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	}
);

export default userRouter;

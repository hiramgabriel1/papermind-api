import { Request, Response, Router } from "express";
import { authMiddleware } from "../../guards/auth.guard";
import { userController } from "../../controllers/users/users.controller";
import fileUploaderMiddleware from "../../middlewares/fileUploader";

const usersController = new userController();
const userRouter = Router();
const path = "/api/v1/users";

/**
 * 📌 Endpoint to create a user
 */
userRouter.post(`${path}/create-user`, async (req: Request, res: Response) => {
	try {
		await usersController.createUser(req, res);
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
		await usersController.loginUser(req, res);
	} catch (error) {
		console.error("Error en /auth-user:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
});

/**
 * 📌 Endpoint to create user chat
 *
 * @middleware fileUploaderMiddleware
 *
 * todo: pending...
 *
 */
userRouter.post(
	`${path}/create-chat/:userId`,
	fileUploaderMiddleware,
	async (req: Request, res: Response) => {
		try {
			await usersController.createChat(req, res);
		} catch (error) {
			console.error("Error en /createchat:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	}
);

/**
 * 📌 Endpoint to view data of profile user
 */
userRouter.get(
	`${path}/view-profile/:userId`,
	authMiddleware,
	async (req: Request, res: Response) => {
		try {
			await usersController.viewProfile(req, res);
		} catch (error) {
			console.error("Error en /show-users:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	}
);

/**
 * 📌 Endpoint to view chats of profile user
 */
userRouter.get(
	`${path}/view-chats/:userId`,
	authMiddleware,
	async (req: Request, res: Response) => {
		try {
			await usersController.viewChatsUser(req, res);
		} catch (error) {
			console.error("Error en /show-users:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	}
);

/**
 * 📌 Endpoint to show all users
 */
userRouter.get(
	`${path}/show-users`,
	authMiddleware,
	async (req: Request, res: Response) => {
		try {
			await usersController.showUsers(req, res);
		} catch (error) {
			console.error("Error en /show-users:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	}
);

export default userRouter;

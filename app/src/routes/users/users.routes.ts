import { Request, Response, Router } from "express";
import { authMiddleware } from "../../guards/auth.guard";
import { userController } from "../../controllers/users/users.controller";
import fileUploaderMiddleware from "../../middlewares/fileUploader";
import profileImageUploader from "../../middlewares/imageUploader";

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
	authMiddleware,
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
 * 📌 Endpoint to query in the chat
 *
 * @middleware authMiddleware
 */
userRouter.post(
	`${path}/chat-query/user/:userId/chat/:chatId`,
	// fileUploaderMiddleware,
	authMiddleware,
	async (req: Request, res: Response) => {
		try {
			await usersController.conversationAI(req, res);
		} catch (error) {
			console.error("Error en /createchat:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	}
);

/**
 * 📌 Endpoint to update profile data
 *
 * @middleware authMiddleware
 */
userRouter.post(
	`${path}/update/:userId/profile`,
	profileImageUploader,
	authMiddleware,
	async (req: Request, res: Response) => {
		try {
			await usersController.conversationAI(req, res);
		} catch (error) {
			console.error("Error en /update profile:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	}
);

/**
 * 📌 Endpoint to generate a invitation to collaborator
 *
 * @middleware authMiddleware
 */
userRouter.post(
	`${path}/invite/generate/user/:userId/collaborator/chat/:chatId`,
	authMiddleware,
	async (req: Request, res: Response) => {
		try {
			await usersController.generateInvitationCollaborator(req, res);
		} catch (error) {
			console.error("Error en /update profile:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	}
);

/**
 * 📌 Endpoint to validate a invitation
 *
 * @middleware authMiddleware
 */
userRouter.get(
	`${path}/invitation/validate-token/:token`,
	authMiddleware,
	async (req: Request, res: Response) => {
		try {
			await usersController.validateTokenInvitation(req, res);
		} catch (error) {
			console.error("Error en /update profile:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	}
);

/**
 * 📌 Endpoint to create directory to user
 */
userRouter.post(
	`${path}/chat-directory/create/:userId`,
	authMiddleware,
	async (req: Request, res: Response) => {
		try {
			await usersController.createDirectoryFiles(req, res);
		} catch (error) {
			console.error("Error en /create-directory:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	}
);

/**
 * 📌 Endpoint to view directories of user by userId
 */
userRouter.get(
	`${path}/view-directories/:userId`,
	authMiddleware,
	async (req: Request, res: Response) => {
		try {
			await usersController.viewDirectoriesByUser(req, res);
		} catch (error) {
			console.error("Error en /show-users:", error);
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
 * 📌 Endpoint to view one chat of user
 */
userRouter.get(
	`${path}/chat-user/:userId/:chatId`,
	authMiddleware,
	async (req: Request, res: Response) => {
		try {
			await usersController.viewOneChat(req, res);
		} catch (error) {
			console.error("Error en /view-chat router:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	}
);

/**
 * 📌 Endpoint to show all users
 */
userRouter.get(
	`${path}/show-users`,
	// authMiddleware,
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

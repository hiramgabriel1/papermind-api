import { Request, Response } from "express";
import userService from "../services/users/users.service";

/**
 * @class userController to manage users in the database and return the response
 */
export class userController {
	/**
	 * method controller to create a new user
	 *
	 * @param req
	 * @param res
	 * @returns
	 */
	async createUser(req: Request, res: Response) {
		try {
			const usersService = new userService();

			if (
				!req.body.email ||
				!req.body.password ||
				!req.body.username ||
				!req.body.lastName ||
				!req.body.phoneNumber
			) {
				return res.status(400).json({
					origin: "userController -> createUser",
					errorMessage: "Missing required fields",
				});
			}

			await usersService.createProfile(req, res);
		} catch (error) {
			res.status(500).json({
				origin: "userController -> createUser",
				errorMessage: `${error}`,
			});
		}
	}

	/**
	 *
	 * this method is used to login a user
	 *
	 * @param req
	 * @param res
	 * @returns
	 */
	async loginUser(req: Request, res: Response) {
		try {
			const usersService = new userService();

			if (!req.body.email || !req.body.password) {
				return res.status(400).json({
					origin: "userController -> loginUser",
					errorMessage: "Missing required fields",
				});
			}

			await usersService.loginUser(req, res);
		} catch (error) {
			res.status(500).json({
				origin: "userController -> loginUser",
				errorMessage: `${error}`,
			});
		}
	}

	/**
	 * this controller is used to view the profile of a user
	 *
	 * @param req
	 * @param res
	 * @returns
	 */
	async viewProfile(req: Request, res: Response) {
		try {
			const usersService = new userService();
			console.log(req.params.userId);

			if (!req.params.userId) {
				return res.status(400).json({
					origin: `userController -> viewProfile`,
					error: "El id del usuario es requerido.",
				});
			}

			await usersService.viewProfile(req, res);
		} catch (error) {
			res.status(500).json({
				origin: "userController -> viewProfile",
				errorMessage: `${error}`,
			});
		}
	}

	/**
	 * this controller is used to view the chats of a user
	 *
	 * @param req
	 * @param res
	 * @returns
	 */
	async viewChatsUser(req: Request, res: Response) {
		try {
			const usersService = new userService();
			console.log(req.params.userId);

			if (!req.params.userId) {
				return res.status(400).json({
					origin: `userController -> viewChatsUser`,
					error: "El id del usuario es requerido.",
				});
			}

			await usersService.viewChatsUser(req, res);
		} catch (error) {
			res.status(500).json({
				origin: "userController -> viewChatsUser",
				errorMessage: `${error}`,
			});
		}
	}

	/**
	 *
	 * this controller is used to create a chat to user
	 *
	 * @param req
	 * @param res
	 */
	async createChat(req: Request, res: Response) {
		try {
			const usersService = new userService();

			if (!req.params.userId) {
				return res.status(400).json({
					origin: `userController -> createChat ${req.body.userId}`,
					error: "El id del usuario es requerido.",
				});
			}

			await usersService.createChat(req, res);
		} catch (error) {
			res.status(500).json({
				origin: "userController -> createChat",
				errorMessage: `${error}`,
			});
		}
	}

	/**
	 *
	 * method to show all users in the database
	 *
	 * @param req
	 * @param res
	 */
	async showUsers(req: Request, res: Response) {
		try {
			const usersService = new userService();

			await usersService.showUsers(req, res);
		} catch (error) {
			res.status(500).json({
				origin: "userController -> showUsers",
				errorMessage: `${error}`,
			});
		}
	}
}

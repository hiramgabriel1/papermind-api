import { Request, Response } from "express";
import userService from "../services/users.service";

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

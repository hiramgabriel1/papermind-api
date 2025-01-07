import { Request, Response } from "express";
import prisma from "../../../../prisma/prisma.client";
import { comparePassword, encryptPassword } from "../../utils/encryptPassword";
import { generateToken } from "../../utils/generateToken";

/**
 * @class userService to manage users in the database and return the response
 */
export default class userService {
	/**
	 * this method is used to validate exist user in the database
	 * @param userId
	 *
	 * @returns true or false
	 */
	async existsUser(userId: number) {
		const user = await prisma.user.findFirst({
			where: { id: userId },
		});

		return user ? true : false;
	}

	/**
	 *
	 * method to create a new user
	 *
	 * @param req
	 * @param res
	 * @returns
	 */
	async createProfile(req: Request, res: Response) {
		try {
			const existingUser = await prisma.user.findUnique({
				where: { email: req.body.email },
			});

			if (existingUser) {
				return res.status(400).json({ error: "El email ya está en uso." });
			}

			const encryptedPassword = await encryptPassword(req.body.password);
			const user = await prisma.user.create({
				data: {
					username: req.body.username,
					lastName: req.body.lastName,
					email: req.body.email,
					phoneNumber: req.body.phoneNumber,
					password: encryptedPassword,
				},
			});

			const token = generateToken({
				userId: user.id,
				username: user.username,
				email: user.email,
			});

			res.status(201).json({ user, token });
		} catch (error) {
			res.status(500).json({
				origin: "userService -> createUser",
				errorMessage: `${error}`,
			});
		}
	}

	/**
	 *
	 * method to login a user and return the response
	 *
	 * @param req
	 * @param res
	 * @returns
	 */
	async loginUser(req: Request, res: Response) {
		try {
			const { email, password } = req.body;

			const user = await prisma.user.findUnique({
				where: { email },
			});

			if (!user) {
				return res.status(401).json({ error: "Credenciales inválidas" });
			}

			const isPasswordValid = await comparePassword(password, user.password);

			if (!isPasswordValid) {
				return res.status(401).json({ error: "Credenciales inválidas" });
			}

			const token = generateToken({
				userId: user.id,
				username: user.username,
				email: user.email,
			});

			res.json({
				user,
				token,
			});
		} catch (error) {
			res.status(500).json({
				origin: "userService -> loginUser",
				errorMessage: `${error}`,
			});
		}
	}

	/**
	 *
	 * method to view the profile of a user
	 *
	 * @param req
	 * @param res
	 * @returns
	 */
	async viewProfile(req: Request, res: Response) {
		try {
			console.log(req.params.userId);

			const user = await prisma.user.findUnique({
				where: { id: Number(req.params.userId) },
				include: {
					chats: true,
				},
			});

			if (!user) {
				return res.status(404).json({
					messageError: `Usuario con id ${req.body.userId} no encontrado`,
				});
			}

			res.json({
				user,
			});
		} catch (error) {
			res.status(500).json({
				origin: `userService -> viewProfile with id ${req.body.userId}`,
				errorMessage: `${error}`,
			});
		}
	}

	/**
	 *
	 * method to view the chats of a user and return the response
	 *
	 * @param req
	 * @param res
	 * @returns
	 */
	async viewChatsUser(req: Request, res: Response) {
		try {
			console.log(req.params.userId);
			const userId = Number(req.params.userId);

			const chatsUser = await prisma.chat.findMany({
				where: { userId },
			});

			if (chatsUser.length === 0) {
				return res.status(404).json({
					error: `No se encontraron chats para el usuario con ID ${userId}`,
				});
			}

			res.json({
				message: `chats encontrados para usuario con id: ${userId}`,
				chats: chatsUser,
			});
		} catch (error) {
			res.status(500).json({
				origin: `userService -> viewChats with id ${req.body.userId}`,
				errorMessage: `${error}`,
			});
		}
	}

	/**
	 *
	 * method to create a new chat to user and return the response
	 *
	 * @param req
	 * @param res
	 * @returns
	 */
	async createChat(req: Request, res: Response) {
		try {
			const { userId } = req.params;
			const user = await this.existsUser(Number(userId));

			if (!user) {
				return res.status(404).json({
					error: `Usuario con id ${userId} no encontrado`,
				});
			}

			const chatData = { ...req.body };

			const newChat = await prisma.chat.create({
				data: { ...chatData, userId: Number(userId) },
			});

			if (!newChat) {
				return res.status(400).json({
					error: "No se pudo crear el chat",
				});
			}

			res.status(201).json({
				message: "Chat creado exitosamente",
				chat: newChat,
			});
		} catch (error) {
			res.status(500).json({
				origin: `userService -> createChat user ${req.body.userId}`,
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
			res.json({
				result: await prisma.user.findMany(),
			});
		} catch (error) {
			res.status(500).json({
				origin: "userService -> showUsers",
				errorMessage: `${error}`,
			});
		}
	}
}

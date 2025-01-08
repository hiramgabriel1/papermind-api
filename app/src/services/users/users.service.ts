import { Request, Response } from "express";
import prisma from "../../../../prisma/prisma.client";
import { comparePassword, encryptPassword } from "../../utils/encryptPassword";
import { generateToken } from "../../utils/generateToken";
import { ICollaborators, IUserChat } from "./user.interfaces";

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
			const userId = Number(req.params.userId);
			const findUser = await this.existsUser(userId);

			if (!findUser) {
				return res.status(404).json({
					messageError: `Usuario con id ${req.body.userId} no encontrado`,
				});
			}

			const user = await prisma.user.findUnique({
				where: { id: userId },
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
			const userId = Number(req.params.userId);
			const findUser = await this.existsUser(userId);

			if (!findUser) {
				return res.status(404).json({
					error: `Usuario con id ${userId} no encontrado`,
				});
			}

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
	 * this method is used to view one chat of a user
	 *
	 * @param req
	 * @param res
	 * @returns
	 */
	async viewOneChat(req: Request, res: Response) {
		try {
			const userId = Number(req.params.userId);
			const chatId = Number(req.params.chatId);

			if (!userId && !chatId) {
				return res.status(400).json({
					origin: `userService -> viewOneChat ${req.params.userId} ${req.params.chatId}`,
					error: "El id del usuario o el chatId es requerido.",
				});
			}

			const findUser = await this.existsUser(userId);

			if (!findUser) {
				return res.status(404).json({
					messageError: `Usuario con id ${req.params.userId} no encontrado`,
				});
			}

			const chat = await prisma.chat.findUnique({
				where: { id: chatId, userId },
				select: {
					context: true,
				},
			});

			if (chat) {
				if (chat.context) {
					return res.status(500).json({
						message: "el chat no tiene contexto",
					});
				}

				return res.status(200).json({
					message: "chat encontrado",
					chat,
				});
			} else {
				return res.status(404).json({
					message: `No se encontró el chat con id: ${chatId} para el usuario con id: ${userId}`,
				});
			}
		} catch (error) {
			res.status(500).json({
				origin: `userService -> viewOneChat with id ${req.params.userId} ${req.params.chatId}`,
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
			const fileUrl = req.file?.path;

			const { userId } = req.params;
			const { title, description, collaborators } = req.body;

			if (!title || !description) {
				return res.status(400).json({
					origin: `userService -> createChat ${req.body.userId}`,
					error: "Todos los campos son requeridos",
				});
			}

			const user = await this.existsUser(Number(userId));

			if (!user) {
				return res.status(404).json({
					error: `Usuario con id ${userId} no encontrado`,
				});
			}

			[fileUrl].filter((fileType) => {
				if (!fileType?.includes("pdf")) {
					return res.status(400).json({
						origin: `userService -> createChat ${req.body.userId}`,
						error: "El archivo debe ser un PDF",
					});
				}
			});

			const chatData = collaborators
				? {
						title,
						description,
						fileUrl,
						userId: Number(userId),
						collaborators: collaborators
							.split(",")
							.map((collaborator: ICollaborators) => ({
								id: collaborator.userId,
							})),
				  }
				: {
						title,
						description,
						fileUrl,
						userId: Number(userId),
				  };

			const newChat = await prisma.chat.create({
				// @ts-ignore ignored why fileUrl is not defined
				data: chatData,
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
	 * this method is used to create a directory to user and return the response
	 *
	 * @param req
	 * @param res
	 */
	async createDirectoryFiles(req: Request, res: Response) {
		try {
			const { userId } = req.params;
			const { titleDirectory } = req.body;

			console.log(titleDirectory);

			const user = await this.existsUser(Number(userId));

			if (!user) {
				return res.status(404).json({
					error: `Usuario con id ${userId} no encontrado`,
				});
			}

			const directoryFileNameIsUnique = await prisma.directory.findFirst({
				where: {
					titleDirectory,
					userId: Number(userId),
				},
			});

			if (directoryFileNameIsUnique) {
				return res.status(400).json({
					error: "El nombre del directorio ya existe",
				});
			}

			const directory = await prisma.directory.create({
				data: {
					titleDirectory,
					userId: Number(userId),
				},
			});

			if (!directory) {
				return res.status(400).json({
					error: "No se pudo crear el directorio",
				});
			}

			res.status(201).json({
				message: `Directorio para usuario con id: ${userId} ha sido creado exitosamente`,
				directory,
			});
		} catch (error) {
			res.status(500).json({
				origin: "userService -> createDirectoryFiles",
				errorMessage: `directory is not created by this error: ${error}`,
			});
		}
	}

	/**
	 *
	 * method to view all directories of a user
	 *
	 * @param req
	 * @param res
	 */
	async viewDirectoriesByUser(req: Request, res: Response) {
		try {
			const { userId } = req.params;

			const user = await this.existsUser(Number(userId));

			if (!user) {
				return res.status(404).json({
					error: `Usuario con id ${userId} no encontrado`,
				});
			}

			const directories = await prisma.directory.findMany({
				where: {
					userId: Number(userId),
				},
			});

			if (directories.length === 0) {
				res.status(404).json({
					error: `el usuario con id ${userId} no tiene directorios creados`,
				});
			}

			res.status(200).json({
				message: "directorios encontrados:",
				directories,
			});
		} catch (error) {
			res.status(500).json({
				origin: "userService -> viewDirectoriesByUser",
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

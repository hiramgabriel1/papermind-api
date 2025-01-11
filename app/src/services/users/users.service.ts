import { Request, Response } from "express";
import { chunkProcessor, G4F } from "g4f";
// import OpenAI from "openai";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import fs from "fs";
import prisma from "../../../../prisma/prisma.client";
import { comparePassword, encryptPassword } from "../../utils/encryptPassword";
import { generateToken } from "../../utils/generateToken";
import { ICollaborators } from "./user.interfaces";
import { paperMindPrompt } from "../../utils/prompts.util";
import { parseFileName } from "../../utils/parseFileName.util";
import cloudinary from "../../config/cloudinary.config";
import { extractContentFile } from "../../utils/extractContentFile";
import { InvitationsService } from "../../smtp/sendInvitation.smtp";
import { ConfirmationAccountService } from "../../smtp/sendConfirmationAccount.smtp";

dotenv.config();

/**
 * @class userService to manage users in the database and return the response
 */
export default class userService {
	private JWT_SECRET_KEY = process.env.JWT_SECRET;

	/**
	 *
	 * this private method is used to instance the paperMind AI and return the response from request message
	 *
	 * @param queryMessage
	 * @returns response from the AI
	 */
	private async answerPaperMind(contentFile: string, queryMessage: string) {
		const paperMindInstance = new G4F();

		const conversation = [
			{
				role: "system",
				content: paperMindPrompt.concat(contentFile),
			},
			{
				role: "user",
				content: `eres un profesional que se encarga de automatizar la busqueda y entendimiento de conceptos que vienen dentro de textos o documentos, tu nombre es PaperMindAI. No conoces nada sobre chat gpt ni gpt. tu fuiste totalmente creado por @hiram.dev, sobre modelos de AI tu no sabes nada, solo sabes que eres una AI y que tu creador fue @hiram.dev. eres increiblemente muy bueno, analitico y respondes a la pregunta que te pregunten solo y cuando el concepto o la pregunta que hagan, esté relacionada con el texto que te voy a mandar, si la pregunta que te hagan, no está relacionado con el texto, entonces tu no tienes idea de lo que dicen, por que debe venir en el texto. si te pasa algo asi, responde con esto: puto. en este caso, el texto que te envian es el siguiente: ${contentFile} y la pregunta que te hacen es esta: ${queryMessage}`,
			},
		];

		const options = {
			provider: paperMindInstance.providers.Bing,
			debug: true,
			stream: true,
		};

		const response = await paperMindInstance.chatCompletion(
			conversation,
			options
		);

		let content = "";

		for await (const chunk of chunkProcessor(response)) content += chunk;

		return content;
	}

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
			const confirmationAccountService = new ConfirmationAccountService();

			const existingUser = await prisma.user.findUnique({
				where: { email: req.body.email },
			});

			if (existingUser) {
				return res.status(400).json({ error: "El email ya está en uso." });
			}

			const encryptedPassword = await encryptPassword(req.body.password);

			const [user] = await Promise.all([
				prisma.user.create({
					data: {
						username: req.body.username,
						lastName: req.body.lastName,
						email: req.body.email,
						phoneNumber: req.body.phoneNumber,
						password: encryptedPassword,
					},
				}),
				confirmationAccountService.sendConfirmationAccount(req.body.email),
			]);

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
			const { userId, chatId } = req.params;

			if (!userId && !chatId) {
				return res.status(400).json({
					origin: `userService -> viewOneChat ${req.params.userId} ${req.params.chatId}`,
					error: "El id del usuario o el chatId es requerido.",
				});
			}

			const findUser = await this.existsUser(Number(userId));

			if (!findUser) {
				return res.status(404).json({
					messageError: `Usuario con id ${req.params.userId} no encontrado`,
				});
			}

			const chat = await prisma.chat.findUnique({
				where: { id: Number(chatId), userId: Number(userId) },
				select: {
					contextChat: true,
				},
			});

			if (chat) {
				// if (!chat.contextChat || chat.contextChat.length === 0) {
				// 	return res.status(500).json({
				// 		message: "el chat no tiene contexto",
				// 	});
				// }

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
			const { userId } = req.params;
			const { title, description, collaborators } = req.body;

			const fileUrl = parseFileName(String(req.file?.path));

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

			if (!fileUrl.endsWith(".pdf")) {
				return res.status(400).json({
					origin: `userService -> createChat ${req.body.userId}`,
					error: "El archivo debe ser un PDF",
				});
			}

			const dataBuffer = fs.readFileSync(fileUrl);
			const contentFile = await extractContentFile(dataBuffer);

			const { secure_url } = await cloudinary.uploader.upload(
				String(req.file?.path),
				{
					resource_type: "auto",
					folder: "papermind",
				}
			);

			const chatData = collaborators
				? {
						title,
						description,
						fileUrl: secure_url,
						userId: Number(userId),
						contextDoc: contentFile,
						collaborators: collaborators
							.split(",")
							.map((collaborator: ICollaborators) => ({
								id: collaborator.userId,
							})),
				  }
				: {
						title,
						description,
						fileUrl: secure_url,
						contextDoc: contentFile,
						userId: Number(userId),
				  };

			const newChat = await prisma.chat.create({
				// @ts-ignore ignored why fileUrl is not defined
				data: chatData,
			});

			if (!newChat) {
				return res.status(400).json({
					status: 400,
					error: "No se pudo crear el chat",
				});
			}

			// ? delete file from the filesystem
			fs.unlinkSync(fileUrl);

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
	 * this method is used to conversate with the AI
	 * todo: debemos pasarle el contenido del archivo pdf
	 * todo: aqui debemos recibir la respuesta de la AI y guardarla en la base de datos
	 *
	 * @param req {queryMessage}
	 * @param res
	 */
	async conversationAI(req: Request, res: Response) {
		try {
			const { userId, chatId } = req.params;
			const { queryMessage } = req.body;

			const findUser = await this.existsUser(Number(userId));

			if (!findUser) {
				return res.status(404).json({
					messageError: `Usuario con id ${userId} no encontrado`,
				});
			}

			const query = await prisma.chat.findFirst({
				where: {
					userId: Number(chatId),
				},
			});

			if (!query) {
				return res.status(404).json({
					messageError: `Chat con id ${req.body.chatId} no encontrado`,
				});
			}

			const { contextDoc } = query;
			const answerPaperMind = await this.answerPaperMind(
				contextDoc,
				queryMessage
			);

			const responsePaperMind = await prisma.chat.update({
				where: {
					id: Number(chatId),
					userId: Number(userId),
				},

				data: {
					contextChat: answerPaperMind,
					id: Number(chatId),
				},
			});

			if (!responsePaperMind) {
				return res.status(400).json({
					messageError: `No se pudo guardar la respuesta en la base de datos`,
				});
			}

			res.status(200).json({
				message: "Respuesta",
				answerPaperMind,
			});
		} catch (error) {
			res.status(500).json({
				origin: "userService -> queryChat",
				errorMessage: `${error}`,
			});
		}
	}

	/**
	 *
	 * 	this method is used to update the user profile
	 *
	 * @param req
	 * @param res
	 */
	async updateProfile(req: Request, res: Response) {
		try {
			const { userId } = req.params;

			const user = await this.existsUser(Number(userId));

			if (!user) {
				return res.status(404).json({
					messageError: `Usuario con id ${userId} no encontrado`,
				});
			}

			const updatedUser = await prisma.user.update({
				where: {
					id: Number(userId),
				},
				data: req.body,
			});

			if (!updatedUser) {
				return res.status(400).json({
					messageError: `No se pudo actualizar el usuario`,
				});
			}

			res.status(200).json({
				message: `Usuario con id ${userId} actualizado exitosamente`,
				updatedUser,
			});
		} catch (error) {
			res.status(500).json({
				origin: "userService -> showUsers",
				errorMessage: `${error}`,
			});
		}
	}

	/**
	 *
	 * this service is used to generator a invitation to collaborator to a project
	 *
	 * @param req
	 * @param res
	 */
	async generateInvitationCollaborator(req: Request, res: Response) {
		try {
			const invitationService = new InvitationsService();

			const { userId, chatId } = req.params;
			const { emailCollaborator } = req.body;

			const findUser = await this.existsUser(Number(userId));

			if (!findUser) {
				return res.status(404).json({
					messageError: `Usuario con id ${userId} no encontrado`,
				});
			}

			const [findCollaboratorByEmail, findChat] = await Promise.all([
				prisma.user.findFirst({
					where: {
						email: emailCollaborator,
					},
				}),
				prisma.chat.findFirst({
					where: {
						id: Number(chatId),
						userId: Number(userId),
					},
				}),
			]);

			if (!findCollaboratorByEmail) {
				return res.status(404).json({
					messageError: `Usuario con email ${emailCollaborator} no encontrado`,
				});
			} else if (!findChat) {
				return res.status(404).json({
					messageError: `Chat con id ${chatId} no encontrado`,
				});
			}

			const detailsProject = {
				projectName: findChat.title,
				descriptionProject: findChat.description,
			};

			const tokenInvitation = jwt.sign(
				{
					emailCollaborator,
					type: "inviteCollaborate",
				},
				String(this.JWT_SECRET_KEY),
				{
					expiresIn: "2h",
				}
			);

			const secureUrlInvitation = `${process.env.URL_FRONTEND}/invitation-collab/user/${emailCollaborator}/projectName?=${detailsProject.projectName}/descrProject?=${detailsProject.descriptionProject}/token?invite=${tokenInvitation}`;

			// send invitation to collaborator
			const sendInvitation = await invitationService.inviteCollaborator(
				emailCollaborator,
				secureUrlInvitation
			);

			if (sendInvitation?.status !== 200) {
				return res.status(400).json({
					messageError: `No se pudo enviar el correo de invitacion`,
				});
			}

			return res.status(200).json({
				message: `Invitación enviada a ${emailCollaborator} correctamente`,
				sendInvitation,
			});
		} catch (error) {
			res.status(500).json({
				origin: "userService -> inviteCollaborator",
				errorMessage: `${error}`,
			});
		}
	}

	/**
	 *
	 * this service is used to validate the invitation to collaborator to a project
	 *
	 * @param req
	 * @param res
	 *
	 * @returns true or false if the invitation is valid or not
	 */
	async validateInvitationCollaborator(req: Request, res: Response) {
		try {
			const invitationService = new InvitationsService();

			const { token, chatId } = req.params;

			const decodedToken = jwt.verify(token, String(this.JWT_SECRET_KEY)) as {
				emailCollaborator: string;
				type: string;
			};

			if (decodedToken.type !== "inviteCollaborate") {
				return res.status(400).json({ messageError: `El token no es válido` });
			}

			const [collaboratorUser, existingCollaborator, findChat] =
				await Promise.all([
					prisma.user.findUnique({
						where: { email: decodedToken.emailCollaborator },
					}),
					prisma.collaborators.findFirst({
						where: {
							chatId: Number(chatId),
							userId: undefined,
						},
					}),
					prisma.chat.findFirst({
						where: {
							id: Number(chatId),
						},
					}),
				]);

			if (!collaboratorUser) {
				return res
					.status(404)
					.json({ messageError: "El usuario colaborador no existe" });
			}

			if (
				existingCollaborator &&
				existingCollaborator.userId === collaboratorUser.id
			) {
				return res
					.status(400)
					.json({ messageError: "El usuario ya es colaborador de este chat" });
			}

			// save collaborator in the database
			const saveCollaborator = await prisma.collaborators.create({
				data: {
					chatId: Number(chatId),
					userId: collaboratorUser.id,
				},
			});

			const extractCreatorData = await prisma.user.findFirst({
				where: {
					id: Number(findChat?.userId),
				},
			});

			const [notifyCollaborator, notifyUserCreatorInvitation] =
				await Promise.all([
					// notify the guest that they were accepted
					invitationService.notifyCollaborator(
						collaboratorUser.email,
						String(findChat?.title)
					),

					// notify the guest that the guest accepted
					invitationService.notifyUser(
						String(extractCreatorData?.email),
						`El usuario ${collaboratorUser.username} se ha unido al proyecto ${findChat?.title}`
					),
				]);

			if (
				notifyCollaborator?.status !== 200 ||
				notifyUserCreatorInvitation?.status !== 200
			) {
				return res.status(400).json({
					messageError: `No se pudo enviar la notificación`,
				});
			}

			return res.status(200).json({
				message:
					"Usuario agregado como colaborador exitosamente. Los usuarios han sido notificados.",
				saveCollaborator,
			});
		} catch (error) {
			console.error("Error en validateInvitationCollaborator:", error);
			res.status(500).json({
				origin: "userService -> validateInvitationCollaborator",
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

import e, { Request, Response } from "express";
import { prisma } from "../prisma/prisma.service";
import cloudinary from "../config/cloudinary.config";
import pdf from "pdf-parse";
import fs from "fs";
import path from "path";
import { chunkProcessor, G4F } from "g4f";

export class ChatController {
	public async createChat(req: Request, res: Response) {
		try {
			const userId = req.params.userId;
			const pathFile: any = req.file?.path;
			const resultData = await cloudinary.uploader.upload(pathFile, {
				resource_type: "auto",
			});

			console.log(resultData);

			const dataChat = {
				...req.body,
				urlPdf: resultData.original_filename,
				userId: userId,
			};
			const saveChat = await prisma.chat.create({
				data: dataChat,
			});

			if (!saveChat)
				return res.status(500).json({ message: "error al guardar la data" });

			console.log(saveChat);

			res.status(200).json({ message: "creado", data: saveChat });
		} catch (error) {
			console.log(error);

			return res.status(500).json({ error: error });
		}
	}

	public async openChatFile(req: Request, res: Response) {
		const { chatId, userId } = req.params;
		const searchChatUser = await prisma.chat.findFirst({
			where: {
				id: chatId,
				userId: userId,
			},
		});

		if (!searchChatUser)
			return res
				.status(404)
				.json({ message: "no existe el chat que busca el usuario" });

		res.status(200).json({ message: "finded", data: searchChatUser });
	}

	private async responses(textFile: string, question: string): Promise<string> {
		const g4f = new G4F();
		const messages = [
			{
				role: "System",
				content: `eres un bot profesional que se encarga de automatizar la busqueda y entendimiento de conceptos que vienen en contratos para trabajar como programador, eres muy bueno y respondes a la pregunta que te preguten solo y cuando el concepto que se busque este dentro del texto que te voy a mandar, sino no tienes idea de lo que dicen, por que tiene que venir siempre en el texto que te envien. en este caso, el texto que te envian es el siguiente: ${textFile}`,
			},
			{
				role: "user",
				content: `dime, que significa este concepto o dime si ese concepto que te menciono, se encuentra en el texto que te estoy entregando, si no se encuentra el concepto que busco, en el texto que te doy, respondeme con: "no esta en el archivo". este es el texto: ${textFile} y mi pregunta es la siguiente: ${question}`,
			},
		];

		const options = {
			provider: g4f.providers.Bing,
			stream: true,
		};

		const response = await g4f.chatCompletion(messages, options);
		let text = "";

		for await (const chunk of chunkProcessor(response)) text += chunk;

		return text;
	}

	public async askForResponseAIChat(req: Request, res: Response) {
		const { chatId } = req.params;
		const { question } = req.body;
		const findChat = await prisma.chat.findFirst({
			where: { id: chatId },
		});

		if (!findChat) return res.status(404).json({ response: "no existe" });

		const { urlPdf } = findChat;
		const pathFile = path.resolve(__dirname, "./uploads", urlPdf + ".pdf");
		const dataBuffer = fs.readFileSync(pathFile);
		const data = await pdf(dataBuffer);

		// save context file
		const saveContextTextFile = await prisma.chat.update({
			where: { id: chatId },
			data: { chatContext: data.text },
		});

		if (!saveContextTextFile)
			return res
				.status(500)
				.json({ message: "error en guardar el texto del file" });

		const sendQuestion = await this.responses(data.text, question);

		if (!sendQuestion) return res.status(500).json({ message: "error" });

		res.status(201).json({
			response: sendQuestion,
			details: "context chat saved",
			context: saveContextTextFile,
		});
	}

	public async startConversationWithAI(req: Request, res: Response) {
		const { chatId } = req.params;
		const findChat = await prisma.chat.findFirst({
			where: {
				id: chatId,
			},
		});

		if (!findChat)
			return res.status(404).json({ message: "no existe ese chat pana" });
	}

	public async show(req: Request, res: Response) {
		const data = await prisma.chat.findMany();
		res.json({ data });
	}
}

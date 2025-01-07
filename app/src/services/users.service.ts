import { Request, Response } from "express";
import prisma from "../../../prisma/prisma.client";
import { comparePassword, encryptPassword } from "../utils/encryptPassword";
import { generateToken } from "../utils/generateToken";

export default class UserService {
	/**
	 *
	 * method to create a new user
	 *
	 * @param req
	 * @param res
	 * @returns
	 */
	async createProfile(req: Request, res: Response) {
		console.log(req.body);

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
	}

	/**
	 *
	 * method to login a user
	 *
	 * @param req
	 * @param res
	 * @returns
	 */
	async loginUser(req: Request, res: Response) {
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
	}

	/**
	 *
	 * method to show all users in the database
	 *
	 * @param req
	 * @param res
	 */
	async showUsers(req: Request, res: Response) {
		res.json({
			result: await prisma.user.findMany(),
		});
	}
}

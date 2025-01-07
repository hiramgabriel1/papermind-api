import { Request, Response } from "express";
import prisma from "../../../prisma/prisma.client";
import { encryptPassword } from "../utils/encryptPassword";

export default class UserService {
	async createProfile(req: Request, res: Response) {
		console.log(req.body);

		const encryptedPassword = await encryptPassword(req.body.password);
		const user = await prisma.user.create({
			data: {
				username: req.body.username,
				lastName: req.body.lastName,
				email: "test@gmail.com",
				phoneNumber: '+593987654321',
				password: encryptedPassword,
			},
		});

		res.json({ user });
	}

	async viewProfile(req: Request, res: Response) {
		res.json({
			result: await prisma.user.findMany(),
		});
	}
}

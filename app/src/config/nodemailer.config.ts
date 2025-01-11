import * as nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 *
 * this is the transporter that will be used to send the emails with nodemailer as smtp service
 *
 */
export const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: Number(process.env.EMAIL_PORT),
	secure: true,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

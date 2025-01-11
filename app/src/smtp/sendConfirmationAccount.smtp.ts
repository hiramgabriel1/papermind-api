import { transporter } from "../config/nodemailer.config";

/**
 * this class is used to send confirmation account to user
 */
export class ConfirmationAccountService {
	async sendConfirmationAccount(email: string) {
		try {
			const info = await transporter.sendMail({
				from: process.env.EMAIL_USER,
				to: email,
				subject: "Confirmación de cuenta - PaperMind.app",
			});

			if (!info.accepted.length) throw new Error("Email not sent");

			return {
				status: 200,
				message: `Email sent successfully ${info}`,
			};
		} catch (error) {
			return {
				status: 400,
				message: `Email not sent ${error}`,
			};
		}
	}
}

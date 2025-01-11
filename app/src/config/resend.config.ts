import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

/**
 * this class is used to send emails with provider resend
 *
 * todo: pending better practices and config real...
 */

const resend = new Resend(process.env.RESEND_API_KEY);

(async () => {
	try {
		const { data, error } = await resend.emails.send({
			from: "",
			to: [],
			subject: "",
			html: "",
		});

		if (error) {
			console.log(error);
		}

		console.log(data);
	} catch (error) {
		console.log(error);
	}
})();

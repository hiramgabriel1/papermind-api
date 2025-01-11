import { Resend } from "resend";
import dotenv from "dotenv";
import {
	IReasonNotification,
	ITemplateNotification,
} from "../types/smtp.types";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 *
 * @param reasonNotification
 * @param email
 * @param user
 * @param projectName
 * @param urlInvitation --- url created
 * @param responseInvitation
 * @returns
 */
export const sendNotificationResend = async (
	reasonNotification: IReasonNotification,
	email: string,
	user: string,
	projectName: string,
	urlInvitation?: string,
	responseInvitation?: string
) => {
	let subjectReasonNotification = "";
	let htmlNotification = "";

	if (!reasonNotification) {
		return {
			status: 400,
			message: "Faltan datos para enviar la notificación",
			details: "origin: provider sendNotificationResend",
		};
	}

	const { data, error } = await resend.emails.send({
		from: String(process.env.EMAIL_DOMAIN_PROVIDER),
		to: email,
		subject: subjectReasonNotification,
		html: htmlNotification,
	});

	if (error) {
		return {
			status: 400,
			message: "Error al enviar la notificación",
			details: "origin: provider sendNotificationResend",
		};
	}

	switch (reasonNotification) {
		/**
		 * service to notify the creator that they invited a user to their project
		 */
		case IReasonNotification.INVITATION_COLLABORATOR:
			subjectReasonNotification = `Invitación de colaboración enviada a ${user} - PaperMind.app`;
			htmlNotification = ITemplateNotification.INVITATION_COLLABORATOR;

			return {
				status: 200,
				message: "Notificación enviada",
				details: "origin: provider sendNotificationResend",
			};

		/**
		 * service to notify the collaborator that they received an invitation
		 */
		case IReasonNotification.NOTIFY_COLLABORATOR:
			subjectReasonNotification = `Hola! ${user} haz recibido una invitación para participar en el proyecto: ${projectName} - PaperMind.app`;
			htmlNotification = ITemplateNotification.NOTIFY_COLLABORATOR;

			return {
				status: 200,
				message: "Notificación enviada",
				details: "origin: provider sendNotificationResend",
			};

		/**
		 * service to notify the collaborator that he accepted or rejected an invitation
		 */
		case IReasonNotification.RESPONSE_INVITATION_COLLABORATOR:
			subjectReasonNotification = `Hola! ${user} haz ${responseInvitation}: ${projectName} - PaperMind.app`;
			htmlNotification = ITemplateNotification.NOTIFY_COLLABORATOR;

			return {
				status: 200,
				message: "Notificación enviada",
				details: "origin: provider sendNotificationResend",
			};

		/**
		 * default case in the reasonNotification is not valid
		 */
		default:
			return {
				status: 400,
				message: "Faltan datos para enviar la notificación",
				details: "origin: provider sendNotificationResend",
			};
	}
};

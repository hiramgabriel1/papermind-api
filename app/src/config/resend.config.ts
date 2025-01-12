import { Resend } from "resend";
import dotenv from "dotenv";
import {
	IReasonNotification,
	ITemplateNotification,
} from "../types/smtp.types";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Enviar notificación por correo usando Resend
 */
export const sendNotificationResend = async (
	reasonNotification: IReasonNotification,
	email: string,
	user?: string,
	projectName?: string,
	urlInvitation?: string,
	responseInvitation?: string
) => {
	if (!reasonNotification || !email) {
		return {
			status: 400,
			message: "Faltan datos para enviar la notificación",
			details: "origin: provider sendNotificationResend",
		};
	}

	let subjectReasonNotification = "";
	let htmlNotification = "";

	switch (reasonNotification) {
		case IReasonNotification.INVITATION_COLLABORATOR:
			if (!user) {
				return {
					status: 400,
					message: "Faltan datos: 'user' es requerido",
					details: "origin: provider sendNotificationResend",
				};
			}
			subjectReasonNotification = `Invitación de colaboración enviada a ${user} - PaperMind.app`;
			htmlNotification = ITemplateNotification.INVITATION_COLLABORATOR;
			break;

		case IReasonNotification.NOTIFY_COLLABORATOR:
			if (!user || !projectName) {
				return {
					status: 400,
					message: "Faltan datos: 'user' y 'projectName' son requeridos",
					details: "origin: provider sendNotificationResend",
				};
			}
			subjectReasonNotification = `Hola ${user}, has recibido una invitación para colaborar en el proyecto ${projectName} - PaperMind.app`;
			htmlNotification = ITemplateNotification.NOTIFY_COLLABORATOR;
			break;

		case IReasonNotification.RESPONSE_INVITATION_COLLABORATOR:
			if (!user || !projectName || !responseInvitation) {
				return {
					status: 400,
					message:
						"Faltan datos: 'user', 'projectName' y 'responseInvitation' son requeridos",
					details: "origin: provider sendNotificationResend",
				};
			}
			subjectReasonNotification = `Hola ${user}, has ${responseInvitation} la invitación para ${projectName} - PaperMind.app`;
			htmlNotification = ITemplateNotification.NOTIFY_COLLABORATOR;
			break;

		default:
			return {
				status: 400,
				message: "Tipo de notificación no válido",
				details: "origin: provider sendNotificationResend",
			};
	}

	try {
		const { data, error } = await resend.emails.send({
			from: process.env.EMAIL_DOMAIN_PROVIDER || "",
			to: email,
			subject: subjectReasonNotification,
			html: htmlNotification,
		});

		if (error) {
			console.error("Error al enviar correo:", error);
			return {
				status: 500,
				message: "Error interno al enviar la notificación",
				details: error.message || "origin: provider sendNotificationResend",
			};
		}

		console.log("Correo enviado:", data);
		return {
			status: 200,
			message: "Notificación enviada",
			details: "origin: provider sendNotificationResend",
		};
	} catch (err) {
		console.error("Error inesperado al enviar correo:", err);
		return {
			status: 500,
			message: "Error inesperado al enviar la notificación",
			details:
				err instanceof Error
					? err.message
					: "origin: provider sendNotificationResend",
		};
	}
};


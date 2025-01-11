import { sendNotificationResend } from "../config/resend.config";
import { IReasonNotification } from "../types/smtp.types";

/**
 * this class is used to send emails to collaborators
 */
export class NotificationServices {
	/**
	 *
	 * this method is used to invite a collaborator to a project
	 *
	 * @param email
	 * @param urlInvitation
	 * @param projectName
	 * @returns
	 */
	async inviteCollaborator(
		email: string,
		urlInvitation: string,
		projectName: string,
		userInvited: string
	) {
		try {
			if (!email || !urlInvitation || !projectName) {
				return {
					status: 400,
					message: "Faltan datos para enviar la invitación",
				};
			}

			const resNotification = await sendNotificationResend(
				IReasonNotification.INVITATION_COLLABORATOR,
				email,
				userInvited,
				projectName,
				urlInvitation,
				""
			);

			console.log(resNotification);

			if (resNotification.status !== 200) {
				return {
					status: 400,
					message: "No se pudo enviar la invitación",
					details: "origin: provider sendNotificationResend",
				};
			}

			return {
				status: 200,
				message: "Invitación enviada",
			};
		} catch (error) {
			return {
				status: 400,
			};
		}
	}

	/**
	 *
	 * this method is used to notify a collaborator that he has been accepted to a project
	 *
	 * @param email
	 * @param projectName
	 * @param description
	 * @returns
	 */
	async notifyCollaborator(
		email: string,
		projectName: string,
		userInvited: string,
		description: string
	) {
		try {
			if (!email || !projectName || !description) {
				return {
					status: 400,
					message: "Faltan datos para la notificación",
				};
			}

			await sendNotificationResend(
				IReasonNotification.NOTIFY_COLLABORATOR,
				email,
				userInvited,
				projectName
			);

			return {
				status: 200,
				message: "Notificación enviada",
			};
		} catch (error) {
			return {
				status: 400,
			};
		}
	}

	/**
	 *
	 * this method is used to notify at creator of project that a collaborator has been invited
	 *
	 * @param email
	 * @param message
	 * @returns
	 */
	async notifyCreator(email: string, message: string) {
		try {
			if (!email || !message) {
				return {
					status: 400,
					message: "Faltan datos para la notificación",
				};
			}

			await sendNotificationResend(
				IReasonNotification.RESPONSE_INVITATION_COLLABORATOR,
				email,
				"",
				"",
				"",
				message
			);

			return {
				status: 200,
			};
		} catch (error) {
			return {
				status: 400,
			};
		}
	}
}

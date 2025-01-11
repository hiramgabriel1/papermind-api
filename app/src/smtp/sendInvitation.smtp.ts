/**
 * this class is used to send emails to collaborators
 */
export class InvitationsService {
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
		projectName: string
	) {
		try {
			if (!email || !urlInvitation || !projectName) {
				return {
					status: 400,
					message: "Faltan datos para enviar la invitación",
				};
			}

			return {
				status: 200,
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
		description: string
	) {
		try {
			if (!email || !projectName || !description) {
				return {
					status: 400,
					message: "Faltan datos para la notificación",
				};
			}

			return {
				status: 200,
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
	async notifyUser(email: string, message: string) {
		try {
			if (!email || !message) {
				return {
					status: 400,
					message: "Faltan datos para la notificación",
				};
			}

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

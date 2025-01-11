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
		projectName?: string
	) {
		try {
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
	 * this method is used to notify a collaborator that he has been invited to a project
	 * @param email
	 * @param projectName
	 * @param description
	 * @returns
	 */
	async notifyCollaborator(email: string, projectName: string) {
		try {
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
	 *
	 * @param email
	 * @param message
	 * @returns
	 */
	async notifyUser(email: string, message: string) {
		try {
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

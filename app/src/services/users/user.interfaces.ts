export interface IUser {
	id: number;
	username: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	password: string;
}

// todo: pending
export interface IDirectory {}

// todo: pending
export interface ICollaborators {
	userId: number;
}

export interface IUserChat {
	userId: number;
	title: string;
	description: string;
	file: string;
	collaborators?: ICollaborators[];
	directory?: IDirectory;
}

import bcrypt from "bcrypt";

/**
 *
 * this method is used to encrypt the password
 *
 * @param password
 * @returns
 */
export const encryptPassword = async (password: string) => {
	const salt = await bcrypt.genSalt(10);
	const hash = await bcrypt.hash(password, salt);

	return hash;
};

/**
 *
 * this method is used to compare the password
 *
 * @param comparedPassword
 * @param password
 *
 *  @returns result password
 *
 */
export const comparePassword = async (
	comparedPassword: string,
	password: string
) => {
	return await bcrypt.compare(comparedPassword, password);
};

import pdf from "pdf-parse";

/**
 *
 * @description Extract content from a file
 * @param content
 */

export const extractContentFile = async (content: Buffer) => {
	const result = await pdf(content);

	// todo: read number pages of the file
	// console.log(result.numpages);

	return result.text;
};

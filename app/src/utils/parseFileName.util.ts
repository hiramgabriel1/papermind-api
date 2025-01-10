/**
 *
 * this method is used to parse the filename --- removing spaces and replacing them with underscores " _ "
 *
 * @param fileName
 *
 * @returns
 */

export const parseFileName = (fileName: string) => {
	// todo: remove accents too
	return fileName.split(" ").join("_");
};

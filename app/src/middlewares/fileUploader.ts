import multer from "multer";
import path from "path";

/**
 * @description
 * this function is used to upload a file to the server
 */
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		console.log(file);
		cb(null, path.join(__dirname, "../../../temp/"));
	},
	filename: (req, file, cb) => {
		console.log(file.originalname);

		cb(null, `${file.originalname}`);
	},
});

const fileUploaderMiddleware = multer({
	storage,
}).single("fileUpload");

export default fileUploaderMiddleware;

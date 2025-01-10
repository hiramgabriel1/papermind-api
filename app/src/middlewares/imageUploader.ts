import multer from "multer";
import path from "path";

/**
 * @description
 * this function is used to upload a profile image to server
 */
const storage = multer.diskStorage({
	destination: (_req, _file, cb) =>
		cb(null, path.join(__dirname, "../../../temp/")),
	filename: (_req, file, cb) => cb(null, `${file.originalname}`),
});

const profileImageUploader = multer({
	storage,
}).single("profileImage");

export default profileImageUploader;

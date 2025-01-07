import { Request, Response, Router } from "express";
import UserService from "../services/users.service";

const userService = new UserService();
const userRouter = Router();
const path = "/api/v1/users";

userRouter.post(`${path}/create-user`, async (req: Request, res: Response) => {
	await userService.createProfile(req, res);
});

export default userRouter;

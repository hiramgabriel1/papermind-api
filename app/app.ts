import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./src/routes/users/users.routes";
import rateLimit from "express-rate-limit";

/**
 * @description
 *
 * in this file we are going to configure the server and the routes
 *
 */

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 60,
	message: "too many request!",
});

app.disable("x-powered-by");

app.use(limiter);
app.use(express.json());
app.use(morgan("dev"));
app.use(
	cors({
		origin: "http://localhost:5173",
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
		exposedHeaders: ["Content-Type", "Authorization"],
	})
);

// todo: endpoints
app.use(userRouter);

const bootstrap = () => {
	app.listen(PORT, () =>
		console.log(
			`to restart server: write RS and press enter key
			 in line command`
		)
	);
};

bootstrap();

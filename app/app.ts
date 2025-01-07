import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./src/routes/users.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

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

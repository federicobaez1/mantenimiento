import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import { authRouter } from "./routes/authRoutes.js";
import { equipoRouter } from "./routes/equipoRoutes.js";
import { ordenRouter } from "./routes/ordenRoutes.js";
import { usuarioRouter } from "./routes/usuarioRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./utils/asyncHandler.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use("/api/auth", authRouter);
app.use("/api/equipos", equipoRouter);
app.use("/api/ordenes", ordenRouter);
app.use("/api/usuarios", usuarioRouter);

app.use(notFound);
app.use(errorHandler);
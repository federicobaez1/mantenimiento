import { Router } from "express";
import { resumen } from "../controllers/resumenController.js";
import { authenticate } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const resumenRouter = Router();

resumenRouter.get("/", authenticate, asyncHandler(resumen));
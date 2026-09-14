import { Router } from "express";
import { body } from "express-validator";
import { login, register } from "../controllers/authController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
  body("email").isEmail().withMessage("Email inválido"),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("rol").optional().isIn(["ADMIN", "TECNICO"]).withMessage("Rol inválido"),
  asyncHandler(register),
);

authRouter.post(
  "/login",
  body("email").isEmail().withMessage("Email inválido"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  asyncHandler(login),
);
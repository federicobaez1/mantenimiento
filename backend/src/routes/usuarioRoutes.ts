import { Router } from "express";
import { body, param } from "express-validator";
import {
  createUsuario,
  deleteUsuario,
  listUsuarios,
  updateUsuario,
} from "../controllers/usuarioController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const usuarioRouter = Router();

usuarioRouter.use(authenticate, authorize("ADMIN"));

usuarioRouter.get("/", asyncHandler(listUsuarios));

usuarioRouter.post(
  "/",
  body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),
  body("email").isEmail().withMessage("Email inválido"),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("rol").optional().isIn(["ADMIN", "TECNICO"]).withMessage("Rol inválido"),
  validate,
  asyncHandler(createUsuario),
);

usuarioRouter.patch(
  "/:id",
  param("id").isInt().withMessage("Id inválido"),
  body("nombre").optional().trim().notEmpty().withMessage("El nombre no puede quedar vacío"),
  body("email").optional().isEmail().withMessage("Email inválido"),
  body("password")
    .optional({ values: "falsy" })
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("rol").optional().isIn(["ADMIN", "TECNICO"]).withMessage("Rol inválido"),
  validate,
  asyncHandler(updateUsuario),
);

usuarioRouter.delete(
  "/:id",
  param("id").isInt().withMessage("Id inválido"),
  validate,
  asyncHandler(deleteUsuario),
);
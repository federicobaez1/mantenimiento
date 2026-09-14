import { Router } from "express";
import { body, param } from "express-validator";
import {
  createEquipo,
  deleteEquipo,
  getEquipo,
  listEquipos,
  updateEquipo,
} from "../controllers/equipoController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const equipoRouter = Router();

equipoRouter.use(authenticate);

equipoRouter.get("/", asyncHandler(listEquipos));
equipoRouter.get("/:id", param("id").isInt(), validate, asyncHandler(getEquipo));

equipoRouter.post(
  "/",
  body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
  body("codigo").notEmpty().withMessage("El código es obligatorio"),
  validate,
  authorize("ADMIN", "TECNICO"),
  asyncHandler(createEquipo),
);

equipoRouter.put(
  "/:id",
  param("id").isInt(),
  validate,
  authorize("ADMIN", "TECNICO"),
  asyncHandler(updateEquipo),
);

equipoRouter.delete(
  "/:id",
  param("id").isInt(),
  validate,
  authorize("ADMIN"),
  asyncHandler(deleteEquipo),
);
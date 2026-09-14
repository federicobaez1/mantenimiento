import { Router } from "express";
import { body, param } from "express-validator";
import {
  createOrden,
  deleteOrden,
  getOrden,
  listOrdenes,
  updateOrden,
} from "../controllers/ordenController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const ordenRouter = Router();

ordenRouter.use(authenticate);

ordenRouter.get("/", asyncHandler(listOrdenes));
ordenRouter.get("/:id", param("id").isInt(), validate, asyncHandler(getOrden));

ordenRouter.post(
  "/",
  body("tipo").notEmpty().withMessage("El tipo es obligatorio"),
  body("descripcion").notEmpty().withMessage("La descripción es obligatoria"),
  body("fechaProgramada").isISO8601().withMessage("Fecha programada inválida"),
  body("equipoId").isInt().withMessage("Equipo inválido"),
  validate,
  asyncHandler(createOrden),
);

ordenRouter.put(
  "/:id",
  param("id").isInt(),
  body("fechaProgramada").optional().isISO8601(),
  body("fechaRealizada").optional({ nullable: true }).isISO8601(),
  body("estado").optional().isIn(["PENDIENTE", "EN_PROGRESO", "COMPLETADA", "CANCELADA"]),
  validate,
  asyncHandler(updateOrden),
);

ordenRouter.delete(
  "/:id",
  param("id").isInt(),
  validate,
  authorize("ADMIN"),
  asyncHandler(deleteOrden),
);
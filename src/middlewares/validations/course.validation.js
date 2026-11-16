// * ARCHIVO A COMPLETAR
// * Imports y courseIdValidation ya resueltos
import { body, param } from "express-validator";
import Course from "../../models/course.model.js";
import Topic from "../../models/topic.model.js";
import User from "../../models/user.model.js";

export const courseIdValidation = [
  param("id").isMongoId().withMessage("El ID del curso no es válido"),
];

export const createCourseValidation = [
  body("title") // TODO 1: de 3 a 100 caracteres y único (custom con una consulta a la base).
    .isLength({ min: 3, max: 100 })
    .withMessage("El título debe tener entre 3 y 100 caracteres")
    .custom(async (title) => {
      const courseExists = await Course.findOne({ title });

      if (courseExists) {
        throw new Error("Ya existe un curso con ese título");
      }

      return true;
    }),

  body("description") // TODO 2: de 10 a 500 caracteres.
    .isLength({ min: 10, max: 500 })
    .withMessage("La descripción debe tener entre 10 y 500 caracteres"),

  body("level") // TODO 3: opcional; valores permitidos: ["beginner", "intermediate", "advanced"].
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("El nivel no es válido"),

  body("price") // TODO 4: opcional; número mayor o igual a 0.
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El precio debe ser un número mayor o igual a 0"),

  body("schedule.day") // TODO 5: valores permitidos: ["monday", "tuesday", "wednesday", "thursday", "friday"].
    .isIn(["monday", "tuesday", "wednesday", "thursday", "friday"])
    .withMessage("El día de la semana no es válido"),

  body("schedule.startTime") // TODO 6: fecha válida (Date), obligatoria.
    .notEmpty()
    .withMessage("La hora de inicio es obligatoria")
    .bail()
    .isISO8601()
    .withMessage("La fecha de inicio no es válida"),

  body("schedule.endTime") // TODO 7: fecha válida (Date), obligatoria, y posterior a startTime (custom).
    .notEmpty()
    .withMessage("La hora de finalización es obligatoria")
    .bail()
    .isISO8601()
    .withMessage("La fecha de finalización no es válida")
    .bail()
    .custom((endTime, { req }) => {
      const startTime = new Date(req.body.schedule.startTime);
      const end = new Date(endTime);

      if (end <= startTime) {
        throw new Error("La hora de finalización debe ser posterior al inicio");
      }

      return true;
    }),

  body("teacher") // TODO 8: obligatorio; ID de MongoDB válido y el teacher debe existir y estar activo, es decir, con deletedAt null (custom).
    .notEmpty()
    .withMessage("El profesor es obligatorio")
    .bail()
    .isMongoId()
    .withMessage("El ID del profesor no es válido")
    .bail()
    .custom(async (teacherId) => {
      const teacherExists = await User.findOne({
        _id: teacherId,
        deletedAt: null,
      });

      if (!teacherExists) {
        throw new Error("El profesor no existe o está eliminado");
      }

      return true;
    }),

  body("topics") // TODO 9: opcional; array cuyos IDs existan en la base (custom).
    .optional()
    .isArray()
    .withMessage("Los temas deben enviarse en un array")
    .bail()
    .custom(async (topics) => {
      const topicsExist = await Topic.find({
        _id: { $in: topics },
      });

      if (topicsExist.length !== topics.length) {
        throw new Error("Uno o más temas no existen");
      }

      return true;
    }),
];

export const updateCourseValidation = [
  param("id") // TODO 10: validar con isMongoId().
    .isMongoId()
    .withMessage("El ID del curso no es válido"),

  body("title") // TODO 11: igual que en la creación, pero opcional. La unicidad debe excluir al propio curso.
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage("El título debe tener entre 3 y 100 caracteres")
    .bail()
    .custom(async (title, { req }) => {
      const courseExists = await Course.findOne({
        title,
        _id: { $ne: req.params.id },
      });

      if (courseExists) {
        throw new Error("Ya existe otro curso con ese título");
      }

      return true;
    }),

  body("description") // TODO 12: igual que en la creación, pero opcional.
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage("La descripción debe tener entre 10 y 500 caracteres"),

  body("level") // TODO 13: igual que en la creación, pero opcional (valores permitidos: ["beginner", "intermediate", "advanced"]).
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("El nivel no es válido"),

  body("price") // TODO 14: igual que en la creación, pero opcional.
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El precio debe ser un número mayor o igual a 0"),

  body("schedule.day") // TODO 15: igual que en la creación, pero opcional (valores permitidos: ["monday", "tuesday", "wednesday", "thursday", "friday"]).
    .optional()
    .isIn(["monday", "tuesday", "wednesday", "thursday", "friday"])
    .withMessage("El día de la semana no es válido"),

  body("schedule.startTime") // TODO 16: igual que en la creación, pero opcional.
    .optional()
    .isISO8601()
    .withMessage("La fecha de inicio no es válida"),

  body("schedule.endTime") // TODO 17: igual que en la creación, pero opcional (y posterior a startTime si ambos llegan).
    .optional()
    .isISO8601()
    .withMessage("La fecha de finalización no es válida")
    .bail()
    .custom((endTime, { req }) => {
      if (req.body.schedule?.startTime) {
        const startTime = new Date(req.body.schedule.startTime);
        const end = new Date(endTime);

        if (end <= startTime) {
          throw new Error(
            "La hora de finalización debe ser posterior al inicio",
          );
        }
      }

      return true;
    }),

  body("teacher") // TODO 18: igual que en la creación, pero opcional.
    .optional()
    .isMongoId()
    .withMessage("El ID del profesor no es válido")
    .bail()
    .custom(async (teacherId) => {
      const teacherExists = await User.findOne({
        _id: teacherId,
        deletedAt: null,
      });

      if (!teacherExists) {
        throw new Error("El profesor no existe o está eliminado");
      }

      return true;
    }),

  body("topics") // TODO 19: igual que en la creación, pero opcional.
    .optional()
    .isArray()
    .withMessage("Los temas deben enviarse en un array")
    .bail()
    .custom(async (topics) => {
      const topicsExist = await Topic.find({
        _id: { $in: topics },
      });

      if (topicsExist.length !== topics.length) {
        throw new Error("Uno o más temas no existen");
      }

      return true;
    }),
];

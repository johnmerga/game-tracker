import { z } from "zod";
import { ErrorResponseSchema, GameNameParamSchema } from "../types";

export const validate = <T>(schema: z.ZodSchema<T>, data: any) => {
  try {
    const parsedData = schema.parse(data);
    return { success: true, data: parsedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return {
      success: false,
      error: [{ message: "Validation failed due to an unknown error." }],
    };
  }
};

export const validateGameNameParam = (gameName: string) => {
  return validate(GameNameParamSchema, { gameName });
};

export const formatValidationError = (
  errors: z.ZodIssue[],
): z.infer<typeof ErrorResponseSchema> => {
  return {
    status: "error",
    message: "Validation failed",
    details: errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
      code: err.code,
    })),
  };
};

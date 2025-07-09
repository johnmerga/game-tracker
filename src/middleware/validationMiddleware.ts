import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { formatValidationError } from "../utils/validation";

export const validateRequest = (
  schema: z.ZodSchema<any>,
  target: "body" | "params" | "query",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return res.status(400).json(formatValidationError(result.error.errors));
    }

    req[target] = result.data;
    next();
  };
};

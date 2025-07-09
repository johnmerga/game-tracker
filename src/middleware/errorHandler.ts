import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../types";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("[Global Error Handler] Uncaught error:", err.stack);

  const errorResponse: ErrorResponse = {
    status: "error",
    message: "An unexpected server error occurred.",
    details: err.message,
  };

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json(errorResponse);
};

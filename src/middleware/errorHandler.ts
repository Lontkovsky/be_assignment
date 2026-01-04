import { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/httpErrors";

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof HttpError) {
    const payload = error.details
      ? { error: error.message, details: error.details }
      : { error: error.message };

    res.status(error.status).json(payload);
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Internal Server Error" });
}

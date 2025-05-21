import { Request, Response, NextFunction } from "express";

export class HttpException extends Error {
  constructor(public status: number, public message: string) {
    super(message);
    this.status = status;
  }
}

export const errorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const status = error.status || 500;
  const message = error.message || "Something went wrong";

  res.status(status).json({
    status,
    message,
  });
};

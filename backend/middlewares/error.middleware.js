import { ZodError } from "zod";
import { HttpError } from "../utils/http-error.js";

export function errorMiddleware(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof ZodError) {
    return res.status(400).json({ success: false, error: { message: "Invalid request parameters" } });
  }
  if (error instanceof HttpError) {
    return res.status(error.status).json({ success: false, error: { message: error.message } });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, error: { message: "Invalid JSON body" } });
  }
  console.error("Internal server error:", error);
  return res.status(500).json({ success: false, error: { message: "Internal server error" } });
}

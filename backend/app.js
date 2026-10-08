import "dotenv/config";
import express from "express";
import cors from "cors";

import propertyRoutes from "./routes/property.routes.js";
import chatRoutes from "./routes/chat.routes.js";

import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/properties", propertyRoutes);
app.use("/api/chat", chatRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Route not found",
    },
  });
});

app.use(errorMiddleware);

export default app;
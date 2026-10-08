import { Router } from "express";

import {
  chat,
  chatStream,
} from "../controllers/chat.controller.js";

const router = Router();

router.post("/", chat);

router.post(
  "/stream",
  chatStream
);

export default router;
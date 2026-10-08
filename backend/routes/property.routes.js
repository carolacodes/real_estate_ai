import { Router } from "express";
import * as properties from "../controllers/property.controller.js";

const router = Router();
router.get("/", properties.getAllProperties);
router.get("/featured", properties.getFeaturedProperties);
router.get("/search", properties.searchProperties);
router.get("/:slug", properties.getPropertyBySlug);
export default router;

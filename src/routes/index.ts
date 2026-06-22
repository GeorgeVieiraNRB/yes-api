import { Router } from "express";
import { isUp } from "../controllers/is-up";

export const router = Router();

router.get("/", isUp);
router.get("/isup", isUp);

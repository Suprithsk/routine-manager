import { login, signup, getUser } from "../controllers/authController";
import express from "express";
import { userLoginSchema, userSignupSchema } from "../schemas/authSchema";
import { zodPostMiddleware } from "../middlewares/zodMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
const router = express.Router();

router.post("/signup", zodPostMiddleware(userSignupSchema), signup);
router.post("/login", zodPostMiddleware(userLoginSchema), login);
router.get('/', authMiddleware as any, getUser as express.RequestHandler);

export default router;

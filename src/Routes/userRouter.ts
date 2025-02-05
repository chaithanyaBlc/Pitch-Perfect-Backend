import { Router, Request, Response } from "express";
const router = Router();
import { userSignup, userLogin, userUpdate } from "../controller/userController";
import { protect } from "../middleware/auth";

router.post("/signup", userSignup);
router.post("/login", userLogin);

//Protected Routes
router.post("/update", protect, userUpdate);

export default router;
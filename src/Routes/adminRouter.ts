import { Router, Request, Response } from "express";
const router = Router();
import { completeAdminSetup } from '../controller/superAdminController';

router.post('/complete-setup', completeAdminSetup);

export default router;
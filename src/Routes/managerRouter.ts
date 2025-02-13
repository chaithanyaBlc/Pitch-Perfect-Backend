import { Router, Request, Response } from "express";
const router = Router();
import path from 'path';
import { protect } from '../middleware/auth';

import { completeManagerInitialization } from '../controller/adminController';

router.post('/complete-setup' ,completeManagerInitialization);

export default router;
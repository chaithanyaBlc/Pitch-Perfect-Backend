import { Router, Request, Response } from "express";
import { createAdmin, initializeSuperAdmin, createSuperAdmin, completeSuperAdminSetup, superAdminLogin, getAllAdmins, getAllSuperAdmins, getAllLogs, updateSuperAdmin } from "../controller/superAdminController";
import path from 'path';
import { protect } from '../middleware/auth';
import { generateToken } from '../utils/auth';
const router = Router();


router.get('/login', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/login.html'))
});
router.get('/initialize/:token', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/setup.html'));
});
router.post('/initialize', initializeSuperAdmin);
router.post('/create', createSuperAdmin);
router.post('/login', superAdminLogin);
router.patch('/update', protect, updateSuperAdmin)

router.post('/complete-setup', completeSuperAdminSetup);
router.get('/dashboard',(req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'))
})

router.get('/logs', protect, getAllLogs);

//Admin Routes
router.get('/admin/create', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/createAdmin.html'))
})
router.post('/admin/create',protect, createAdmin);
router.get('/admin/all', protect, getAllAdmins);
router.get('/all', protect, getAllSuperAdmins )


export default router;
 
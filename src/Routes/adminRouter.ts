import { Router, Request, Response } from "express";
const router = Router();
import path from 'path';
import { protect } from '../middleware/auth';
import { completeAdminSetup } from '../controller/superAdminController';
import { adminLogin,createManager, generateQRImage, getManagers, deactivateManager, createLocation, getLocations, deactivateLocation, addTurf, getTurfs, deactivateTurf, assignManager, deassignManager } from '../controller/adminController';


router.get('/login', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/login.html'))
});


router.post('/location/assign-manager', protect, assignManager);
router.post('/location/deassign-manager', protect, deassignManager);

router.post('/login', adminLogin);
router.post('/create-manager', protect, createManager);

router.get('/get-managers', protect, getManagers);

router.post('/deactivate-manager', protect, deactivateManager);

router.post('/create-location', protect, createLocation);

router.get('/get-locations', protect, getLocations);

router.post('/deactivate-location', protect, deactivateLocation);

router.post('/add-turf', protect, addTurf);

router.get('/get-turfs', protect, getTurfs);

router.post('/deactivate-turf', protect, deactivateTurf);

router.post('/complete-setup', completeAdminSetup);

router.post('/generate-qr', generateQRImage)

export default router;
import { Router, Request, Response } from "express";
const router = Router();
import { completeAdminSetup } from '../controller/superAdminController';
import { createManager, getManagers, deactivateManager, createLocation, getLocations, deactivateLocation, addTurf, getTurfs, deactivateTurf } from '../controller/adminController';

router.post('/create-manager', createManager);

router.get('/get-managers', getManagers);

router.post('/deactivate-manager', deactivateManager);

router.post('/create-location', createLocation);

router.get('/get-locations', getLocations);

router.post('/deactivate-location', deactivateLocation);

router.post('/add-turf', addTurf);

router.get('/get-turfs', getTurfs);

router.post('/deactivate-turf', deactivateTurf);

router.post('/complete-setup', completeAdminSetup);

export default router;
import { Router, Request, Response } from "express";
import { getAllLocations, getLocationById, getAllTurfs, getTurfById, getSlotDetails } from '../controller/locationTurfController';
import { lockTurf, confirmBooking, cancelBooking } from '../controller/bookingController';

const router = Router();

router.get('/locations', getAllLocations);
router.get('/location/:id', getLocationById);
router.get('/turfs', getAllTurfs);
router.get('/turf/:id', getTurfById);
router.get('/turf/:id/get-slots', getSlotDetails);
router.post('/turf/:id/lock', lockTurf);
router.post('/booking/:id/confirm', confirmBooking);
router.post('/booking/:id/cancel', cancelBooking);

export default router;
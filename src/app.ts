import { Request, Response } from 'express';
const express = require('express');
const cors = require('cors')
require('dotenv').config()
import { sendSetupEmail } from "./utils/email"
import superadminRoutes from './Routes/superAdminRouter';
import adminRoutes from './Routes/adminRouter';
import userRoutes from './Routes/userRouter';
import managerRoutes from './Routes/managerRouter';
import locationTurfRoutes from './Routes/locationTurfRouter';
import sequelize from './config/db';
import { SuperAdmin } from './models/SuperAdmin';
import { Admin } from './models/Admin';
import { Booking } from './models/Booking';
import { Location } from './models/Location';
import path, { resolve } from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { TemporaryReservation, Turf } from './models';
import { Op } from '@sequelize/core'
import { start } from 'repl';

const app = express();
const server = http.createServer(app);
const port = 3000;

app.use(cors({
    origin: 'http://localhost:4200', 
    credentials: false 
  }));

// app.use(cors())
// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:4200",
//         methods: ["GET", "POST"]
//     }
// });


// async function seedData() {
//     try {
//         // Sync the database (force: true drops existing tables)
//         await sequelize.sync();
//         console.log('Database synced.');

//         // Create multiple sample locations in Mumbai, India
//         const location1 = await Location.create({
//             name: "Marine Drive Ground",
//             coordinates: { lat: 18.9435, lng: 72.8238 },
//             amenities: { wifi: true, parking: true },
//             city: "Mumbai",
//             description: "Scenic seaside ground ideal for sports and events.",
//             images: ["marine_drive1.jpg", "marine_drive2.jpg"],
//             openingTime: "06:00",
//             closingTime: "22:00",
//             status: "active",
//             adminId: 1,
//             managerId: null,
//         });

//         const location2 = await Location.create({
//             name: "Bandra Sports Complex",
//             coordinates: { lat: 19.0595, lng: 72.8294 },
//             amenities: { wifi: false, parking: true },
//             city: "Mumbai",
//             description: "Well-equipped sports complex with multiple turfs.",
//             images: ["bandra_sports1.jpg", "bandra_sports2.jpg"],
//             openingTime: "07:00",
//             closingTime: "23:00",
//             status: "active",
//             adminId: 1,
//             managerId: null,
//         });

//         const location3 = await Location.create({
//             name: "Andheri Turf Arena",
//             coordinates: { lat: 19.1197, lng: 72.8469 },
//             amenities: { wifi: true, parking: true },
//             city: "Mumbai",
//             description: "Premium synthetic turf for multiple sports.",
//             images: ["andheri_arena1.jpg", "andheri_arena2.jpg"],
//             openingTime: "05:30",
//             closingTime: "23:30",
//             status: "active",
//             adminId: 1,
//             managerId: null,
//         });

//         // Create multiple sample turfs associated with the locations
//         await Turf.create({
//             name: "Football Turf - Marine Drive",
//             duration: 60,
//             description: "High-quality grass turf with seaside view.",
//             cost_per_slot: 250,
//             ground_type: "grass",
//             sport_type: "football",
//             images: ["football_turf1.jpg", "football_turf2.jpg"],
//             locationId: location1.id,
//             status: "active",
//         });

//         await Turf.create({
//             name: "Cricket Pitch - Bandra",
//             duration: 90,
//             description: "Professionally maintained synthetic cricket pitch.",
//             cost_per_slot: 300,
//             ground_type: "synthetic",
//             sport_type: "cricket",
//             images: ["cricket_pitch1.jpg"],
//             locationId: location2.id,
//             status: "active",
//         });

//         await Turf.create({
//             name: "Badminton Court - Andheri",
//             duration: 45,
//             description: "Indoor badminton court with proper lighting.",
//             cost_per_slot: 150,
//             ground_type: "wooden",
//             sport_type: "badminton",
//             images: ["badminton_court1.jpg"],
//             locationId: location3.id,
//             status: "active",
//         });

//         await Turf.create({
//             name: "Basketball Court - Andheri",
//             duration: 60,
//             description: "Standard full-court basketball facility.",
//             cost_per_slot: 200,
//             ground_type: "concrete",
//             sport_type: "basketball",
//             images: ["basketball_court1.jpg"],
//             locationId: location3.id,
//             status: "active",
//         });

//         console.log("Dummy data seeded successfully.");
//     } catch (error) {
//         console.error("Error seeding data:", error);
//     }
// }



// io.on('connection', (socket) => {
//     console.log(`Client connected: ${socket.id} `);

//     socket.on('reserveSlot', async (data, callback) => {
//         try {
//             const { turfId, start_time, end_time } = data;

//             const startTime = new Date(start_time);
//             const endTime = new Date(end_time);

//             const existingBooking = await Booking.findOne({
//                 where: {
//                     turfId,
//                     start_time: { [Op.lt]: endTime },
//                     end_time: { [Op.gt]: startTime }
//                 }
//             });

//             const existingTempReservation = await TemporaryReservation.findOne({
//                 where: {
//                     turfId,
//                     expiresAt: { [Op.gt]: new Date() },
//                     start_time: { [Op.lt]: endTime },
//                     end_time: { [Op.gt]: startTime }
//                 }
//             });

//             if (existingBooking || existingTempReservation) {
//                 return callback({
//                     success: false,
//                     message: 'The requested slot is already reserved'
//                 })
//             }

//             const tempReservation = await TemporaryReservation.create({
//                 turfId,
//                 start_time: startTime,
//                 end_time: endTime,
//                 expiresAt: new Date(Date.now() + 5 * 60 * 1000)
//             })

//             io.emit('slotReserved', {
//                 turfId,
//                 start_time: startTime,
//                 end_time: endTime,
//                 tempReservationId: tempReservation.id
//             })

//             callback({ success: true, tempReservationId: tempReservation.id })
//         } catch (error) {
//             console.error('Error reserving slot:, error');
//             callback({ success: false, message: 'Error reserving slot' })
//         }
//     })

//     socket.on('confirmBooking', async (data, callback) => {
//         try {
//             const { tempReservationId, userId, paymentSuccess } = data;

//             if (!paymentSuccess) {
//                 await TemporaryReservation.destroy({ where: { id: tempReservationId}});
//                 io.emit('slotReleased', { tempReservationId });
//                 return callback({ success: false, message: 'Payment failed' });
//             }

//             const tempReservation = await TemporaryReservation.findByPk(tempReservationId);
//             if (!tempReservation) {
//                 return callback({ success: false, message: 'Reservation not found or expired'})
//             }

//             const turf = await Turf.findByPk(tempReservation.turfId);
//             if (!turf) {
//                 return callback({ success: false, message: 'Turf not found' });
//             }

//             const startTime = new Date(tempReservation.start_time);
//             const endTime = new Date(tempReservation.end_time);
//             const diffInMinutes = (endTime.getTime() - startTime.getTime() / (1000 * 60));
//             const nunmberOfSlots = Math.ceil(diffInMinutes / turf.duration);
//             const total_cost = turf.cost_per_slot * nunmberOfSlots;

//             const booking = await Booking.create({
//                 start_time: tempReservation.start_time,
//                 end_time: tempReservation.end_time,
//                 total_cost,
//                 booking_status: 'confirmed',
//                 payment_type: 'online',
//                 payment_status: 'paid',
//                 userId,
//                 turfId: tempReservation.turfId
//             })

//             await TemporaryReservation.destroy({ where: { id: tempReservationId }});

//             io.emit('slotBooked', {
//                 turfId: booking.turfId,
//                 start_time: booking.start_time,
//                 end_time: booking.end_time,
//                 bookingId: booking.id
//             });

//             callback({ success: true, booking });
//         } catch (error) {
//             console.error('Error confirming booking:', error);
//             callback({ success: false, message: 'Error confirming booking' });
//         }
//     })

//     socket.on('releaseSlot', async (data, callback) => {
//         try {
//             const { tempReservationId } = data;
//             await TemporaryReservation.destroy({ where: { id: tempReservationId } });
//             io.emit('slotReleased', { tempReservationId });
//             callback({ success: true });
//         } catch (error) {
//             console.error('Error releasing slot:', error);
//             callback({ success: false, message: 'Error releasing slot'});
//         }
//     })
// });



app.use(express.json());
app.use(cors({
    origin: 'http://localhost:4200', 
    credentials: false 
  }));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')))
app.get('/admin/initialize/:token', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '/public/setup.html'));
});

app.get('/manager/initialize/:token', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '/public/setup.html'));
})

app.get('/initialize', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '/public/initialize.html'))
})

app.get('/turf/:id/slots', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '/public/slots.html'))
})

app.use('/superadmin', superadminRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/manager', managerRoutes);
app.use(locationTurfRoutes)

app.get('/', (req: Request, res: Response) => {
    // res.send('Hello World!');
    res.sendFile(path.join(__dirname, '/public/home.html'));
})



sequelize.sync().then(async () => {
    // await seedData();
    server.listen(port, () => {
        console.log('Server is running on port: ', port);
        
    });
}).catch((err: Error) => console.log(err));
import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { Op } from '@sequelize/core';
import { CurrencyCodes } from 'validator/lib/isISO4217';

const LOCK_DURATION = 5 * 60 * 1000;

export const lockTurf = async (req: Request, res: Response): Promise<void> => {
    try {
        const { turfId, start_time, end_time, total_cost, payment_type } = req.body;

        if (!turfId || !start_time || !end_time || !total_cost || !payment_type) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const startTime = new Date(start_time);
        const endTime = new Date(end_time);

        const overlappingBooking = await Booking.findOne({
            where: {
                turfId,
                booking_status: { [Op.in]: ['pending', 'confirmed'] },
                start_time: { [Op.lt]: endTime },
                end_time: { [Op.gt]: startTime }
            }
        });

        if (overlappingBooking) {
            res.status(400).json({ message: "Turf is not available for the selected time slot" });
            return;
        }

        const booking = await Booking.create({
            turfId,
            start_time: startTime,
            end_time: endTime,
            total_cost,
            booking_status: 'pending',
            payment_type,
            payment_status: null
        });

        setTimeout(async () => {
            try {
                const currentBooking = await Booking.findByPk(booking.id);
                if (currentBooking && currentBooking.booking_status === 'pending') {
                    await currentBooking.update({ booking_status: 'canceled' });
                    console.log(`Booking ${booking.id} auto canceled due to timeout.`);
                }
            } catch (error) {
                console.log(`Error auto-canceling booking ${booking.id}`, error)
            }
        }, LOCK_DURATION);

        res.status(201).json({
            message: "Turf locked for booking. Please confirm within 5 minutes",
            data: booking
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error locking turf", error });
    }
}

export const confirmBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { userId } = req.body; 

        if (!id) {
            res.status(400).json({ message: "Booking id is required" });
            return;
        }

        if (!userId) {
            res.status(400).json({ message: "User id is required for confirming booking" });
            return;
        }

        const booking = await Booking.findByPk(id);
        if (!booking) {
            res.status(404).json({ message: "Booking not found" });
            return;
        }

        if (booking.booking_status !== 'pending') {
            res.status(400).json({ message: "Only pending bookings can be confirmed" });
            return;
        }

        
        await booking.update({ userId, booking_status: 'confirmed', payment_status: 'paid' });
        res.status(200).json({
            message: "Booking confirmed successfully",
            data: booking
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error confirming booking", error });
    }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ message: "Booking id is required" });
            return;
        }

        const booking = await Booking.findByPk(id);
        if (!booking) {
            res.status(404).json({ message: "Booking not found" });
            return;
        }

        await booking.update({ booking_status: 'canceled' });
        res.status(200).json({ message: "Booking canceled successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error canceling booking", error });
    }
};

export const getBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: "Booking id is required" });
            return;
        }

        const booking = await Booking.findByPk(id);
        if (!booking) {
            res.status(404).json({ message: "Booking not found" });
            return;
        }

        res.status(200).json({ data: booking });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching booking", error });
    }
};

export const getBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const bookings = await Booking.findAll();
        res.status(200).json({ data: bookings });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching bookings", error });
    }
};
// controllers/locationTurfController.ts
import { Request, Response } from 'express';
import { Location } from '../models/Location';
import { Turf } from '../models/Turf';
import { Booking } from '../models/Booking';
import { Op } from '@sequelize/core';

/**
 * Get all locations along with their associated turfs.
 */
export const getAllLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const locations = await Location.findAll({
        include: Turf,
    });
    res.status(200).json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: "Error fetching locations", error });
  }
};

/**
 * Get a single location by its id (with its associated turfs).
 */
export const getLocationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Location id is required" });
      return;
    }

    const location = await Location.findByPk(id, {
      
    });

    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }

    res.status(200).json({ data: location });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ message: "Error fetching location", error });
  }
};

/**
 * Get all turfs along with their associated location.
 */
export const getAllTurfs = async (req: Request, res: Response): Promise<void> => {
  try {
    const turfs = await Turf.findAll({
        // Include associated location (if defined in the model)
    });
    res.status(200).json(turfs);
  } catch (error) {
    console.error('Error fetching turfs:', error);
    res.status(500).json({ message: "Error fetching turfs", error });
  }
};

/**
 * Get a single turf by its id (with its associated location).
 */
export const getTurfById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Turf id is required" });
      return;
    }

    const turf = await Turf.findByPk(id, {
     
    });

    if (!turf) {
      res.status(404).json({ message: "Turf not found" });
      return;
    }

    res.status(200).json(turf);
  } catch (error) {
    console.error('Error fetching turf:', error);
    res.status(500).json({ message: "Error fetching turf", error });
  }
};




/**
 * getSlotDetailsForNext14Days
 *
 * Endpoint: GET /api/turfs/:id/slots/details
 *
 * - Retrieves the turf and its associated location.
 * - For the next 14 days, uses the location's opening and closing times to build a day's time window.
 * - Generates fixed 30-minute slots for each day.
 * - For each slot, checks against the Booking table (pending/confirmed) to determine if the slot is booked.
 * - Returns an array of day objects with date and slots (each with start_time, end_time, isBooked flag).
 */
export const getSlotDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // turf id

    // Retrieve the turf along with its associated location.
    const turf = await Turf.findByPk(id, { include: { association: 'Location' } });
    if (!turf) {
      res.status(404).json({ message: "Turf not found" });
      return;
    }
    const location = turf.Location;
    if (!location) {
      res.status(404).json({ message: "Associated location not found" });
      return;
    }

    // Parse the location's opening and closing times (assumed "HH:mm" format).
    const [openHour, openMinute] = (location.openingTime as string).split(':').map(Number);
    const [closeHour, closeMinute] = (location.closingTime as string).split(':').map(Number);

    // Use today's date as the starting point.
    const today = new Date();

    // Determine the overall range for the next 14 days.
    const startRange = new Date(today);
    startRange.setHours(openHour, openMinute, 0, 0);
    const endRange = new Date(today);
    endRange.setDate(endRange.getDate() + 14);
    endRange.setHours(closeHour, closeMinute, 0, 0);

    // Query all bookings for this turf within the next 14 days and during operating hours.
    const bookings = await Booking.findAll({
      where: {
        turfId: turf.id,
        booking_status: { [Op.in]: ['pending', 'confirmed'] },
        start_time: { [Op.gte]: startRange },
        end_time: { [Op.lte]: endRange }
      }
    });

    // Define a fixed slot duration: 30 minutes in milliseconds.
    const slotDurationMs = 30 * 60 * 1000; // 30 minutes

    // Array to hold slot details for each day.
    const result = [];

    // Loop for the next 14 days.
    for (let i = 0; i < 14; i++) {
      // Create a new date for the current day.
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() + i);

      // Format the date as "YYYY-MM-DD".
      const year = currentDay.getFullYear();
      const month = String(currentDay.getMonth() + 1).padStart(2, '0');
      const day = String(currentDay.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      // Construct the day's opening and closing Date objects.
      const dayOpen = new Date(currentDay);
      dayOpen.setHours(openHour, openMinute, 0, 0);
      const dayClose = new Date(currentDay);
      dayClose.setHours(closeHour, closeMinute, 0, 0);
      // If closing time is earlier than or equal to opening, assume closing on the next day.
      if (dayClose <= dayOpen) {
        dayClose.setDate(dayClose.getDate() + 1);
      }

      // Generate fixed 30-minute slots for the day.
      let slotStart = new Date(dayOpen);
      const slots = [];
      while (slotStart.getTime() + slotDurationMs <= dayClose.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + slotDurationMs);

        // Determine if this slot overlaps with any existing booking.
        // Overlap condition: slot.start < booking.end && slot.end > booking.start
        const isBooked = bookings.some(booking => {
          const bookingStart = new Date(booking.start_time);
          const bookingEnd = new Date(booking.end_time);
          return slotStart < bookingEnd && slotEnd > bookingStart;
        });

        slots.push({
          start_time: new Date(slotStart),
          end_time: new Date(slotEnd),
          isBooked
        });

        // Move to the next slot.
        slotStart = slotEnd;
      }

      // Add the day's slots to the result.
      result.push({
        date: dateString,
        slots
      });
    }
    // result.push({
    //   cost_per_slot: turf.cost_per_slot,
    // })

    res.status(200).json({ data: result, cost_per_slot: turf.cost_per_slot });
  } catch (error) {
    console.error('Error fetching slot details:', error);
    res.status(500).json({ message: 'Error fetching slot details', error });
  }
};

import { Request, Response } from 'express';
// const bcrypt = require('bcrypt');
const bcrypt = require('bcrypt');
import { Admin } from '../models/Admin';
import { AuthRequest } from 'src/middleware/auth';
import { Log } from '../models/Log';
import { SuperAdmin } from '../models/SuperAdmin';
import { v4 as uuidv4 } from 'uuid';
import { ActionToken } from '../models/ActionToken';
import { sendSetupEmail } from '../utils/email';
import { generateToken } from '../utils/auth';
import { Manager } from 'src/models';
import { Location } from '../models/Location';


export const createManager = async(req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, username, email} = req.body;
        if (!name || !username || !email) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        
        const token = uuidv4();
        const manager = await Manager.create({
            name,
            username,
            email,
            password: '12345678',
            status: 'inactive',
            adminId: req.user.id
        })
        
        await ActionToken.create({
            superAdminId: null,
            purpose: 'setup',
            token,
            isUsed: false,
            adminId: null,
            managerId: manager.id
        })
        
        await sendSetupEmail(email, token, 'setup', 'manager');
        
        await Log.create({
            role: 'Manager',
            userId: req.user.id,
            actionType: 'creation',
            description: `Manager ${name} created with email ${email} by Admin ${req.user.name}.`
        });
        
        res.status(201).json({
            message: "Manager initialization started."
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error initializing Manager", error })
    }
}

export const getManagers = async(req: AuthRequest, res: Response): Promise<void> => {
    try {
        const managers = await Manager.findAll({
            where: {
                adminId: req.user.id
            }
        })

        if (!managers) {
            res.status(404).json({ message: "No managers found" });
            return;
        }

        res.status(200).json(managers);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const deactivateManager = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const manager = await Manager.findByPk(id);

        if (!manager) {
            res.status(404).json({ message: "Manager not found" });
            return;
        }

        await manager.update({
            status: 'inactive'
        })
        res.status(200).json({ message: "Manager deactivated" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const createLocation = async(req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, coordinates, amenities, city, description, images, openingTime, closingTime, status } = req.body;
        if (!name || !coordinates || !amenities || !city || !description || !images || !openingTime || !closingTime || !status) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const location = await Location.create({
            name,
            coordinates,
            amenities,
            city,
            description,
            images,
            openingTime,
            closingTime,
            status,
            adminId: req.user.id,
            managerId: null
        })

        await Log.create({
            role: 'Admin',
            userId: req.user.id,
            actionType: 'location-addition',
            description: `Location ${name} added by Admin ${req.user.name}.`
        })

        res.status(201).json({
            message: 'Location added successfully'
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error adding location", error })
    }
}

export const deactivateLocation = async(req:AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.body;
        if (!id) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        
        const location = await Location.findByPk(id);
        if (!location) {
            res.status(404).json({ message: "Location not found" });
            return;
        }

        await location.update({
            status: 'inactive'
        })
        res.status(200).json({ message: "Location deactivated" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const getLocations = async(req: AuthRequest, res: Response): Promise<void> => {
    try {
        const locations = await Location.findAll({
            where: {
                adminId: req.user.id
            }
        })

        if (!locations) {
            res.status(404).json({ message: "No locations found" });
            return;
        }
        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const addTurf = async(req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, duration, description, cost_per_slot, ground_type, sport_type, }
    }
}
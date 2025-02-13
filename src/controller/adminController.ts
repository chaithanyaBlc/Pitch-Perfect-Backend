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
import { Manager } from '../models/Manager';
import { Location } from '../models/Location';
import { Turf } from '../models/Turf';
import QRCode from 'qrcode';


export const adminLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        
        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }

       
        const admin = await Admin.withScope('withPassword').findOne({ where: { username } });
        
        
        if (!admin) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password)
        
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

     
        const token = await generateToken(admin, 'Admin');
      

       
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: admin.id,
                name: admin.name,
                username: admin.username,
                email: admin.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login', error });
    }
};


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

export const completeManagerInitialization = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { token, password} = req.body;

        const actionToken = await ActionToken.findOne({
            where: {
                token,
                purpose: 'setup',
                isUsed: false
            }
        })

        if (!actionToken) {
            res.status(400).json({ message: "Invalid or expired token" });
            return;
        }

        const manager = await Manager.findByPk(actionToken.managerId);

        if (!manager) {
            res.status(404).json({ message: "Manager not found" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await manager.update({ password: hashedPassword });

        await actionToken.update({ isUsed: true });

        res.status(200).json({
            message: "Password setup completed successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Error completing setup", error });
    }
}

export const generateQRImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { locationId, turfId} = req.body;

        if (!turfId && !locationId) {
            res.status(400).json({ message: "Missing locationId or turfId" });
            return;
        }
        else if (turfId && !locationId) {
            await QRCode.toFile('test.png', `http://localhost:3000/location/${locationId}/turf/${turfId}`);
            res.status(200).json({ message: "QR code generated successfully for the turf" });
        } else {
            await QRCode.toFile('test.png', `http://localhost:3000/location/${locationId}`);
            res.status(200).json({ message: "QR code generated successfully for the location" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
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

export const assignManager = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { locationId, managerId } = req.body;
        
        const location = await Location.findByPk(locationId);
        const manager = await Manager.findByPk(managerId);

        if (!location) {
            res.status(404).json({ message: "Location not found" });
            return;
        }

        if (!manager) {
            res.status(404).json({ message: "Manager not found" });
            return;
        }

        await location.update({
            managerId: manager.id
        });

        await Log.create({
            role: 'Manager',
            userId: req.user.id,
            actionType: 'assigned',
            description: `Manager ${manager.name} assigned to location ${location.name}.`
        })

        res.status(200).json({ message: "Manager assigned successfully" });
    }  catch (error) {
        res.status(500).json({ message: "Error assigning manager", error });
    }
}

export const deassignManager = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { locationId, managerId } = req.body;

        const location = await Location.findByPk(locationId);
        const manager = await Manager.findByPk(managerId);

        if (!location) {
            res.status(400).json({ message: "Location not found" });
            return;
        }

        if (!manager) {
            res.status(400).json({ message: "Manager not found" });
            return;
        }

        await location.update({
            managerId: null
        });

        await Log.create({
            role: 'Manager',
            userId: req.user.id,
            actionType: 'deassigned',
            description: `Manager ${manager.name} deassigned from location ${location.name}.`
        })

        res.status(200).json({ message: "Manager deassigned successfully" });        
    } catch (error) {
        res.status(500).json({ message: "Error deassigning manager", error });
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
        const { name, duration, description, cost_per_slot, ground_type, sport_type, images, locationId } = req.body;

        if (!name || !duration || !description || !cost_per_slot || !ground_type || !sport_type || !images) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const turf = await Turf.create({
            name,
            duration,
            description,
            cost_per_slot,
            ground_type,
            sport_type,
            images,
            locationId,
            status: 'active'
        });

        res.status(201).json({ message: "Turf added Successfully", turf});

    } catch (error) {
        res.status(500).json({ message: "Error adding turf", error });
    }
}

export const getTurfs = async(req: AuthRequest, res: Response): Promise<void> =>{
    try {
        const { locationId } = req.body;
        const turfs = await Turf.findAll({
            where: {
                locationId: locationId
            }
        })

        if (!turfs) {
            res.status(400).json({ message: "Turfs not found" });
            return;
        }

        res.status(200).json(turfs);
    } catch (error) {
        res.status(500).json({ message: "Error getting turfs", error });
    }
}

export const deactivateTurf = async(req: AuthRequest, res: Response) => {
    try {
        const { turfId } = req.body;

        if (!turfId) {
            res.status(400).json({ message: "Missing required field"});
            return;
        }

        const turf = await Turf.findByPk(turfId);

        if (!turf) {
            res.status(404).json({ message: "Turf not found"});
            return
        }

        await turf.update({
            status: "inactive"
        });

        res.status(200).json({ message: "Turf deactivated" });
    } catch (error) {
        res.status(500).json({ message: "Error deactivating turf", error });
    }
}
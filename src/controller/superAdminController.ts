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

export const initializeSuperAdmin = async(req: Request, res: Response): Promise<void> => {
    try {
        const existingSuperAdmin = await SuperAdmin.findOne();
        if(existingSuperAdmin) {
            res.status(400).json({ message: "System already initialized"});
            return;
        }

        const { name, username,email }  = req.body;

        if (!name || !username || !email) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const token = uuidv4()

        const superAdmin = await SuperAdmin.create({
            name,
            username,
            email,
            password: '12345678'
        })
        await ActionToken.create({
            superAdminId: superAdmin.id,
            purpose: 'setup',
            token,
            isUsed: false,
            adminId: null
        })

        await sendSetupEmail(email, token, 'setup', 'superAdmin');

        await Log.create({
            role: 'SuperAdmin',
            userId: superAdmin.id,
            actionType: 'creation',
            description: `Super Admin ${name} initialized with email ${email}.`
        })

        res.status(201).json({
            message: "Super Admin initialization started.",
        })
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: "Error initializing Super Admin", error })
    }
}

export const completeSuperAdminSetup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, password } = req.body;

        
        const actionToken = await ActionToken.findOne({
            where: {
                token,
                purpose: 'setup',
                isUsed: false
            }
        });

        if (!actionToken) {
            res.status(400).json({ message: "Invalid or expired token" });
            return;
        }

      
        const superAdmin = await SuperAdmin.findByPk(actionToken.superAdminId);
        
        if (!superAdmin) {
            res.status(404).json({ message: "Super Admin not found" });
            return;
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

        
        await superAdmin.update({ password: hashedPassword });

       
        await actionToken.update({ isUsed: true });

        res.status(200).json({ 
            message: "Password setup completed successfully" 
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Error completing setup", 
            error 
        });
    }
};

export const superAdminLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        
        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }

       
        const superAdmin = await SuperAdmin.scope('withPassword').findOne({ where: { username } });
        
        
        if (!superAdmin) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, superAdmin.password)
        
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

     
        const token = await generateToken(superAdmin, 'superAdmin');
      

       
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: superAdmin.id,
                name: superAdmin.name,
                username: superAdmin.username,
                email: superAdmin.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login', error });
    }
};

export const createSuperAdmin = async(req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, username,email }  = req.body;
        if (!name || !username || !email) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const token = uuidv4()
        const superAdmin = await SuperAdmin.create({
            name,
            username,
            email,
            password: '12345678'
        })
        await ActionToken.create({
            superAdminId: superAdmin.id,
            purpose: 'setup',
            token,
            isUsed: false,
            adminId: null
        })

        await sendSetupEmail(email, token, 'superAdmin');

        await Log.create({
            role: 'SuperAdmin',
            userId: req.user?.id || null,
            actionType: 'creation',
            description: `New Super Admin ${name} created with email ${email}`
        })

        res.status(201).json({
            message: "Super Admin created successfully.",
            token
        })

    } catch (error) {
        res.status(500).json({ message: "Error initializing Super Admin", error })
    }
}

export const updateSuperAdmin = async(req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, username, email } = req.body;

        if(!name && !username && !email) {
            res.status(400).json({ message: "No fields to update" });
            return;
        }

        const superAdmin = await SuperAdmin.findByPk(req.user?.id);
        if(!superAdmin){
            res.status(404).json({ message: "Super Admin not found" });
            return;
        }

        const updatedData : { name?: string; username?: string } = {}
        if (name) updatedData.name = name;
        if (username) updatedData.username = username;

        if (Object.keys(updatedData).length > 0) {
            await superAdmin.update(updatedData)
        }

        let emailVerification = false;
        if (email) {
            if (email.superAdmin.email) {
                res.status(400).json({ message: "New email matches current email" });
                return;
            }

            const token = uuidv4();
            await ActionToken.create({
                superAdminId: superAdmin.id,
                purpose: 'email-change',
                token,
                isUsed: false,
                newEmail: email,
                adminId: null
            });

            await sendSetupEmail(email,token, 'email-change');
        }


    } catch (error) {
        res.status(500).json({ message: "Error updating Super Admin", error });
    }
}



export const createAdmin = async(req: AuthRequest, res: Response): Promise<void> => {
    try {
        

        const { name, username,email }  = req.body;

        if (!name || !username || !email) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const token = uuidv4()

        const admin = await Admin.create({
            name,
            username,
            email,
            password: '12345678',
            superAdminId: req.user.id
        })
        await ActionToken.create({
            superAdminId: null,
            purpose: 'setup',
            token,
            isUsed: false,
            adminId: admin.id
        })

        await sendSetupEmail(email, token, 'setup', 'admin');

        await Log.create({
            role: 'SuperAdmin',
            userId: req.user.id,
            actionType: 'creation',
            description: `Admin ${name} created with email ${email} by Super Admin ${req.user.name}.`
        });

        res.status(201).json({
            message: "Admin initialization started.",
        })
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: "Error initializing Super Admin", error })
    }
}

export const completeAdminSetup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, password } = req.body;

        
        const actionToken = await ActionToken.findOne({
            where: {
                token,
                purpose: 'setup',
                isUsed: false
            }
        });

        if (!actionToken) {
            res.status(400).json({ message: "Invalid or expired token" });
            return;
        }
        console.log(actionToken.adminId)

      
        const admin = await Admin.findByPk(actionToken.adminId);
      
        
        if (!admin) {
            res.status(404).json({ message: "Admin not found" });
            return;
        }

 
        const hashedPassword = await bcrypt.hash(password, 10);

     
        await admin.update({ password: hashedPassword });

        
        await actionToken.update({ isUsed: true });

        await Log.create({
            role: 'Admin',
            userId: admin.id,
            actionType: 'update',
            description: `Admin ${admin.name} completed setup.`
        })

        res.status(200).json({ 
            message: "Password setup completed successfully" 
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Error completing setup", 
            error 
        });
    }
};

export const verifyEmailUpdate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.query;

        const actionToken = await ActionToken.findOne({
            where: {
                purpose: 'email-change',
                token: token as string,
                isUsed: false
            }
        });

        if (!actionToken) {
            res.status(400).json({ message: "Invalid or expired token" });
            return;
        }

        const superAdmin = await SuperAdmin.findByPk(actionToken.superAdminId);
        if (!superAdmin) {
            res.status(404).json({ message: "Super Admin not found" });
            return;
        }

        const existingAdmin = await SuperAdmin.findOne({
            where: { email: actionToken.newEmail as string }
        });
        if (existingAdmin) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }

        await superAdmin.update({ email: actionToken.newEmail as string});
        await actionToken.update({ isUsed: true });

        await Log.create({
            role: 'SuperAdmin',
            userId: superAdmin.id,
            actionType: 'email-change',
            description: `Super Admin ${superAdmin.name} email updated to ${actionToken.newEmail}`
        });

        res.status(200).json({ message: "Email updated successfully"})
    } catch (error) {
        res.status(500).json({ message: "Error verifying email", error });
    }
}



export const getAllSuperAdmins = async (req: Request, res: Response): Promise<void> => {
    try {
        const superadmins = await SuperAdmin.findAll();
        res.status(200).json(superadmins);
    } catch (error) {
        res.status(500).json({ message: "Error fetching super admins", error });
    }
}

export const getAllAdmins = async (req: Request, res: Response): Promise<void> => {
    try {
        const admins = await Admin.findAll();
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: "Error fetching admins", error });
    }
}

export const getAllLogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const{ role, id } = req.user;

        if (role === 'superAdmin') {
            const logs = await Log.findAll({
                where: { role: 'SuperAdmin' }
            });
            res.status(200).json(logs);
        } else if (role === 'Admin') {
            const logs = await Log.findAll({
                where: { role: 'Admin', userId: id }
            });
            res.status(200).json(logs);
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching logs", error });
    }
}

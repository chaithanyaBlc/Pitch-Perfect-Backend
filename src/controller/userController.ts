import { Request, Response } from 'express';
const bycrypt = require('bcrypt');
import { v4 as uuidv4 } from 'uuid';
import { ActionToken } from '../models/ActionToken';
import { User } from '../models/User';
import { generateToken } from '../utils/auth';
import { AuthRequest } from 'src/middleware/auth';
import { sendSetupEmail } from '../utils/email';

export const userSignup = async(req: Request, res: Response): Promise<void> => {
    try {
        const { name, username, email, password } = req.body;
    
        if (!name || !username || !email || !password) {
            res.status(400).json({ message: 'Please provide all fields' });
            return;
        }

        const user = await User.findOne({ where: { email } });
        if (user) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }

        const hashedPassword = await bycrypt.hash(password, 10);

        await User.create({
            name,
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: "User created Successfully"});

    } catch (error) {
        res.status(500).json({ message: "Error creatng user", error });
    }
}

export const userLogin = async(req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }

        const user = await User.withScope('withPassword').findOne({ where: { username } });

        if (!user) {
            res.status(404).json({ message: "Account not found"})
            return;
        }

        const isPasswordValid = await bycrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const token = await generateToken(user, 'User');

        res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
}

export const userUpdate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, username, email } = req.body;

        if (!name && !username && !email) {
            res.status(400).json({ message: "No fields provided" });
            return;
        }

        const user = await User.findByPk(req.user.id)
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const updatedData: { name?: string, username?: string, email?: string } = {};
        if (name) updatedData.name = name;
        if (username) updatedData.username = username;

        if (Object.keys(updatedData).length > 0) {
            await user.update(updatedData);
        }

        if (email) {
            if (email === user.email) {
                res.status(400).json({ message: "New email matches current email"});
                return;
            }

            const token = uuidv4();
            await ActionToken.create({
                superAdminId: null,
                purpose: 'email-change',
                token,
                isUsed: false,
                newEmail: email,
                adminId: null,
                userId: req.user.id
            });

            await sendSetupEmail(email, token, 'email-change');

            res.status(200).json({ message: "User updated successfully" })
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error });
    }
}

export const deleteUser = async (req: AuthRequest, res: Response):Promise<void> => {
    try {
        const { id } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            res.status(404).json({ message: "User does not exist"});
            return;
        }

        await user.destroy();

        res.status(200).json({ message: "User deleted successfully"});
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error });
    }
}


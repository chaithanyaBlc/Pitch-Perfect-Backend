import { Request, Response, NextFunction } from 'express';
import { generateToken, verifyToken } from '../utils/auth';
import { SuperAdmin } from '../models/SuperAdmin';
import { Admin } from '../models/Admin';
import { User } from '../models/User';

export interface AuthRequest extends Request {
    user?: any 
}

const ENCODED_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// export const generate = (userId: any): string => {
//     const token = generateToken(userId)
//     return token 
// }

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({
                message: "Not authorized",
                code: "NO_TOKEN"
            });
            return;
        }

        const token = authHeader?.split(' ')[1];
        // console.log(token)

        const decoded = await verifyToken(token)
        console.log(decoded)
        if (decoded.role === "SuperAdmin") {
            req.user = await SuperAdmin.findByPk(decoded.id);
            req.user.role = decoded.role;
        } else if (decoded.role === "Admin") {
            req.user = await Admin.findByPk(decoded.id);
            req.user.role = decoded.role;
        } else {
            req.user = await User.findByPk(decoded.id);
            req.user.role = decoded.role;
            
        }
        next();
    } catch (error) {
        res.status(401).json({
            message: "Not authorized",
            code: "INVALID_TOKEN"
        })
    }
}
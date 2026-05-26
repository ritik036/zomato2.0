import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import User, { IUser } from "../model/User.js";
import TryCatch from "./TryCatch.js";

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req?.headers?.authorization;
        if (!authHeader || !(authHeader.startsWith("Bearer "))) {
            res.status(401).json({
                message: "please login - No Auth Header"
            })
            return;
        }
        const token = authHeader.split(" ")[1] as string;
        if (!token) {
            res.status(401).json({
                message: "please login - no token present"
            })
        }

        const decodedValue = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({
                message: "invalid token"
            })
            return;
        }
        req.user = decodedValue.user;

        next();
    } catch (error) {
        res.status(500).json({
            message: "please login - jwt error"
        })
    }
}

const allowedRoles = ["customer", "rider", "seller"] as const;
type Role = (typeof allowedRoles)[number];

export const addUserRole = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?._id) {
        return res.status(401).json({
            message: "UnAuthorized"
        })
    }

    const { role } = req.body as { role: Role };
    if (!allowedRoles.includes(role)) {
        res.status(401).json({
            message: "Invalid Role"
        })
    }

    const user = await User.findByIdAndUpdate(req.user?._id, { role }, { new: true });

    const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
        expiresIn: "15d"
    })

    res.json({ user, token })
})


export const myProfile = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    res.json(user)
})
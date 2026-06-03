import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Document } from "mongoose";


export interface IUser {
    _id: string;
    name: string;
    role: string;
    image: string;
    email: string;
    restaurantId : string;
}

export interface AuthenticatedRequest extends Request {
    user: IUser | null;
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req?.headers?.authorization;
        if (!authHeader || !(authHeader.startsWith("Bearer "))) {
            res.status(401).json({
                message: "please login - no auth header"
            })
            return;
        }
        const token = authHeader.split(" ")[1] as string;
        if (!token) {
            res.status(401).json({
                message: "please login - no token present"
            })
            return;
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

export const isSeller = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;
    if (user && (user?.role !== "seller")) {
        res.status(401).json({
            message: "You are not Authorized Seller"
        })
        return;
    }
    next();
}
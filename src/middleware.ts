import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config();
export const userMiddleware = (req: Request, res: Response, next: NextFunction)=>{
    const header = req.headers["authorization"] as string;
    const decoded = jwt.verify(header as string, process.env.JWT_PASSWORD!)

    if (decoded){
        //@ts-ignore
        req.userId = decoded.id;
        next();

    } else{
        res.status(401).json({
            message: " Invalid Token"
        })
    }
}
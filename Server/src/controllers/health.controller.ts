import { Request, Response } from "express";
import pool from '../config/database'
import { timeStamp } from "node:console";

export class HealthController {
    healthCheck = async (req: Request, res: Response): Promise<void> => {
        try {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                service: 'Currency converter API'
            });
        } catch (error) {
            res.status(500).json({
                status: 'ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }
}
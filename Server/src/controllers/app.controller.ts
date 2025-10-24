import { Request, Response } from "express";
import { version } from "os";

export class AppController {
    getAppInfo = async (req: Request, res: Response): Promise<void> => {
        res.json({
            message: 'Currency converter API',
            version: '1.0.0'
        });
    };  
}
import { Request, Response } from 'express';
import { CurrencyService } from '../cacheData/currency.service';
import Joi from 'joi';


const conversionSchema = Joi.object({
    from: Joi.string().length(3).uppercase().required(),
    to: Joi.string().length(3).uppercase().required(),
    amount: Joi.number().positive().default(1)
});

export class CurrencyController {
    private currencyService: CurrencyService;

    constructor() {
        this.currencyService = new CurrencyService();
    }

    convert = async (req: Request, res: Response): Promise<void> => {
        try {
            const { error, value } = conversionSchema.validate(req.query);
            if (error) {
                res.status(400).json({ error: error.details[0].message });
                return;
            }

            const { from, to, amount } = value;
            const result = await this.currencyService.convertCurrency(from, to, amount);
            res.json({
                success: true,
                data: {
                    from,
                    to,
                    amount,
                    convertedAmount: result.convertedAmount,
                    rate: result.rate,
                    cached: result.cached,
                    source: result.source,
                    timestamp: result.timestamp
                }
            });
        } catch (error: any) {
            console.error('Conversion error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    getProviderStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const providers = await this.currencyService.getProviderStatus();
            res.json({
                success: true,
                data: providers
            });
        } catch (error: any) {
            console.error('Provider status error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get provider status'
            });
        }
    }
}
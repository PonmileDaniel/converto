import axios from 'axios';
import { ExchangeRateProvider, APIResponse } from '../types';
/**
 * BaseProvider is an abstract class that defines the core functionality
 * for all exchange rate providers.
 * 
 * It handles:
 * - Converting between currencies using fetched rates
 * - Common error handling
 * - HTTP request logic with timeouts
 * 
 * Every subclass must implement `fetchRates()` to define how it retrieves
 * rates from its own external API.
 */
export abstract class  BaseProvider implements ExchangeRateProvider {
    abstract name: string;
    abstract priority: number;
    public isActive: boolean = true;

    abstract fetchRates(baseCurrency: string, targetCurrencies: string[]): Promise<APIResponse>;

    async convertCurrency(from: string, to: string, amount: number): Promise<number> {
        const response = await this.fetchRates(from, [to]);
        if (!response.success || !response.rates?.[to]) {
            throw new Error(`Failed to fetch rate from ${this.name}`);
        }
        return amount * response.rates[to];
    }

    protected handleError(error: any): APIResponse {
        return{
            success: false,
            error: error.message || 'Unknown error',
            source: this.name
        };
    }

    protected async makeRequest(url: string, timeout: number = 5000): Promise<any> {
        try {
            const response = await axios.get(url, { timeout });
            return response.data;
        } catch (error: any) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timed out');
            }
            throw error;
        }
    }
}
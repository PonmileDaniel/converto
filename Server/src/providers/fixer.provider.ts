import { BaseProvider } from "./base.provider";
import { APIResponse } from "../types";

export class FixerProvider extends BaseProvider {
    public name = 'fixer';
    public priority = 2;
    private baseUrl = 'https://data.fixer.io/api';
    private apiKey = process.env.fixerapiKey;

    async fetchRates(baseCurrency: string, targetCurrencies: string[]): Promise<APIResponse> {
        try {
            if(!this.apiKey) {
                throw new Error('Fixer API key is missing');
            }
            const symbols = targetCurrencies.join(',');
            const url = `${this.baseUrl}/latest?access_key=${this.apiKey}&base=${baseCurrency}&symbols=${symbols}`;

            const data = await this.makeRequest(url)

            if (!data.success) {
                throw new Error(`Fixer API error: ${data.error.type}`);
            }

            return {
                success: true,
                rates: data.rates,
                source: this.name
            }
        } catch (error) {
            console.error(`Error fetching rates from Fixer`, error);
            return this.handleError(error);
        }
    }
}
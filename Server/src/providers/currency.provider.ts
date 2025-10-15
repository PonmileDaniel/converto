import { BaseProvider } from "./base.provider";
import { APIResponse } from "../types";


export class CurrencyAPIProvider extends BaseProvider {
    public name = 'currencyapi';
    public priority = 3;
    private baseUrl = 'https://api.currencyapi.com/v3';
    private apiKey = process.env.currencyapiKey;

    async fetchRates(baseCurrency: string, targetCurrencies: string[]): Promise<APIResponse> {
        try {
            if (!this.apiKey) {
                throw new Error('Currency key must contain api key')
            }
            const currencies = targetCurrencies.join(',');
            const url = `${this.baseUrl}/latest?apikey=${this.apiKey}&base_currency=${baseCurrency}&currencies=${currencies}`;

            const data = await this.makeRequest(url);

            if (!data.data) {
                throw new Error('Invalid response from currencyAPI');
            }

            // Transform the response to match the format
            const rates: Record<string, number> = {};
            Object.keys(data.data).forEach(currency => {
                rates[currency] = data.data[currency].value;
            });

            return {
                success: true,
                rates,
                source: this.name
            }   
        } catch (error) {
            console.error(`${this.name} provider error:`, error);
            return this.handleError(error);
        }
    }
}
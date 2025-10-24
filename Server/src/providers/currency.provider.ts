import { BaseProvider } from "./base.provider";
import { APIResponse } from "../types";
import { appConfig } from "../config/app.config";

export class CurrencyAPIProvider extends BaseProvider {
    public name = appConfig.apis.currencyapi.name;;
    public priority = appConfig.apis.currencyapi.priority;
    private baseUrl = appConfig.apis.currencyapi.baseUrl;
    private apiKey = appConfig.apis.currencyapi.key

    async fetchRates(baseCurrency: string, targetCurrencies: string[]): Promise<APIResponse> {
        try {
            if (!this.apiKey) {
                throw new Error('CurrencyAPI key is missing')
            }

            const currencies = targetCurrencies.join(',');
            const url = `${this.baseUrl}/latest?apikey=${this.apiKey}&base_currency=${baseCurrency}&currencies=${currencies}`;

            console.log(`CurrencyAPI URL: ${url.replace(this.apiKey, '***')}`);

            const data = await this.makeRequest(url, 10000); // Increase timeout to 10s

            console.log(`CurrencyAPI Response:`, JSON.stringify(data, null, 2));

            if (!data.data) {
                throw new Error('Invalid response from CurrencyAPI');
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
            };
        } catch (error: any) {
            console.error(`${this.name} provider error:`, error.message);
            return this.handleError(error);
        }
    }
}
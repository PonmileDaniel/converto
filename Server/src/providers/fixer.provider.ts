import { BaseProvider } from "./base.provider";
import { APIResponse } from "../types";
import { appConfig } from '../config/app.config'

export class FixerProvider extends BaseProvider {
    public name = appConfig.apis.fixer.name;
    public priority = appConfig.apis.fixer.priority;
    private baseUrl = appConfig.apis.fixer.baseUrl;
    private apiKey = appConfig.apis.fixer.key;

    async fetchRates(baseCurrency: string, targetCurrencies: string[]): Promise<APIResponse> {
        try {
            if(!this.apiKey) {
                throw new Error('Fixer API key is missing');
            }

            const symbols = targetCurrencies.join(',');
            const url = `${this.baseUrl}/latest?access_key=${this.apiKey}&base=${baseCurrency}&symbols=${symbols}`;
            
            console.log(`Fixer API URL: ${url.replace(this.apiKey, '***')}`);

            const data = await this.makeRequest(url, 10000); // Increase timeout to 10s

            console.log(`Fixer API Response:`, JSON.stringify(data, null, 2));

            if (!data.success) {
                const errorMsg = data.error ? `${data.error.type}: ${data.error.info}` : 'Unknown Fixer API error';
                throw new Error(errorMsg);
            }

            return {
                success: true,
                rates: data.rates,
                source: this.name
            };
        } catch (error: any) {
            console.error(`${this.name} provider error:`, error.message);
            return this.handleError(error);
        }
    }
}
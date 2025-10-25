import { BaseProvider } from "./base.provider";
import { APIResponse } from "../types";
import { appConfig } from '../config/app.config'


export class ExchangeRatesProvider extends BaseProvider {
    public name = appConfig.apis.exchangerates.name;;
    public priority = appConfig.apis.exchangerates.priority;
    private baseUrl = appConfig.apis.exchangerates.baseUrl;

    constructor() {
        super();
        this.isActive = this.determineActiveStatus();

        if(!this.isActive) {
            console.warn(`${this.name} provider is disabled`);
        }
        else {
            console.log(`${this.name} provider is active`);
        }
    }

    private determineActiveStatus(): boolean {
        const config = appConfig.apis.exchangerates;
        if (!config.enabled) {
            return false;
        }

        if (!this.baseUrl) {
            return false;
        }
        
        return true;
    }

    async fetchRates(baseCurrency: string, targetCurrencies: string[]): Promise<APIResponse> {
        try {
            const url = `${this.baseUrl}/latest/${baseCurrency}`;

            console.log(`ExchangeRates API URL: ${url}`);
            const data = await this.makeRequest(url, 10000);
            console.log(`ExchangeRates API Response:`, JSON.stringify({
                base: data.base,
                date: data.date,
                rates: 'Object with ' + Object.keys(data.rates || {}).length + ' currencies'
            }, null, 2));

            if (!data.rates) {
                throw new Error('Invalid response from ExchangeRates API');
            }

            // Filter only requested currencies
            const rates: Record<string, number> = {};
            targetCurrencies.forEach(currency => {
                if (data.rates[currency]) {
                    rates[currency] = data.rates[currency];
                }
            });

            return {
                success: true,
                rates,
                source: this.name
            }

        } catch (error: any) {
            console.error(`Error fetching rates from ExchangeRates API:`, error.message);
            return this.handleError(error);
            
        }
    }
}
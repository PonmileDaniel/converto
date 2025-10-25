import { CurrencyAPIProvider } from "../providers/currency.provider";
import { FixerProvider } from "../providers/fixer.provider";
import { CacheService } from "./cache.service";
import { ExchangeRatesProvider } from "../providers/exchange.provider";
import { ExchangeRateProvider, ConversionResult } from "../types";
import { ExchangeRateRepository } from "../repositories/exchange-rate.repository";
import { ApiSourceRespository } from "../repositories/api-source.repository";
// import pool from '../config/database';

/**
 * CurrencyService handles the main business logic for currency conversion.
 * 
 * Responsibilities:
 * - Coordinate between multiple exchange rate providers (Fixer, CurrencyAPI)
 * - Use caching to reduce redundant API calls
 * - Fall back to database records when APIs fail
 * - Keep track of provider performance (success/failure rates)
 * 
 * Providers are tried in order of priority (lowest number = highest priority).
 */

export class CurrencyService {
    private providers: ExchangeRateProvider[];
    private cacheService: CacheService;
    private exchangeRateRepository: ExchangeRateRepository;
    private apiSourceRepository: ApiSourceRespository;

    constructor() {
        this.cacheService = new CacheService();
        this.exchangeRateRepository = new ExchangeRateRepository();
        this.apiSourceRepository = new ApiSourceRespository();

        this.providers = [
            new ExchangeRatesProvider(),
            new FixerProvider(),
            new CurrencyAPIProvider(),
        ].sort((a, b) => a.priority - b.priority);
    }

    async convertCurrency(from: string, to: string, amount: number = 1): Promise<ConversionResult> {
        const cacheKey = this.cacheService.generateKey(from, to);
        const cached = await this.cacheService.get(cacheKey);

        if (cached) {
            console.log(`Cache hit for ${from} to ${to}`);
            return {
                rate: cached.rate,
                amount,
                convertedAmount: amount * cached.rate,
                cached: true,
                source: 'cache',
                timestamp: new Date().toISOString()
            };
        }

        console.log(`Cache miss for ${from} to ${to}, trying providers...`);

        const errors: string[] = [];

        for (const provider of this.providers) {
            if (!provider.isActive) {
                console.log(`Skipping inactive provider: ${provider.name}`);
                continue;
            }

            try {
                console.log(`Trying provider: ${provider.name} (priority: ${provider.priority})`);

                const convertedAmount = await provider.convertCurrency(from, to, amount);

                const rate = convertedAmount / amount;

                console.log(`Provider ${provider.name} succeeded with rate: ${rate}`);

                await this.cacheService.set(cacheKey, rate);
                await this.exchangeRateRepository.save(from, to, rate, provider.name);
                await this.apiSourceRepository.updateStatus(provider.name, true);

                return {
                    rate,
                    amount,
                    convertedAmount: amount * rate,
                    cached: false,
                    source: provider.name,
                    timestamp: new Date().toISOString()
                };
            } catch (error: any) {
                const errorMsg = `Provider ${provider.name} failed: ${error.message}`;
                console.error(`${errorMsg}`);
                errors.push(errorMsg);

                try {
                    await this.apiSourceRepository.updateStatus(provider.name, false);
                } catch (error) {
                    console.warn('Failed to update provider status, continuing...');
                }
                continue;
            }
        }

        try {
            const lastKnownRate = await this.exchangeRateRepository.getLastKnownRate(from, to);

            if (lastKnownRate) {
                console.log(`Using last known rate from database: ${lastKnownRate.rate}`);
                return {
                    rate: lastKnownRate.rate,
                    amount,
                    convertedAmount: amount * lastKnownRate.rate,
                    cached: false,
                    source: `fallback-${lastKnownRate.source}`,
                    timestamp: new Date().toISOString()
                }
            }
        } catch (error) {
            console.warn('Failed to retrieve fallback rate from database');
        }
        
        throw new Error(`All providers failed and no fallback available. Errors: ${errors.join('; ')}`);
    }

    async getProviderStatus(): Promise<any[]> {
        try {
            return await this.apiSourceRepository.getAllProviders();
        } catch (error) {
            console.error('Failed to get provider status:', error);
            return [];
        }
    }
}
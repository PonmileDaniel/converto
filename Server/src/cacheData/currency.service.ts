import { CurrencyAPIProvider } from "../providers/currency.provider";
import { FixerProvider } from "../providers/fixer.provider";
import { CacheService } from "./cache.service";
import { ExchangeRateProvider, ConversionResult } from "../types";
import pool from '../config/database'
import { timeStamp } from "console";


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

    constructor() {
        this.cacheService = new CacheService();

        this.providers = [
            new FixerProvider(),
            new CurrencyAPIProvider()
        ].sort((a, b) => a.priority - b.priority);
    }

    async convertCurrency(from: string, to: string, amount: number): Promise<ConversionResult> {
        const cacheKey = this.cacheService.generateKey(from, to);
        const cached = await this.cacheService.get(cacheKey);

        if (cached) {
            console.log(`✅ Cache hit for ${from} to ${to}`);

            return {
                rate: cached.rate,
                amount,
                convertedAmount: amount * cached.rate,
                cached: true,
                source: 'cache',
                timestamp: new Date().toISOString()
            };
        }

        // Try Provider if not available in cache
        const errors: string[] = [];

        for (const provider of this.providers) {
            if (!provider.isActive) {
                console.log(`Skipping inactive provider: ${provider.name}`)
                continue;
            }

            try {
                console.log(`🔄 Trying provider: ${provider.name} (priority: ${provider.priority})`);

                const rate = await provider.convertCurrency(from, to, 1);

                console.log(`✅ Provider ${provider.name} succeeded with rate: ${rate}`);

                await this.cacheService.set(cacheKey, rate);

                await this.saveRateToDatabase(from, to, rate, provider.name);

                await this.updateProviderStatus(provider.name, true);

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
                console.error(errorMsg);
                errors.push(errorMsg);

                await this.updateProviderStatus(provider.name, false);
                continue;
            }
        }

        const lastKnownRate = await this.getLastKnownRate(from, to);

        if (lastKnownRate) {
            console.log(`✅ Using last known rate from database: ${lastKnownRate.rate}`);
            return {
                rate: lastKnownRate.rate,
                amount,
                convertedAmount: amount * lastKnownRate.rate,
                cached: false,
                source: `fallback-${lastKnownRate.source}`,
                timestamp: new Date().toISOString()
            };
        }
        throw new Error(`All provider failed and also fallback failed: ${errors.join('; ')}`)
    }

    private async saveRateToDatabase(from: string, to: string, rate: number, source: string): Promise<void> {
        try {
            await pool.query(
                'INSERT INTO exchange_rate (from_currency, to_currency, rate, source, expires_at) VALUES ($1, $2, $3, $4, $5)',
                [from, to, rate, source, new Date(Date.now() + 300000)]
            )
        } catch (error) {
            console.error('Database saved Error', error);
        }
    }

    private async getLastKnownRate(from: string, to: string): Promise<{ rate: number, source: string } | null> {
        try {
            const result = await pool.query(
                `SELECT rate, source FROM exchange_rates
                WHERE from_currency = $1 AND to_currency = $2
                ORDER BY created_at DESC
                LIMIT 1`,
                [from, to]
            );
            return result.rows.length > 0 ? result.rows[0] : null
        } catch (error) {
            console.error('Database query error:', error)
            return null;
        }
    }

    private async updateProviderStatus(providerName: string, success: boolean): Promise<void> {
        try {
            if (success) {
                await pool.query(
                    `UPDATE api_sources
                    SET last_success_at = CURRENT_TIMESTAMP, failure_count = 0
                    WHERE name = $1`,
                    [providerName]
                );
            } else {
                await pool.query(
                    `UPDATE api_source
                    SET last_failure_at = CURRENT_TIMESTAMP, failure_count = failure_count + 1
                    WHERE name = $1`,
                    [providerName]
                );
            }
        } catch (error) {
            console.error('Provider status update error:', error);
        }
    }

    async getProviderStatus(): Promise<any[]> {
        try {
            const result = await pool.query(
                'SELECT * FROM api_sources ORDER BY priority ASC'
            );
            return result.rows;
        } catch (error) {
            console.error('Provider status query error:', error);
            return []; 
        }
    }
}
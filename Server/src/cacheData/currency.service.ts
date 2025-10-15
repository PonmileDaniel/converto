import { CurrencyAPIProvider } from "../providers/currency.provider";
import { FixerProvider } from "../providers/fixer.provider";
import { CacheService } from "./cache.service";
import { ExchangeRateProvider, ConversionResult } from "../types";
import pool from '../config/database'


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
}
export interface ExchangeRate {
  id?: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
  createdAt?: Date;
  expiresAt?: Date;
}

export interface CacheData {
  rate: number;
  timestamp: number;
  expiresAt: number;
}

export interface APIResponse {
  success: boolean;
  rates?: Record<string, number>;
  error?: string;
  source: string;
}

export interface ConversionRequest {
  from: string;
  to: string;
  amount?: number;
}

export interface ConversionResult {
  rate: number,
  amount: number,
  convertedAmount: number;
  cached: boolean;
  source?: string;
  timestamp: string;
}

export interface ExchangeRateProvider {
  name: string;
  priority: number;
  isActive: boolean;
  fetchRates(baseCurrency: string, targetCurrencies: string[]): Promise<APIResponse>;
  convertCurrency(from: string, to: string, amount: number): Promise<number>;
}
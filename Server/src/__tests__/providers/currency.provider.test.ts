import { CurrencyAPIProvider } from "../../providers/currency.provider";
import axios from 'axios';

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('CurrencyAPIProvider', () => {
    let provider: CurrencyAPIProvider ;

    beforeEach(() => {
        provider = new CurrencyAPIProvider();
        jest.clearAllMocks();
    });

    describe('fetchRates', () => {
        it('should fetch rates successfully', async () => {
            const mockResponse = {
                data: {
                    EUR: { value: 0.85 },
                    GBP: { value: 0.73 }
                }
            };

            jest.spyOn(provider as any, 'makeRequest').mockResolvedValue(mockResponse);
            const result = await provider.fetchRates('USD', ['EUR', 'GBP']);
            expect(result).toEqual({
                success: true,
                rates: { EUR: 0.85, GBP: 0.73 },
                source: provider.name
            });
        });

        it('should handle API error', async () => {
            jest.spyOn(provider as any, 'makeRequest').mockRejectedValue(new Error('Invalid access_key: Invalid API key'));
            const result = await provider.fetchRates('USD', ['EUR']);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid access_key: Invalid API key');
        });
    });

    describe('convertCurrency', () => {
        it('should convert currency successfully', async () => {
            const mockResponse = {
                data: {
                    EUR: { value: 0.85 }
                }
            };
            jest.spyOn(provider as any, 'makeRequest').mockResolvedValue(mockResponse);

            const result = await provider.convertCurrency('USD', 'EUR', 100);
            expect(result).toBe(85);
        });
    });
});
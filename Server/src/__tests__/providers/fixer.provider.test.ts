import { FixerProvider } from "../../providers/fixer.provider";
import axios from 'axios';

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('FixerProvider', () => {
    let provider: FixerProvider;

    beforeEach(() => {
        provider = new FixerProvider();
        jest.clearAllMocks();
    });

    describe('fetchRates', () => {
        it('should fetch rates successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    rates: {
                        EUR: 0.85,
                        GBP: 0.73
                    }
                }
            };

            mockAxios.get.mockResolvedValue(mockResponse);
            const result = await provider.fetchRates('USD', ['EUR', 'GBP']);
            expect(result).toEqual({
                success: true,
                rates: { EUR: 0.85, GBP: 0.73 },
                source: 'fixer'
            });
        });

        it('should handle API error', async () => {
            const mockError = {
                data: {
                    success: false,
                    error: {
                        type: 'Invalid access_key',
                        info: 'Invalid API key'
                    }
                }
            };
            mockAxios.get.mockResolvedValueOnce(mockError);
            const result = await provider.fetchRates('USD', ['EUR']);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid access_key: Invalid API key');
        });
    });

    describe('convertCurrency', () => {
        it('should convert currency successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    rates: { EUR: 0.85 }
                }
            };

            mockAxios.get.mockResolvedValue(mockResponse);
            const result = await provider.convertCurrency('USD', 'EUR', 100);
            expect(result).toBe(85);
        });
    });
});
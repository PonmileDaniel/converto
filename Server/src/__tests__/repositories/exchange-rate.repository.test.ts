import { ExchangeRateRepository } from "../../repositories/exchange-rate.repository";
import pool from "../../config/database";

const mockPool = pool as jest.Mocked<typeof pool>;

describe('ExchangeRateRepository', () => {
    let repository: ExchangeRateRepository;

    beforeEach(() => {
        repository = new ExchangeRateRepository();
        jest.clearAllMocks();
    });

    describe('save', () => {
        it('should save exchange rate successfully', async () => {
            (mockPool.query as jest.Mock).mockResolvedValue({ rows: [], rowCount: 1 });

            await expect(repository.save('USD', 'EUR', 1.5, 'fixer')).resolves.not.toThrow();

            expect(mockPool.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO exchange_rates'),
                expect.arrayContaining(['USD', 'EUR', 1.5, 'fixer'])
            );
        });

        it('should throw error when database fails', async () => {
            (mockPool.query as jest.Mock).mockRejectedValue(new Error('DB error'));

            await expect(repository.save('USD', 'EUR', 1.5, 'fixer')).rejects.toThrow('Failed to save exchange rate to database');
        });
    });

    describe('getLastKnownRate', () => {
        it('should return the last known rate', async () => {
            const mockResult = {
                rows: [{ rate: 1.5, source: 'fixer' }],
                rowCount: 1
            };
            (mockPool.query as jest.Mock).mockResolvedValue(mockResult as any);

            const result = await repository.getLastKnownRate('USD', 'EUR');
            expect(result).toEqual({ rate: 1.5, source: 'fixer' });
            expect(mockPool.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT rate, source FROM exchange_rates'),
                ['USD', 'EUR']
            );
        });
    });
});
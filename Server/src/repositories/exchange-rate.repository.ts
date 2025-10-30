import pool from "../config/database";

export interface ExchangeRateRecord {
    id?: number;
    from_currency: string;
    to_currency: string;
    rate: number;
    source: string;
    create_at?: Date;
    expires_at?: Date;
}

export class ExchangeRateRepository {
    async save (from: string, to: string, rate: number, source: string): Promise<void> {
        try {
            await pool.query(
                'INSERT INTO exchange_rates (from_currency, to_currency, rate, source, expires_at) VALUES ($1, $2, $3, $4, $5)',
                [from, to, rate, source, new Date(Date.now() + 300000)]
            );
        } catch (error) {
            console.error('Database save error:', error);
            throw new Error('Failed to save exchange rate to database');
        }
    }

    async getLastKnownRate(from: string, to: string): Promise<{ rate: number; source: string } | null> {
        try {
            const result = await pool.query(
                `SELECT rate, source FROM exchange_rates
                 WHERE from_currency = $1 AND to_currency = $2
                 ORDER BY created_at DESC
                 LIMIT 1`,
                [from, to]
            );
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('Database query error:', error);
            throw new Error('Failed to retrieve last known rate from database');
            
        }
    }

    async getRateHistory(from: string, to: string, limit: number = 10): Promise<ExchangeRateRecord[]> {
        try {
            const result = await pool.query(
                `SELECT * FROM exchange_rates
                WHERE from_currency = $1 AND to_currency = $2
                ORDER BY created_at DESC
                LIMIT $3`,
                [from, to, limit]
            );
            return result.rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw new Error('Failed to retrieve rate history from database');
        }
    }
}
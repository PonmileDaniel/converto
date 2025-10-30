import pool from '../config/database';

export interface ApiSourceRecord {
    id?: number;
    name: string;
    base_url: string;
    priority: number;
    is_active: boolean;
    last_success_at?: Date;
    last_failure_at?: Date;
    failure_count: number;
    api_key_required: boolean;
}

export class ApiSourceRespository {
    async updateStatus(providerName: string, success: boolean): Promise<void> {
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
                    `UPDATE api_sources
                    SET last_failure_at = CURRENT_TIMESTAMP, failure_count = failure_count + 1
                    WHERE name = $1`,
                    [providerName]
                )
            }
        } catch (error) {
            console.error('Provider status update error:', error);
            throw new Error('Failed to update provider status in database');
        }
    }

    async getAllProviders(): Promise<ApiSourceRecord[]> {
        try {
            const result = await pool.query(
                'SELECT * FROM api_sources ORDER BY priority ASC'
            );
            return result.rows
        } catch (error) {
            console.error('Provider status query error:', error);
            throw new Error('Failed to fetch providers from database');
        }
    }

    async getProviderByName(name: string): Promise<ApiSourceRecord | null> {
        try {
            const result = await pool.query(
                'SELECT * FROM api_sources WHERE name = $1',
                [name]
            );
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('Provider query error:', error);
            throw new Error('Failed to fetch provider from database');
        }
    }

    async createProvider(provider: Omit<ApiSourceRecord, 'id'>): Promise<ApiSourceRecord> {
        try {
            const result = await pool.query(
                `INSERT INTO api_sources (name, base_url, priority, is_active, api_key_required, failure_count)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [provider.name, provider.base_url, provider.priority, provider.is_active, provider.api_key_required, provider.failure_count]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Provider creation error:', error);
            throw new Error('Failed to create provider in database');
        }
    }
} 
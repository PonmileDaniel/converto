import dotenv from 'dotenv';
dotenv.config();

/**
 * AppConfig hold the application config settings.
 * Abstracts away how  config is loaded
 * 
 * Server
 * Database(PostgreSql)
 * Redis
 * API
 */


interface IAppConfig {
    port: number;
    nodeEnv: 'development' | 'production' | 'test';

    database: {
        user: string;
        host: string;
        name: string;
        password: string;
        port: number;
    }

    redis: {
        host: string;
        port: number;
        password: string;
        connectTimeout: number;
    }

    cache: {
        ttl: number;
    }

    apis: {
        fixer: {
            name: string;
            priority: number;
            baseUrl: string;
            key: string;
            enabled: boolean;
        };
        currencyapi: {
            name: string;
            priority: number;
            baseUrl: string;
            key: string;
            enabled: boolean;
        };

        exchangerates: {
            name: string;
            priority: number;
            baseUrl: string;
            key: string;
            enabled: boolean;
        };
    };
}

class AppConfig implements IAppConfig {
    port: number;

    nodeEnv: 'development' | 'production' | 'test';

    database: { 
        user: string; 
        host: string; 
        name: string; 
        password: string; 
        port: number; 
    };

    redis: {
        host: string;
        port: number;
        password: string;
        connectTimeout: number;
    };

    cache: { 
        ttl: number; 
    };

    apis: {
        fixer: {
            name: string;
            priority: number;
            baseUrl: string;
            key: string;
            enabled: boolean;
        };
        currencyapi: {
            name: string;
            priority: number;
            baseUrl: string;
            key: string;
            enabled: boolean;
        };
        exchangerates: {
            name: string;
            priority: number;
            baseUrl: string;
            key: string;
            enabled: boolean;
        };
    };

    constructor() {
        this.port = this.getEnvAsNumber('PORT', 3000);
        this.nodeEnv = this.getEnvAsString('NODE_ENV', 'development') as any;
        
        this.database = {
            user: this.getEnvAsString('DB_USER', 'postgres'),
            host: this.getEnvAsString('DB_HOST', 'localhost'),
            name: this.getEnvAsString('DB_NAME', 'postgres'),
            password: this.getEnvAsString('DB_PASSWORD', 'password'),
            port: this.getEnvAsNumber('DB_PORT', 5432),
        };

        this.redis = {
            host: this.getEnvAsString('REDIS_HOST', 'localhost'),
            port: this.getEnvAsNumber('REDIS_PORT', 6379),
            password: this.getEnvAsString('REDIS_PASSWORD', ''),
            connectTimeout: 10000,
        };

        this.cache = {
            ttl: this.getEnvAsNumber('CACHE_TTL', 300)
        }

        this.apis = {
            fixer: {
                name: 'fixer',
                priority: this.getEnvAsNumber('FIXER_PRIORITY', 3),
                baseUrl: this.getEnvAsString('FIXER_BASE_URL', 'http://data.fixer.io/api'),
                key: this.getEnvAsString('fixerapiKey', ''),
                enabled: this.getEnvAsBoolean('FIXER_ENABLED'),
            },

            currencyapi: {
                name: 'currencyapi',
                priority: this.getEnvAsNumber('CURRENCYAPI_PRIORITY', 2),
                baseUrl: this.getEnvAsString('CURRENCYAPI_BASE_URL', 'https://api.currencyapi.com/v3'),
                key: this.getEnvAsString('currencyapiKey', ''),
                enabled: this.getEnvAsBoolean('CURRENCYAPI_ENABLED'),
            },
            exchangerates: {
                name: 'exchangerates',
                priority: this.getEnvAsNumber('EXCHANGERATES_PRIORITY', 1),
                baseUrl: this.getEnvAsString('EXCHANGERATES_BASE_URL', 'https://api.exchangerate-api.com/v4'),
                key: this.getEnvAsString('exchangeratesKey', ''),
                enabled: this.getEnvAsBoolean('EXCHANGERATES_ENABLED'),
            },
        };

        this.validate();
    }

    private getEnvAsString(key: string, defaultValue: string = ''): string {
        const value = process.env[key];
        return value != undefined ? value : defaultValue
    }

    private getEnvAsNumber(key: string, defaultValue: number = 0): number {
        const value = process.env[key];
        if (value === undefined) return defaultValue;
        const parsed = Number(value);
        if (isNaN(parsed)) {
            return defaultValue;
        }
        return parsed;
    }

    private getEnvAsBoolean(key: string, defaultValue: boolean = false): boolean {
        const value = process.env[key];
        if (value === undefined) return defaultValue;
        return value.toLowerCase() === 'true';
    }

    private validate(): void {
        const errors: string[] = [];

        if (!this.database.password) {
            errors.push('Database Password is required')
        }

        if (!this.apis.fixer.key) {
            errors.push('Fixer API Key is required')
        }

        if (!this.apis.currencyapi.key) {
            errors.push('Currency API Key is required')
        }

        if (errors.length > 0) {
            throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
        }

        console.log('Configuration validated successfully');
    }

    toString(): string {
        return `
    AppConfig:
        Port: ${this.port}
        Environment: ${this.nodeEnv}
        Database: ${this.database.host}:${this.database.port}/${this.database.name}
        Redis: ${this.redis.host}:${this.redis.port},
        Cache TTL: ${this.cache.ttl}s
        Fixer API Key: ${this.apis.fixer.key}${this.apis.fixer.key ? '✓ Configured' : '✗ Not configured'}
        Currency API Key: ${this.apis.currencyapi.key}${this.apis.currencyapi.key ? '✓ Configured' : '✗ Not configured'}
        `;
    }
}

export const appConfig = new AppConfig();
export default appConfig;
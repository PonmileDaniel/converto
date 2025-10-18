import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import pool from '../config/database';
import redisClient from '../config/redis';
import currencyRoutes from '../routes/currency.routes';

dotenv.config();

export class ServerSetup {
    private app: express.Application;
    private port: number;

    constructor() {
        this.app = express();
        this.port = Number(process.env.PORT) || 3000;
        this.setupMiddleware();
        this.setupRoutes();
        this.setupGracefulShutdown();
    }

    private setupMiddleware(): void {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(morgan('combined'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private setupRoutes(): void {
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                service: 'Currency Converter API'
            });
        });

        this.app.get('/', (req, res) => {
            res.json({
                message: 'Currency Converter API',
                version: '1.0.0'
            });
        });

        this.app.use('/api/currency', currencyRoutes);
    }

    private async initializeConnections(): Promise<void> {
        try {
            await pool.query('SELECT NOW()');
            console.log('Database connected');

            await redisClient.connect();
            console.log('Redis connected');
        } catch (error) {
            console.error('Failed to initialize connections:', error);
            throw error;
        }
    }

    private setupGracefulShutdown(): void {
        process.on('SIGTERM', async () => {
            console.log('🔄 Shutting down gracefully...');
            try {
                await pool.end();
                await redisClient.quit();
                console.log('Connections closed successfully');
                process.exit(0);
            } catch (error) {
                console.error('Error during shutdown:', error);
                process.exit(1);
            }
        });

        process.on('SIGINT', async () => {
            console.log('\n Received SIGINT, shutting down gracefully...');
            try {
                await pool.end();
                await redisClient.quit();
                console.log('Connections closed successfully');
                process.exit(0);
            } catch (error) {
                console.error('Error during shutdown:', error);
                process.exit(1);
            }
        });
    }

    public async start(): Promise<void> {
        try {
            await this.initializeConnections();
            
            this.app.listen(this.port, () => {
                console.log(`Server running on port ${this.port}`);
                console.log(`Environment: ${process.env.NODE_ENV}`);
                console.log(`Health check: http://localhost:${this.port}/health`);
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    public getApp(): express.Application {
        return this.app;
    }
}
import { Pool } from "pg";
import dotenv from 'dotenv';
import { appConfig } from './app.config'

dotenv.config();

const pool = new Pool({
    user: appConfig.database.user,
    host: appConfig.database.host,
    database: appConfig.database.name,
    password: appConfig.database.password,
    port: appConfig.database.port,
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL Successfully');
});

pool.on('error', (err) => {
    console.error('PostgreSQL connection error:', err);
});

export default pool;
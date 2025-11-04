import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// Mock database pool globally
jest.mock('../config/database', () => ({
    __esModule: true,
    default: {
        query: jest.fn(),
        connect: jest.fn(),
        end: jest.fn()
    }
}));

// Mock Redis client globally  
jest.mock('../config/redis', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        quit: jest.fn()
    }
}));

// Mock axios for external API calls
jest.mock('axios');

// Set test environment
process.env.NODE_ENV = 'test';
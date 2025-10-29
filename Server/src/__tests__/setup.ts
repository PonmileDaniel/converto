import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// Mock Redis client
jest.mock('../config/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  connect: jest.fn(),
  quit: jest.fn(),
  ping: jest.fn().mockResolvedValue('PONG')
}));

// Mock Database pool
jest.mock('../config/database', () => ({
  query: jest.fn(),
  end: jest.fn(),
  on: jest.fn()
}));

// Mock axios for external API calls
jest.mock('axios');

// Set test environment
process.env.NODE_ENV = 'test';
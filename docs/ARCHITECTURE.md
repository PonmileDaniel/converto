# Architecture Guide

## Overview
The Currency Converter API follows a layered architecture pattern with clear separation of concerns.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP Requests
┌─────────────────────▼───────────────────────────────────────┐
│                   Controller Layer                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  Currency   │ │   Health    │ │     App     │            │
│  │ Controller  │ │ Controller  │ │ Controller  │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────┬───────────────────────────────────────┘
                      │ Business Logic
┌─────────────────────▼───────────────────────────────────────┐
│                   Service Layer                             │
│  ┌─────────────┐ ┌─────────────┐                            │
│  │  Currency   │ │    Cache    │                            │
│  │  Service    │ │   Service   │                            │
│  └─────────────┘ └─────────────┘                            │
└─────────────────────┬───────────────────────────────────────┘
                      │ Data Access
┌─────────────────────▼───────────────────────────────────────┐
│                 Repository Layer                            │
│  ┌─────────────┐ ┌─────────────┐                            │
│  │ ExchangeRate│ │ ApiSource   │                            │
│  │ Repository  │ │ Repository  │                            │
│  └─────────────┘ └─────────────┘                            │
└─────────────────────┬───────────────────────────────────────┘
                      │ External APIs
┌─────────────────────▼───────────────────────────────────────┐
│                  Provider Layer                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │   Fixer     │ │ CurrencyAPI │ │ExchangeRates│            │
│  │  Provider   │ │  Provider   │ │  Provider   │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### Controller Layer
- Handle HTTP requests/responses
- Input validation (Joi schemas)
- Error handling and status codes
- Route parameter extraction

### Service Layer
- Business logic implementation
- Provider orchestration and fallback
- Caching strategy
- Error aggregation

### Repository Layer
- Database operations
- Data persistence
- Query optimization
- Connection management

### Provider Layer
- External API integration
- Rate limiting compliance
- Response transformation
- Error handling

## Data Flow

1. **Request**: Client sends HTTP request
2. **Validation**: Controller validates input
3. **Cache Check**: Service checks Redis cache
4. **Provider Call**: If cache miss, try providers in priority order
5. **Fallback**: If all providers fail, check database
6. **Response**: Return result to client
7. **Persistence**: Save successful rates to database

## Design Patterns

### Singleton Pattern
- `CacheService` - Single Redis connection
- `AppConfig` - Centralized configuration

### Repository Pattern
- `ExchangeRateRepository` - Database operations
- `ApiSourceRepository` - Provider status tracking

### Strategy Pattern
- `BaseProvider` - Common provider interface
- Multiple provider implementations

### Dependency Injection
- Services accept dependencies in constructor
- Enables easy testing and mocking

## Configuration Management

```typescript
interface IAppConfig {
  port: number;
  database: DatabaseConfig;
  redis: RedisConfig;
  apis: ApiConfig;
}
```

- Environment-based configuration
- Validation on startup
- Type-safe configuration access

## Error Handling Strategy

1. **Provider Level**: Catch and transform API errors
2. **Service Level**: Aggregate errors, try fallbacks
3. **Controller Level**: Transform to HTTP responses
4. **Global Level**: Catch unhandled errors

## Caching Strategy

- **TTL**: Configurable time-to-live
- **Key Pattern**: `rate:{from}:{to}`
- **Invalidation**: Automatic expiration
- **Fallback**: Database if cache fails

## Security Measures

- Helmet.js security headers
- CORS configuration
- Input validation
- Rate limiting
- Environment variable protection
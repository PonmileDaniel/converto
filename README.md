# Currency Converter API

A robust TypeScript API for real-time currency conversion with multi-provider support and intelligent caching.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Jest-red.svg)](https://jestjs.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

- **Multi-Provider Support** - Fixer.io, CurrencyAPI, ExchangeRatesAPI with automatic fallback
- **Redis Caching** - Fast response times with configurable TTL
- **PostgreSQL Persistence** - Rate history and fallback data storage
- **Provider Health Monitoring** - Automatic provider status tracking
- **Comprehensive Testing** - Unit, integration, and E2E tests
- **Docker Ready** - Containerized deployment
- **Production Security** - Helmet, CORS, input validation, rate limiting

## 🏗️ Architecture

[Include your architecture diagram here]

## 🛠️ Tech Stack

**Backend**
- TypeScript + Node.js + Express.js
- PostgreSQL + Redis
- Jest + Supertest (Testing)
- Swagger/OpenAPI 3.0

**Frontend**
- React 18 + Vite
- Modern CSS with responsive design
- Axios for API communication


## Quick Start

```bash
git clone https://github.com/yourusername/currency-converter-api.git
cd currency-converter-api/Server
npm install

cp .env.example .env


npm run dev
```

## API Usage

```bash
# Convert currency
GET /api/currency/convert?from=USD&to=EUR&amount=100


{
  "success": true,
  "data": {
    "convertedAmount": 85.50,
    "rate": 0.855,
    "cached": false,
    "source": "fixer"
  }
}
```

## Environment Setup

```bash
DB_PASSWORD=your_db_password
fixerapiKey=your_fixer_key
currencyapiKey=your_currency_key
PORT=3000
CACHE_TTL=300
FIXER_ENABLED=true
```

## Development

```bash
npm run dev       
npm test  
npm run test:coverage 
npm run build        
```

## Documentation

- [API Documentation](docs/API.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing](CONTRIBUTING.md)

## License

MIT © [Ndukwe Daniel](LICENSE)
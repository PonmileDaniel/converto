# API Documentation

## Swagger docs
```
http://localhost:3000/api-docs
```

## Base URL
```
http://localhost:3000/api
```

## Authentication
No authentication required for public endpoints.

## Endpoints

### Convert Currency
Convert an amount from one currency to another.

**Endpoint:** `GET /currency/convert`

**Parameters:**
| Parameter | Type | Required | Description      |
|-----------|------|----------|------------------|
| from      |string|    Yes   |Source currency   |
| to        |string|    Yes   |Target currency   |
| amount    |number|    No    |Amount to convert |

**Example Request:**
```bash
GET /api/currency/convert?from=USD&to=EUR&amount=100
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "from": "USD",
    "to": "EUR",
    "amount": 100,
    "convertedAmount": 85.50,
    "rate": 0.855,
    "cached": false,
    "source": "fixer",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Provider Status
Get the status of all currency providers.

**Endpoint:** `GET /currency/providers`

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "exchangerates",
      "priority": 1,
      "is_active": true,
      "last_success_at": "2024-01-15T10:25:00.000Z",
      "failure_count": 0
    }
  ]
}
```

### Health Check
Check API health status.

**Endpoint:** `GET /health`

**Example Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Currency converter API"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "\"from\" length must be 3 characters long"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

## Rate Limiting
- 100 requests per minute per IP
- Headers included: `X-RateLimit-Limit`, `X-RateLimit-Remaining`
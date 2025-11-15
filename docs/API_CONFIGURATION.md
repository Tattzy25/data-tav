# API Configuration Guide

This document provides comprehensive information about configuring the API for production deployment.

## Environment Variables

### Required Configuration

#### AI Model Registry

**Option 1: Registry File (Recommended)**
```bash
AI_MODEL_REGISTRY_FILE=config/ai-model-registry.json
```
Points to a JSON file that defines available AI models. See `config/ai-model-registry.example.json` for the format.

**Option 2: Inline JSON**
```bash
AI_MODEL_REGISTRY='[{"id":"groq/llama-3.3-70b-versatile","label":"Llama 3.3 70B","provider":"groq","model":"llama-3.3-70b-versatile","maxTokens":4096,"temperature":0.4}]'
```
Defines models directly in environment variable.

**Fallback Behavior:**
If neither is configured, the system uses a hardcoded fallback registry with:
- Llama 3.3 70B (Groq)
- Llama 3.1 70B (Groq)

### AI Provider API Keys

At least one API key must be configured:

```bash
# For Groq models (recommended for cost-effectiveness)
GROQ_API_KEY=your_groq_api_key_here

# For OpenAI models
OPENAI_API_KEY=your_openai_api_key_here
```

**Note:** Users can also provide API keys per-request via the Custom API feature in the UI.

## API Endpoints

### POST /api/generate-ai-data

Generates synthetic data using AI models.

**Rate Limiting:**
- 10 requests per minute per IP address
- Returns `429` status when exceeded with `Retry-After` header

**Request Body:**
```json
{
  "headers": ["Name", "Email", "Company"],
  "rowCount": 10,
  "context": "Generate realistic employee data",
  "model": "groq/llama-3.3-70b-versatile",
  "provider": "groq",
  "apiKey": "optional_override_key",
  "maxTokens": 4096,
  "temperature": 0.4,
  "reasoning": "medium"
}
```

**Required Fields:**
- `headers` (array of strings, 1-50 items)
- `rowCount` (number, 1-100)

**Optional Fields:**
- `context` (string, max 500 chars) - Additional context for generation
- `model` (string) - Model ID from registry
- `provider` (string) - Must match model's provider
- `apiKey` (string) - Override default API key
- `maxTokens` (number) - Override model's default max tokens
- `temperature` (number, 0-2) - Override model's default temperature
- `reasoning` ("low" | "medium" | "high") - Reasoning effort level

**Success Response (200):**
```json
{
  "data": [
    {"Name": "John Doe", "Email": "john@example.com", "Company": "Acme Corp"},
    {"Name": "Jane Smith", "Email": "jane@example.com", "Company": "Tech Inc"}
  ]
}
```

**Error Responses:**
- `400` - Invalid request (bad headers, row count, etc.)
- `401` - Invalid API key
- `404` - Model not found
- `429` - Rate limit exceeded
- `500` - Server error
- `503` - Service unavailable
- `504` - Request timeout

All error responses include:
```json
{
  "error": "Error message",
  "suggestion": "Helpful guidance for fixing the issue"
}
```

**Response Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 8
X-RateLimit-Reset: 1700000000000
```

### GET /api/model-registry

Returns list of available AI models.

**Success Response (200):**
```json
{
  "models": [
    {
      "id": "groq/llama-3.3-70b-versatile",
      "label": "Llama 3.3 70B (Groq)",
      "provider": "groq",
      "model": "llama-3.3-70b-versatile",
      "maxTokens": 4096,
      "temperature": 0.4
    }
  ]
}
```

### GET /api/health

Health check endpoint for monitoring and load balancers.

**Success Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-15T23:00:00.000Z",
  "version": "0.1.0",
  "checks": {
    "modelRegistry": {
      "status": "ok",
      "modelCount": 2
    },
    "environment": {
      "status": "ok",
      "hasGroqKey": true,
      "hasOpenAIKey": false
    }
  }
}
```

**Status Values:**
- `healthy` - All systems operational
- `degraded` - Some issues but service is functional
- `unhealthy` - Critical issues, service may not function properly

**Status Codes:**
- `200` - Healthy or degraded
- `503` - Unhealthy

## Production Features

### Error Handling
- **Timeout Protection**: All AI API calls have 30-second timeout
- **Retry Logic**: Automatic retry with exponential backoff for transient failures
- **Detailed Errors**: Specific error messages with actionable suggestions
- **Fallback Strategies**: Multiple JSON parsing strategies for robustness

### Security
- **Rate Limiting**: Per-IP rate limiting with cleanup of old entries
- **Input Validation**: All inputs validated and sanitized
- **API Key Protection**: Environment variables or per-request keys
- **Header Validation**: Headers length and count limits

### Reliability
- **Graceful Degradation**: Fallback model registry when config missing
- **Memory Management**: Automatic cleanup of expired rate limit entries
- **Response Validation**: Validates AI responses before returning
- **Health Monitoring**: `/api/health` endpoint for uptime monitoring

### Performance
- **Connection Reuse**: HTTP clients reuse connections
- **Efficient Rate Limiting**: O(1) lookup with periodic cleanup
- **Optimized Retries**: Smart retry logic skips non-retriable errors

## Deployment Checklist

- [ ] Set `AI_MODEL_REGISTRY_FILE` or `AI_MODEL_REGISTRY`
- [ ] Set `GROQ_API_KEY` and/or `OPENAI_API_KEY`
- [ ] Configure reverse proxy to set `x-forwarded-for` header
- [ ] Set up monitoring on `/api/health` endpoint
- [ ] Configure log aggregation for error tracking
- [ ] Test rate limiting behavior under load
- [ ] Verify timeout behavior with slow networks
- [ ] Test fallback registry activation
- [ ] Review error messages in production logs

## Monitoring Recommendations

1. **Health Checks**: Poll `/api/health` every 30 seconds
2. **Alerts**: Alert on status != "healthy" for > 2 minutes
3. **Metrics to Track**:
   - Request rate to `/api/generate-ai-data`
   - Error rate by status code
   - Average response time
   - Rate limit hit rate
   - Model usage distribution
4. **Logs to Monitor**:
   - "AI generation error:" entries
   - "Using fallback registry" warnings
   - Rate limit exceeded events

## Troubleshooting

### "Model registry is not configured"
- Check `AI_MODEL_REGISTRY_FILE` path is correct
- Ensure file is readable by the application
- Verify JSON format matches schema
- Check logs for fallback registry usage

### "API key not configured"
- Verify environment variable is set correctly
- Check for trailing spaces in API key
- Ensure deployment platform exposes env vars
- Try providing API key in request body

### Rate Limiting Issues
- Multiple instances? Consider external rate limiter (Redis)
- Too restrictive? Adjust limits in code
- Behind CDN? Ensure proper IP forwarding

### Timeout Errors
- Reduce `rowCount` in requests
- Simplify context/headers
- Check network latency to AI provider
- Consider increasing timeout (default 30s)

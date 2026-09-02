#### FILE: `API_DOCUMENTATION.md` (Excerpt to guide the team)
```markdown
# SOMATIC API Documentation

Base URL: `http://localhost:5000/api`
Authentication: Bearer Token (JWT) required for most routes.

## 1. Authentication
- `POST /auth/register`: Register a new farmer.
- `POST /auth/login`: Authenticate and receive JWT.
- `GET /auth/me`: Get current authenticated user profile.

## 2. Cows
- `GET /cows`: List all cows for the logged-in farmer.
- `POST /cows`: Register a new cow.
- `GET /cows/:cowId/dashboard`: Detailed dashboard for a single cow (trend, latest tests).

## 3. Test Lifecycle
- `POST /tests/start`: Initiate a new test. Returns `testId`. Status `CREATED`.
- `POST /tests/:testId/observations`: Submit observational answers. Status `OBSERVATION_COMPLETED`.
- `POST /tests/:testId/start-sensor-test`: Sets state to `WAITING_FOR_DEVICE`.
- `GET /tests/:testId/status`: Poll this endpoint during testing to update UI progress bars.
- `GET /tests/:testId/result`: Fetch the final detailed result.

## 4. Farm Analytics & Dashboard
- `GET /dashboard/summary`: Single endpoint to hydrate the main UI dashboard.
- `GET /farm/health`: Detailed analytics for the Farm Health report page.

## 5. IoT Webhook (For Hardware integration)
- `POST /iot/sensor-data`: Webhook for the physical IoT device to push data. 
  *Payload must include testId, deviceId, cowId, and measurement object.*
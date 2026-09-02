# SOMATIC — Clinical Field System (Backend API)

SOMATIC is a real-world IoT + Machine Learning based cattle mastitis risk assessment platform. This backend API collects observational information, IoT sensor measurements, and processed ML data, running it all through a configurable weighted risk-scoring engine to produce a comprehensive clinical risk assessment.

## Architecture Highlights
- **Stack:** Node.js, Express, MongoDB (Mongoose)
- **Pattern:** Modular Monolithic (Controller -> Service -> Model)
- **State Machine:** Robust test session state machine (CREATED -> DEVICE_CONNECTED -> COMPLETED)
- **Configurability:** Risk weights, sensor thresholds, and ML endpoints are completely configurable.

## Important Folder Structure
server/
├── src/
│ ├── config/ # Environment, DB, and Risk Engine configs
│ ├── controllers/ # Express route controllers
│ ├── middleware/ # Auth, Role, Error, and Validation middlewares
│ ├── models/ # Mongoose schema definitions
│ ├── routes/ # API route definitions
│ ├── services/ # Business logic (Risk, ML, IoT, Farm Analytics)
│ └── utils/ # Helper utilities (Responses, Async Handlers)
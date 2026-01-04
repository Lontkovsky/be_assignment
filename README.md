# User management backend assignment

## Requirements
- Node.js 18+
- Docker + docker compose

## Setup
1. Start MySQL and phpMyAdmin:
   ```bash
   docker compose up -d
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional):
   ```bash
   cp .env.example .env
   ```

4. Run the server:
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:3000` by default.

## API Docs (Swagger)
- UI: `http://localhost:3000/docs`
- Spec JSON: `http://localhost:3000/openapi.json`

## Tests
```bash
npm test
```

## Database Access
phpMyAdmin is available at `http://localhost:8080/` with:
- Username: `user`
- Password: `password`

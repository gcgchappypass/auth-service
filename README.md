# Auth Service

A Node.js authentication service using session-based authentication with TypeScript and Express.

## Features

- Session-based authentication
- User login/logout
- Session management
- Cookie-based session storage  
- TypeScript support
- Comprehensive testing

## Getting Started

### Prerequisites

- Node.js (>= 16.0.0)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gcgchappypass/auth-service.git
cd auth-service
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Build the project:
```bash
npm run build
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /auth/login` - User login with username/password
- `POST /auth/logout` - User logout (destroys session)
- `GET /auth/profile` - Get current user profile (requires valid session)

### Health Check

- `GET /health` - Service health check

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## Project Structure

```
src/
├── controllers/
│   ├── authController.ts      # Authentication logic
│   └── sessionController.ts   # Session management
├── index.ts                   # Main application entry point
tests/
├── authService.test.ts        # Authentication tests
└── setup.ts                   # Test setup
```

## Session Management

This service uses in-memory session storage (suitable for development). In production, consider using:

- Redis for session storage
- Database-backed sessions
- Clustered session management

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript project
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

## Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `SESSION_SECRET` - Secret for session signing
- `SESSION_TIMEOUT` - Session timeout in milliseconds
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins

## License

MIT
# NEW-PJ API

A robust NestJS-based user management API with JWT authentication, event-driven architecture, and MongoDB integration.

## Features

- 🔐 JWT Authentication & Authorization
- 👥 Role-based Access Control (RBAC)
- 📝 Comprehensive API Documentation (Swagger)
- 🎯 Event-driven Architecture
- ✅ Input Validation & Error Handling
- 🏥 Health Check Endpoints
- 🔒 Security Best Practices

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Events**: @nestjs/event-emitter

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd server-new-pj
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp env.example .env
```

Edit `.env` file with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/NEWPJ
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
PORT=3000
NODE_ENV=development
```

4. Start the application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## API Endpoints

### Authentication
- `POST /user/create` - Register a new user
- `POST /user/signin` - Sign in user
- `PUT /user/update` - Update user profile (authenticated)

### User Management
- `GET /users/me` - Get current user profile
- `GET /users/all` - Get all users (admin only)
- `GET /users/:role` - Get users by role (admin only)

### System
- `GET /health` - Health check endpoint

## User Roles

- **SUPERADMIN**: Full system access
- **ADMIN**: User management access
- **CLIENT**: Basic user access

## Project Structure

```
src/
├── common/           # Shared utilities, filters, interceptors
├── config/           # Configuration files
├── eventbase/        # Event system implementation
├── health/           # Health check module
└── user/             # User management module
    ├── controller/   # API controllers
    ├── decorators/   # Custom decorators
    ├── dto/          # Data transfer objects
    ├── events/       # Event definitions
    ├── guards/       # Authentication & authorization guards
    ├── handlers/     # Event handlers
    ├── repository/   # Data access layer
    ├── schema/       # Database schemas
    ├── service/      # Business logic
    └── utils/        # Utility functions
```

## Development

### Available Scripts

```bash
npm run start:dev     # Start in development mode
npm run build         # Build for production
npm run test          # Run tests
npm run test:cov      # Run tests with coverage
npm run lint          # Lint code
npm run format        # Format code
npm run typecheck     # Type checking
```

### Code Quality

The project includes:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Jest for testing

## Security Features

- Password hashing with bcrypt (salt rounds: 12)
- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- Global exception handling
- CORS configuration

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

This project is licensed under the UNLICENSED License.

## Deployment

### Render Deployment

The application is ready for deployment on Render. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
1. Connect repository to Render
2. Set build command: `npm install && npm run build`
3. Set start command: `npm run start:prod`
4. Add environment variables (see DEPLOYMENT.md)

The application includes Docker support for containerized deployments.

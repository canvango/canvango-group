# Canvango Group - Project Structure Overview

## Architecture Overview

This is a full-stack web application built with:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL

## Directory Structure

```
canvango-app/
│
├── README.md                 # Main project documentation
├── SETUP.md                  # Setup and installation guide
├── PROJECT_STRUCTURE.md      # This file
│
├── backend/                  # Backend API server
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts           # Database connection configuration
│   │   │
│   │   ├── controllers/              # Request handlers (to be implemented)
│   │   │   └── .gitkeep
│   │   │
│   │   ├── database/
│   │   │   ├── schema.sql            # Database schema definition
│   │   │   └── migrate.ts            # Migration runner
│   │   │
│   │   ├── middleware/               # Express middleware (to be implemented)
│   │   │   └── .gitkeep
│   │   │
│   │   ├── models/                   # Data models (to be implemented)
│   │   │   └── .gitkeep
│   │   │
│   │   ├── routes/                   # API routes (to be implemented)
│   │   │   └── .gitkeep
│   │   │
│   │   ├── services/                 # Business logic (to be implemented)
│   │   │   └── .gitkeep
│   │   │
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript type definitions
│   │   │
│   │   ├── utils/
│   │   │   └── response.ts           # API response utilities
│   │   │
│   │   └── index.ts                  # Application entry point
│   │
│   ├── .env.example                  # Environment variables template
│   ├── .gitignore
│   ├── jest.config.js                # Jest testing configuration
│   ├── package.json                  # Dependencies and scripts
│   └── tsconfig.json                 # TypeScript configuration
│
└── frontend/                 # Frontend React application
    ├── src/
    │   ├── components/               # Reusable React components (to be implemented)
    │   │   └── .gitkeep
    │   │
    │   ├── contexts/                 # React Context providers (to be implemented)
    │   │   └── .gitkeep
    │   │
    │   ├── hooks/                    # Custom React hooks (to be implemented)
    │   │   └── .gitkeep
    │   │
    │   ├── pages/                    # Page components (to be implemented)
    │   │   └── .gitkeep
    │   │
    │   ├── services/                 # API service functions (to be implemented)
    │   │   └── .gitkeep
    │   │
    │   ├── test/
    │   │   └── setup.ts              # Test setup configuration
    │   │
    │   ├── types/
    │   │   ├── api.types.ts          # API response types
    │   │   └── user.types.ts         # User-related types
    │   │
    │   ├── utils/
    │   │   ├── api.ts                # Axios instance with interceptors
    │   │   └── constants.ts          # Application constants
    │   │
    │   ├── App.tsx                   # Main application component
    │   ├── index.css                 # Global styles with Tailwind
    │   ├── main.tsx                  # Application entry point
    │   └── vite-env.d.ts             # Vite environment types
    │
    ├── .env.example                  # Environment variables template
    ├── .eslintrc.cjs                 # ESLint configuration
    ├── .gitignore
    ├── index.html                    # HTML template
    ├── package.json                  # Dependencies and scripts
    ├── postcss.config.js             # PostCSS configuration
    ├── tailwind.config.js            # Tailwind CSS configuration
    ├── tsconfig.json                 # TypeScript configuration
    ├── tsconfig.node.json            # TypeScript config for Node files
    ├── vite.config.ts                # Vite configuration
    └── vitest.config.ts              # Vitest testing configuration
```

## Database Schema

The application uses PostgreSQL with the following tables:

### Users Table
- Stores user information (username, email, password, role, balance)
- Roles: guest, member, admin
- Includes timestamps and last login tracking

### Transactions Table
- Records all user transactions
- Links to users table
- Tracks product type, quantity, amount, and status

### TopUps Table
- Manages balance top-up requests
- Links to users table
- Tracks payment method and status

### Claims Table
- Handles warranty/guarantee claims
- Links to users and transactions
- Includes status workflow and admin responses

### Tutorials Table
- Stores tutorial content
- Includes categories, tags, and view counts

### AdminAuditLogs Table
- Tracks all admin actions
- Records changes, IP addresses, and user agents
- Essential for security and compliance

## API Structure (To Be Implemented)

### Authentication Endpoints
**Note**: Authentication is now handled by Supabase Auth on the frontend. The backend validates Supabase JWT tokens via middleware. No custom auth endpoints exist in the backend API.

### User Endpoints
- `GET /api/users/me` - Get user profile
- `PUT /api/users/me` - Update user profile

### Transaction Endpoints
- `GET /api/transactions` - Get user transactions
- `GET /api/transactions/:id` - Get transaction detail

### Top Up Endpoints
- `POST /api/topup` - Create top up request
- `GET /api/topup/methods` - Get payment methods

### Claim Endpoints
- `POST /api/claims` - Submit claim
- `GET /api/claims` - Get user claims
- `GET /api/claims/:id` - Get claim detail

### Tutorial Endpoints
- `GET /api/tutorials` - Get all tutorials
- `GET /api/tutorials/:id` - Get tutorial detail
- `GET /api/tutorials/search` - Search tutorials

### Admin Endpoints
- User Management: CRUD operations on users
- Transaction Management: View and manage all transactions
- Claim Management: Review and process claims
- Tutorial Management: CRUD operations on tutorials
- System Settings: Configure application settings
- Statistics: View system analytics

## Frontend Component Structure (To Be Implemented)

### Layout Components
- `Header` - Navigation header with auth status
- `Sidebar` - Role-based navigation menu
- `Layout` - Main layout wrapper
- `Footer` - Application footer

### Authentication Components
- `LoginForm` - User login form
- `RegisterForm` - User registration form
- `ProtectedRoute` - Route guard component

### Dashboard Components
- `WelcomeBanner` - Personalized welcome message
- `AlertSection` - Important notices
- `SupportSection` - Customer support info
- `UpdateSection` - Latest updates

### Feature Components
- `TransactionTable` - Transaction history display
- `TopUpForm` - Balance top-up form
- `ClaimForm` - Warranty claim form
- `TutorialList` - Tutorial listing
- `TutorialDetail` - Tutorial content display

### Admin Components
- `UserManagement` - User administration
- `TransactionManagement` - Transaction administration
- `ClaimManagement` - Claim administration
- `TutorialManagement` - Tutorial administration
- `SystemSettings` - System configuration
- `AdminDashboard` - Admin statistics dashboard

## State Management

The application uses React Context API for state management:

### AuthContext
- Manages authentication state
- Provides login, logout, register functions
- Tracks current user and role

### Future Contexts (as needed)
- `TransactionContext` - Transaction state
- `NotificationContext` - App-wide notifications

## Styling

- **Tailwind CSS** for utility-first styling
- **Custom theme** defined in `tailwind.config.js`
- **Responsive design** with mobile-first approach
- **Dark mode support** (optional, can be added)

## Testing Strategy

### Backend Testing
- **Unit tests**: Jest for services and utilities
- **Integration tests**: Supertest for API endpoints
- **Database tests**: Test database operations

### Frontend Testing
- **Unit tests**: Vitest for components and hooks
- **Component tests**: React Testing Library
- **E2E tests**: (Optional) Cypress or Playwright

## Security Features

### Authentication
- JWT-based authentication
- HTTP-only cookies for token storage
- Refresh token mechanism
- Password hashing with bcrypt

### Authorization
- Role-based access control (RBAC)
- Route protection on frontend and backend
- Admin action logging

### General Security
- CORS configuration
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## Development Workflow

1. **Setup**: Follow SETUP.md to initialize the project
2. **Database**: Run migrations to create tables
3. **Backend Development**: Implement API endpoints
4. **Frontend Development**: Build UI components
5. **Integration**: Connect frontend to backend
6. **Testing**: Write and run tests
7. **Deployment**: Deploy to production

## Next Steps

Refer to `.kiro/specs/canvango-group-web-app/tasks.md` for the detailed implementation plan. The tasks are organized sequentially to build the application incrementally.

Start with:
1. Task 2: Implement database models
2. Task 3: Implement authentication system
3. Task 4: Implement user endpoints
4. Continue with remaining tasks...

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `DB_*` - Database connection settings
- `JWT_*` - JWT configuration
- `CORS_ORIGIN` - Allowed CORS origin
- `RATE_LIMIT_*` - Rate limiting settings

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## Scripts

### Backend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run migrate  # Run database migrations
npm test         # Run tests
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm test         # Run tests
```

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Express Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)

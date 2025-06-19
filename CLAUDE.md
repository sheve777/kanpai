# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

kanpAI is a comprehensive restaurant management system designed for Japanese izakayas (restaurants), featuring a LINE chatbot with OpenAI integration, reservation management via Google Calendar, and multi-tier subscription plans. The system consists of three main applications:

1. **Backend API** (`/backend`) - Node.js/Express server with PostgreSQL
2. **Customer Frontend** (`/frontend`) - React application for customers  
3. **Admin Dashboard** (`/admin`) - React/Vite application for store owners

## Security Guidelines

**CRITICAL**: Never commit sensitive information to the repository. Always use environment variables for:
- Database credentials
- API keys and secrets
- Authentication tokens
- Passwords (including demo passwords)
- Private keys and certificates

**Required**: Each application must have proper `.env.example` files with all required environment variables documented.

**Enforcement**: All applications should validate required environment variables on startup and fail gracefully if missing.

## Development Commands

### Backend Development
```bash
cd backend
npm start                    # Start production server (port 3002)
npm test                     # Run Jest tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Generate test coverage report
```

### Frontend Development (Customer-facing)
```bash
cd frontend  
npm start                    # Start dev server (port 3000)
npm run build               # Build for production
npm test                    # Run React tests
```

### Admin Dashboard Development
```bash
cd admin
npm run dev                 # Start Vite dev server (port 3003)
npm run build              # Build for production
npm run lint               # Run ESLint
npm run preview            # Preview production build
```

### Database Operations
```bash
cd backend
npm run db:init                      # Initialize database schema
npm run db:create-menus             # Create menu tables
npm run db:create-chat-tables       # Create chat/messaging tables
npm run db:create-reservation-tables # Create reservation system tables
npm run db:create-billing-tables    # Create billing/subscription tables
npm run db:seed-plans               # Seed subscription plans
```

## Architecture Overview

### Multi-Application Structure
The project uses a **monorepo approach** with three separate applications sharing common backend services. Each application has distinct responsibilities:

- **Backend**: Centralized API server handling all business logic, database operations, and external API integrations
- **Frontend**: Customer-facing React SPA for browsing menus and making reservations via LINE bot
- **Admin**: Store owner dashboard for managing reservations, menus, LINE broadcasts, and viewing analytics

### Key Architectural Patterns

**Store-Scoped Multi-Tenancy**: All data is partitioned by `store_id` to support multiple restaurant locations. Every API endpoint includes store-level access control and data isolation.

**Demo Mode Support**: The system runs in demo mode when PostgreSQL is unavailable, providing realistic mock data for development and testing without requiring database setup.

**External API Integration Layer**: Centralized service pattern for managing OpenAI, LINE, Google Calendar, and Stripe integrations with proper error handling and rate limiting.

### Database Design
PostgreSQL with comprehensive schema supporting:
- **Store Management**: Multi-tenant store information with isolated data
- **Reservation System**: Google Calendar integration with seat type management  
- **Chat System**: Conversation history with OpenAI token tracking
- **Usage Analytics**: Detailed logging for billing and reporting
- **LINE Integration**: Broadcast history and friend management
- **Subscription Billing**: Stripe integration with usage-based limits

## Core Technologies

### Backend Stack
- **Runtime**: Node.js with ES modules (`"type": "module"`)
- **Framework**: Express.js with comprehensive middleware stack
- **Database**: PostgreSQL with `pg` driver
- **Authentication**: JWT with bcrypt password hashing
- **External APIs**: OpenAI GPT, LINE Messaging API, Google Calendar API, Stripe
- **Logging**: Winston with file rotation and structured logging
- **Testing**: Jest with supertest for API testing

### Frontend Technologies
- **Customer Frontend**: React 19 with Create React App, Chart.js for analytics
- **Admin Dashboard**: React 19 with Vite, Lucide React icons, Recharts for data visualization
- **Shared**: Axios for API communication, React Router for navigation

### Key Middleware and Security
- **Rate Limiting**: Express-rate-limit with Redis backing
- **Input Validation**: Express-validator with comprehensive sanitization
- **Error Handling**: Centralized error handling with operational error classification
- **CORS**: Configured for development and production environments
- **Usage Monitoring**: Custom middleware for tracking API usage and billing

## Environment Configuration

### Required Environment Variables
```bash
# Core Services
PORT=3002
DATABASE_URL="postgresql://user:pass@localhost:5432/kanpai"
JWT_SECRET="your-jwt-secret"

# External APIs  
OPENAI_API_KEY="sk-..."
LINE_CHANNEL_ACCESS_TOKEN="..."
LINE_CHANNEL_SECRET="..."
STRIPE_API_KEY="sk_test_..."
GOOGLE_CALENDAR_ID="..."

# Demo Mode (for development)
DEMO_MODE=true
DEMO_PASSWORDS="kanpai123,demo,admin123"
```

### Development vs Production
- **Development**: Uses demo mode when DATABASE_URL is unavailable
- **Production**: Requires full PostgreSQL setup and all API keys
- **Testing**: Uses separate test database or demo mode

## Common Development Patterns

### API Route Structure
All routes follow RESTful patterns with store-scoped access:
```javascript
// Store-scoped endpoints
GET    /api/stores/:storeId/menus
POST   /api/stores/:storeId/reservations  
GET    /api/stores/:storeId/dashboard

// Admin endpoints (JWT protected)
POST   /api/admin/login
GET    /api/admin/stores
POST   /api/admin/stores/create
```

### Error Handling Pattern
The project uses a sophisticated error handling system:
```javascript
// Custom error classes for different scenarios
new AppError(message, statusCode)           // General application errors
new ValidationError(message, errors)       // Input validation failures  
new AuthenticationError(message)           // Authentication/authorization issues

// Async route wrapper for consistent error catching
router.get('/endpoint', catchAsync(async (req, res) => {
  // Route logic here - errors automatically caught and handled
}));
```

### Database Query Pattern
All database operations use connection pooling with proper error handling:
```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // Multiple queries in transaction
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

## Demo Mode Development

The system includes comprehensive demo mode functionality for development without full infrastructure:

### Demo Mode Features
- **Mock Authentication**: Predefined admin credentials (`admin`/`admin123`)
- **Simulated Store Data**: Realistic store and menu information
- **API Response Simulation**: All endpoints return appropriate mock data
- **Usage Tracking**: Simulated usage logs and billing information

### Enabling Demo Mode
Set `DEMO_MODE=true` in `.env` file. The system automatically falls back to demo mode when PostgreSQL connection fails.

## Testing Strategy

### Backend Testing
- **Unit Tests**: Individual middleware and utility functions
- **Integration Tests**: API endpoints with supertest
- **Database Tests**: Transaction rollback for isolation
- **External API Mocking**: Mocked responses for OpenAI, LINE, etc.

### Frontend Testing  
- **Component Tests**: React Testing Library for component behavior
- **Integration Tests**: Full user workflows and API interaction
- **Visual Testing**: Responsive design validation

## Key Development Notes

### Menu Management System - Critical Data Synchronization
The menu management system implements **bidirectional real-time synchronization** between frontend and admin dashboard, which is **ESSENTIAL** for proper restaurant operations:

#### 🔄 Bidirectional Data Flow
- **Admin Dashboard Changes** → **Customer Frontend**: Menu updates immediately reflect in customer-facing interface
- **Customer Frontend Changes** → **Admin Dashboard**: Real-time updates visible in management interface
- **Single Source of Truth**: Both interfaces use identical API endpoints (`/api/stores/:storeId/menus`)

#### 📊 Shared Database Schema
```sql
menus table:
- id (Primary Key)
- store_id (Store ID for multi-tenant isolation)  
- name (Menu item name)
- category (Standardized categories with icons)
- price (Price in yen)
- description (Optional description)
- is_recommended (Recommendation flag)
- is_available (Availability flag)
- created_at, updated_at (Timestamps)
```

#### 🎯 Critical Use Cases
1. **Bulk Menu Updates**: Admin can import/export JSON for seasonal menu changes
2. **Real-time Price Changes**: Staff can update prices from either interface immediately
3. **Availability Management**: Sold-out items can be disabled from either side
4. **Category Consistency**: Both interfaces share identical category mapping with emojis

#### ⚠️ Development Requirements
- **NEVER** create separate menu storage systems
- **ALWAYS** maintain category consistency between frontend and admin
- **ENSURE** API endpoints remain synchronized
- **TEST** bidirectional updates in both local and production environments

#### 📱 Category Standard (Must be identical across all interfaces)
```javascript
const categoryIcons = {
  'ドリンク': '🍺',     // Drinks
  '揚げ物': '🍤',       // Fried foods  
  '焼き鳥': '🍗',       // Yakitori
  '刺身': '🐟',         // Sashimi
  'サラダ': '🥗',       // Salads
  'ご飯物': '🍚',       // Rice dishes
  'デザート': '🍮',     // Desserts
  'おつまみ': '🥜',     // Appetizers/Snacks
  '麺類': '🍜',         // Noodles
  '鍋料理': '🍲'        // Hot pot dishes
};
```

### Store Setup Wizard
Recent implementation includes a comprehensive 5-step store setup wizard in the admin dashboard:
1. **Basic Info**: Store details, operating hours, subscription plan selection
2. **LINE Setup**: Bot API configuration with security features  
3. **Google Setup**: Calendar integration with service account upload
4. **AI Setup**: Chatbot personality configuration and API key management
5. **Completion**: Setup summary with next steps and resource links

### Multi-Language Support
The system is designed for Japanese restaurants with:
- Japanese text throughout the UI
- Cultural considerations for restaurant operations (izakaya-specific features)
- LINE integration (popular in Japan)
- Localized date/time formatting

### Subscription and Usage Management
The system implements sophisticated usage tracking:
- **Token-based billing** for OpenAI API usage
- **Tiered subscription plans** (Entry/Standard/Pro)
- **Usage limits** with automatic enforcement
- **Overage billing** through Stripe integration
# Marketplace Monorepo

A production-ready e-commerce marketplace built with React, NestJS microservices, and PostgreSQL.

## 🏗️ Architecture

### Frontend
- **React 18** with Vite + TypeScript
- **TailwindCSS** + shadcn/ui components
- **React Query** for server state management
- **React Hook Form** + Zod validation
- **Framer Motion** for animations
- **Socket.IO** for real-time notifications

### Backend (Microservices)
- **API Gateway** (Port 3000) - Request routing, auth middleware, rate limiting
- **Auth Service** (Port 3001) - JWT authentication, user management
- **Product Service** (Port 3002) - Product catalog, categories, vendors
- **Order Service** (Port 3003) - Cart, orders, order lifecycle
- **Payment Service** (Port 3004) - Stripe/Razorpay integration
- **Notification Service** (Port 3005) - Email, SMS, WebSocket notifications

### Infrastructure
- **PostgreSQL** - Separate database per service
- **Redis** - Caching and session storage
- **Docker** - Containerized development environment
- **Prisma** - Type-safe database ORM

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- npm 9+

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd marketplace
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the development environment**
```bash
# Start all services with Docker Compose
npm run dev:backend

# In another terminal, start the frontend
npm run dev:frontend
```

4. **Access the application**
- Frontend: http://localhost:5173
- API Gateway: http://localhost:3000
- Individual services: http://localhost:3001-3005

### Database Setup

```bash
# Generate Prisma clients
npm run db:generate

# Push database schemas
npm run db:push

# Seed demo data
npm run seed
```

## 📁 Project Structure

```
marketplace/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configurations
│   │   └── types/          # TypeScript type definitions
├── backend/
│   ├── api-gateway/        # Main API gateway
│   ├── auth-service/       # Authentication service
│   ├── product-service/    # Product management
│   ├── order-service/      # Order processing
│   ├── payment-service/    # Payment processing
│   ├── notification-service/ # Notifications
│   └── shared/             # Shared DTOs and utilities
├── infra/                  # Infrastructure configurations
└── docs/                   # Documentation
```

## 🔐 Authentication Flow

1. User registers/logs in via frontend
2. Auth service validates credentials and issues JWT tokens
3. Tokens stored in HttpOnly cookies
4. API Gateway validates tokens for protected routes
5. Services communicate user context via headers

## 🛒 E-commerce Flow

1. **Browse Products** - Users view product catalog with filters
2. **Add to Cart** - Products added to persistent cart
3. **Checkout** - Order creation with shipping details
4. **Payment** - Secure payment via Stripe/Razorpay
5. **Order Processing** - Vendor receives order notification
6. **Fulfillment** - Order status updates (CONFIRMED → SHIPPED → DELIVERED)

## 👥 User Roles

- **Buyer** - Browse products, manage cart, place orders
- **Vendor** - Manage products, view orders, update inventory
- **Admin** - Approve vendors, manage categories, system oversight

## 🧪 Testing

```bash
# Run all tests
npm run test

# Frontend tests
npm run test:frontend

# Backend tests
npm run test:backend
```

## 🚢 Deployment

### Backend (Render)
```bash
# Build and deploy individual services
npm run build:backend
```

### Frontend (Vercel)
```bash
# Build and deploy frontend
npm run build:frontend
```

## 📊 Monitoring & Logging

- Health checks on all services
- Structured logging with Winston
- Performance monitoring
- Error tracking and alerting

## 🔧 Development Scripts

```bash
npm run dev          # Start full development environment
npm run build        # Build all services
npm run test         # Run all tests
npm run lint         # Lint all code
npm run seed         # Seed demo data
npm run setup        # Complete project setup
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
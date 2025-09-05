# Marketplace System Design
## Multi-Vendor E-commerce Platform

---

## Implementation Approach

We will implement a production-ready marketplace using a **microservices architecture** with the following key design decisions:

### Architecture Strategy
- **Microservices Pattern**: Each service handles a specific domain (Auth, Products, Orders, Payments, Notifications)
- **API Gateway Pattern**: Single entry point for all client requests with routing, authentication, and rate limiting
- **Database per Service**: Each microservice owns its data with PostgreSQL databases
- **Event-Driven Communication**: Asynchronous messaging between services using Redis Pub/Sub
- **Container-First Approach**: Docker containerization for consistent deployment across environments

### Technology Stack Selection
- **Frontend**: React 18 + Vite + TypeScript for modern, fast development with excellent DX
- **UI Framework**: TailwindCSS + shadcn/ui for consistent, accessible, and customizable components
- **Backend**: NestJS for enterprise-grade Node.js applications with TypeScript support
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **Authentication**: JWT with HttpOnly cookies for secure, stateless authentication
- **Real-time**: Socket.IO for bidirectional communication and live updates
- **Caching**: Redis for session management, caching, and message brokering
- **Containerization**: Docker + Docker Compose for local development and deployment

### Key Architectural Decisions
1. **Monorepo Structure**: Single repository with shared tooling and dependencies
2. **Microservices Boundaries**: Domain-driven service separation for scalability
3. **API-First Design**: OpenAPI specifications for consistent API contracts
4. **Security-First**: JWT tokens in HttpOnly cookies, RBAC, input validation
5. **Performance-Optimized**: Caching strategies, database indexing, code splitting

---

## Database Schemas

### Auth Service Schema (Prisma)

```prisma
// auth-service/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  BUYER
  VENDOR
  ADMIN
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String
  role          UserRole @default(BUYER)
  isActive      Boolean  @default(true)
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  refreshTokens RefreshToken[]

  @@map("users")
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}
```

### Product Service Schema (Prisma)

```prisma
// product-service/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum VendorStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}

model Vendor {
  id           String       @id @default(cuid())
  userId       String       @unique
  businessName String
  description  String?
  status       VendorStatus @default(PENDING)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  products Product[]

  @@map("vendors")
}

model Category {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  parentId  String?
  createdAt DateTime @default(now())

  parent   Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children Category[] @relation("CategoryHierarchy")
  products Product[]

  @@map("categories")
}

model Product {
  id            String   @id @default(cuid())
  vendorId      String
  categoryId    String?
  name          String
  description   String?
  price         Decimal  @db.Decimal(10, 2)
  stockQuantity Int      @default(0)
  isActive      Boolean  @default(true)
  images        String[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  vendor   Vendor    @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  category Category? @relation(fields: [categoryId], references: [id])
  variants ProductVariant[]

  @@map("products")
}

model ProductVariant {
  id            String  @id @default(cuid())
  productId     String
  name          String
  price         Decimal @db.Decimal(10, 2)
  stockQuantity Int     @default(0)
  sku           String  @unique

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_variants")
}
```

### Order Service Schema (Prisma)

```prisma
// order-service/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

model Cart {
  id          String   @id @default(cuid())
  userId      String   @unique
  totalAmount Decimal  @db.Decimal(10, 2) @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  items CartItem[]

  @@map("carts")
}

model CartItem {
  id        String  @id @default(cuid())
  cartId    String
  productId String
  quantity  Int
  price     Decimal @db.Decimal(10, 2)

  cart Cart @relation(fields: [cartId], references: [id], onDelete: Cascade)

  @@unique([cartId, productId])
  @@map("cart_items")
}

model Order {
  id              String      @id @default(cuid())
  userId          String
  orderNumber     String      @unique
  status          OrderStatus @default(PENDING)
  totalAmount     Decimal     @db.Decimal(10, 2)
  shippingAmount  Decimal     @db.Decimal(10, 2) @default(0)
  taxAmount       Decimal     @db.Decimal(10, 2) @default(0)
  shippingAddress Json
  billingAddress  Json
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  items OrderItem[]

  @@map("orders")
}

model OrderItem {
  id         String  @id @default(cuid())
  orderId    String
  productId  String
  quantity   Int
  price      Decimal @db.Decimal(10, 2)
  totalPrice Decimal @db.Decimal(10, 2)

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("order_items")
}
```

### Payment Service Schema (Prisma)

```prisma
// payment-service/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
  REFUNDED
}

enum PaymentMethod {
  STRIPE
  RAZORPAY
  PAYPAL
}

model Payment {
  id              String        @id @default(cuid())
  orderId         String        @unique
  userId          String
  amount          Decimal       @db.Decimal(10, 2)
  currency        String        @default("USD")
  status          PaymentStatus @default(PENDING)
  method          PaymentMethod
  transactionId   String?
  gatewayResponse Json?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@map("payments")
}
```

---

## API Specifications

### Authentication Endpoints

```typescript
// Auth Service API
interface AuthAPI {
  // Authentication
  'POST /auth/register': {
    body: RegisterDto;
    response: { user: User; accessToken: string; refreshToken: string };
  };
  
  'POST /auth/login': {
    body: LoginDto;
    response: { user: User; accessToken: string; refreshToken: string };
  };
  
  'POST /auth/refresh': {
    body: { refreshToken: string };
    response: { accessToken: string; refreshToken: string };
  };
  
  'POST /auth/logout': {
    response: { message: string };
  };
  
  // User Profile
  'GET /auth/profile': {
    response: User;
  };
  
  'PUT /auth/profile': {
    body: UpdateUserDto;
    response: User;
  };
}

interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: 'BUYER' | 'VENDOR';
}

interface LoginDto {
  email: string;
  password: string;
}
```

### Product Service Endpoints

```typescript
// Product Service API
interface ProductAPI {
  // Products
  'GET /products': {
    query: ProductFilters;
    response: PaginatedResponse<Product>;
  };
  
  'GET /products/:id': {
    params: { id: string };
    response: Product;
  };
  
  'POST /vendor/products': {
    body: CreateProductDto;
    response: Product;
  };
  
  'PUT /vendor/products/:id': {
    params: { id: string };
    body: UpdateProductDto;
    response: Product;
  };
  
  'DELETE /vendor/products/:id': {
    params: { id: string };
    response: { message: string };
  };
  
  // Categories
  'GET /categories': {
    response: Category[];
  };
  
  'POST /admin/categories': {
    body: CreateCategoryDto;
    response: Category;
  };
  
  // Vendors
  'POST /vendors/register': {
    body: CreateVendorDto;
    response: Vendor;
  };
  
  'GET /admin/vendors/pending': {
    response: Vendor[];
  };
  
  'PUT /admin/vendors/:id/approve': {
    params: { id: string };
    response: Vendor;
  };
}

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

### Order Service Endpoints

```typescript
// Order Service API
interface OrderAPI {
  // Cart Management
  'GET /cart': {
    response: Cart;
  };
  
  'POST /cart/items': {
    body: AddToCartDto;
    response: Cart;
  };
  
  'PUT /cart/items/:id': {
    params: { id: string };
    body: { quantity: number };
    response: Cart;
  };
  
  'DELETE /cart/items/:id': {
    params: { id: string };
    response: Cart;
  };
  
  // Order Management
  'POST /checkout': {
    body: CheckoutDto;
    response: Order;
  };
  
  'GET /orders': {
    query: { page?: number; limit?: number };
    response: PaginatedResponse<Order>;
  };
  
  'GET /orders/:id': {
    params: { id: string };
    response: Order;
  };
  
  'PUT /orders/:id/status': {
    params: { id: string };
    body: { status: OrderStatus };
    response: Order;
  };
  
  // Vendor Orders
  'GET /vendor/orders': {
    query: { status?: OrderStatus; page?: number; limit?: number };
    response: PaginatedResponse<Order>;
  };
}

interface CheckoutDto {
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: 'STRIPE' | 'RAZORPAY';
}
```

### Payment Service Endpoints

```typescript
// Payment Service API
interface PaymentAPI {
  'POST /payments': {
    body: CreatePaymentDto;
    response: Payment;
  };
  
  'GET /payments/:id': {
    params: { id: string };
    response: Payment;
  };
  
  'POST /payments/:id/process': {
    params: { id: string };
    response: PaymentResult;
  };
  
  'POST /webhooks/stripe': {
    body: any;
    response: { received: boolean };
  };
  
  'POST /webhooks/razorpay': {
    body: any;
    response: { received: boolean };
  };
}
```

---

## Authentication Flow

### JWT Token Strategy

```typescript
// JWT Payload Structure
interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Token Configuration
const JWT_CONFIG = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: '15m'
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d'
  }
};
```

### Authentication Flow Sequence

1. **User Registration/Login**
   - Client sends credentials to API Gateway
   - Gateway forwards to Auth Service
   - Auth Service validates and generates JWT pair
   - Tokens stored in HttpOnly cookies
   - User data returned to client

2. **Authenticated Requests**
   - Client makes request with cookies
   - Gateway extracts JWT from HttpOnly cookie
   - Gateway validates token and extracts user info
   - Request forwarded to appropriate service with user context

3. **Token Refresh**
   - When access token expires, client gets 401
   - Client automatically calls refresh endpoint
   - New access token generated and set in cookie
   - Original request retried with new token

### Security Implementation

```typescript
// JWT Strategy (API Gateway)
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        return req.cookies?.accessToken || null;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}

// Role-Based Access Control
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

---

## Inter-Service Communication

### Communication Patterns

1. **Synchronous Communication (REST)**
   - Direct HTTP calls between services
   - Used for immediate data requirements
   - API Gateway to all services

2. **Asynchronous Communication (Redis Pub/Sub)**
   - Event-driven messaging
   - Used for notifications and state changes
   - Loose coupling between services

### Event-Driven Architecture

```typescript
// Event Types
interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  totalAmount: number;
  items: OrderItem[];
}

interface PaymentCompletedEvent {
  paymentId: string;
  orderId: string;
  amount: number;
  status: 'completed' | 'failed';
}

// Event Publisher (Order Service)
@Injectable()
export class OrderEventPublisher {
  constructor(private redis: Redis) {}

  async publishOrderCreated(order: Order) {
    const event: OrderCreatedEvent = {
      orderId: order.id,
      userId: order.userId,
      totalAmount: order.totalAmount,
      items: order.items,
    };

    await this.redis.publish('order.created', JSON.stringify(event));
  }
}

// Event Subscriber (Notification Service)
@Injectable()
export class OrderEventSubscriber {
  constructor(
    private redis: Redis,
    private notificationService: NotificationService
  ) {
    this.redis.subscribe('order.created');
    this.redis.on('message', this.handleMessage.bind(this));
  }

  private async handleMessage(channel: string, message: string) {
    if (channel === 'order.created') {
      const event: OrderCreatedEvent = JSON.parse(message);
      await this.notificationService.sendOrderConfirmation(event);
    }
  }
}
```

---

## Docker Containerization Strategy

### Root Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Databases
  auth-db:
    image: postgres:15
    environment:
      POSTGRES_DB: auth_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - auth_db_data:/var/lib/postgresql/data

  product-db:
    image: postgres:15
    environment:
      POSTGRES_DB: product_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5433:5432"
    volumes:
      - product_db_data:/var/lib/postgresql/data

  order-db:
    image: postgres:15
    environment:
      POSTGRES_DB: order_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5434:5432"
    volumes:
      - order_db_data:/var/lib/postgresql/data

  payment-db:
    image: postgres:15
    environment:
      POSTGRES_DB: payment_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5435:5432"
    volumes:
      - payment_db_data:/var/lib/postgresql/data

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Backend Services
  api-gateway:
    build:
      context: ./backend/api-gateway
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - JWT_ACCESS_SECRET=your-access-secret
      - JWT_REFRESH_SECRET=your-refresh-secret
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - auth-service
      - product-service
      - order-service
      - payment-service
      - notification-service

  auth-service:
    build:
      context: ./backend/auth-service
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@auth-db:5432/auth_db
      - JWT_ACCESS_SECRET=your-access-secret
      - JWT_REFRESH_SECRET=your-refresh-secret
      - REDIS_URL=redis://redis:6379
    depends_on:
      - auth-db
      - redis

  product-service:
    build:
      context: ./backend/product-service
      dockerfile: Dockerfile
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@product-db:5432/product_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - product-db
      - redis

  order-service:
    build:
      context: ./backend/order-service
      dockerfile: Dockerfile
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@order-db:5432/order_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - order-db
      - redis

  payment-service:
    build:
      context: ./backend/payment-service
      dockerfile: Dockerfile
    ports:
      - "3004:3004"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@payment-db:5432/payment_db
      - STRIPE_SECRET_KEY=sk_test_your_stripe_key
      - RAZORPAY_KEY_ID=your_razorpay_key
      - RAZORPAY_KEY_SECRET=your_razorpay_secret
      - REDIS_URL=redis://redis:6379
    depends_on:
      - payment-db
      - redis

  notification-service:
    build:
      context: ./backend/notification-service
      dockerfile: Dockerfile
    ports:
      - "3005:3005"
    environment:
      - NODE_ENV=development
      - REDIS_URL=redis://redis:6379
      - SMTP_HOST=smtp.gmail.com
      - SMTP_PORT=587
      - SMTP_USER=your-email@gmail.com
      - SMTP_PASS=your-app-password
    depends_on:
      - redis

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000
    depends_on:
      - api-gateway

volumes:
  auth_db_data:
  product_db_data:
  order_db_data:
  payment_db_data:
  redis_data:
```

### Individual Service Dockerfiles

```dockerfile
# backend/auth-service/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Deployment Architecture

### Backend Deployment (Render)

```yaml
# render.yaml
services:
  - type: web
    name: marketplace-api-gateway
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: marketplace-auth-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          type: redis
          name: marketplace-redis
          property: connectionString

  - type: web
    name: marketplace-auth-service
    env: node
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm run start:prod

  - type: web
    name: marketplace-product-service
    env: node
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm run start:prod

databases:
  - name: marketplace-auth-db
    databaseName: auth_db
    user: marketplace_user

  - name: marketplace-product-db
    databaseName: product_db
    user: marketplace_user

redis:
  - name: marketplace-redis
```

### Frontend Deployment (Vercel)

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://marketplace-api-gateway.onrender.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://marketplace-api-gateway.onrender.com"
  }
}
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Run tests
        run: cd frontend && npm run test
      
      - name: Build
        run: cd frontend && npm run build

  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    strategy:
      matrix:
        service: [auth-service, product-service, order-service, payment-service, notification-service]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/${{ matrix.service }}/package-lock.json
      
      - name: Install dependencies
        run: cd backend/${{ matrix.service }} && npm ci
      
      - name: Generate Prisma client
        run: cd backend/${{ matrix.service }} && npx prisma generate
      
      - name: Run tests
        run: cd backend/${{ matrix.service }} && npm run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
```

```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths: ['frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Build
        run: cd frontend && npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend
```

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend Services

on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [api-gateway, auth-service, product-service, order-service, payment-service, notification-service]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets[format('RENDER_{0}_SERVICE_ID', matrix.service)] }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

---

## Anything UNCLEAR

The following aspects may need clarification during implementation:

1. **Payment Processing**: Should we implement escrow functionality where payments are held until order completion, or use direct payment processing?

2. **File Storage**: Where should product images and other assets be stored? Consider AWS S3, Cloudinary, or local storage with CDN.

3. **Search Implementation**: Should we use PostgreSQL full-text search, Elasticsearch, or a third-party service like Algolia for product search?

4. **Rate Limiting**: What are the specific rate limits for different user roles and endpoints?

5. **Monitoring & Logging**: Which monitoring tools should be integrated (DataDog, New Relic, or custom solution)?

6. **Email Templates**: Should we use a template engine like Handlebars or a service like SendGrid for email templates?

7. **Mobile Responsiveness**: Are there specific mobile breakpoints or PWA requirements?

8. **Internationalization**: Is multi-language support required for the initial release?

9. **Analytics**: Should we integrate Google Analytics, Mixpanel, or build custom analytics?

10. **Backup Strategy**: What is the backup and disaster recovery strategy for databases?

---

*This system design provides a comprehensive foundation for building a production-ready marketplace platform. The architecture is designed to be scalable, maintainable, and secure while supporting all the required features outlined in the PRD.*
const fs = require('fs');
const path = require('path');

// Copy .env.example to .env if it doesn't exist
const envExamplePath = path.join(__dirname, '..', '.env.example');
const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
  } else {
    console.log('❌ .env.example file not found');
  }
} else {
  console.log('✅ .env file already exists');
}

// Create environment files for each service
const services = [
  'auth-service',
  'product-service',
  'order-service',
  'payment-service',
  'notification-service',
  'api-gateway'
];

services.forEach(service => {
  const serviceEnvPath = path.join(__dirname, '..', 'backend', service, '.env');
  
  if (!fs.existsSync(serviceEnvPath)) {
    const envContent = `NODE_ENV=development
PORT=${getServicePort(service)}
DATABASE_URL=${getDatabaseUrl(service)}
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
REDIS_URL=redis://localhost:6379
`;
    
    fs.writeFileSync(serviceEnvPath, envContent);
    console.log(`✅ Created .env file for ${service}`);
  }
});

function getServicePort(service) {
  const ports = {
    'auth-service': 3001,
    'product-service': 3002,
    'order-service': 3003,
    'payment-service': 3004,
    'notification-service': 3005,
    'api-gateway': 3000
  };
  return ports[service] || 3000;
}

function getDatabaseUrl(service) {
  const dbPorts = {
    'auth-service': 5432,
    'product-service': 5433,
    'order-service': 5434,
    'payment-service': 5435
  };
  
  const port = dbPorts[service];
  if (!port) return '';
  
  const dbName = service.replace('-service', '_db');
  return `postgresql://postgres:postgres@localhost:${port}/${dbName}`;
}

console.log('🎉 Environment setup completed!');
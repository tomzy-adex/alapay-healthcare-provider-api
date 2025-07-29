import Redis from 'ioredis';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

export const config = {
  port: process.env.PORT || process.env.APP_PORT || 3000,
  baseUrl: process.env.BASE_URL,
  frontendUrl: process.env.FRONTEND_URL,
  healthProviderUrl: process.env.HEALTH_PROVIDER_URL,
  env: process.env.NODE_ENV,
  db: {
    url: process.env.DATABASE_URL,
    ssl: Boolean(process.env.DB_SSL),
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    privateKey: process.env.PRIVATE_KEY,
    publicKey: process.env.PUBLIC_KEY,
    issuer: process.env.ISSUER,
    expiresIn: process.env.EXPIRES, // time in seconds
  },
  email: {
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Boolean(process.env.EMAIL_SECURE),
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    emailSender: process.env.EMAIL_SENDER,
  },
};

export const redisConnection = new Redis(process.env.REDIS_URL!);

redisConnection.on('connect', () => console.log('Connected to Redis'));
redisConnection.on('error', (error) => console.error('Redis error', error));

import dotenv from 'dotenv';
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI', 'JWT_SECRET', 
  'USER_CREDENTIALS'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Environment variable ${envVar} is required`);
  }
}

// Parse user credentials from environment variable
const parseUserCredentials = () => {
  try {
    return JSON.parse(process.env.USER_CREDENTIALS);
  } catch (error) {
    throw new Error('Failed to parse USER_CREDENTIALS. Must be valid JSON.');
  }
};

export default {
  port: process.env.PORT || 8000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  users: parseUserCredentials(),
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 requests per windowMs
  }
};
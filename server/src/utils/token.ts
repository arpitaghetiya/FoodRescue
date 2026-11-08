import jwt from 'jsonwebtoken';

const isProduction = process.env.NODE_ENV === 'production';
const rawJwtSecret = process.env.JWT_SECRET;

if (isProduction) {
  if (!rawJwtSecret || rawJwtSecret === 'foodrescue_jwt_default_secret_dev' || rawJwtSecret.length < 32) {
    throw new Error(
      'CRITICAL SECURITY CONFIGURATION ERROR: A strong JWT_SECRET environment variable (minimum 32 characters) is required in production.'
    );
  }
}

const JWT_SECRET = rawJwtSecret || 'foodrescue_jwt_default_secret_dev';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

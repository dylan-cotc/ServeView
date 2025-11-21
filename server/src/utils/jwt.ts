import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Auto-generate JWT secret on first launch
function getJWTSecret(): string {
  const envSecret = process.env.JWT_SECRET;

  if (envSecret && envSecret !== 'default-secret-change-this') {
    return envSecret;
  }

  // Check for existing auto-generated secret
  const secretsPath = path.join(process.cwd(), '.jwt_secret');
  try {
    if (fs.existsSync(secretsPath)) {
      return fs.readFileSync(secretsPath, 'utf8').trim();
    }
  } catch (error) {
    // File doesn't exist or can't be read, generate new one
  }

  // Generate new cryptographically secure secret
  const newSecret = crypto.randomBytes(64).toString('hex');

  // Save to file for persistence
  try {
    fs.writeFileSync(secretsPath, newSecret, { mode: 0o600 }); // Restrictive permissions
    console.log('Generated new JWT secret and saved to .jwt_secret');
  } catch (error) {
    console.warn('Could not save JWT secret to file, using in-memory secret (will change on restart):', error);
    return newSecret; // Still use the generated secret even if we can't save it
  }

  return newSecret;
}

const JWT_SECRET = getJWTSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  } as SignOptions);
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/user.types';

export class JwtUtil {
  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '15m',
    });
  }

  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: '7d',
    });
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
  }

  static decode(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }
}
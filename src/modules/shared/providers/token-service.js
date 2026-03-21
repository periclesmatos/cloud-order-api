import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../application/errors/unauthorized.error.js';

export class TokenService {
  constructor(secret = process.env.AUTH_SECRET || 'dev-secret-change-me') {
    this.secret = secret;
  }

  sign(payload, expiresInSeconds = 3600) {
    return jwt.sign(payload, this.secret, {
      algorithm: 'HS256',
      expiresIn: expiresInSeconds,
    });
  }

  verify(token) {
    if (!token || typeof token !== 'string') {
      throw new UnauthorizedError('Token inválido');
    }
    try {
      return jwt.verify(token, this.secret, { algorithms: ['HS256'] });
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token expirado');
      }
      throw new UnauthorizedError('Token inválido');
    }
  }
}

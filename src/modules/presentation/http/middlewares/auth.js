import { ForbiddenError } from '../../../application/errors/forbidden.error.js';
import { UnauthorizedError } from '../../../application/errors/unauthorized.error.js';
import { TokenService } from '../../../shared/providers/token-service.js';

const tokenService = new TokenService();

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

function ensureAuthenticatedPayload(req) {
  if (req.auth) return req.auth;
  const token = getBearerToken(req);
  if (!token) throw new UnauthorizedError('Token não informado');
  const payload = tokenService.verify(token);
  req.auth = payload;
  return payload;
}

export function requireAuth(req, res, next) {
  try {
    ensureAuthenticatedPayload(req);
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireUser(req, res, next) {
  try {
    const auth = ensureAuthenticatedPayload(req);
    if (auth.type !== 'USER') {
      throw new ForbiddenError('Apenas usuários administradores podem acessar este recurso');
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireCustomerOwnerOrUser(paramName = 'id') {
  return (req, res, next) => {
    try {
      const auth = ensureAuthenticatedPayload(req);
      if (auth.type === 'USER') return next();

      const ownerId = req.params[paramName];
      if (auth.type === 'CUSTOMER' && auth.sub === ownerId) {
        return next();
      }

      throw new ForbiddenError('Você não tem permissão para acessar este cliente');
    } catch (error) {
      return next(error);
    }
  };
}

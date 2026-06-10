import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { logger } from '../lib/logger.js';

export interface AuthRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  sub: string;
  tokenVersao: number;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.__session as string | undefined;
  if (!token) {
    logger.warn('auth:no-token', { path: req.path });
    res.status(401).json({ error: 'Não autenticado' });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(payload.sub).select('tokenVersao status').lean();
    if (!user) {
      logger.warn('auth:user-not-found', { sub: payload.sub });
      res.status(401).json({ error: 'Usuário não encontrado' });
      return;
    }
    if ((user as any).tokenVersao !== payload.tokenVersao) {
      logger.warn('auth:session-expired', { sub: payload.sub });
      res.status(401).json({ error: 'Sessão expirada' });
      return;
    }
    req.userId = payload.sub;
    next();
  } catch {
    logger.warn('auth:token-invalid', { path: req.path });
    res.status(401).json({ error: 'Token inválido' });
  }
}

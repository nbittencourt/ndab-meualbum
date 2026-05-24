import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';

const mockVerify = vi.fn();
const mockFindById = vi.fn();

vi.mock('jsonwebtoken', () => ({
  default: { verify: mockVerify },
}));

vi.mock('../../models/User.js', () => ({
  User: {
    findById: () => ({ select: () => ({ lean: mockFindById }) }),
  },
}));

const { requireAuth } = await import('../../middleware/auth.js');

function makeReq(cookies: Record<string, string> = {}, path = '/test'): AuthRequest {
  return { cookies, path } as unknown as AuthRequest;
}

function makeRes() {
  const res: Partial<Response> & { _status?: number; _body?: unknown } = {};
  res.status = vi.fn().mockImplementation((code: number) => {
    res._status = code;
    return res as Response;
  });
  res.json = vi.fn().mockImplementation((body: unknown) => {
    res._body = body;
    return res as Response;
  });
  return res as Response & { _status?: number; _body?: unknown };
}

describe('requireAuth', () => {
  const next: NextFunction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('retorna 401 quando não há cookie token', async () => {
    const req = makeReq({});
    const res = makeRes();
    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect((res._body as any).error).toBe('Não autenticado');
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 401 quando jwt.verify lança', async () => {
    mockVerify.mockImplementation(() => { throw new Error('invalid'); });
    const req = makeReq({ __session: 'bad-token' });
    const res = makeRes();
    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect((res._body as any).error).toBe('Token inválido');
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 401 quando usuário não existe no banco', async () => {
    mockVerify.mockReturnValue({ sub: 'user-id-1', tokenVersao: 1 });
    mockFindById.mockResolvedValue(null);
    const req = makeReq({ __session: 'valid-token' });
    const res = makeRes();
    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect((res._body as any).error).toBe('Usuário não encontrado');
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 401 quando tokenVersao diverge', async () => {
    mockVerify.mockReturnValue({ sub: 'user-id-1', tokenVersao: 1 });
    mockFindById.mockResolvedValue({ tokenVersao: 2, status: 'ATIVO' });
    const req = makeReq({ __session: 'valid-token' });
    const res = makeRes();
    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect((res._body as any).error).toBe('Sessão expirada');
    expect(next).not.toHaveBeenCalled();
  });

  it('chama next() e seta req.userId quando token é válido', async () => {
    mockVerify.mockReturnValue({ sub: 'user-id-1', tokenVersao: 3 });
    mockFindById.mockResolvedValue({ tokenVersao: 3, status: 'ATIVO' });
    const req = makeReq({ __session: 'valid-token' });
    const res = makeRes();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(req.userId).toBe('user-id-1');
  });
});

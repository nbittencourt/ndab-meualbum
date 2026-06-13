import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Encaminha rejeições de handlers async para o error middleware global.
 * Express 4 não captura promises rejeitadas — sem este wrapper, um erro
 * assíncrono cai em unhandledRejection e a requisição fica pendurada.
 */
export function asyncHandler<Req extends Request = Request>(
  fn: (req: Req, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as Req, res, next)).catch(next);
  };
}

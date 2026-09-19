import { Router, RequestHandler } from 'express';

// Express 4 does not forward rejected async handlers to error middleware.
export function asyncRouter() {
  const router = Router();
  for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
    const register = router[method].bind(router);
    router[method] = ((path: string | string[], ...handlers: RequestHandler[]) =>
      register(path, ...handlers.map(handler => ((req, res, next) => {
        Promise.resolve().then(() => handler(req, res, next)).catch(next);
      }) as RequestHandler))) as typeof router[typeof method];
  }
  return router;
}

import type { JWTPayload } from '../middlewares/auth';

declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}

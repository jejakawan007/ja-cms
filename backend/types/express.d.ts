import { JWTPayload } from '@shared/types';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}




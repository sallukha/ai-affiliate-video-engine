import { SafeUser } from "./auth.service";

declare global {
  namespace Express {
    interface Request {
      authUser?: SafeUser;
    }
  }
}

export {};

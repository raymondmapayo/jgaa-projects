declare global {
  namespace Express {
    interface Request {
      user_id?: number; // Add user_id to Request object
    }
  }
}

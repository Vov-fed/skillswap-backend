import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IUser } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }


  jwt.verify(authHeader, process.env.JWT_SECRET || 'default_secret', async (err, decoded) => {
    if (err || !decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById((decoded as { userId: string }).userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  });
};
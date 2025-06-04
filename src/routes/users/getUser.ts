import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/User';

export const getUserRoute = async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string || 'default_secret') as { userId: string };
    const user = await User.findById(decoded.userId).select('-password -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getUserByIdRoute = async (req: Request, res: Response) => {
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  try {
    const user = await User.findById(userId).select('-password -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user });
  } catch (error: any) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getUsersByIdsRoute = async (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Array of user IDs is required' });
  }
  try {
    const users = await User.find({ _id: { $in: ids } }).select('name email profilePicture _id');
    return res.status(200).json(users);
  } catch (error: any) {
    console.error('Get users by IDs error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};
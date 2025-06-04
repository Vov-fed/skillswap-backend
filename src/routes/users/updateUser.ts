import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../../models/User';

export const updateUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string || 'default_secret') as { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.currentPassword && req.body.newPassword) {
      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      const hashedNewPassword = await bcrypt.hash(req.body.newPassword, 10);
      user.password = hashedNewPassword;
    }

    const allowedFields = [
      'name',
      'bio',
      'location',
      'profilePicture',
      'headerPicture',
      'profession',
      'skills',
      'skillsOffered',
      'skillsRequested',
      'skillsInterested',
      'email'
    ] as const;

    type AllowedField = typeof allowedFields[number];

    allowedFields.forEach((field) => {
      if (field in req.body) {
        (user as any)[field] = req.body[field];
      }
    });

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password -__v');
    res.status(200).json({ user: updatedUser });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

export default updateUser;
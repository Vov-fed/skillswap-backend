import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../../models/User'

const signUpRoute = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user', // Default to 'user' if no role is provided
      createdAt: new Date(),
    })

    await newUser.save()
    const user = await User.findOne({ email }).select('-password -__v')
    if (!user) {
      return res.status(404).json({ message: 'User not found after creation' })
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'default_secret', {
          expiresIn: '1d',
    });
    return res.status(201).json({ token })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

export default signUpRoute;
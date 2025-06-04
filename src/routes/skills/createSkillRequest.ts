import express, { Request, Response } from 'express';
import Skill from '../../models/Skill';
import { verifyToken } from '../../middleware/authMiddleware';
import User from '../../models/User';


const createSkillRouter = express.Router();

// POST /api/skills - Create a new skill request/offer
createSkillRouter.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const { skillOffered, skillRequested, description } = req.body;

    if (!skillOffered || !skillRequested || !description) {
      return res.status(400).json({ message: 'skillOffered, skillRequested, and description are required' });
    }

    // @ts-ignore
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: No user' });
    }

    const newSkill = new Skill({
      skillOffered,
      skillRequested,
      description,
      userOffering: userId,
      usersRequesting: [],
      usersInterested: [],
      likes: [],
      isActive: true,
      createdAt: new Date(),
    });

    const savedSkill = await newSkill.save();
    await User.findByIdAndUpdate(
      userId,
      { $push: { skillRequestings: savedSkill._id.toString() } }
    );
    res.status(201).json(savedSkill);

  } catch (error: any) {
    console.error('Error creating skill:', error);
    res.status(500).json({ message: 'Server error while creating skill' });
  }
});

export default createSkillRouter;
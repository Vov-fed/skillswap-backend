import e, { Request, Response } from 'express';
import mongoose from 'mongoose';
import express from 'express';
import Skill from '../../models/Skill';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../../middleware/authMiddleware';
import Moderator from '../../models/Moderator';


const getSkillsRouter = express.Router();

// GET /api/skills - Fetch all skills
getSkillsRouter.get('/', async (req: Request, res: Response) => {
    try {
        const skills = await Skill.find({}).populate('userOffering', 'name email profilePicture');
        res.status(200).json(skills);
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ message: 'Server error while fetching skills' });
    }
});
getSkillsRouter.get('/moderator', verifyToken, async (req: Request, res: Response) => {
    const userId = (req as any).userId; // Extract userId from the request object
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    if (!decoded || decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: You are not a moderator' });
    }
    try {
        const moderatorSkills = await Moderator.find()
            .populate('skillId', 'skillOffered skillRequested description userOffering');
        res.status(200).json({ message: 'Moderator skills fetched successfully', data: moderatorSkills });
    } catch (error) {
        console.error('Error fetching skills for moderator:', error);
        res.status(500).json({ message: 'Server error while fetching skills for moderator' });
    }
});
getSkillsRouter.get('/from/:userId', async (req, res) => {
  try {
    const userId = req.params.userId
    const skills = await Skill.find({ userOffering: userId }).populate('userOffering', 'name email profilePicture');
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// GET /api/skills/:id - Fetch a skill by ID
getSkillsRouter.get('/:id', async (req: Request, res: Response) => {
    const skillId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(skillId)) {
        return res.status(400).json({ message: 'Invalid skill ID format' });
    }

    try {
        const skill = await Skill.findById(skillId);
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        res.status(200).json(skill);
    } catch (error: any) {
        console.error(`Error fetching skill with ID ${skillId}:`, error);
        res.status(500).json({ message: 'Server error while fetching skill' });
    }
});
// GET /api/skills/myskills - Fetch skills offered by the authenticated user


export default getSkillsRouter;
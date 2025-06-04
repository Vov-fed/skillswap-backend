import express, { Request, Response } from 'express';
import Skill from '../../models/Skill';
import { verifyToken } from '../../middleware/authMiddleware';
import User from '../../models/User';
import Moderator from '../../models/Moderator';


const reportSkill = express.Router();

// POST /api/skills - Create a new skill request/offer
reportSkill.post('/:id/report', verifyToken, async (req: Request, res: Response) => {
  const skillId = req.params.id;
  const { reason } = req.body;
  
  if (!reason) {
    return res.status(400).json({ message: 'Reason for reporting is required' });
  }

  try {
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    const report = {
      skillId,
      reason
    };
    await Moderator.create(report);
    return res.status(201).json({ message: 'Skill reported successfully' });
  } catch (error) {
    console.error('Error reporting skill:', error);
    console.log('Error details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default reportSkill;
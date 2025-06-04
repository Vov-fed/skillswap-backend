

import express, { Request, Response } from 'express';
import Skill from '../../models/Skill';
import jwt from 'jsonwebtoken';
import Moderator from '../../models/Moderator';

const deleteSkillRouter = express.Router();

// DELETE /api/skills/:id - Delete a skill by ID
deleteSkillRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const skillId = req.params.id;
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    let userId: string | undefined;
    if (typeof decodedToken === 'object' && decodedToken !== null && 'userId' in decodedToken) {
      userId = (decodedToken as jwt.JwtPayload).userId as string;
    }
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    if (!skill.userOffering && decodedToken.role !== 'admin' || skill.userOffering.toString() !== userId && decodedToken.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this skill' });
    }
    const deletedSkill = await Skill.findByIdAndDelete(skillId);

    if (!deletedSkill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    const isModerator = await Moderator.findOne({ skillId: skillId }) || false;
    if (isModerator) {
      await Moderator.deleteOne({ skillId: skillId });
    }
    res.status(200).json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ message: 'Server error while deleting skill' });
  }
});

export default deleteSkillRouter;
import express, { Request, Response } from 'express';
import Skill from '../../models/Skill';
import { verifyToken } from '../../middleware/authMiddleware';

const updateSkillRouter = express.Router();

// PUT /api/skills/:id - Update a skill by ID
updateSkillRouter.put('/:id', verifyToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { skillOffered, skillRequested, description } = req.body;

    try {
        const updatedSkill = await Skill.findByIdAndUpdate(
            id,
            { skillOffered, skillRequested, description },
            { new: true }
        );

        if (!updatedSkill) {
            return res.status(404).json({ message: "Skill not found" });
        }

        res.json(updatedSkill);
    } catch (error) {
        console.error("Error updating skill:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
export default updateSkillRouter;
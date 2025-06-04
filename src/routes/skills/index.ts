import express from 'express';
const router = express.Router();
import getSkillsroutes from './getSkills';
import deleteSkillRouter from './deleteSkill';
import createSkillRouter from './createSkillRequest';
import reportSkill from './reportSkill';
import updateSkillRouter from './updateSkill';


router.use(getSkillsroutes);
router.use(deleteSkillRouter);
router.use(createSkillRouter);
router.use(reportSkill);
router.use(updateSkillRouter);


export default router;
import { Router } from 'express'
import signUpRoute from './signUp';
import loginRoute from './login';
import {getUserRoute, getUserByIdRoute, getUsersByIdsRoute} from './getUser';
import updateUser from './updateUser';
import { deleteUser } from './deleteUser';

const router = Router();
router.post('/signup', signUpRoute);
router.post('/login', loginRoute)
router.post('/profile', getUserRoute)
router.post('/update', updateUser)
router.delete('/delete', deleteUser)
router.get('/:id', getUserByIdRoute);
router.post('/getUsersByIds', getUsersByIdsRoute);

export default router
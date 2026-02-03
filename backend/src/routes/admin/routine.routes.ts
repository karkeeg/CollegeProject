import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/roleGuard';
import {
  createRoutine,
  getAllRoutines,
  updateRoutine,
  deleteRoutine
} from '../../controllers/routine.controller';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.post('/', createRoutine);
router.get('/', getAllRoutines);
router.put('/:id', updateRoutine);
router.delete('/:id', deleteRoutine);

export default router;

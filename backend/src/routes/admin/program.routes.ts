import { Router } from 'express';
import { getAllPrograms, createProgram, updateProgram, deleteProgram } from '../../controllers/program.controller';

const router = Router();

router.get('/', getAllPrograms);
router.post('/', createProgram);
router.put('/:id', updateProgram);
router.delete('/:id', deleteProgram);

export default router;
